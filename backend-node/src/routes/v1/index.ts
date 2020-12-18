const WalletController = require('../../controllers/wallet.controller');
const ValidationController = require('../../controllers/validation.controller');
const secureRoutes = require("./secure");

// The index route file which connects all the other files.
module.exports = function(express) {
    const router = express.Router();

    router.post('/saveEmailPassword', WalletController.saveEmailPassword);
    router.post('/getEncryptedSeed', WalletController.getEncryptedSeed);
    router.get('/getRecoveryTypes', WalletController.getRecoveryTypes);

    router.post('/getFacebookEncryptedSeed', WalletController.getFacebookEncryptedSeed);
    router.post('/getGoogleEncryptedSeed', WalletController.getGoogleEncryptedSeed);
    router.post('/getVKontakteEncryptedSeed', WalletController.getVKontakteEncryptedSeed);

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
    router.post('/auth/updatePassword', WalletController.updatePassword);
    router.post('/auth/updateEmail', WalletController.updateEmail);
    router.post('/auth/change2FAMethods', WalletController.change2FAMethods);
    router.post('/auth/generateAuthenticatorQR', WalletController.generateAuthenticatorQR);

    return router;
};
