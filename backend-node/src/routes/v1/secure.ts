import { Recovery, User } from "../../database/models";
import {errorResponse, randomFixedInteger, sortObject} from "../../helpers/functions/util";
const Util = require('ethereumjs-util');
const Web3 = require('web3');
const web3 = new Web3('https://sidechain.morpher.com');

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

        const signMessage = JSON.stringify(sortObject(req.body)) + '_' + user.nonce

        const result = await web3.eth.personal.ecRecover(signMessage, signature.signature)

        console.log(signMessage, result)

        try{
            if (user.eth_address.toLowerCase() === result) {
                console.log('user found')
                user.nonce = user.nonce + 1;
                await user.save();
                return next();
            }
        }catch (e) {
            return errorResponse(res,  'User not authenticated.')
        }

        return errorResponse(res,  'User not authenticated.')
    }
}