import { Recovery, User } from "../../database/models";
import {errorResponse, randomFixedInteger, sortObject} from "../../helpers/functions/util";
const Util = require('ethereumjs-util');

module.exports = async function (req, res, next) {
    const signature = JSON.parse(req.header('Signature'));
    const key = req.body.oldKey;

    console.log(signature)
    console.log(key)

    if (signature === null) {
        return errorResponse(res, 'User signature not found');
    }

    else {
        const recovery = await Recovery.findOne({ where: { key } });
        const user = await User.findOne({ where: { id: recovery.user_id } });

        const msgHash = Util.keccak(JSON.stringify(sortObject(req.body) + '_' + user.nonce));

        try{
            const eth_address = '0x' + (Util.pubToAddress(Util.ecrecover(signature.msgHash, Buffer.from(signature.v), Buffer.from(signature.r), Buffer.from(signature.s)))).toString('hex');

            console.log(eth_address)
            if (user.eth_address === eth_address) {
                user.nonce = user.nonce + 1;
                await user.save();
                next();
            }
        }catch (e) {
            return errorResponse(res,  'User not authenticated.')
        }

        return errorResponse(res,  'User not authenticated.')
    }
}