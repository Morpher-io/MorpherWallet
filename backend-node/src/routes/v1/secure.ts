import { Recovery } from '../../database/models/Recovery.model';
import { User } from '../../database/models/User.model';
import { errorResponse, sortObject } from '../../helpers/functions/util';
const ethereumjs = require('ethereumjs-util');

module.exports = async function(req, res, next) {
    const signature = JSON.parse(req.header('Signature'));
    const key = req.header('key');

    if (!key) {
        return errorResponse(res, 'AUTH_ERROR - No Key', 400);    
    }

    if (signature !== null) {
        const recovery = await Recovery.findOne({ where: { key } });
        if (!recovery) {
            return errorResponse(res, 'AUTH_ERROR - No Recovery', 400);  
        }
        const user = await User.findOne({ where: { id: recovery.user_id } });

        if (!user) {
            return errorResponse(res, 'AUTH_ERROR - No User', 400);  
        }
        
        if (req.body.nonce === user.nonce) {
            const signMessage = Buffer.from(JSON.stringify(sortObject(req.body)));
            const prefixedMsg = ethereumjs.hashPersonalMessage(signMessage);
            const pub = ethereumjs.ecrecover(prefixedMsg, parseInt(signature.v), ethereumjs.toBuffer(signature.r), ethereumjs.toBuffer(signature.s));
            const addrBuf = ethereumjs.pubToAddress(pub);
            const addr = ethereumjs.toChecksumAddress(ethereumjs.bufferToHex(addrBuf));
            if (user.eth_address === addr) {
                user.nonce = user.nonce + 1;
                user.nonce_timestamp = null;
                await user.save();
                return next();
            } else {
                return errorResponse(res, 'AUTH_ERROR - eth_address', 400);    
            }
        } else {
            return errorResponse(res, 'AUTH_ERROR - Nonce', 400);    
        }
    } else {
        return errorResponse(res, 'AUTH_ERROR - No Signature', 400);    
    }

    return errorResponse(res, 'AUTH_ERROR', 400);
};
