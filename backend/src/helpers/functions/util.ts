import awaitTo from 'await-to-js';
import {Recovery_Type} from "../../database/models";

const { promisify } = require('util');

/**
 * Function which returns error REST Response
 * @param res
 * @param err
 * @param code
 */
const errorResponse = function(res, err, code = null) {
    if (typeof err === 'object' && typeof err.message !== 'undefined') err = err.message;
    if (code !== null) res.statusCode = code;
    console.log(err);
    return res.json({ success: false, error: err });
};

/**
 * Function which returns successfully REST Response
 * @param res
 * @param data
 * @param code
 */
const successResponse = function(res, data, code = null) {
    let sendData = { success: true };
    // Merge the objects
    if (typeof data === 'object') sendData = Object.assign(data, sendData);
    // Set response code
    if (code !== null) res.statusCode = code;
    // Response in JSON Format
    return res.json(sendData);
};

/**
 * Normal array.forEach method from js is not synchronous
 * This function make "callback" run for each element in array synchronously
 * @param array
 * @param callback
 */
const asyncForEach = async function(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

const formatMarketId = (type: string, symbol: string) => {
    return (type + '_' + symbol).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_');
};

async function seedDatabase(){
    const recoveryTypes = [{ id: 1, name: 'Email/Password' }, { id: 2, name: 'Facebook' }, { id: 3, name: 'Google' },
        { id: 4, name: 'Twitter' }, { id: 5, name: 'VKontakte' }
    ]

    await Recovery_Type.bulkCreate(recoveryTypes);

    console.log('Recovery types added successfully to database.')
}


// @ts-ignore
export {
    errorResponse,
    successResponse,
    asyncForEach,
    formatMarketId,
    seedDatabase
};
