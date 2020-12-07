import { getTransaction, Op, Recovery, Recovery_Type, User } from '../database/models';
import { decrypt, encrypt, errorResponse, successResponse, sha256, randomFixedInteger } from '../helpers/functions/util';
const { to } = require('await-to-js');
import { Request, Response } from 'express';
const Util = require('ethereumjs-util');

import { VK } from 'vk-io';
import { Facebook } from 'fb';
import { sendEmail2FA } from "../helpers/functions/email";
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

// Function to change email for current existing user.
export async function changeEmail(req, res) {
    const oldEmail = req.body.oldEmail;
    const newEmail = req.body.newEmail;
    const key = req.body.key;
    const encryptedSeed = req.body.encryptedSeed;

    // Get sequelize transactions to rollback changes in case of failure.
    const [err, transaction] = await to(getTransaction());
    if (err) return errorResponse(res, err.message);

    let userId;

    try {
        // Attempt to get user from database.
        const [, user] = await to(User.findOne({ where: { email: oldEmail }, transaction }));

        if (user) {
            // If it exists, update the new email and add a new Recovery entry.
            userId = user.id;

            user.email = newEmail;
            await user.save({ transaction });

            await Recovery.destroy({ where: { user_id: user.id, [Op.and]: { recovery_type_id: 1 } }, transaction });

            const recoveryId = (
                await Recovery.create(
                    {
                        recovery_type_id: 1,
                        user_id: userId,
                        encrypted_seed: JSON.stringify(encrypt(JSON.stringify(encryptedSeed), process.env.DB_BACKEND_SALT)),
                        key
                    },
                    { transaction }
                )
            ).dataValues.id;

            // Commit changes to database and return successfully.
            await transaction.commit();

            user.payload.email = true;
            user.payload.authenticator = false;
            user.payload.authenticatorConfirmed = false;
            user.payload.authenticator_qr = null;
            user.changed('payload', true);
            await user.save();


            return successResponse(res, {
                recovery_id: recoveryId
            });
        } else {
            return errorResponse(res, 'User not found.');
        }
    } catch (error) {
        // If an error happened anywhere along the way, rollback all the changes.
        await transaction.rollback();
        return errorResponse(res, error.message);
    }
}

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

        let userId;

        // Attempt to get user from database.
        const user = await User.findOne({ where: { email }, raw: true, transaction });

        if (user == null) {
            // If it exists, set the userId and delete the associated recovery method.
            // If it doesnt exist create a new one.
            const payload = { email: true, authenticator: false, authenticatorConfirmed: false };
            userId = (await User.create({ email, payload }, { transaction })).dataValues.id;

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

            return successResponse(res, {
                recovery_id: recoveryId
            });
        }

        return errorResponse(res, "Error: User already exists!");

    } catch (error) {
        // If an error happened anywhere along the way, rollback all the changes.
        await transaction.rollback();
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

        console.log(email2fa);
        console.log(authenticator2fa);
        const email2FAVerified = await verifyEmail2FA(result.user_id, email2fa);
        console.log(email2FAVerified);
        const googleVerified = await verifyGoogle2FA(result.user_id, authenticator2fa);
        console.log(googleVerified);
        if (!email2FAVerified || !googleVerified) {
            return errorResponse(res, 'Either Email2FA or Authenticator2FA was wrong. Try again.')
        }
        //avoid replay attack, generate a new Email 2FA after it was validated and seed was sent
        updateEmail2fa(user.id);
        //only if the codes are correct we get the juicy seed.
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
        return successResponse(res, payload);
    } else {
        return errorResponse(res, '2FA methods could not be found');
    }
}

// Function to change 2FA methods from the database.
export async function change2FAMethods(req, res) {
    const toggleEmail = req.body.toggleEmail;
    const toggleAuthenticator = req.body.toggleAuthenticator;
    const signedMessage = req.body.signedMessage;
    const key = req.body.key;

    if (signedMessage === null) {
        const recovery = await Recovery.findOne({ where: { key } });
        const user = await User.findOne({ where: { id: recovery.user_id } });

        const nonce = randomFixedInteger(6);
        user.nonce = nonce;
        await user.save()

        return successResponse(res, { nonce });
    }

    else {
        const recovery = await Recovery.findOne({ where: { key } });
        const user = await User.findOne({ where: { id: recovery.user_id } });

        const msgHash = Util.keccak("authentication" + '_' + user.nonce);

        const eth_address = '0x' + (Util.pubToAddress(Util.ecrecover(msgHash, signedMessage.v, Buffer.from(signedMessage.r), Buffer.from(signedMessage.s)))).toString('hex');

        if (user.eth_address === eth_address) {
            user.payload.email = toggleEmail;
            user.payload.authenticator = toggleAuthenticator;
            user.nonce = randomFixedInteger(6);
            user.changed('payload', true);
            await user.save();
            return successResponse(res, { message: 'User payload updated successfully.' });
        }

        else return errorResponse(res, 'User could not be found.');
    }
}


export async function generateAuthenticatorQR(req, res) {
    const key = req.body.key;
    const recovery = await Recovery.findOne({ where: { key } });
    const user = await User.findOne({ where: { id: recovery.user_id } });

    user.authenticator_secret = authenticator.generateSecret();

    const otp = authenticator.keyuri(user.email, "Morpher Wallet", user.authenticator_secret);

    try {
        const result = await QRCode.toDataURL(otp);

        user.authenticator_qr = result;
        user.payload.authenticator = false;
        user.payload.authenticatorConfirmed = false;
        user.changed('payload', true);
        await user.save();
        return successResponse(res, {
            image: result
        })
    }
    catch (e) {
        return errorResponse(res, 'Could not generate QR code.')
    }

}

export async function getQRCode(req, res) {
    const key = req.body.key;
    const recovery = await Recovery.findOne({ where: { key } });
    const user = await User.findOne({ where: { id: recovery.user_id } });

    try {
        const result = user.authenticator_qr || '';
        return successResponse(res, {
            image: result
        })
    }
    catch (e) {
        return errorResponse(res, 'Could not generate QR code.')
    }

}

export async function verifyAuthenticatorCode(req, res) {
    const code = req.body.code;
    const key = req.body.key;
    const recovery = await Recovery.findOne({ where: { key } });
    const user = await User.findOne({ where: { id: recovery.user_id } });


    if (verifyGoogle2FA(recovery.user_id, code)) {
        user.payload.authenticatorConfirmed = true;
        user.changed('payload', true);
        await user.save();
        return successResponse(res, true)
    } else {
        return errorResponse(res, 'Could not verify authenticator code.')
    }

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

        return successResponse(res, { verificationCode });
    }
    catch (e) {
        console.log(e)
        return errorResponse(res, 'There was a problem parsing the email');
    }
}

export async function verifyEmailCode(req, res) {
    const code = req.body.code;
    const key = req.body.key;
    const recovery = await Recovery.findOne({ where: { key } });

    if (verifyEmail2FA(recovery.user_id, code)) {
        return successResponse(res, true)
    } else {
        return errorResponse(res, 'Could not verify email code.')
    }

}

async function verifyEmail2FA(user_id: string, code: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: user_id } });
    return (user.payload.email == false || user.email_verification_code === Number(code));
}

async function verifyGoogle2FA(user_id: string, code: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: user_id } });
    return (user.payload.authenticator == false || authenticator.check(code, user.authenticator_secret));
}