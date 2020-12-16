import { getTransaction, Op, Recovery, Recovery_Type, User, Userhistory } from '../database/models';
import { decrypt, encrypt, errorResponse, successResponse, sha256, randomFixedInteger } from '../helpers/functions/util';
const { to } = require('await-to-js');
import { Request, Response } from 'express';

import { VK } from 'vk-io';
import { Facebook } from 'fb';
import { sendEmail2FA, sendEmailChanged } from "../helpers/functions/email";
import { authenticator } from "otplib";
const QRCode = require('qrcode')
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
    if (err) return errorResponse(res, err.message);

    try {
        // Get variables from request body.
        const email = req.body.email;
        const key = req.body.key;
        const encryptedSeed = req.body.encryptedSeed;
        const recoveryTypeId = req.body.recoveryTypeId || 1;
        const eth_address = req.body.ethAddress;

        let userId;

        // Attempt to get user from database.
        const user = await User.findOne({ where: { email }, raw: true, transaction });

        if (user == null) {
            // If it exists, set the userId and delete the associated recovery method.
            // If it doesnt exist create a new one.
            const payload = { email: true, authenticator: false, authenticatorConfirmed: false };

            const nonce = 1;

            userId = (await User.create({ email, payload, nonce, eth_address }, { transaction })).dataValues.id;

            // Create a new recovery method.
            const recoveryId = (
                await Recovery.create(
                    {
                        recovery_type_id: recoveryTypeId,
                        user_id: userId,
                        encrypted_seed: JSON.stringify(encrypt(JSON.stringify(encryptedSeed), process.env.DB_BACKEND_SALT)),
                        key
                    },
                    { transaction }
                )
            ).dataValues.id;
            // Commit changes to database and return successfully.
            await transaction.commit();

            Logger.info({ type: 'New Wallet', user_id: userId, headers: req.headers, body: req.body });

            return successResponse(res, {
                recovery_id: recoveryId
            });
        } else {
            //@TODO confirm user before updating recovery method or move to a different function

            if (recoveryTypeId === 1) {
                await transaction.rollback();
                return errorResponse(res, "Error: User already exists!");
            }
            let recoveryId;

            const recovery = await Recovery.findOne({ where: { user_id: user.id, [Op.and]: { recovery_type_id: recoveryTypeId } }, transaction });
            if (recovery) {
                recovery.user_id = userId;
                recovery.encrypted_seed = JSON.stringify(encrypt(JSON.stringify(encryptedSeed), process.env.DB_BACKEND_SALT));
                recovery.key = key

                recoveryId = recovery.id

            } else {

                recoveryId = (
                    await Recovery.create(
                        {
                            recovery_type_id: recoveryTypeId,
                            user_id: userId,
                            encrypted_seed: JSON.stringify(encrypt(JSON.stringify(encryptedSeed), process.env.DB_BACKEND_SALT)),
                            key
                        },
                        { transaction }
                    )
                ).dataValues.id;
            }

            // Commit changes to database and return successfully.
            await transaction.commit();

            Logger.info({ type: 'Updated Recovery Method', user_id: user.id, recovery_id: recoveryId, user, headers: req.headers, body: req.body });
            return successResponse(res, {
                recovery_id: recoveryId
            });
        }
    } catch (error) {
        // If an error happened anywhere along the way, rollback all the changes.
        console.log(error);
        await transaction.rollback();
        return errorResponse(res, error.message);
    }
}


// Function to save new email/password to the database.
//only works if passed through a middleware that checks the signature!
export async function updatePassword(req: Request, res: Response) {
    // Get sequelize transactions to rollback changes in case of failure.
    const [err, transaction] = await to(getTransaction());
    if (err) return errorResponse(res, err.message);

    try {
        const key = req.header('key');
        const encryptedSeed = req.body.encryptedSeed;

        // Create a new recovery method.
        const recovery = await Recovery.findOne({ where: { key: key, recovery_type_id: 1 } });
        if (recovery != null) {
            recovery.encrypted_seed = JSON.stringify(encrypt(JSON.stringify(encryptedSeed), process.env.DB_BACKEND_SALT));
            recovery.save();

            Logger.info({ method: arguments.callee.name, type: "Password Change", user_id: recovery.user_id, headers: req.headers, body: req.body });
            return successResponse(res, "updated");

        }
    } catch (error) {
        // If an error happened anywhere along the way, rollback all the changes.
        return errorResponse(res, error.message);
    }
    //error out in any other case
    return errorResponse(res, "Internal Error", 500);
}


// Function to save new email/password to the database.
//only works if passed through a middleware that checks the signature!
export async function updateEmail(req: Request, res: Response) {
    // Get sequelize transactions to rollback changes in case of failure.
    let transaction = await getTransaction();

    try {
        // Get variables from request body.
        const newEmail = req.body.newEmail;
        const email2faVerification = req.body.email2faVerification;
        const key = req.header('key');
        const recoveryTypeId = 1;

        const recovery = await Recovery.findOne({ where: { key: key, recovery_type_id: recoveryTypeId }, transaction });
        if (recovery != null) {
            const user = await User.findOne({ where: { id: recovery.user_id }, transaction });
            const user_should_not_exist = await User.findOne({ where: { email: newEmail, [Op.not]: { id: user.id } } });
            //the user doesn't exist yet
            if (user_should_not_exist == null) {
                //email 2FA alredy sent out to verify new email address exists?
                if (email2faVerification == undefined) {
                    let verificationCode = await updateEmail2fa(user.id);
                    await sendEmail2FA(verificationCode, newEmail);
                    transaction.commit(); //close the transaction after the 2fa was sent
                    return successResponse(res, "sent 2fa code to new email address");
                } else {
                    // 2FA tokens in query params
                    // Attempt to get user from database.
                    if (verifyEmail2FA(user.id.toString(), email2faVerification)) {
                        //2fa passed here
                        Userhistory.create({ user_id: user.id, old_value: user.email, new_value: newEmail, change_type: 'updateEmail', stringified_headers: JSON.stringify(req.headers) });
                        sendEmailChanged(newEmail, user.email); //send the old user an info-mail that his email address got updated.

                        Logger.info({ method: arguments.callee.name, type: "Email Change", user_id: user.id, old_value: user.email, new_value: newEmail, headers: req.headers, body: req.body });

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
                return errorResponse(res, "Error: User with this Email address already exists.", 409);
            }
        }
        //any other error case
        await transaction.rollback();
        return errorResponse(res, "Error: Update Operation aborted.", 500);


    } catch (error) {
        // If an error happened anywhere along the way, rollback all the changes.
        return errorResponse(res, error.message);
    }
}



// Function to get an encrypted seed from the database using a key.
export async function getEncryptedSeed(req, res) {
    const key = req.body.key;
    const email2fa = req.body.email2fa;
    const authenticator2fa = req.body.authenticator2fa;

    // Simply get Recovery instance that has this key and return it if its found.
    const [error, result] = await to(Recovery.findOne({ where: { key }, raw: true }));


    if (result) {
        const user = await User.findOne({ where: { id: result.user_id } });

        const email2FAVerified = await verifyEmail2FA(result.user_id, email2fa);
        const googleVerified = await verifyGoogle2FA(result.user_id, authenticator2fa);
        if (!email2FAVerified || !googleVerified) {
            Logger.info({ method: arguments.callee.name, type: "Error: Fetch Encrypted Seed Failed", error: "2fa wrong", user_id: user.id, user, headers: req.headers, body: req.body });
            return errorResponse(res, 'Either Email2FA or Authenticator2FA was wrong. Try again.')
        }
        //avoid replay attack, generate a new Email 2FA after it was validated and seed was sent
        updateEmail2fa(user.id);
        //only if the codes are correct we get the juicy seed.

        Logger.info({ method: arguments.callee.name, type: "Fetch Encrypted Seed", user_id: user.id, user, headers: req.headers, body: req.body });
        return successResponse(res, {
            encryptedSeed: decrypt(JSON.parse(result.encrypted_seed), process.env.DB_BACKEND_SALT)
        });
    }

    // Otherwise return an error.
    return errorResponse(res, 'There is no user with this key.');
}

// Function to return all recovery types from the database.
export async function getRecoveryTypes(req, res) {
    const recoveryMethods = await Recovery_Type.findAll({ raw: true });

    if (recoveryMethods.length > 0) { return successResponse(res, recoveryMethods); }
    else { return errorResponse(res, 'Recovery methods could not be found'); }
}

// Function to get encrypted seed from facebook recovery.
export async function getFacebookEncryptedSeed(req, res) {
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
        const recovery = await Recovery.findOne({ where: { key, [Op.and]: { recovery_type_id: 2 } }, raw: true });
        if (recovery)
            return successResponse(res, { encryptedSeed: decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT) });
    }

    // If user does not exist return an error.
    return errorResponse(res, 'User not found.');
}

// Function to get encrypted seed from google recovery.
export async function getGoogleEncryptedSeed(req, res) {
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
    const key = sha256(process.env.GOOGLE_APP_ID + result.data.id);

    // Attempt to get user from database with the given email address.
    const user = await User.findOne({ where: { email: signupEmail } });

    if (user) {
        // If user exists return the decrypted seed.
        const recovery = await Recovery.findOne({ where: { key, [Op.and]: { recovery_type_id: 3 } }, raw: true });
        if (recovery)
            return successResponse(res, { encryptedSeed: decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT) });
    }

    // If user does not exist return an error.
    return errorResponse(res, 'User not found.');
}

// Function to get encrypted seed from vkontakte recovery.
export async function getVKontakteEncryptedSeed(req, res) {
    // Get access token and email from request body.
    const accessToken = req.body.accessToken;
    const signupEmail = req.body.signupEmail;

    // Set vkontakte access token and make the query for the current profile.
    const vk = new VK({
        token: accessToken
    });
    const result = await vk.api.users.get([accessToken]);

    // Hash the facebook id with user id to get the database key.
    const key = sha256(process.env.VKONTAKTE_APP_ID + result[0].id);

    // Attempt to get user from database with the given email address.
    const user = await User.findOne({ where: { email: signupEmail } });

    if (user) {
        // If user exists return the decrypted seed.
        const recovery = await Recovery.findOne({ where: { key, [Op.and]: { recovery_type_id: 5 } }, raw: true });
        if (recovery)
            return successResponse(res, { encryptedSeed: decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT) });
    }

    // If user does not exist return an error.
    return errorResponse(res, 'User not found.');
}

// Function to return all 2FA methods from the database.
export async function getPayload(req, res) {
    const key = req.body.key;
    const recovery = await Recovery.findOne({ where: { key } });
    if (recovery == null) {
        return errorResponse(res, 'User not found');
    }
    const user = await User.findOne({ where: { id: recovery.user_id }, raw: true });

    const payload = {};
    if (user != null && user['payload'] !== null) {
        if (user['payload'].email !== undefined) { payload['email'] = user.payload.email };
        if (user['payload'].authenticator !== undefined) { payload['authenticator'] = user.payload.authenticator };
        if (user['payload'].emailVerificationCode !== undefined) { payload['emailVerificationCode'] = user.payload.emailVerificationCode };
        if (user['payload'].authenticatorConfirmed !== undefined) { payload['authenticatorConfirmed'] = user.payload.authenticatorConfirmed };
    }

    if (user) {
        Logger.info({ method: arguments.callee.name, type: "Get Payload", user_id: user.id, user, headers: req.headers, body: req.body });
        return successResponse(res, payload);
    } else {
        return errorResponse(res, '2FA methods could not be found');
    }
}

export async function getNonce(req, res) {
    const key = req.body.key;
    const recovery = await Recovery.findOne({ where: { key } });
    if (recovery == null) {

        Logger.info({ method: arguments.callee.name, type: "Error: User Not found", key, headers: req.headers, body: req.body });
        return errorResponse(res, 'User not found');
    }
    const user = await User.findOne({ where: { id: recovery.user_id }, raw: true });

    if (user) {
        Logger.info({ method: arguments.callee.name, type: "Get Nonce", user_id: user.id, user, headers: req.headers, body: req.body });
        return successResponse(res, { nonce: user.nonce });
    } else {
        return errorResponse(res, 'Nonce could not be found');
    }
}

// Function to change 2FA methods from the database.
export async function change2FAMethods(req, res) {
    const toggleEmail = req.body.email;
    const toggleAuthenticator = req.body.authenticator;

    const key = req.header('key');

    const recovery = await Recovery.findOne({ where: { key } });
    if (recovery != null) {
        const user = await User.findOne({ where: { id: recovery.user_id } });

        user.payload.email = toggleEmail;
        user.payload.authenticator = toggleAuthenticator;
        if (toggleAuthenticator == false) {
            user.authenticator_qr = null;
            user.authenticator_secret = null;
            user.payload.authenticatorConfirmed = false;
        }
        user.changed('payload', true);
        await user.save();

        Logger.info({ method: arguments.callee.name, type: "2FA Methods Changed", user_id: user.id, user, headers: req.headers, body: req.body });
        return successResponse(res, { message: 'User payload updated successfully.' });
    }
    //in any other case, return error
    return errorResponse(res, "Error: User not found.", 404);
}


export async function generateAuthenticatorQR(req, res) {
    const key = req.header('key');
    const recovery = await Recovery.findOne({ where: { key } });
    if (recovery != null) {
        const user = await User.findOne({ where: { id: recovery.user_id } });
        if (user != null) {

            user.authenticator_secret = authenticator.generateSecret();

            const otp = authenticator.keyuri(user.email, "Morpher Wallet", user.authenticator_secret);

            try {
                const result = await QRCode.toDataURL(otp);

                user.authenticator_qr = result;
                user.payload.authenticator = true;
                user.payload.authenticatorConfirmed = false;
                user.changed('payload', true);
                await user.save();

                Logger.info({ method: arguments.callee.name, type: "Generated Authenticator QR Code", user_id: user.id, user, headers: req.headers, body: req.body });
                return successResponse(res, {
                    image: result
                });
            }
            catch (e) {
                return errorResponse(res, 'Could not generate QR code.')
            }
        }
    }

    return errorResponse(res, 'User not found', 404);
}

export async function verifyAuthenticatorCode(req, res) {
    const code = req.body.code;
    const key = req.body.key;
    const recovery = await Recovery.findOne({ where: { key } });
    if (recovery != null) {
        const user = await User.findOne({ where: { id: recovery.user_id } });

        if (user != null) {
            if (await verifyGoogle2FA(user.id.toString(), code)) {
                if (user.payload.authenticatorConfirmed == false) {
                    user.payload.authenticatorConfirmed = true;
                    user.changed('payload', true);
                    await user.save();
                }
                Logger.info({ method: arguments.callee.name, type: "Verify Authenticator Code", user_id: user.id, user, headers: req.headers, body: req.body });
                return successResponse(res, true)
            } else {
                Logger.info({ method: arguments.callee.name, type: "Error: Authenticator Code Wrong", user_id: user.id, user, headers: req.headers, body: req.body });
                return errorResponse(res, 'Could not verify authenticator code.', 500)
            }
        }
    }
    Logger.info({ method: arguments.callee.name, type: "Error: User Not found", headers: req.headers, body: req.body });
    return errorResponse(res, 'User not found, aborting');
}

async function updateEmail2fa(user_id) {
    const user = await User.findOne({ where: { id: user_id } });
    const verificationCode = randomFixedInteger(6);
    user.email_verification_code = verificationCode;
    await user.save();
    return user.email_verification_code;
}

export async function send2FAEmail(req, res) {
    const key = req.body.key;
    const recovery = await Recovery.findOne({ where: { key } });
    const user = await User.findOne({ where: { id: recovery.user_id } });

    try {
        let verificationCode = await updateEmail2fa(user.id);

        await sendEmail2FA(verificationCode, user.email);
        Logger.info({ method: arguments.callee.name, type: "2FA Email Sent", user_id: user.id, user, headers: req.headers, body: req.body });
        return successResponse(res, { sent: true });
    }
    catch (e) {
        console.log(e);
        Logger.info({ method: arguments.callee.name, type: "Error: Can't send 2FA email", user_id: user.id, user, headers: req.headers, body: req.body });
        return errorResponse(res, 'There was a problem parsing the email');
    }
}

export async function verifyEmailCode(req, res) {
    const code = req.body.code;
    const key = req.body.key;
    const recovery = await Recovery.findOne({ where: { key } });
    if (recovery != null) {
        const user = await User.findOne({ where: { id: recovery.user_id } });
        if (user != null) {
            if (await verifyEmail2FA(recovery.user_id, code)) {
                Logger.info({ method: arguments.callee.name, type: "Email 2FA Code Verified", user_id: user.id, user, headers: req.headers, body: req.body });
                return successResponse(res, true)
            } else {
                Logger.info({ method: arguments.callee.name, type: "Error: Email 2FA Code Wrong", user_id: user.id, user, headers: req.headers, body: req.body });
                return errorResponse(res, 'Could not verify email code.')
            }
        }
    }

    return errorResponse(res, "Could not find User!", 404);

}

async function verifyEmail2FA(user_id: string, code: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: user_id } });
    return (user.payload.email == false || user.email_verification_code === Number(code));
}

async function verifyGoogle2FA(user_id: string, code: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: user_id } });
    return (user.payload.authenticator == false || authenticator.check(code, user.authenticator_secret));
}