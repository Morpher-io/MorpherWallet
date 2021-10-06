import { getTransaction, Op } from '../database';
import { User, Userhistory, Recovery, Recovery_Type } from '../database/models';
import { decrypt, encrypt, errorResponse, successResponse, sha256, randomFixedInteger } from '../helpers/functions/util';
const { to } = require('await-to-js');
import { Request, Response } from 'express';

import { VK } from 'vk-io';
import { Facebook } from 'fb';
import { sendEmail2FA, sendEmailChanged } from '../helpers/functions/email';
import { authenticator } from 'otplib';
const QRCode = require('qrcode');
const options = {
    app_id: process.env.FACEBOOK_APP_ID,
    app_secret: process.env.FACEBOOK_APP_SECRET,
    default_graph_version: 'v7.0'
};
const FB = new Facebook(options);
const Google = require('googleapis').google;
const OAuth2 = Google.auth.OAuth2;
const oauth2Client = new OAuth2();

import { Logger } from '../helpers/functions/winston';

// Function to save new signups to the database.
export async function saveEmailPassword(req: Request, res: Response) {
    // Get sequelize transactions to rollback changes in case of failure.
    const [err, transaction] = await to(getTransaction());
    if (err) return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);

    try {
        // Get variables from request body.
        const email = req.body.email;
        const key = req.body.key;
        const encryptedSeed = req.body.encryptedSeed;
        const recoveryTypeId = req.body.recoveryTypeId || 1;
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
            // If it exists, set the userId and delete the associated recovery method.
            // If it doesnt exist create a new one.
            const payload = { email: false, authenticator: false, authenticatorConfirmed: false, needConfirmation: true };

            const nonce = 1;

            userId = (await User.create({ email, payload, nonce, eth_address }, { transaction })).getDataValue('id');

            // Create a new recovery method.
            const recoveryId = (
                await Recovery.create(
                    {
                        recovery_type_id: recoveryTypeId,
                        user_id: userId,
                        encrypted_seed: JSON.stringify(await encrypt(JSON.stringify(encryptedSeed), process.env.DB_BACKEND_SALT)),
                        key
                    },
                    { transaction }
                )
            ).getDataValue('id');
            // Commit changes to database and return successfully.
            await transaction.commit();

            Logger.info({ method: arguments.callee.name, type: 'New Wallet', user_id: userId, headers: req.headers, body: req.body });

            return successResponse(res, {
                recovery_id: recoveryId
            });
        } else {
            await transaction.commit();
        }
    } catch (error) {
        // If an error happened anywhere along the way, rollback all the changes.
        await transaction.rollback();
        Logger.error({ source: 'saveEmailPassword', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }

    return errorResponse(res, 'USER_NOT_FOUND', 404);
}

export async function getRecoveryMethods(req: Request, res: Response) {
    try {
        const key = req.header('key');
        const recoveryEmail = await Recovery.findOne({ where: { key, recovery_type_id: 1 } });
        const recovery = await Recovery.findAll({ where: { user_id: recoveryEmail.user_id }, include: [Recovery_Type] });
        const recoveryTypes = [];
        for (let i = 0; i < recovery.length; i++) {
            recoveryTypes.push(recovery[i].recovery_type);
        }
        return successResponse(res, recoveryTypes);
    } catch (error) {
        Logger.error({ source: 'getRecoveryMethods', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function addRecoveryMethod(req: Request, res: Response) {
    try {
        const key = req.header('key');
        const keyForSaving = req.body.key;
        const recoveryTypeId = req.body.recoveryTypeId;

        const emailRecovery = await Recovery.findOne({ where: { key, recovery_type_id: 1 } });

        const recovery = await Recovery.findOne({ where: { user_id: emailRecovery.user_id, recovery_type_id: recoveryTypeId } });
        if (recovery == null) {
            const newRecoveryId = (
                await Recovery.create({
                    recovery_type_id: recoveryTypeId,
                    user_id: emailRecovery.user_id,
                    encrypted_seed: JSON.stringify(await encrypt(JSON.stringify(req.body.encryptedSeed), process.env.DB_BACKEND_SALT)),
                    key: keyForSaving
                })
            ).getDataValue('id');

            Logger.info({
                method: arguments.callee.name,
                type: 'Added new Recovery Method',
                user_id: emailRecovery.user_id,
                recovery_id: newRecoveryId,
                headers: req.headers,
                body: req.body
            });
            return successResponse(res, {
                recovery_id: newRecoveryId
            });
        }

        return errorResponse(res, 'RECOVERY_METHOD_ALREADY_SET');
    } catch (error) {
        Logger.error({ source: 'addRecoveryMethod', data: req.body, message: error.message || error.toString() } );
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
                headers: req.headers,
                body: req.body
            });
            return successResponse(res, 'updated');
        }

    } catch (error) {
        Logger.error({ source: 'updatePassword', data: req.body, message: error.message || error.toString() } );
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
        const newEmail = req.body.newEmail;
        const email2faVerification = req.body.email2faVerification;
        const key = req.header('key');
        const recoveryTypeId = 1;
        const environment = process.env.ENVIRONMENT;

        const recovery = await Recovery.findOne({ where: { key, recovery_type_id: recoveryTypeId }, transaction });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id }, transaction });
            const user_should_not_exist = await User.findOne( { where: { email: newEmail , id: {[Op.ne]: user.id } } } );
            //the user doesn't exist yet
            if (user_should_not_exist == null) {
                //email 2FA alredy sent out to verify new email address exists?
                if (email2faVerification === undefined) {
                    const verificationCode = await updateEmail2fa(user.id);
                    if (environment !== 'development') {
                        await sendEmail2FA(verificationCode, newEmail);
                    }
                    transaction.commit(); //close the transaction after the 2fa was sent
                    return successResponse(res, 'sent 2fa code to new email address');
                } else {
                    // 2FA tokens in query params
                    // Attempt to get user from database.
                    if (verifyEmail2FA(user.id.toString(), email2faVerification)) {
                        //2fa passed here
                        Userhistory.create({
                            user_id: user.id,
                            old_value: user.email,
                            new_value: newEmail,
                            change_type: 'updateEmail',
                            stringified_headers: JSON.stringify(req.headers)
                        });
                        if (environment !== 'development') {
                            await sendEmailChanged(newEmail, user.email);
                        } //send the old user an info-mail that his email address got updated.

                        Logger.info({
                            method: arguments.callee.name,
                            type: 'Email Change',
                            user_id: user.id,
                            old_value: user.email,
                            new_value: newEmail,
                            headers: req.headers,
                            body: req.body
                        });

                        //save the new user email
                        user.email = newEmail;
                        await user.save({ transaction });

                        //save the new recovery key for the recovery option email
                        recovery.key = await sha256(newEmail);
                        await recovery.save({ transaction });

                        // Commit changes to database and return successfully.
                        await transaction.commit();
                        return successResponse(res, { updated: true });
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
        Logger.error({ source: 'updateEmail', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

// Function to get an encrypted seed from the database using a key.
export async function getEncryptedSeed(req, res) {
    try {
        const key = req.body.key;
        const email2fa = req.body.email2fa;
        const authenticator2fa = req.body.authenticator2fa;
        const recovery_type_id = 1;

        // Simply get Recovery instance that has this key and return it if its found.
        const recovery = await Recovery.findOne({ where: { key, recovery_type_id }, raw: true });

        if (recovery) {
            const user = await User.findOne({ where: { id: recovery.user_id } });

            if (user.payload.needConfirmation) {
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Error: Account not confirmed',
                    error: '2fa wrong',
                    user_id: user.id,
                    user,
                    headers: req.headers,
                    body: req.body
                });
                return errorResponse(res, 'ACCOUNT_NOT_CONFIRMED', 400);
            }

            const email2FAVerified = await verifyEmail2FA(recovery.user_id, email2fa);
            const googleVerified = await verifyGoogle2FA(recovery.user_id, authenticator2fa);

            if (!email2FAVerified || !googleVerified) {
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Error: Fetch Encrypted Seed Failed',
                    error: '2fa wrong',
                    user_id: user.id,
                    user,
                    headers: req.headers,
                    body: req.body
                });
                return errorResponse(res, 'SOME_2FA_WRONG', 400);
            }

            const email2faStillValid = await isEmail2FaStillValid(recovery.user_id);
            if (!email2faStillValid) {
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Error: Fetch Encrypted Seed Failed',
                    error: '2fa expired',
                    user_id: user.id,
                    user,
                    headers: req.headers,
                    body: req.body
                });
                return errorResponse(res, 'EMAIL_2FA_EXPIRED', 400);
            }
            
            //avoid replay attack, generate a new Email 2FA after it was validated and seed was sent
            if (user.payload.email) {
                updateEmail2fa(user.id);
            }
            //only if the codes are correct we get the juicy seed.

            Logger.info({
                method: arguments.callee.name,
                type: 'Fetch Encrypted Seed',
                user_id: user.id,
                user,
                headers: req.headers,
                body: req.body
            });
            return successResponse(res, {
                encryptedSeed: await decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT)
            });
        }

        // Otherwise return an error.
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'getEncryptedSeed', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

// Function to get encrypted seed from facebook recovery.
async function getFacebookEncryptedSeed(req, res) {
    try {
        // Get access token and email from request body.
        const accessToken = req.body.accessToken;
        const signupEmail = req.body.signupEmail;

        // Set facebook access token and make the query for the current profile.
        FB.setAccessToken(accessToken);
        const result = await FB.api('/me?fields=name,email', 'get');

        // Hash the facebook id with user id to get the database key.
        const key = sha256(process.env.FACEBOOK_APP_ID + result.id);

        // Attempt to get user from database with the given email address.
        const user = await User.findOne({ where: { email: signupEmail }, raw: true });

        if (user) {
            // If user exists return the decrypted seed.
            const recovery = await Recovery.findOne({ where: { key, recovery_type_id: 2, user_id: user.id } });
            if (recovery) {
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Recover Encrypted Seed',
                    user_id: user.id,
                    recovery,
                    headers: req.headers,
                    body: req.body
                });
                return successResponse(res, { encryptedSeed: await decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT) });
            }
        }
        Logger.info({ method: arguments.callee.name, type: 'Failed Recover Encrypted Seed', headers: req.headers, body: req.body });
        // If user does not exist return an error.
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'getFacebookEncryptedSeed', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

// Function to get encrypted seed from google recovery.
async function getGoogleEncryptedSeed(req, res) {
    try {
        // Get access token and email from request body.
        const accessToken = req.body.accessToken;
        const signupEmail = req.body.signupEmail;

        // Set google access token and make the query for the current profile.
        oauth2Client.setCredentials({ access_token: accessToken });
        const oauth2 = Google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        const result = await oauth2.userinfo.get();

        // Hash the facebook id with user id to get the database key.
        const key = await sha256(process.env.GOOGLE_APP_ID + result.data.id);

        // If user exists return the decrypted seed.
        // Attempt to get user from database with the given email address.
        const user = await User.findOne({ where: { email: signupEmail } });

        if (user != null) {
            const recovery = await Recovery.findOne({ where: { user_id: user.id, key, recovery_type_id: 3 }, include: [User] });
            if (recovery != null) {
                /**
                 * Big question: are we leaking user-data here? No: The access token has only limited validity and will be different next time
                 */
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Recover Encrypted Seed',
                    user_id: user.id,
                    recovery,
                    headers: req.headers,
                    body: req.body
                });
                return successResponse(res, {
                    encryptedSeed: await decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT),
                    email: recovery.user.email
                });
            }
        }

        Logger.info({ method: arguments.callee.name, type: 'Failed Recover Encrypted Seed', headers: req.headers, body: req.body });
        // If user does not exist return an error.
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'getGoogleEncryptedSeed', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

// Function to get encrypted seed from vkontakte recovery.
async function getVKontakteEncryptedSeed(req, res) {
    try {
        // Get access token and email from request body.
        const accessToken = req.body.accessToken;
        const signupEmail = req.body.signupEmail;

        // Set vkontakte access token and make the query for the current profile.
        const vk = new VK({
            token: accessToken
        });
        const result = await vk.api.users.get([accessToken]);

        // Hash the facebook id with user id to get the database key.
        const key = await sha256((process.env.VK_APP_ID + result[0].id).toString());

        // Attempt to get user from database with the given email address.
        const user = await User.findOne({ where: { email: signupEmail } });

        if (user != null) {
            // If user exists return the decrypted seed.
            const recovery = await Recovery.findOne({ where: { key, recovery_type_id: 5, user_id: user.id } });
            if (recovery != null) {
                Logger.info({
                    method: arguments.callee.name,
                    type: 'Recover Encrypted Seed',
                    user_id: user.id,
                    recovery,
                    headers: req.headers,
                    body: req.body
                });
                return successResponse(res, { encryptedSeed: await decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT) });
            }
        }
        Logger.info({ method: arguments.callee.name, type: 'Failed Recover Encrypted Seed', headers: req.headers, body: req.body });
        // If user does not exist return an error.
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'getVKontakteEncryptedSeed', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function recoverSeedSocialRecovery(req: Request, res: Response) {
    switch (req.body.recoveryTypeId) {
        case 2:
            return await getFacebookEncryptedSeed(req, res);
        case 3:
            return await getGoogleEncryptedSeed(req, res);
        case 5:
            return await getVKontakteEncryptedSeed(req, res);
        default:
            return errorResponse(res, 'RECOVERY_METHOD_NOT_EXIST', 500);
    }
}

// Function to return all 2FA methods from the database.
export async function getPayload(req, res) {
    try {
        const key = req.body.key;
        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery == null) {
            return errorResponse(res, 'USER_NOT_FOUND', 404);
        }
        const user = await User.findOne({ where: { id: recovery.user_id }, raw: true });

        const payload = {};
        if (user != null && user['payload'] !== null) {
            if (user['payload'].email !== undefined) {
                payload['email'] = user.payload.email;
            }
            if (user['payload'].authenticator !== undefined) {
                payload['authenticator'] = user.payload.authenticator;
            }
            if (user['payload'].emailVerificationCode !== undefined) {
                payload['emailVerificationCode'] = user.payload.emailVerificationCode;
            }
            if (user['payload'].authenticatorConfirmed !== undefined) {
                payload['authenticatorConfirmed'] = user.payload.authenticatorConfirmed;
            }
            if (user['payload'].needConfirmation !== undefined) {
                payload['needConfirmation'] = user.payload.needConfirmation;
            }
        }

        if (user) {
            Logger.info({ method: arguments.callee.name, type: 'Get Payload', user_id: user.id, user, headers: req.headers, body: req.body });
            return successResponse(res, payload);
        } else {
            return errorResponse(res, 'METHODS_2FA_NOT_FOUND', 404);
        }
    } catch (error) {
        Logger.error({ source: 'getPayload', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function getNonce(req, res) {
    try {
        const key = req.body.key;
        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery == null) {
            Logger.info({ method: arguments.callee.name, type: 'Error: User Not found', key, headers: req.headers, body: req.body });
            return errorResponse(res, 'USER_NOT_FOUND', 404);
        }
        const user = await User.findOne({ where: { id: recovery.user_id }, raw: true });

        if (user) {
            Logger.info({ method: arguments.callee.name, type: 'Get Nonce', user_id: user.id, user, headers: req.headers, body: req.body });
            return successResponse(res, { nonce: user.nonce });
        } else {
            return errorResponse(res, 'NONCE_NOT_FOUND', 404);
        }
    } catch (error) {
        Logger.error({ source: 'getNonce', data: req.body, message: error.message || error.toString() } );
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
        const environment = process.env.ENVIRONMENT;

        // only allow one
        if (toggleAuthenticator) toggleEmail = false;
        if (toggleEmail) toggleAuthenticator = false;

        const key = req.header('key');

        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id } });

            if (toggleEmail) {
                if (!email2faVerification) {
        
                    const verificationCode = await updateEmail2fa(user.id);

                    if (environment !== 'development') {
                        await sendEmail2FA(verificationCode, user.email);
                    }
                    
                    Logger.info({
                        method: arguments.callee.name,
                        type: '2FA Email Sent',
                        user_id: user.id,
                        user,
                        headers: req.headers,
                        body: req.body
                    });
        
                    return successResponse(res, 'sent 2fa code to email address');
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
                        user,
                        headers: req.headers,
                        body: req.body
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
                user,
                headers: req.headers,
                body: req.body
            });
            return successResponse(res, { message: 'User payload updated successfully.' });
        }
        //in any other case, return error
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'change2FAMethods', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function generateAuthenticatorQR(req, res) {
    try {
        const key = req.header('key');
        const recovery = await Recovery.findOne({ where: { key } });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id } });
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
                        user,
                        headers: req.headers,
                        body: req.body
                    });
                    return successResponse(res, {
                        image: result
                    });
                } catch (e) {
                    return errorResponse(res, 'CANNOT_GENERATE_QR_CODE', 500);
                }
            }
        }

        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'generateAuthenticatorQR', data: req.body, message: error.message || error.toString() } );
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
                        user,
                        headers: req.headers,
                        body: req.body
                    });
                    return successResponse(res, true);
                } else {
                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Error: Authenticator Code Wrong',
                        user_id: user.id,
                        user,
                        headers: req.headers,
                        body: req.body
                    });
                    return errorResponse(res, 'CANNOT_VERIFY_AUTHENTICATOR', 500);
                }
            }
        }
        Logger.info({ method: arguments.callee.name, type: 'Error: User Not found', headers: req.headers, body: req.body });
        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'verifyAuthenticatorCode', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

async function updateEmail2fa(user_id) {
    const user = await User.findOne({ where: { id: user_id } });
    const verificationCode = randomFixedInteger(6);
    user.email_verification_code = verificationCode;
    user.email2fa_valid_until = new Date(Date.now() + (15 * 60 * 1000)); //15 minutes valid
    await user.save();
    return user.email_verification_code;
}

export async function send2FAEmail(req, res) {
    try {
        const key = req.body.key;
        const recovery = await Recovery.findOne({ where: { key } });
        const user = await User.findOne({ where: { id: recovery.user_id } });
        const environment = process.env.ENVIRONMENT;

        try {
            const verificationCode = await updateEmail2fa(user.id);

            if (environment !== 'development') {
                await sendEmail2FA(verificationCode, user.email);
            }

            Logger.info({
                method: arguments.callee.name,
                type: '2FA Email Sent',
                user_id: user.id,
                user,
                headers: req.headers,
                body: req.body
            });
            return successResponse(res, { sent: true });
        } catch (e) {
            Logger.error({ source: 'send2FAEmail', data: req.body, message: e.message || e.toString() } );
            return errorResponse(res, 'PROBLEM_SENDING_EMAIL', 500);
        }
    } catch (error) {
        Logger.error({ source: 'send2FAEmail', data: req.body, message: error.message || error.toString() } );
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
                    if (await verifyEmail2FA(recovery.user_id, code)) {
                        Logger.info({
                            method: arguments.callee.name,
                            type: 'Email 2FA Code Verified',
                            user_id: user.id,
                            user,
                            headers: req.headers,
                            body: req.body
                        });
                        return successResponse(res, true);
                    } else {
                        Logger.info({
                            method: arguments.callee.name,
                            type: 'Error: Email 2FA Code Wrong',
                            user_id: user.id,
                            user,
                            headers: req.headers,
                            body: req.body
                        });
                        return errorResponse(res, 'CANNOT_VERIFY_EMAIL_CODE', 400);
                    }
                } else {
                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Error: Email 2FA Code Expired',
                        user_id: user.id,
                        user,
                        headers: req.headers,
                        body: req.body
                    });
                    return errorResponse(res, 'EMAIL_2FA_EXPIRED', 400);
                }
            }
        }

        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'verifyEmailCode', data: req.body, message: error.message || error.toString() } );
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
                    user.changed('payload', true);
                    await user.save();

                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Email Confirmation Code Verified',
                        user_id: user.id,
                        user,
                        headers: req.headers,
                        body: req.body
                    });
                    return successResponse(res, true);
                } else {
                    Logger.info({
                        method: arguments.callee.name,
                        type: 'Error: Email Confirmation Code Wrong',
                        user_id: user.id,
                        user,
                        headers: req.headers,
                        body: req.body
                    });
                    return errorResponse(res, 'CANNOT_VERIFY_EMAIL_CODE', 400);
                }
            }
        }

        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'verifyEmailConfirmationCode', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function resetRecovery(req, res) {
    try {
        const recoveryTypeId = req.body.recoveryTypeId;
        const key = req.body.key;
        const defaultRecovery = await Recovery.findOne({ where: { key } });
        if (defaultRecovery !== null && recoveryTypeId !== 1) {
            const recovery = await Recovery.findOne({ where: { user_id: defaultRecovery.user_id, recovery_type_id: recoveryTypeId } });
            if (recovery !== null) {
                await recovery.destroy();
                return successResponse(res, true);
            }

            return errorResponse(res, 'CANNOT_FIND_RECOVERY', 404);
        }

        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'verifyEmailConfirmationCode', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function deleteAccount(req, res) {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (user !== null) {
            try {
                await user.destroy();
                await Userhistory.create({
                    new_value: JSON.stringify(req.body),
                    old_value: JSON.stringify(user.payload),
                    change_type: 'deleteAccount',
                    stringified_headers: JSON.stringify(req.headers)
                });
                return successResponse(res, true);
            } catch (e) {
                return errorResponse(res, 'CANNOT_DELETE_USER', 500);
            }
        }

        return errorResponse(res, 'USER_NOT_FOUND', 404);
    } catch (error) {
        Logger.error({ source: 'deleteAccount', data: req.body, message: error.message || error.toString() } );
        return errorResponse(res, 'INTERNAL_SERVER_ERROR', 500);
    }
}

async function verifyEmail2FA(user_id: string, code: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: user_id } });
    if (user.payload.needConfirmation) {
        return user.email_verification_code === Number(code)
    }

    return user.payload.email === false || (user.email_verification_code === Number(code));
    
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
