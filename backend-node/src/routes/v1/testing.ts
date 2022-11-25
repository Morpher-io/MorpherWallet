// Setup market routes according to controller functions.

import { User } from '../../database/models/User.model';
import { errorResponse, successResponse, randomFixedInteger } from '../../helpers/functions/util';

module.exports = function(router) {
    router.get('/clearDatabase', async (req, res) => {
        await User.destroy({ where: {} });
        return successResponse(res, { success: true });
    });

    router.post('/getUserSecret', async (req, res) => {
        const user = await User.findOne({ where: { email: req.body.email }, raw: true });
        if (user) return successResponse(res, { authenticator_secret: user.authenticator_secret });
        else return errorResponse(res, 'User not found');
    });

    router.post('/getEmailCode', async (req, res) => {
        
        const user = await User.findOne({ where: { email: req.body.email } });
        
        if (user) return successResponse(res, { email_verification_code: user.email_verification_code });
        else return errorResponse(res, 'User not found');
    });

    router.post('/deleteUser', async (req, res) => {
        const user = await User.findOne({ where: { email: req.body.email }, raw: true });
        if (user) {
            await user.destroy();
            return successResponse(res, { message: 'User delete successfully' });
        } else return errorResponse(res, 'User not found');
    });

    return router;
};
