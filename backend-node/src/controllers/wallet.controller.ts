import { getTransaction, Op } from '../database';
import { User, Userhistory, Recovery, Recovery_Type } from '../database/models';
import { decrypt, encrypt, errorResponse, successResponse, sha256, randomFixedInteger, getIPCountryCode, formatLogData } from '../helpers/functions/util';
const { to } = require('await-to-js');
import { Request, Response } from 'express';
import { sendEmail2FA, sendEmailChanged } from '../helpers/functions/email';
import { authenticator } from 'otplib';
const QRCode = require('qrcode');
const countryList = process.env.COUNTRY_LIST || '[]';
import { Logger } from '../helpers/functions/winston';
import { getKeyEmail } from '../helpers/functions/sso';
const vk_tokens = {};

// Function to save new signups to the database.
export async function saveEmailPassword(req: Request, res: Response) {
    // Get sequelize transactions to rollback changes in case of failure.
    const [err, transaction] = await to(getTransaction());
    if (err) return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);

    try {
        const recoveryTypeId = Number(req.body.recovery_type || 1);
    
        // Get variables from request body.
        let email = req.body.email.toLowerCase().replace(/ /g, '');
        const key = req.body.key;

        const emailKey = await getKeyEmail(recoveryTypeId, req.body.access_token, key, email, vk_tokens[key]);
        
        if (emailKey.success !== true) {
            await transaction.rollback();
            return errorResponse(res, 'TOKEN_VALIDATION_ERROR', 500);     
        }

        // can only register using google/apple/password
        if (!emailKey.recovery_type || !['Password','Apple','Google'].includes(emailKey.recovery_type)) {
            await transaction.rollback();
            return errorResponse(res, 'INVALID_RECOVERY_TYPE', 500);
        }

        // use the SSO email and check the user key for apple and google
        email = emailKey.email;
        if (key !== emailKey.key) {
            Logger.error({ source: 'saveEmailPassword', data: formatLogData(req.body), message: 'User key SSO mismatch' });
            await transaction.rollback();
            return errorResponse(res, 'SSO_KEY_MISMATCH', 500);     
        }
        

        const encryptedSeed = req.body.encryptedSeed;
        const eth_address = req.body.ethAddress;

        if (
            key.length !== 64 ||
            encryptedSeed.ciphertext === undefined ||
            encryptedSeed.iv === undefined ||
            encryptedSeed.salt === undefined
        ) {
            await transaction.rollback();
            return errorResponse(res, 'BAD_REQUEST', 400);
        }

        let userId;

        // Attempt to get user from database.
        const user = await User.findOne({ where: { email }, raw: true, transaction });

        if (user == null) {
            // Create a new user and associated recovery method
            let needConfirmation = true;
            let registerConfirmation = true;
            if (recoveryTypeId == 3 || recoveryTypeId == 6) {
                needConfirmation = false;
                registerConfirmation = false;
            }
            const payload = { email: false, authenticator: false, authenticatorConfirmed: false, needConfirmation, registerConfirmation };

            const nonce = 1;

            userId = (await User.create({ email, payload, nonce, eth_address }, { transaction })).getDataValue('id');


            const existingRecovery = await Recovery.findOne({where: {key: key}, transaction});
            if (existingRecovery) {
                return errorResponse(res, 'USER_ALREADY_EXISTS', 404);
            }

            // Create a new recovery method.
            const recoveryId = (
                await Recovery.create(
                    {
                        recovery_type_id: recoveryTypeId,
                        user_id: userId,
                        encrypted_seed: JSON.stringify(await encrypt(JSON.stringify(encryptedSeed), process.env.DB_BACKEND_SALT)),
                        key,
                        email
                    },
                    { transaction }
                )
            ).getDataValue('id');
            // Commit changes to database and return successfully.
            await transaction.commit();

            Logger.info({ method: arguments.callee.name, type: 'New Wallet', user_id: userId, headers: formatLogData(req.headers), body: formatLogData(req.body), message: `saveEmailPassword: New Wallet [${userId}] [${email}] [${eth_address}]` });

            return successResponse(res, {
                recovery_id: recoveryId
            });
        } else {
            await transaction.commit();
        }
    } catch (error) {
        // If an error happened anywhere along the way, rollback all the changes.
        await transaction.rollback();
        Logger.error({ source: 'saveEmailPassword', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }

    return errorResponse(res, 'USER_ALREADY_EXISTS', 404);
}

// Returns the all the active recovery types for a user. used to check which recovery types can be de-activated and to warn the user if no recovery types are active
export async function getRecoveryMethods(req: Request, res: Response) {
    try {
        const recovery_type_id = Number(req.body.recovery_type || 1);
        const key = req.header('key');
        const recoveryEmail = await Recovery.findOne({ where: { key, recovery_type_id: recovery_type_id } });
        const recovery = await Recovery.findAll({ where: { user_id: recoveryEmail.user_id }, include: [Recovery_Type] });
        const recoveryTypes = [];
        for (let i = 0; i < recovery.length; i++) {
            let return_data = recovery[i].recovery_type['dataValues'];
            return_data['email'] = recovery[i].email
            
            recoveryTypes.push(return_data);
        }
        return successResponse(res, recoveryTypes);
    } catch (error) {
        Logger.error({ source: 'getRecoveryMethods', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function addRecoveryMethod(req: Request, res: Response) {
    try {
        const key = req.header('key');
        const keyForSaving = req.body.key;
        const recoveryTypeId = req.body.recoveryTypeId;
        const currentRecoveryTypeId = req.body.currentRecoveryTypeId;
        let email = req.body.email ? req.body.email.toLowerCase().replace(/ /g, '') : '';

        const emailRecovery = await Recovery.findOne({ where: { key, recovery_type_id: currentRecoveryTypeId } });

        if (!emailRecovery) {
            return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
        }

        const emailKey = await getKeyEmail(recoveryTypeId, req.body.access_token, keyForSaving, email, vk_tokens[key]);

        if (emailKey.success !== true) {
            return errorResponse(res, 'TOKEN_VALIDATION_ERROR', 500);     
        }

        // use the SSO email and check the user key for apple and google
        email = emailKey.email;

        if (keyForSaving !== emailKey.key) {
            Logger.error({ source: 'saveEmailPassword', data: formatLogData(req.body), message: 'User key SSO mismatch' });
            return errorResponse(res, 'SSO_KEY_MISMATCH', 500);     
        }
        

        const recovery = await Recovery.findOne({ where: { user_id: emailRecovery.user_id, recovery_type_id: recoveryTypeId } });
        if (recovery == null) {
            const existingRecovery = await Recovery.findOne({where: {key: keyForSaving}});
            if (existingRecovery) {
                return errorResponse(res, 'RECOVERY_ALREADY_EXISTS');
            }

            const newRecoveryId = (
                await Recovery.create({
                    recovery_type_id: recoveryTypeId,
                    user_id: emailRecovery.user_id,
                    encrypted_seed: JSON.stringify(await encrypt(JSON.stringify(req.body.encryptedSeed), process.env.DB_BACKEND_SALT)),
                    key: keyForSaving,
                    email
                })
            ).getDataValue('id');

            Logger.info({
                method: arguments.callee.name,
                type: 'Added new Recovery Method',
                user_id: emailRecovery.user_id,
                recovery_id: newRecoveryId,
                headers: formatLogData(req.headers),
                body: formatLogData(req.body),
                message: `addRecoveryMethod: User ${emailRecovery.user_id} added recovery method ${recoveryTypeId} [${emailRecovery.user_id}]`
            });
            return successResponse(res, {
                recovery_id: newRecoveryId
            });
        }

        return errorResponse(res, 'RECOVERY_METHOD_ALREADY_SET');
    } catch (error) {
        Logger.error({ source: 'addRecoveryMethod', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

// Function to save new email/password to the database.
//only works if passed through a middleware that checks the signature!
export async function updatePassword(req: Request, res: Response) {

    try {
        const key = req.header('key');
        const encryptedSeed = req.body.encryptedSeed;

        // Create a new recovery method.
        const recovery = await Recovery.findOne({ where: { key, recovery_type_id: 1 } });
        if (recovery != null) {
            recovery.encrypted_seed = JSON.stringify(await encrypt(JSON.stringify(encryptedSeed), process.env.DB_BACKEND_SALT));
            await recovery.save();

            Logger.info({
                method: arguments.callee.name,
                type: 'Password Change',
                user_id: recovery.user_id,
                headers: formatLogData(req.headers),
                body: formatLogData(req.body),
                message: `updatePassword: User ${recovery.user_id} changed his password [${recovery.user_id}]`
            });
            return successResponse(res, 'updated');
        }

    } catch (error) {
        Logger.error({ source: 'updatePassword', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
    //error out in any other case
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);

}

// Function to save new email/password to the database.
//only works if passed through a middleware that checks the signature!
export async function updateEmail(req: Request, res: Response) {
    // Get sequelize transactions to rollback changes in case of failure.
    const transaction = await getTransaction();

    try {
        // Get variables from request body.
        const newEmail = req.body.newEmail.toLowerCase().replace(/ /g, '');
        const email2faVerification = req.body.email2faVerification;
        const key = req.header('key');
        const recoveryTypeId = req.header('recoveryTypeId');
        const sendEmails = process.env.SEND_EMAILS;

        const recovery = await Recovery.findOne({ where: { key, recovery_type_id: recoveryTypeId }, transaction });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id }, transaction });
            const user_should_not_exist = await User.findOne({ where: { email: newEmail, id: { [Op.ne]: user.id } } });
            //the user doesn't exist yet
            if (user_should_not_exist == null) {
                //email 2FA alredy sent out to verify new email address exists?
                if (email2faVerification === undefined) {
                    const verificationCode = await updateEmail2fa(user.id);
                    if (sendEmails === 'true') {
                        await sendEmail2FA(verificationCode, newEmail, user);
                    }
                    transaction.commit(); //close the transaction after the 2fa was sent
                    return successResponse(res, 'sent 2fa code to new email address');
                } else {
                    // 2FA tokens in query params
                    // Attempt to get user from database.
                    if (await verifyEmail2FA(user.id.toString(), email2faVerification, true, newEmail)) {
                        //2fa passed here
                        Userhistory.create({
                            user_id: user.id,
                            old_value: user.email,
                            new_value: newEmail,
                            change_type: 'updateEmail',
                            stringified_headers: JSON.stringify(req.headers)
                        });
                        if (sendEmails === 'true') {
                            await sendEmailChanged(newEmail, user.email, user);
                        } //send the old user an info-mail that his email address got updated.

                        Logger.info({
                            method: arguments.callee.name,
                            type: 'Email Change',
                            user_id: user.id,
                            old_value: user.email,
                            new_value: newEmail,
                            headers: formatLogData(req.headers),
                            body: formatLogData(req.body),
                            message: `updateEmail: User ${user.id} changed his email (${user.email} to ${newEmail}) [${user.id}]`
                        });

                        //save the new user email
                        user.email = newEmail;
                        await user.save({ transaction });

                        //save the new recovery key for the recovery option email
                        if (recovery.recovery_type_id == 1) {
                            recovery.key = await sha256(newEmail);
                            await recovery.save({ transaction });
                        }

                        // Commit changes to database and return successfully.
                        await transaction.commit();
                        return successResponse(res, { updated: true });
                    } else {
                        return errorResponse(res, 'EMAIL_2FA_WRONG', 400);
                    }
                }
            } else {
                //user exists error
                await transaction.rollback();
                return errorResponse(res, 'USER_ALREADY_EXISTS', 409);
            }
        }
        //any other error case
        await transaction.rollback();
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    } catch (error) {
        Logger.error({ source: 'updateEmail', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

// Function to get an encrypted seed from the database using a key.
export async function getEncryptedSeed(req, res) {
    try {
        const key = req.body.key;
        let email = (req.body.email || '').toLowerCase().replace(/ /g, '');
        const email2fa = req.body.email2fa;
        const authenticator2fa = req.body.authenticator2fa;
        const recovery_type_id = Number(req.body.recovery_type || 1);

        const emailKey = await getKeyEmail(recovery_type_id, req.body.access_token, key, email, vk_tokens[key]);

        if (emailKey.success !== true) {
            return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);     
        }

        // use the SSO email and check the user key for apple and google
        email = emailKey.email;
        
        if (key !== emailKey.key) {
            Logger.error({ source: 'saveEmailPassword', data: formatLogData(req.body), message: 'User key SSO mismatch' });
            return errorResponse(res, 'SSO_KEY_MISMATCH', 500);     
        }
        
       
        // Simply get Recovery instance that has this key and return it if its found.
        const recovery = await Recovery.findOne({ where: { key, recovery_type_id } });


        if (recovery) {
            
            const user = await User.findOne({ where: { id: recovery.user_id } });

            if (user) {
                if (recovery.recovery_type_id !== 1 && user.payload.needConfirmation) {
                    user.payload.needConfirmation = false;
                    user.changed('payload', true);
                }

                let ip_country = user.ip_country
                if (req.clientIp && user.ip_address !== req.clientIp) {
                    ip_country = await getIPCountryCode(req.clientIp)
                }

                if (!user.ip_country && ip_country) {
                    user.ip_country = ip_country;
                }

                if (ip_country) {
                    if (countryList.includes("'" + ip_country.toUpperCase() + "'") && recovery_type_id == 1) {
                        if (!user.payload.authenticator && !user.payload.email) {
                            await Userhistory.create({
                                user_id: user.id,
                                new_value: JSON.stringify(user.payload.email),
                                old_value: JSON.stringify(true),
                                change_type: 'autoemail2fa',
                                stringified_headers: JSON.stringify(req.headers)
                            });
                            user.payload.email = true;
                            user.changed('payload', true)
                        }
                    }

                }

                user.ip_address = req.clientIp;

                if (ip_country && ip_country !== user.ip_country) {
                    if (!user.payload.authenticator && !user.payload.email) {
                        if (!user.payload.needConfirmation) {
                            await Userhistory.create({
                                user_id: user.id,
                                new_value: JSON.stringify(user.payload.needConfirmation),
                                old_value: JSON.stringify(true),
                                change_type: 'autoemailconfirm',
                                stringified_headers: JSON.stringify(req.headers)
                            });
                        }

                        let ignoreCountry = false;
                        if (user.payload && user.payload.ignoreCountry == true) {
                            ignoreCountry = true;
                        }

                        if(process.env.ENVIRONMENT !== 'development' && ignoreCountry == false){
                            if (recovery.recovery_type_id !== 3 && recovery.recovery_type_id !== 6) {
                                user.payload.needConfirmation = true;
                            }
                        }

                        user.changed('payload', true)
                    }
                }

                if (ip_country && user.ip_country !== ip_country) {
                    Logger.log({ source: 'getEncryptedSeed', data: { id: user.id, old_country: user.ip_country, new_country: ip_country }, message: `getEncryptedSeed: User country changed [${user.id}  ${user.ip_country} ${ip_country}]` });
                    user.ip_country = ip_country;
                }

                await user.save();
            }

            if (user.payload.needConfirmation) {
                if (recovery.recovery_type_id == 3 || recovery.recovery_type_id == 6) {
                    user.payload.needConfirmation = false;
                    user.changed('payload', true)
                    await user.save();
                }
            }

            if (user.payload.needConfirmation) {
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Error: Account not confirmed',
                    error: '2fa wrong',
                    user_id: user.id,
                    headers: formatLogData(req.headers),
                    body: formatLogData(req.body),
                    message: `getEncryptedSeed: Account not confirmed [${user.id}]`
                });
                return errorResponse(res, 'ACCOUNT_NOT_CONFIRMED', 400);
            }

            let email2FAVerified = await verifyEmail2FA(recovery.user_id, email2fa);
            const googleVerified = await verifyGoogle2FA(recovery.user_id, authenticator2fa);

            if (recovery.recovery_type_id == 3 || recovery.recovery_type_id == 6) {
                email2FAVerified = true;
            }

            if (!email2FAVerified || !googleVerified) {
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Error: Fetch Encrypted Seed Failed',
                    error: '2fa wrong',
                    user_id: user.id,
                    headers: formatLogData(req.headers),
                    body: formatLogData(req.body),
                    message: `getEncryptedSeed: 2FA Wrong [${user.id}]`
                });
                return errorResponse(res, 'SOME_2FA_WRONG', 400);
            }

            let email2faStillValid = await isEmail2FaStillValid(recovery.user_id);
            if (recovery.recovery_type_id == 3 || recovery.recovery_type_id == 6) {
                email2faStillValid = true;
            }
            if (!email2faStillValid) {
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Error: Fetch Encrypted Seed Failed',
                    error: '2fa expired',
                    user_id: user.id,
                    headers: formatLogData(req.headers),
                    body: formatLogData(req.body),
                    message: `getEncryptedSeed: 2FA expired [${user.id}]`
                });
                return errorResponse(res, 'EMAIL_2FA_EXPIRED', 400);
            }

            //avoid replay attack, generate a new Email 2FA after it was validated and seed was sent
            if (user.payload.email) {
                updateEmail2fa(user.id);
            }

            if (recovery_type_id !== 1 && email && recovery.email !== email) {
                recovery.email = email;
                await recovery.save();
            }
            //only if the codes are correct we get the juicy seed.

            Logger.info({
                method: arguments.callee.name,
                type: 'Fetch Encrypted Seed',
                user_id: user.id,
                headers: formatLogData(req.headers),
                body: formatLogData(req.body),
                message: `getEncryptedSeed: Fetched encrypted seed [${user.id}]`
            });
            const encryptedSeed = await decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT);

            return successResponse(res, {
                encryptedSeed
            });
        }

        // Otherwise return an error.
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'getEncryptedSeed', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}


export async function recoverSeedSocialRecovery(req: Request, res: Response) {
    switch (req.body.recovery_type) {
        case 2:
            return await getEncryptedSeed(req, res);
        case 3:
            return await getEncryptedSeed(req, res);
        case 5:
            return await getEncryptedSeed(req, res);
        case 6:
            return await getEncryptedSeed(req, res);            
        default:
            return errorResponse(res, 'RECOVERY_METHOD_NOT_EXIST', 500);
    }
}

// Function to return all 2FA methods from the database.
export async function getPayload(req, res) {
    try {
        const ip_address = req.ip;
        const key = req.body.key;
        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery == null) {

            Logger.warn({ source: 'getPayload', data: formatLogData(req.body), message: `getPayload: User not found. [${req.ip}] [${key.substr(0, 10)}...]`, remoteAddress: req.ip });
            return errorResponse(res, 'USER_NOT_FOUND', 404);
        }
        const user = await User.findOne({ where: { id: recovery.user_id } });

        let ip_country = user.ip_country
        if (user.ip_address !== ip_address) {
            ip_country = await getIPCountryCode(ip_address)
        }

        const payload = {};
        if (user) {
            if (!user.ip_country && ip_country) {
                user.ip_country = ip_country;
            }

            if (ip_country) {
                if (countryList.includes("'" + ip_country.toUpperCase() + "'") && recovery.recovery_type_id == 1) {
                    if (!user.payload.authenticator && !user.payload.email) {
                        user.payload.email = true;
                        await Userhistory.create({
                            user_id: user.id,
                            new_value: JSON.stringify(user.payload.email),
                            old_value: JSON.stringify(true),
                            change_type: 'autoemail2fa',
                            stringified_headers: JSON.stringify(req.headers)
                        });
                        user.changed('payload', true)
                    }
                }

            }

            user.ip_address = ip_address;

            if (ip_country && ip_country !== user.ip_country) {
                if (!user.payload.authenticator && !user.payload.email) {

                    if (!user.payload.needConfirmation) {
                        await Userhistory.create({
                            user_id: user.id,
                            new_value: JSON.stringify(user.payload.needConfirmation),
                            old_value: JSON.stringify(true),
                            change_type: 'autoemailconfirm',
                            stringified_headers: JSON.stringify(req.headers)
                        });
                    }

                    let ignoreCountry = false;
                    if (user.payload && user.payload.ignoreCountry == true) {
                        ignoreCountry = true;
                    }

                    if(process.env.ENVIRONMENT !== 'development' && ignoreCountry == false){
                        if (recovery.recovery_type_id !== 3 && recovery.recovery_type_id !== 6) {
                            user.payload.needConfirmation = true;
                        }
                    }
                    
                    user.changed('payload', true)
                }
            }

            if (ip_country && user.ip_country !== ip_country) {
                Logger.log({ source: 'getPayload', data: { id: user.id, old_country: user.ip_country, new_country: ip_country }, message: `getPayload: User country changed [${user.id}] [${user.ip_country} to ${ip_country}]` });
                user.ip_country = ip_country;
            }

            await user.save();

            if (user != null && user['payload'] !== null) {
                // default app language to en 
                if (!user['payload'].app_lang) {
                    user['payload'].app_lang = 'en';
                    user.changed('payload', true)
                    await user.save();
                }

                payload['app_lang'] = user['payload'].app_lang;
                
                if (user['payload'].email !== undefined) {
                    payload['email'] = user.payload.email;
                }
                if (user['payload'].authenticator !== undefined) {
                    payload['authenticator'] = user.payload.authenticator;
                }
                if (user['payload'].authenticatorConfirmed !== undefined) {
                    payload['authenticatorConfirmed'] = user.payload.authenticatorConfirmed;
                }
                if (user['payload'].needConfirmation !== undefined) {
                    payload['needConfirmation'] = user.payload.needConfirmation;
                }
            }
        }

        if (user) {
            if (recovery.recovery_type_id !== 1) {
                payload['user_email'] = user.email;
                payload['email'] = false;
            }
            payload['ip_country'] = user.ip_country;
            if (recovery.recovery_type_id !== 1 && payload['needConfirmation']) {
                payload['needConfirmation'] = false;
            }

            Logger.info({ method: arguments.callee.name, type: 'Get Payload', user_id: user.id, headers: formatLogData(req.headers), body: formatLogData(req.body), message: `getPayload: Successful [${user.id}] [${user.email}]` });

            return successResponse(res, payload);
        } else {
            return errorResponse(res, 'METHODS_2FA_NOT_FOUND', 404);
        }
    } catch (error) {
        Logger.error({ source: 'getPayload', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function getNonce(req, res) {
    const [err, transaction] = await to(getTransaction());
    if (err) return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);

    try {
        const key = req.body.key;
        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery == null) {
            Logger.info({ method: arguments.callee.name, type: 'Error: User Not found', key, headers: formatLogData(req.headers), body: formatLogData(req.body), message: `getNonce: User not found [${key.substr(0, 10)}...]` });
            return errorResponse(res, 'USER_NOT_FOUND', 404);
        }

        let user = await User.findOne({ where: { id: recovery.user_id }, lock: true, transaction });

        if (user.nonce_timestamp && user.nonce_timestamp > Date.now() - (1000 * 10)) {
            transaction.rollback();    
            return successResponse(res, { nonce: null });
        }

        user.nonce_timestamp = Date.now();
        await user.save({transaction});

        await transaction.commit();


        if (user) {
            Logger.info({ method: arguments.callee.name, type: 'Get Nonce', user_id: user.id, headers: formatLogData(req.headers), body: formatLogData(req.body), message: `getNonce: User found [${user.id}]` });
            return successResponse(res, { nonce: user.nonce });
        } else {
            return errorResponse(res, 'NONCE_NOT_FOUND', 404);
        }
    } catch (error) {
        if (transaction) {
            try {
                transaction.rollback();
            } catch (err) {

            }
        }
        
        Logger.error({ source: 'getNonce', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

// Function to change 2FA methods from the database.
export async function change2FAMethods(req, res) {
    try {
        let toggleEmail = req.body.email;
        let toggleAuthenticator = req.body.authenticator;
        const email2faVerification = req.body.email2faVerification;
        const authenticator2faVerification = req.body.authenticator2faVerification;
        const sendEmails = process.env.SEND_EMAILS;
        const recoveryTypeId =  req.header('recoveryTypeId');

        // only allow one
        if (toggleAuthenticator) toggleEmail = false;
        if (toggleEmail) toggleAuthenticator = false;

        const key = req.header('key');

        const recovery = await Recovery.findOne({ where: { key, recovery_type_id: recoveryTypeId } });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id } });

            if (toggleEmail) {
                if (!email2faVerification) {

                    const verificationCode = await updateEmail2fa(user.id);

                    if (sendEmails === 'true') {
                        await sendEmail2FA(verificationCode, user.email, user);
                    }

                    Logger.info({
                        method: arguments.callee.name,
                        type: '2FA Email Sent',
                        user_id: user.id,
                        headers: formatLogData(req.headers),
                        body: formatLogData(req.body),
                        message: `2FA Email Sent [${user.id}] [${user.email}]`
                    });

                    return successResponse(res, {data: '2FA_CODE_SENT'});
                } else {
                    // 2FA tokens in query params
                    // Attempt to get user from database.
                    if (user.email_verification_code !== Number(email2faVerification)) {
                        return errorResponse(res, 'EMAIL_2FA_WRONG', 404);
                    }
                }
            }

            if (toggleAuthenticator) {

                if (!authenticator2faVerification || !await verifyGoogle2FA(user.id.toString(), authenticator2faVerification, false)) {
                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Error: Authenticator Code Wrong',
                        user_id: user.id,
                        headers: formatLogData(req.headers),
                        body: formatLogData(req.body),
                        message: `change2FAMethod: Authenticator Code Wrong [${user.id}] [${user.email}]`
                    });
                    return errorResponse(res, 'CANNOT_VERIFY_AUTHENTICATOR', 500);
                }
            }

            Userhistory.create({
                user_id: user.id,
                new_value: JSON.stringify(req.body),
                old_value: JSON.stringify(user.payload),
                change_type: 'update2fa',
                stringified_headers: JSON.stringify(req.headers)
            });
            user.payload.email = toggleEmail;
            user.payload.authenticator = toggleAuthenticator;
            if (toggleAuthenticator === false) {
                user.authenticator_qr = null;
                user.authenticator_secret = null;
                user.payload.authenticatorConfirmed = false;
            }
            user.changed('payload', true);
            await user.save();

            Logger.info({
                method: arguments.callee.name,
                type: '2FA Methods Changed',
                user_id: user.id,
                headers: formatLogData(req.headers),
                body: formatLogData(req.body),
                message: `change2FAMethod: 2FA Method Changed [${user.id}] [${user.email}]`
            });
            return successResponse(res, { message: 'User payload updated successfully.' });
        }
        //in any other case, return error
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'change2FAMethods', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function generateAuthenticatorQR(req, res) {
    try {
        const key = req.header('key');
        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id } });

            if (user.authenticator_secret && user.payload.authenticator == true) {
                return errorResponse(res, 'AUTHENTICATOR_ALREADY_ENABLED', 500);
            }
            if (user != null) {
                user.authenticator_secret = authenticator.generateSecret();

                const otp = authenticator.keyuri(user.email, 'Morpher Wallet', user.authenticator_secret);

                try {
                    const result = await QRCode.toDataURL(otp);

                    user.authenticator_qr = result;
                    await user.save();

                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Generated Authenticator QR Code',
                        user_id: user.id,
                        headers: formatLogData(req.headers),
                        body: formatLogData(req.body),
                        message: `Authenticator Code generated [${user.id}] [${user.email}]`
                    });
                    return successResponse(res, {
                        image: result,
                        secret: user.authenticator_secret 
                    });
                } catch (e) {
                    return errorResponse(res, 'CANNOT_GENERATE_QR_CODE', 500);
                }
            }
        }

        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'generateAuthenticatorQR', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function verifyAuthenticatorCode(req, res) {
    try {
        const code = req.body.code;
        const key = req.body.key;
        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id } });

            if (user != null) {
                if (await verifyGoogle2FA(user.id.toString(), code, false)) {
                    if (user.payload.authenticatorConfirmed === false) {
                        user.payload.authenticator = true;
                        user.payload.authenticatorConfirmed = true;
                        user.changed('payload', true);
                        await user.save();
                    }
                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Verify Authenticator Code',
                        user_id: user.id,
                        headers: formatLogData(req.headers),
                        body: formatLogData(req.body),
                        message: `verifyAuthenticatorCode: Authenticator Code verified successfully [${user.id}] [${user.email}]`
                    });
                    return successResponse(res, true);
                } else {
                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Error: Authenticator Code Wrong',
                        user_id: user.id,
                        headers: formatLogData(req.headers),
                        body: formatLogData(req.body),
                        message: `verifyAuthenticatorCode: Authenticator Code wrong [${user.id}] [${user.email}]`
                    });
                    return errorResponse(res, 'CANNOT_VERIFY_AUTHENTICATOR', 500);
                }
            }
        }
        Logger.info({ method: arguments.callee.name, type: 'Error: User Not found', headers: formatLogData(req.headers), body: formatLogData(req.body) });
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'verifyAuthenticatorCode', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

async function updateEmail2fa(user_id) {
    const user = await User.findOne({ where: { id: user_id } });
    const verificationCode = randomFixedInteger(6);
    user.email_verification_code = verificationCode;
    user.email2fa_valid_until = new Date(Date.now() + (15 * 60 * 1000)); //15 minutes valid
    user.payload.email2fa_retry_count = 0;

    await user.save();
    return user.email_verification_code;
}

export async function send2FAEmail(req, res) {
    try {
        const key = req.body.key;
        const recovery = await Recovery.findOne({ where: { key } });
        const user = await User.findOne({ where: { id: recovery.user_id } });
        const sendEmails = process.env.SEND_EMAILS;

        try {
            const verificationCode = await updateEmail2fa(user.id);

            if (sendEmails === 'true') {
                await sendEmail2FA(verificationCode, user.email, user);
            }

            Logger.info({
                method: arguments.callee.name,
                type: '2FA Email Sent',
                user_id: user.id,
                headers: formatLogData(req.headers),
                body: formatLogData(req.body),
                message: `send2FAEmail: 2FA Email Sent [${user.id}] [${user.email}]`
            });
            return successResponse(res, { sent: true });
        } catch (e) {
            Logger.error({ source: 'send2FAEmail', data: formatLogData(req.body), message: e.message || e.toString() });
            return errorResponse(res, 'PROBLEM_SENDING_EMAIL', 500);
        }
    } catch (error) {
        Logger.error({ source: 'send2FAEmail', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function verifyEmailCode(req, res) {
    try {
        const code = req.body.code;
        const key = req.body.key;

        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id } });
            if (user != null) {
                if (await isEmail2FaStillValid(recovery.user_id)) {
                    if (await verifyEmail2FA(recovery.user_id, code, true)) {
                        Logger.info({
                            method: arguments.callee.name,
                            type: 'Email 2FA Code Verified',
                            user_id: user.id,
                            headers: formatLogData(req.headers),
                            body: formatLogData(req.body),
                            message: `verifyEmailCode: 2FA Email Verified Successfully [${user.id}] [${user.email}]`
                        });
                        return successResponse(res, true);
                    } else {
                        Logger.info({
                            method: arguments.callee.name,
                            type: 'Error: Email 2FA Code Wrong',
                            user_id: user.id,
                            headers: formatLogData(req.headers),
                            body: formatLogData(req.body),
                            message: `verifyEmailCode: 2FA Email Wrong [${user.id}] [${user.email}]`
                        });
                        return errorResponse(res, 'CANNOT_VERIFY_EMAIL_CODE', 400);
                    }
                } else {
                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Error: Email 2FA Code Expired',
                        user_id: user.id,
                        headers: formatLogData(req.headers),
                        body: formatLogData(req.body),
                        message: `verifyEmailCode: 2FA Email Code Exired [${user.id}] [${user.email}]`
                    });
                    return errorResponse(res, 'EMAIL_2FA_EXPIRED', 400);
                }
            }
        }

        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'verifyEmailCode', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function verifyEmailConfirmationCode(req, res) {
    try {
        const code = req.body.code;
        const key = req.body.key;
        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id } });
            if (user != null) {
                if (await verifyEmail2FA(recovery.user_id, code)) {
                    user.payload.needConfirmation = false;
                    user.payload.registerConfirmation = false;
                    user.changed('payload', true);
                    await user.save();

                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Email Confirmation Code Verified',
                        user_id: user.id,
                        headers: formatLogData(req.headers),
                        body: formatLogData(req.body),
                        message: `verifyEmailConfirmationCode: 2FA Email Confirmed Successfully [${user.id}] [${user.email}]`
                    });
                    return successResponse(res, true);
                } else {
                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Error: Email Confirmation Code Wrong',
                        user_id: user.id,
                        headers: formatLogData(req.headers),
                        body: formatLogData(req.body),
                        message: `verifyEmailConfirmationCode: 2FA Email Wrong [${user.id}] [${user.email}]`
                    });
                    return errorResponse(res, 'CANNOT_VERIFY_EMAIL_CODE', 400);
                }
            }
        }

        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'verifyEmailConfirmationCode', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function resetRecovery(req, res) {
    try {
        const loginKey = req.header('key');
        const recoveryTypeId = req.body.recoveryTypeId;
        const key = req.body.key;
        const email = req.body.email;

        // Verify the apple acess token for apple logins
        const emailKey = await getKeyEmail(recoveryTypeId, req.body.token, key, email, vk_tokens[loginKey]);

        if (emailKey.success !== true) {
            return errorResponse(res, 'TOKEN_VALIDATION_ERROR', 500);     
        }


        // use the SSO email and check the user key for apple and google
        if (key !== emailKey.key) {
            Logger.error({ source: 'saveEmailPassword', data: formatLogData(req.body), message: 'User key SSO mismatch' });
            return errorResponse(res, 'SSO_KEY_MISMATCH', 500);     
        }        

        const defaultRecovery = await Recovery.findOne({ where: { key } });
        if (defaultRecovery !== null && recoveryTypeId !== 1) {
            const recovery = await Recovery.findOne({ where: { user_id: defaultRecovery.user_id, recovery_type_id: recoveryTypeId } });
            if (recovery !== null) {
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Recovery Method Removed',
                    recovery: {...recovery, encrypted_seed: '-'},
                    headers: formatLogData(req.headers),
                    body: formatLogData(req.body),
                    message: `resetRecovery: Recovery Method Removed [${defaultRecovery.user_id}] [${recoveryTypeId}]`
                });
                await recovery.destroy();

                return successResponse(res, true);
            }


            Logger.error({
                method: arguments.callee.name,
                type: 'Error: Recovery Method Not found',
                recovery: {...recovery, encrypted_seed: '-'},
                headers: formatLogData(req.headers),
                body: formatLogData(req.body),
                message: `resetRecovery: Recovery Method Not Found [${defaultRecovery.user_id}] [${recoveryTypeId}]`
            });
            return errorResponse(res, 'CANNOT_FIND_RECOVERY', 404);
        }

        Logger.error({
            method: arguments.callee.name,
            type: 'Error: User Not Found',
            key,
            headers: formatLogData(req.headers),
            body: formatLogData(req.body),
            message: `resetRecovery: User Not Found [${key.substr(0, 10)}...] [${recoveryTypeId}]`
        });
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'verifyEmailConfirmationCode', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function deleteAccount(req, res) {
    try {
        const user = await User.findOne({ where: { email: formatLogData(req.body).email.toLowerCase().replace(/ /g, '') } });
        if (user !== null) {
            try {
                await user.destroy();
                await Userhistory.create({
                    new_value: JSON.stringify(req.body),
                    old_value: JSON.stringify(user.payload),
                    change_type: 'deleteAccount',
                    stringified_headers: JSON.stringify(req.headers)
                });
                Logger.info({
                    method: arguments.callee.name,
                    type: 'User Account Deleted',
                    headers: formatLogData(req.headers),
                    body: formatLogData(req.body),
                    message: `deleteAccount: User deleted [${req.body.email.toLowerCase().replace(/ /g, '')}] [${user.id}]`
                });
                return successResponse(res, true);
            } catch (e) {
                return errorResponse(res, 'CANNOT_DELETE_USER', 500);
            }
        }

        Logger.error({
            method: arguments.callee.name,
            type: 'Error: User Not Found',
            headers: formatLogData(req.headers),
            body: formatLogData(req.body),
            message: `deleteAccount: User Not Found [${req.body.email.toLowerCase().replace(/ /g, '')}]`
        });


        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'deleteAccount', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

async function verifyEmail2FA(user_id: string, code: string, isEmailChange: boolean = false, email_override: String = ''): Promise<boolean> {
    const user = await User.findOne({ where: { id: user_id } });
    const sendEmails = process.env.SEND_EMAILS;

    if (user.payload.needConfirmation || isEmailChange) {
        const verified = user.email_verification_code === Number(code)
        if (!verified) {
            user.payload.email2fa_retry_count = (user.payload.email2fa_retry_count || 0) + 1;
            if (user.payload.email2fa_retry_count >=3) {
                const verificationCode = await updateEmail2fa(user.id);
                if (sendEmails === 'true') {
                    if (!email_override) {
                        email_override = user.email
                    }
                    await sendEmail2FA(verificationCode, email_override, user);
                }
            }
        }
        return verified
    }

    const verified = user.payload.email === false || (user.email_verification_code === Number(code));

    if (!verified) {
        user.payload.email2fa_retry_count = (user.payload.email2fa_retry_count || 0) + 1;
        if (user.payload.email2fa_retry_count >=3) {
            const verificationCode = await updateEmail2fa(user.id);
            if (sendEmails === 'true') {
                if (!email_override) {
                    email_override = user.email
                }
                await sendEmail2FA(verificationCode, email_override, user);
            }
        }
    }

    return verified

}

async function isEmail2FaStillValid(user_id: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: user_id } });

    const email2faValidUntil = new Date(user.email2fa_valid_until);
    return (user.payload.email === false || email2faValidUntil > new Date());
}

async function verifyGoogle2FA(user_id: string, code: string, getSeed: boolean = true): Promise<boolean> {
    const user = await User.findOne({ where: { id: user_id } });
    if (getSeed) {
        return user.payload.authenticator === false || authenticator.check(code, user.authenticator_secret);
    } else return authenticator.check(code, user.authenticator_secret);
}

export async function updateUserPayload(req, res) {
    try {
        const key = req.header('key');
        const payloadColumn = req.body.column;
        const payloadValue = req.body.value;
        
        // only allow updates to app lang payload column
        if (payloadColumn !== 'app_lang') {
            return res.status(403).json({ error: "INVALID_REQUEST" });
        }

        const recovery_type_id = Number(req.body.recovery_type || req.header('recoveryTypeId') || 1);
        
        // Create a new recovery method.
        const recovery = await Recovery.findOne({ where: { key, recovery_type_id: recovery_type_id } });
        if (recovery) {
            const user = await User.findOne({ where: { id: recovery.user_id } });

            if (user) {
                user.payload[payloadColumn] = payloadValue;
                user.changed('payload', true);
                await user.save();

                return successResponse(res, true);
            }
        }
    } catch (error) {
        Logger.error({ source: 'updateUserPayload', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }

    //error out in any other case
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
}

// generate an auth key using the vk app id and vk secure key. this validates the user is originating from the correct url and is using the correct application code 
export const fetchVKAuthToken = async (req, res) => {
    try {

        const token = req.body.code

        const axios = require('axios')

        const getAuthToken = `https://oauth.vk.com/access_token?client_id=${process.env.VK_APP_ID}&client_secret=${process.env.VK_SECURE_KEY}&redirect_uri=${process.env.VK_URL}&code=${token}`

        const response = await axios.get(getAuthToken);

        const auth_token = response.data;

        const key = req.header('key');
        const recovery_type_id = req.header('recoverytypeid');

        const recovery = await Recovery.findOne({ where: { key, recovery_type_id: recovery_type_id } });


        if (!recovery || ! recovery.user_id) {
            return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
        }

        vk_tokens[key] = {token: auth_token.access_token, date: Date.now(), user_id: recovery.user_id, vk_user_id: auth_token.user_id }

        const keys = Object.keys(vk_tokens)
        keys.forEach(k => {
            if (vk_tokens[k].date < Date.now() - (1000 * 60 * 60)) {
                delete vk_tokens[k]
            }
        })

        return successResponse(res, auth_token);

    } catch (error) {
        Logger.error({ source: 'fetchVKAuthToken', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

// generate a vk token for recovery
export const recoveryVKAuthToken = async (req, res) => {
    try {
        const token = req.body.code
        const type = req.body.type

        const axios = require('axios')
        let getAuthToken;
        

        if (type == 'app'){
            getAuthToken = `https://oauth.vk.com/access_token?client_id=${process.env.VK_APP_ID}&client_secret=${process.env.VK_SECURE_KEY}&redirect_uri=${process.env.VK_URL_APP}&code=${token}`
        } else {
            getAuthToken = `https://oauth.vk.com/access_token?client_id=${process.env.VK_APP_ID}&client_secret=${process.env.VK_SECURE_KEY}&redirect_uri=${process.env.VK_URL}&code=${token}`
        }

        let response = await axios.get(getAuthToken);

        const auth_token = response.data;

        const key = await sha256(process.env.VK_APP_ID + auth_token.user_id )

        const recovery_type_id = 5;

        const recovery = await Recovery.findOne({ where: { key, recovery_type_id: recovery_type_id } });


        if (!recovery || ! recovery.user_id) {
            return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
        }

        vk_tokens[key] = {token: auth_token.access_token, date: Date.now(), user_id: recovery.user_id, vk_user_id: auth_token.user_id }

        const keys = Object.keys(vk_tokens)
        keys.forEach(k => {
            if (vk_tokens[k].date < Date.now() - (1000 * 60 * 60)) {
                delete vk_tokens[k]
            }
        })

        return successResponse(res, auth_token);

    } catch (error) {
        Logger.error({ source: 'recoveryVKAuthToken', data: formatLogData(req.body), message: error.message || error.toString() });
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}