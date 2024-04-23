import appleSigninAuth from 'apple-signin-auth';
import { Logger } from './winston';
import { sha256 } from './util';
import { Recovery_Type } from '../../database/models';

import { OAuth2Client } from 'google-auth-library'
import { Facebook } from 'fb';
const options = {
    app_id: process.env.FACEBOOK_APP_ID,
    app_secret: process.env.FACEBOOK_APP_SECRET,
    default_graph_version: 'v18.0'
};
const FB = new Facebook(options);

// Verify the sso user/token and return the user email and fetch key
export const getKeyEmail = async (recoveryTypeId: number, token: any, key: string, email: string, vk_token: any) => {
    try {
        const testBackend = String(process.env.SEND_EMAILS || 'true') === 'false';

        // fail if not recovery type was found in the DB.
        const recovery_type_db = await Recovery_Type.findOne({ where: { id: recoveryTypeId } })
        if (!recovery_type_db) {
            return { success: false, error: 'Invalid Recovery Type' }
        }

        const recovery_type = recovery_type_db.name;

        // dont verify for test backend
        if (testBackend) {
            return { success: true, recovery_type, key: key, email: email }
        }

        // No verification for password recovery
        if (recovery_type == 'Password') {
            return { success: true, recovery_type, key: key, email: email }

        }

        // Process apple oath verification
        if (recovery_type == 'Apple') {
            const crypto = require('crypto');

            // fail of no oath token was passed
            if (!token) {
                Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'No sso token supplied' });

                return { success: false, error: 'No sso token supplied' }
            }
            token = JSON.parse(token)

            if (!token.identityToken) {
                Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'Invalid sso token' });

                return { success: false, error: 'Invalid sso token' }
            }
            try {

                // check that the token is valid and generated against the correct apple client id.
                const appleIdTokenClaims = await appleSigninAuth.verifyIdToken(token.identityToken, {
                    audience: [process.env.APPLE_CLIENT_ID, process.env.APPLE_APP_CLIENT_ID],
                    /** sha256 hex hash of raw nonce */
                    nonce: token.nonce ? crypto.createHash('sha256').update(token.nonce).digest('hex') : undefined,
                    ignoreExpiration: false

                });

                if (!appleIdTokenClaims.sub) {
                    Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'No sso user id returned' });
                    return { success: false, error: 'No sso user id returned' }
                }

                const key = await sha256(process.env.APPLE_CLIENT_ID + appleIdTokenClaims.sub);
                return { success: true, recovery_type, key: key, email: appleIdTokenClaims.email }

            } catch (err) {
                Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'Error veryfting apple token' + err.message || err.toString() });

                return { success: false, error: err.message || err.toString() }
            }

        }

        // Process google oath verification
        if (recovery_type == 'Google') {

            const CLIENT_ID = process.env.GOOGLE_APP_ID;
            const CLIENT_SECRET = process.env.GOOGLE_APP_SECRET;
            const GOOGLE_ANDROID_APP_ID = process.env.GOOGLE_ANDROID_APP_ID;
            const GOOGLE_IOS_APP_ID = process.env.GOOGLE_IOS_APP_ID;
            const GOOGLE_WEB_APP_ID = process.env.GOOGLE_WEB_APP_ID;

            const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);

            try {

                // check that the token is valid and generated against the correct google client id (web/android or ios).
                if (token.split(".").length == 3) {
                    //JWT token
                    const ticket = await client.verifyIdToken({
                        idToken: token,
                        audience: [CLIENT_ID, GOOGLE_ANDROID_APP_ID, GOOGLE_IOS_APP_ID, GOOGLE_WEB_APP_ID]
                    });

                    const tokenInfo = ticket.getPayload();
                    const userid = tokenInfo['sub'];

                    if (!userid) {
                        Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'No sso user id returned' });
                        return { success: false, error: 'No sso user id returned' }
                    }
                    if (tokenInfo.exp < (Date.now() / 1000)) {
                        Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'Token Expired' });
                        return { success: false, error: 'Token Expired' }
                    }

                    const return_key = await sha256(CLIENT_ID + userid);
                    return { success: true, recovery_type, key: return_key, email: tokenInfo.email }
                } else {
                    //new opaque Bearer Token, see https://stackoverflow.com/questions/71974104/google-oauth-v2-0-generates-invalid-jwt
                    const tokenInfo = await client.getTokenInfo(
                        token
                    );

                    const audience = tokenInfo["aud"];

                    if(![CLIENT_ID, GOOGLE_ANDROID_APP_ID, GOOGLE_IOS_APP_ID, GOOGLE_WEB_APP_ID].includes(audience)) {
                        Logger.error({source: "getKeyEmail", data: {tokenInfo, CLIENT_ID}, message: "SSO Audience mismatch"});
                        return {success: false, error: "SSO Audience mismatch"}
                    }
                   
                    const userid = tokenInfo['sub'];

                    if (!userid) {
                        Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'No sso user id returned' });
                        return { success: false, error: 'No sso user id returned' }
                    }
                    if (tokenInfo.expiry_date < Date.now()) {
                        Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'Token Expired' });
                        return { success: false, error: 'Token Expired' }
                    }

                    const return_key = await sha256(CLIENT_ID + userid);
                    return { success: true, recovery_type, key: return_key, email: tokenInfo.email }
                }

            } catch (err) {
                Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'Error veryfting google token: ' + err.message || err.toString() });

                return { success: false, error: err.message || err.toString() }
            }
        }

        // Process facebook oath verification
        if (recovery_type == 'Facebook') {
            try {
                // Set facebook access token and make the query for the current profile.
                FB.setAccessToken(token);
                const result = await FB.api('/me?fields=name,email', 'get');


                if (!result.id) {
                    Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'No sso user id returned' });
                    return { success: false, error: 'No sso user id returned' }
                }

                // Hash the facebook id with user id to get the database key.
                const return_key = sha256(process.env.FACEBOOK_APP_ID + result.id);


                return { success: true, recovery_type, key: return_key, email: result.email }
            } catch (err) {
                Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'Error veryfting facebook token' + err.message || err.toString() });

                return { success: false, error: err.message || err.toString() }
            }
        }

        // Process VK oath verification
        if (recovery_type == 'VKontakte') {
            try {

                if (!vk_token || token !== vk_token.token || !vk_token.vk_user_id) {
                    return { success: false, error: 'Invalid sso token' }
                }

                // Set vkontakte access token and make the query for the current profile.


                const url_service = `https://api.vk.com/method/users.get?access_token=${process.env.VK_SERVICE_TOKEN}&v=5.131&user_ids=${vk_token.vk_user_id}`
                const url_user = `https://api.vk.com/method/users.get?access_token=${token}&v=5.131`

                const axios = require('axios')
                // get the vk user info
                const response_service = await axios.get(url_service);
                const response_user = await axios.get(url_user);

                if (!response_user.data.response || !response_service.data.response || response_user.data.response.length !== 1 || response_service.data.response.length !== 1 || response_user.data.response[0].id !== response_service.data.response[0].id) {
                    return { success: false, error: 'Invalid sso user' }
                }

                const result = response_user.data.response

                if (result[0].id !== vk_token.vk_user_id) {
                    return { success: false, error: 'Invalid sso user' }
                }

                if (!result || result.length < 1 || !result[0].id) {
                    Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'No sso user id returned' });
                    return { success: false, error: 'No sso user id returned' }
                }

                // Hash the VK id with user id to get the database key.
                const key = await sha256((process.env.VK_APP_ID + result[0].id).toString());

                return { success: true, recovery_type, key: key, email: result[0].email || email }

            } catch (err) {
                Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'Error veryfting VK token' + err.message || err.toString() });

                return { success: false, error: err.message || err.toString() }
            }
        }

        Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId, recovery_type }, message: 'Invalid recovery type' });

        return { success: false, error: 'No sso user id returned' }

    } catch (err) {

        Logger.error({ source: 'getKeyEmail', data: { recoveryTypeId }, message: err.message || err.toString() });

        return { success: false, error: err.message || err.toString() }
    }
};
