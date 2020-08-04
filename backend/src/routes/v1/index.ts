import {errorResponse} from "../../helpers/functions/util";

const WalletController = require('../../controllers/wallet.controller');


// The index route file which connects all the other files.
module.exports = function(express) {
    const router = express.Router();

    router.post('/saveEmailPassword', WalletController.saveEmailPassword);
    router.post('/getEncryptedSeed', WalletController.getEncryptedSeed);
    router.get('/getRecoveryMethods', WalletController.getRecoveryMethods);

    return router;
};
