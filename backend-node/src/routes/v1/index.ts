const WalletController = require('../../controllers/wallet.controller');
const ValidationController = require('../../controllers/validation.controller');

// The index route file which connects all the other files.
module.exports = function(express) {
    const router = express.Router();

    router.post('/changeEmail', WalletController.changeEmail);
    router.post('/saveEmailPassword', WalletController.saveEmailPassword);
    router.post('/getEncryptedSeed', WalletController.getEncryptedSeed);
    router.get('/getRecoveryTypes', WalletController.getRecoveryTypes);
    router.post('/getPayload', WalletController.getPayload);
    router.post('/send2FAEmail', WalletController.send2FAEmail);
    router.post('/change2FAMethods', WalletController.change2FAMethods);
    router.post('/getFacebookEncryptedSeed', WalletController.getFacebookEncryptedSeed);
    router.post('/getGoogleEncryptedSeed', WalletController.getGoogleEncryptedSeed);
    router.post('/getVKontakteEncryptedSeed', WalletController.getVKontakteEncryptedSeed);

    router.post('/validateInput', ValidationController.validateInput);
    router.post('/generateAuthenticatorQR', ValidationController.generateAuthenticatorQR);
    router.post('/verifyAuthenticatorCode', ValidationController.verifyAuthenticatorCode);
    router.post('/getQRCode', ValidationController.getQRCode);

    return router;
};
