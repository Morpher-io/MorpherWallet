const WalletController = require('../../controllers/wallet.controller');
const ValidationController = require('../../controllers/validation.controller');

// The index route file which connects all the other files.
module.exports = function(express) {
    const router = express.Router();

    router.post('/changeEmail', WalletController.changeEmail);
    router.post('/saveEmailPassword', WalletController.saveEmailPassword);
    router.post('/getEncryptedSeed', WalletController.getEncryptedSeed);
    router.get('/getRecoveryTypes', WalletController.getRecoveryTypes);
    router.post('/get2FAMethods', WalletController.get2FAMethods);
    router.post('/change2FAMethods', WalletController.change2FAMethods);
    router.post('/getFacebookEncryptedSeed', WalletController.getFacebookEncryptedSeed);
    router.post('/getGoogleEncryptedSeed', WalletController.getGoogleEncryptedSeed);
    router.post('/getVKontakteEncryptedSeed', WalletController.getVKontakteEncryptedSeed);

    router.post('/validateInput', ValidationController.validateInput);

    return router;
};
