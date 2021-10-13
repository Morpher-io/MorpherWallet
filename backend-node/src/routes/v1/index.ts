const WalletController = require('../../controllers/wallet.controller');
const EmailController = require('../../controllers/email.controller');
const ValidationController = require('../../controllers/validation.controller');
const secureRoutes = require('./secure');

const rateLimit = require('express-rate-limit');
import { Logger } from '../../helpers/functions/winston';

import {ipban} from '../../helpers/functions/ipban';

const limitReached = (req: any, res: any) => {
    Logger.warn({ data: { ip: req.ip, method: req.method, path: req.path, url: req.originalUrl} , message: 'Rate limiter triggered'});
};

const limiter = new rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    onLimitReached: limitReached,
    keyGenerator(req, res) {
        return req.body.key;
    }
});

let ipRequestPayload = {};

/**
 * the idea is to allow maximum of 3 _different_ keys per 60 minutes
 * 
 * that means: if the key was already requested and is just re-requested, the keyGenerator will return a random number (Date.now()), which wasn't rate-limited yet.
 * 
 * If the getPayload-Key was not requested yet, it returns the actual IP as a key for the keyGenerator
 * 
 * 3 times the same ip with different keys will get then rate-limited.
 */
const limiterGetPayload = new rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 5,
    onLimitReached: limitReached,
    keyGenerator(req, res) {

        /**
         * if the requests are not existing yet, define them
         */
        if(ipRequestPayload[req.ip] == undefined) {
            ipRequestPayload[req.ip] = {
                lastAccess: Date.now(),
                keyRequests: []
            };
        }

         /**
         * if you are trying a new key, return the IP as a keygenerator-key
         */
        if(!ipRequestPayload[req.ip].keyRequests.includes(req.body.key)) {

            /**
             * if there are not yet 3 addresses in there, add it so it won't rate limit
             */
            if(ipRequestPayload[req.ip].keyRequests.length <= 5) {
                ipRequestPayload[req.ip].keyRequests.push(req.body.key);
            }
            return req.ip;
        }

        /**
         * if it a key that you already tried before, well, do not rate limit
         */
        return Date.now();
    }
});

// The index route file which connects all the other files.
module.exports = function(express) {
    const router = express.Router();
    const { secret, recaptcha } = require('../../helpers/functions/middleware');

    if (process.env.ENVIRONMENT === 'development') {
        const testingRoutes = require('./testing')(express.Router());
        router.use('/test', testingRoutes);
    }

    router.post('/saveEmailPassword', WalletController.saveEmailPassword);
    router.post('/getEncryptedSeed', ipban, limiterGetPayload, limiter, recaptcha, WalletController.getEncryptedSeed);

    /**
     * Recovery Methods
     */
    router.post('/recoverSeedSocialRecovery', WalletController.recoverSeedSocialRecovery);

    router.post('/getPayload', ipban, limiterGetPayload, recaptcha, async function(req, res,next) {
        let result = await WalletController.getPayload(req,res);
        ipban(req, result, function() {});
        return result;
    });
    router.post('/getNonce', ipban, limiterGetPayload, WalletController.getNonce);
    router.post('/send2FAEmail', ipban, WalletController.send2FAEmail);
    router.post('/verifyEmailCode', ipban, limiterGetPayload, WalletController.verifyEmailCode);
    router.post('/verifyEmailConfirmationCode',ipban, limiterGetPayload, WalletController.verifyEmailConfirmationCode);
    router.post('/verifyAuthenticatorCode',ipban, limiterGetPayload, WalletController.verifyAuthenticatorCode);
    router.post('/validateInput', ValidationController.validateInput);

    /**
     * Secure routes checking signature matching eth_address
     */
    router.use('/auth', secureRoutes);
    router.post('/auth/resetRecovery', WalletController.resetRecovery);
    router.post('/auth/updatePassword', WalletController.updatePassword);
    router.post('/auth/updateEmail', WalletController.updateEmail);
    router.post('/auth/change2FAMethods', WalletController.change2FAMethods);
    router.post('/auth/generateAuthenticatorQR', WalletController.generateAuthenticatorQR);
    router.post('/auth/addRecoveryMethod', WalletController.addRecoveryMethod);
    router.post('/auth/getRecoveryMethods', WalletController.getRecoveryMethods);
    router.post('/auth/deleteAccount', WalletController.deleteAccount);

    /**
     * Email Notifications
     */
     router.post('/emailNotification', secret, EmailController.emailNotification);

    return router;
};
