import { getTransaction, Op, Recovery, Recovery_Type, User } from '../database/models';
import { decrypt, encrypt, errorResponse, successResponse, sha256 } from '../helpers/functions/util';
const { to } = require('await-to-js');
import * as moment from 'moment';

import { VK } from 'vk-io';
import { Facebook } from 'fb';
const options = {
    app_id: process.env.FACEBOOK_APP_ID,
    app_secret: process.env.FACEBOOK_APP_SECRET,
    default_graph_version: 'v7.0'
};
const FB = new Facebook(options);
const Google = require('googleapis').google;
const OAuth2 = Google.auth.OAuth2;
const oauth2Client = new OAuth2();

// Function to save new signups to the database.
export async function saveEmailPassword(req, res) {
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
        const [, user] = await to(User.findOne({ where: email, transaction }));

        if (user) {
            // If it exists, set the userId and delete the associated recovery method.
            userId = user.dataValues.id;

            await Recovery.destroy({ where: { user_id: user.id, [Op.and]: { recovery_type_id: recoveryTypeId } }, transaction });
        } else {
            // If it doesnt exist create a new one.
            userId = (await User.create({ email, created_at: moment.utc().valueOf() }, { transaction })).dataValues.id;
        }

        // Create a new recovery method.
        const recoveryId = (
            await Recovery.create(
                {
                    recovery_type_id: recoveryTypeId,
                    user_id: userId,
                    encrypted_seed: JSON.stringify(encrypt(encryptedSeed, process.env.DB_BACKEND_SALT)),
                    key,
                    created_at: moment.utc().valueOf()
                },
                { transaction }
            )
        ).dataValues.id;

        // Commit changes to database and return successfully.
        await transaction.commit();

        return successResponse(res, {
            recovery_id: recoveryId
        });
    } catch (error) {
        // If an error happened anywhere along the way, rollback all the changes.
        await transaction.rollback();
        return errorResponse(res, error.stack);
    }
}

// Function to get an encrypted seed from the database using a key.
export async function getEncryptedSeed(req, res) {
    const key = req.body.key;

    // Simply get Recovery instance that has this key and return it if its found.
    const [error, result] = await to(Recovery.findOne({ where: { key }, raw: true }));

    if (result)
        return successResponse(res, {
            encryptedSeed: decrypt(JSON.parse(result.encrypted_seed), process.env.DB_BACKEND_SALT)
        });
    // Otherwise return an error.
    else return errorResponse(res, 'Encrypted seed could not be found.', 404);
}

// Function to return all recovery types from the database.
export async function getRecoveryTypes(req, res) {
    const recoveryMethods = await Recovery_Type.findAll({ raw: true });

    if (recoveryMethods.length > 0) return successResponse(res, recoveryMethods);
    else return errorResponse(res, 'Recovery methods could not be found', 404);
}

// Function to get encrypted seed from facebook recovery.
export async function getFacebookEncryptedSeed(req, res) {
    // Get access token and email from request body.
    const accessToken = req.body.accessToken;
    const originalSignupEmail = req.body.originalSignupEmail;

    // Set facebook access token and make the query for the current profile.
    FB.setAccessToken(accessToken);
    const result = await FB.api('/me?fields=name,email', 'get');

    // Hash the facebook id with user id to get the database key.
    const key = sha256(process.env.FACEBOOK_APP_ID + '.' + result.id);

    // Attempt to get user from database with the given email address.
    const user = await User.findOne({ where: { email: originalSignupEmail }, raw: true });

    if (user) {
        // If user exists return the decrypted seed.
        const recovery = await Recovery.findOne({ where: { key, [Op.and]: { recovery_type_id: 2 } }, raw: true });
        if (recovery)
            return successResponse(res, { encryptedSeed: decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT) });
    }

    // If user does not exist return an error.
    return errorResponse(res, 'User not found.', 404);
}

// Function to get encrypted seed from google recovery.
export async function getGoogleEncryptedSeed(req, res) {
    // Get access token and email from request body.
    const accessToken = req.body.accessToken;
    const originalSignupEmail = req.body.originalSignupEmail;

    // Set google access token and make the query for the current profile.
    oauth2Client.setCredentials({ access_token: accessToken });
    const oauth2 = Google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    });
    const result = await oauth2.userinfo.get();

    // Hash the facebook id with user id to get the database key.
    const key = sha256(process.env.GOOGLE_APP_ID + '.' + result.data.id);

    // Attempt to get user from database with the given email address.
    const user = await User.findOne({ where: { email: originalSignupEmail } });

    if (user) {
        // If user exists return the decrypted seed.
        const recovery = await Recovery.findOne({ where: { key, [Op.and]: { recovery_type_id: 3 } }, raw: true });
        if (recovery)
            return successResponse(res, { encryptedSeed: decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT) });
    }

    // If user does not exist return an error.
    return errorResponse(res, 'User not found.', 404);
}

// Function to get encrypted seed from vkontakte recovery.
export async function getVKontakteEncryptedSeed(req, res) {
    // Get access token and email from request body.
    const accessToken = req.body.accessToken;
    const originalSignupEmail = req.body.originalSignupEmail;

    // Set vkontakte access token and make the query for the current profile.
    const vk = new VK({
        token: accessToken
    });
    const result = await vk.api.users.get([accessToken]);

    // Hash the facebook id with user id to get the database key.
    const key = sha256(process.env.VKONTAKTE_APP_ID + '.' + result[0].id);

    // Attempt to get user from database with the given email address.
    const user = await User.findOne({ where: { email: originalSignupEmail } });

    if (user) {
        // If user exists return the decrypted seed.
        const recovery = await Recovery.findOne({ where: { key, [Op.and]: { recovery_type_id: 5 } }, raw: true });
        if (recovery)
            return successResponse(res, { encryptedSeed: decrypt(JSON.parse(recovery.encrypted_seed), process.env.DB_BACKEND_SALT) });
    }

    // If user does not exist return an error.
    return errorResponse(res, 'User not found.', 404);
}
