const WalletController = require('../../controllers/wallet.controller');
const ValidationController = require('../../controllers/validation.controller');
const secureRoutes = require("./secure");

console.log(secureRoutes)

// The index route file which connects all the other files.
module.exports = function(express) {
    const router = express.Router();

    //router.post('/changeEmail', WalletController.changeEmail);
    router.post('/saveEmailPassword', WalletController.saveEmailPassword);
    router.post('/getEncryptedSeed', WalletController.getEncryptedSeed);
    router.get('/getRecoveryTypes', WalletController.getRecoveryTypes);

    router.post('/getFacebookEncryptedSeed', WalletController.getFacebookEncryptedSeed);
    router.post('/getGoogleEncryptedSeed', WalletController.getGoogleEncryptedSeed);
    router.post('/getVKontakteEncryptedSeed', WalletController.getVKontakteEncryptedSeed);

    router.post('/getPayload', WalletController.getPayload);
    router.post('/getNonce', WalletController.getNonce);
    router.post('/send2FAEmail', WalletController.send2FAEmail);
    router.post('/generateAuthenticatorQR', WalletController.generateAuthenticatorQR);
    router.post('/verifyAuthenticatorCode', WalletController.verifyAuthenticatorCode);
    router.post('/verifyEmailCode', WalletController.verifyEmailCode);
    router.post('/getQRCode', WalletController.getQRCode);

    router.post('/validateInput', ValidationController.validateInput);

    /**
     * Secure routes checking signature matching eth_address
     */
    // router.use('/auth', secureRoutes);
    router.post('/auth/updateEmailPassword', secureRoutes, WalletController.updateEmailPassword);
    router.post('/auth/change2FAMethods', WalletController.change2FAMethods);

    return router;
};
