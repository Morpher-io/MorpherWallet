import { Recovery_Type } from '../../database/models/Recovery_Type.model';

const crypto = require('crypto');

/**
 * Function which returns error REST Response
 * @param res
 * @param err
 * @param code
 */
const errorResponse = function(res, err, code = 404) {
    if (typeof err === 'object' && typeof err.message !== 'undefined') err = err.message;
    if (code !== null) res.statusCode = code;
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
        { id: 5, name: 'VKontakte' },
        { id: 6, name: 'Apple' }
    ];

    await Recovery_Type.bulkCreate(recoveryTypes);

    console.log('Recovery types added successfully to database.');
}

// Black box encryption functions.
async function encrypt(text, secret) {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(16);
    //const key = crypto.createHash('sha256').update(String(secret)).digest();
    //this will reduce to const key = sha256(secret).substr(0, 64);
    const key = await new Promise((resolve, reject) => {
        crypto.pbkdf2(String(secret), salt, 100000, 32, 'sha512', (err, derivedKey) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(derivedKey);  // '3745e48...08d59ae'
      });
    });
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const cipherTag = cipher.getAuthTag();
    return { salt: salt.toString('hex'), iv: iv.toString('hex'), encryptedData: encrypted.toString('hex'), cipherTag: cipherTag.toString('hex') };
}

async function decrypt(text, secret) {
    const iv = Buffer.from(text.iv, 'hex');
    const salt = Buffer.from(text.salt, 'hex');
    const cipherTag = Buffer.from(text.cipherTag, 'hex');
    //const key = sha256(secret).substr(0, 64);
    
    //const key = crypto.createHash('sha256').update(String(secret)).digest();
    const key = await new Promise((resolve, reject) => {
        crypto.pbkdf2(String(secret), salt, 100000, 32, 'sha512', (err, derivedKey) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(derivedKey);  // '3745e48...08d59ae'
      });
    });
    const encryptedText = Buffer.from(text.encryptedData, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(cipherTag);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function sha256(text) {
    return crypto
        .createHash('sha256')
        .update(text)
        .digest('hex');
}

const randomFixedInteger = function(length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
};

function sortObject(object: any) {
    if (typeof object !== 'object' || object instanceof Array) {
        // Not to sort the array
        return object;
    }
    const keys = Object.keys(object);
    keys.sort();
    const newObject = {};
    for (let i = 0; i < keys.length; i++) {
        // @ts-ignore
        newObject[keys[i]] = sortObject(object[keys[i]]);
    }
    return newObject;
}

/**
 * validate a recaptcha token passed by the web site
 */
 const validateRecaptcha = async function(recaptchaToken: string) {
    try {

        if (process.env.RECAPTCHA_SECRET == 'DISABLED') {
            return true;
        }
        const axios = require('axios')

        const response = await  axios.post(
                'https://www.google.com/recaptcha/api/siteverify?secret=' +
                process.env.RECAPTCHA_SECRET +
                '&response=' +
                recaptchaToken,
                {},
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                    }
                }
            )
        

        // Check Recaptcha Response
        if (response && response.data && !response.data.success) return false;

        return true;
    } catch(err) {
        if (err) return false;
    }
};

export const getIPCountryCode = async ip_address => {
    const axios = require('axios')

    let country_code = null;
    if (!ip_address || ip_address === '127.0.0.1' || ip_address === '::ffff:127.0.0.1') {
        return country_code;
    }
    try {
            
        
        // check for geolocation using ipdata.co
        const ipcheck1 = await axios.get(
            'https://api.ipdata.co/' + ip_address + '?api-key=' + process.env.IP_DATA_KEY);

        country_code = ipcheck1.data.country_code;
    } catch (err) {
        country_code = null;
    }

    if (!country_code) {
        try {
            // check for geolocation using ipinfo.io
            const ipcheck1 = await axios.get('https://ipinfo.io/' + ip_address + '/json');

            country_code = ipcheck1.data.country;

        } catch (err) {
            country_code = null;
        }
    }
    if (!country_code) {
        try {
            // check for geolocation using geo.json
            const ip_check = await axios.get('https://get.geojs.io/v1/ip/geo.json?ip=' + ip_address);

            country_code = ip_check.data[0].country_code;

        } catch (err) {
            country_code = null;
        }
    }

    return country_code;
};


export {
    validateRecaptcha,
    errorResponse,
    successResponse,
    asyncForEach,
    formatMarketId,
    seedDatabase,
    encrypt,
    decrypt,
    sha256,
    randomFixedInteger,
    sortObject
};
