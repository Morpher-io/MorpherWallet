import { Recovery_Type } from '../../database/models';

const crypto = require('crypto');

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

// Helper function to add the recovery types in a fresh database.
async function seedDatabase() {
    const recoveryTypes = [
        { id: 1, name: 'Email/Password' },
        { id: 2, name: 'Facebook' },
        { id: 3, name: 'Google' },
        { id: 4, name: 'Twitter' },
        { id: 5, name: 'VKontakte' }
    ];

    await Recovery_Type.bulkCreate(recoveryTypes);

    console.log('Recovery types added successfully to database.');
}

// Black box encryption functions.
function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text, key) {
    const iv = Buffer.from(text.iv, 'hex');
    const encryptedText = Buffer.from(text.encryptedData, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function sha256(text) {
    return crypto
        .createHash('sha256')
        .update(text)
        .digest('base64');
}

export { errorResponse, successResponse, asyncForEach, formatMarketId, seedDatabase, encrypt, decrypt, sha256 };
