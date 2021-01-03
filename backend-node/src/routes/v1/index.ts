import { User } from '../../database/models';
import { errorResponse, successResponse } from '../../helpers/functions/util';

const WalletController = require('../../controllers/wallet.controller');
const ValidationController = require('../../controllers/validation.controller');
const secureRoutes = require('./secure');

// The index route file which connects all the other files.
module.exports = function(express) {
    const router = express.Router();

    if (process.env.ENVIRONMENT === 'development') {
        router.get('/test/clearDatabase', async (req, res) => {
            await User.destroy({ where: {} });
            return successResponse(res, { success: true });
        });
    }

    if (process.env.ENVIRONMENT === 'development') {
        router.post('/test/getUserSecret', async (req, res) => {
            const user = await User.findOne({ where: { email: req.body.email } });
            if (user) return successResponse(res, { authenticator_secret: user.authenticator_secret });
            else return errorResponse(res, 'User not found');
        });
    }

    router.post('/saveEmailPassword', WalletController.saveEmailPassword);
    router.post('/getEncryptedSeed', WalletController.getEncryptedSeed);

    /**
     * Recovery Methods
     */
    router.post('/recoverSeedSocialRecovery', WalletController.recoverSeedSocialRecovery);

    router.post('/getPayload', WalletController.getPayload);
    router.post('/getNonce', WalletController.getNonce);
    router.post('/send2FAEmail', WalletController.send2FAEmail);
    router.post('/verifyEmailCode', WalletController.verifyEmailCode);
    router.post('/verifyAuthenticatorCode', WalletController.verifyAuthenticatorCode);
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

    return router;
};
