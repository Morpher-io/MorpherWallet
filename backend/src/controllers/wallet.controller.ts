import { getTransaction, Op, Recovery, Recovery_Type, User } from "../database/models";
import { errorResponse, successResponse } from "../helpers/functions/util";
const { to } = require('await-to-js');
import * as moment from 'moment'

import { Facebook, FacebookApiException } from 'fb';
const options = {
    'app_id': process.env.FACEBOOK_APP_ID,
    'app_secret': process.env.FACEBOOK_APP_SECRET,
    'default_graph_version': 'v7.0'
}
const fb = new Facebook(options);

export async function saveEmailPassword(req, res) {
    const [err, transaction] = await to(getTransaction());
    if (err) return errorResponse(res, err.message);

    try{
        const email = req.body.email;
        const key = req.body.key;
        const encryptedSeed = req.body.encryptedSeed;
        const recoveryTypeId = req.body.recoveryTypeId || 1;

        let userId;

        const [, user] = await to(User.findOne({ where: email, transaction }));

        if(user){
            userId = user.dataValues.id;

            await Recovery.destroy({ where: { user_id: user.id,
                    [Op.and]: { recovery_type_id: recoveryTypeId }, transaction}});
        }
        else {
            userId = (await User.create({ email, created_at: moment.utc().valueOf(), transaction })).dataValues.id
        }

        const recoveryId = (await Recovery.create({
            recovery_type_id: recoveryTypeId,
            user_id: userId,
            encrypted_seed: encryptedSeed,
            key,
            created_at: moment.utc().valueOf()
        }, { transaction })).dataValues.id;

        await transaction.commit();

        return successResponse(res, {
            'recovery_id': recoveryId
        })

    } catch (error){
        await transaction.rollback();
        return errorResponse(res, error.message)
    }
}

export async function getEncryptedSeed(req, res){
    const key = req.body.key;

    const [error, result] = await to(Recovery.findOne({ where: { key }, raw: true }))

    if(result) return successResponse(res, {
        encryptedSeed: result.encrypted_seed
    })

    else return errorResponse(res, 'Encrypted seed could not be found', 404);
}

export async function getRecoveryMethods(req, res){
    const recoveryMethods = await Recovery_Type.findAll({ raw: true });

    if(recoveryMethods.length > 0) return successResponse(res, recoveryMethods);
    else return errorResponse(res, 'Recovery methods could not be found', 404);
}