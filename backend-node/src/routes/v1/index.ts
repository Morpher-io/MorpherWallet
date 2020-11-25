const WalletController = require('../../controllers/wallet.controller');
const ValidationController = require('../../controllers/validation.controller');

// The index route file which connects all the other files.
module.exports = function(express) {
    const router = express.Router();

    router.post('/changeEmail', WalletController.changeEmail);
    router.post('/saveEmailPassword', WalletController.saveEmailPassword);
    router.post('/getEncryptedSeed', WalletController.getEncryptedSeed);
    router.get('/getRecoveryTypes', WalletController.getRecoveryTypes);

    router.post('/getFacebookEncryptedSeed', WalletController.getFacebookEncryptedSeed);
    router.post('/getGoogleEncryptedSeed', WalletController.getGoogleEncryptedSeed);
    router.post('/getVKontakteEncryptedSeed', WalletController.getVKontakteEncryptedSeed);

    router.post('/getPayload', WalletController.getPayload);
    router.post('/change2FAMethods', WalletController.change2FAMethods);
    router.post('/send2FAEmail', WalletController.send2FAEmail);
    router.post('/generateAuthenticatorQR', WalletController.generateAuthenticatorQR);
    router.post('/verifyAuthenticatorCode', WalletController.verifyAuthenticatorCode);
    router.post('/verifyEmailCode', WalletController.verifyEmailCode);
    router.post('/getQRCode', WalletController.getQRCode);

    router.post('/validateInput', ValidationController.validateInput);

    return router;
};
