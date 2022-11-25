import * as expect from 'expect';
import { describe, it, beforeEach } from 'mocha';
import { Recovery, User } from '../database/models';
import { sha256, sortObject } from '../helpers/functions/util';
import { authenticator } from 'otplib';

const app = require('../index').app;
const request = require('supertest');

const Web3EthAccounts = require('web3-eth-accounts');

const Account = new Web3EthAccounts('https://sidechain.morpher.com');

async function clearDatabase() {
    await Recovery.destroy({ where: {} });
    await User.destroy({ where: {} });
}

const bodyData = {
    email: 'test@morpher.com',
    key: '5eb8f7d40f8b67dec627deeb9f18620c40014e1346994b567a27374001c337ad',
    encryptedSeed: {
        ciphertext:
            'yqm+4z2w6XcqTveYC7uXjadFHJsIaS+OQ/hC2Zu/e4Jas7ha6U0dxf4pVvISUxSEkyKuTENcDyBYNjnQ8HgPNZ/Wdesw3R/IkghBz8c5wi2EnRe6lRxCCEeIpLGgPQ==',
        iv: 'TljpH9fl8eUC/6M3',
        salt: 'zAdVIXo4K+QJvSbjeqFVug=='
    },
    ethAddress: '0xCb4DB6D3554B3F6439847f3559c41501967192fE',
    recovery_type: 1
};

const newBodyData = {
    email: 'test@morpher.com',
    key: '5eb8f7d40f8b67dec627deeb9f18620c40014e1346994b567a27374001c337ad',
    encryptedSeed: {
        ciphertext:
            'EzT86NIuZD88pe7jd=gsGgaNSCGIS8I/Yu4kxF/CcC3HLCmSOpwaDZxcSmXCyHSH4IvaRj7UFz+QauXI5Ea+ISju7mscxUCwXC/eahu2eCe8keYINEue/H=CSC=/dxR2',
        iv: 'GgddR6jdlyQF/4R1',
        salt: 'sSJvJXeVzqg+4eVbIAQb4S=='
    },
    ethAddress: '0xCb4DB6D3554B3F6439847f3559c41501967192fE'
};

const badBodyKey = {
    email: 'test@morpher.com',
    key: 'secureKeyBad',
    encryptedSeed: {
        ciphertext:
            'yqm+4z2w6XcqTveYC7uXjadFHJsIaS+OQ/hC2Zu/e4Jas7ha6U0dxf4pVvISUxSEkyKuTENcDyBYNjnQ8HgPNZ/Wdesw3R/IkghBz8c5wi2EnRe6lRxCCEeIpLGgPQ==',
        iv: 'TljpH9fl8eUC/6M3',
        salt: 'zAdVIXo4K+QJvSbjeqFVug=='
    },
    ethAddress: '0xCb4DB6D3554B3F6439847f3559c41501967192fE'
};

const badBodyEncryptedSeed = {
    email: 'test@morpher.com',
    key: '5eb8f7d40f8b67dec627deeb9f18620c40014e1346994b567a27374001c337ad',
    encryptedSeed: 'badBodySeed'
};

const encryptedSeedData = {
    key: '5eb8f7d40f8b67dec627deeb9f18620c40014e1346994b567a27374001c337ad',
    email2fa: '',
    authenticator2fa: '',
    email: 'test@morpher.com',
};

const facebookData = {
    email: 'test@morpher.com',
    key: sha256(process.env.FACEBOOK_APP_ID + '.' + '54674675'), // simulating facebook id
    encryptedSeed: {
        ciphertext:
            'yqm+4z2w6XcqTveYC7uXjadFHJsIaS+OQ/hC2Zu/e4Jas7ha6U0dxf4pVvISUxSEkyKuTENcDyBYNjnQ8HgPNZ/Wdesw3R/IkghBz8c5wi2EnRe6lRxCCEeIpLGgPQ==',
        iv: 'TljpH9fl8eUC/6M3',
        salt: 'zAdVIXo4K+QJvSbjeqFVug=='
    },
    recoveryTypeId: 2,
    currentRecoveryTypeId: 1
};

const googleData = {
    email: 'morpher@gmail.com',
    key: sha256(process.env.VUE_APP_GOOGLE_APP_ID + '234655374'), // simulating google user id
    encryptedSeed: {
        ciphertext:
            'yqm+4z2w6XcqTveYC7uXjadFHJsIaS+OQ/hC2Zu/e4Jas7ha6U0dxf4pVvISUxSEkyKuTENcDyBYNjnQ8HgPNZ/Wdesw3R/IkghBz8c5wi2EnRe6lRxCCEeIpLGgPQ==',
        iv: 'TljpH9fl8eUC/6M3',
        salt: 'zAdVIXo4K+QJvSbjeqFVug=='
    },
    recoveryTypeId: 3,
    recovery_type: 3,
    currentRecoveryTypeId: 1
};

const appleData = {
    email: 'morpher@apple.com',
    key: sha256(process.env.VUE_APP_APPLE_CLIENT_ID + '832745629'), // simulating apple id
    encryptedSeed: {
        ciphertext:
            'yqm+4z2w6XcqTveYC7uXjadFHJsIaS+OQ/hC2Zu/e4Jas7ha6U0dxf4pVvISUxSEkyKuTENcDyBYNjnQ8HgPNZ/Wdesw3R/IkghBz8c5wi2EnRe6lRxCCEeIpLGgPQ==',
        iv: 'TljpH9fl8eUC/6M3',
        salt: 'zAdVIXo4K+QJvSbjeqFVug=='
    },
    recoveryTypeId: 6,
    currentRecoveryTypeId: 3
};



const facebookRecovery = {
    accessToken: 'longAccessToken',
    originalSignupEmail: 'test@morpher.com'
};

const secureAccount = {
    ethAddress: '0xCb4DB6D3554B3F6439847f3559c41501967192fE',
    privateKey: '7dc0746fd1a3c6180ee0b95462a4a2bd6689a7618981c7adc629326bc5f52825'
};

describe('Wallet controller test cases', async () => {
    beforeEach(async () => {
        await clearDatabase();
    });

    it('successfully creates the user and recovery method', async () => {
        const walletResponse = await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body).toHaveProperty('recovery_id');
    });

    it('returns error if user already exists', async () => {
        // Attempt to create 2 users with the same data.
        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const walletResponse = await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('USER_ALREADY_EXISTS');
    });

    it('returns error if bad body key', async () => {
        const walletResponse = await request(app)
            .post('/v1/saveEmailPassword')
            .send(badBodyKey)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(400);
        expect(walletResponse.body.error).toEqual('BAD_REQUEST');
    });

    it('returns error if bad body encryptedSeed', async () => {
        const walletResponse = await request(app)
            .post('/v1/saveEmailPassword')
            .send(badBodyEncryptedSeed)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(400);
        expect(walletResponse.body.error).toEqual('BAD_REQUEST');
    });

    it('returns encryptedSeed', async () => {

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        // Simulate sending an email by changing only user payload.
        const emailData = {
            key: bodyData.key
        };

        await request(app)
            .post('/v1/send2FAEmail')
            .send(emailData)
            .set('Accept', 'application/json');

        // Get the email verification code from the payload.
        const user = await User.findOne();
        encryptedSeedData.email2fa = user.email_verification_code;

        // Confirm user first
        await request(app)
            .post('/v1/verifyEmailConfirmationCode')
            .send({
                key: bodyData.key,
                code: user.email_verification_code
            })
            .set('Accept', 'application/json');

        const walletResponse = await request(app)
            .post('/v1/getEncryptedSeed')
            .send(encryptedSeedData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body).toHaveProperty('encryptedSeed');
    });

    it('returns error if user not confirmed', async () => {
        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const walletResponse = await request(app)
            .post('/v1/getEncryptedSeed')
            .send(encryptedSeedData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(400);
        expect(walletResponse.body.error).toEqual('ACCOUNT_NOT_CONFIRMED');
    });

    it('returns error if no email verification code', async () => {
        encryptedSeedData.email2fa = '';

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        // Simulate sending an email by changing only user payload.
        const emailData = {
            key: bodyData.key
        };

        await request(app)
            .post('/v1/send2FAEmail')
            .send(emailData)
            .set('Accept', 'application/json');

        // Get the email verification code from the payload.
        const user = await User.findOne();

        // Confirm user first
        await request(app)
            .post('/v1/verifyEmailConfirmationCode')
            .send({
                key: bodyData.key,
                code: user.email_verification_code
            })
            .set('Accept', 'application/json');

        // Confirm user first
        await request(app)
            .post('/v1/verifyEmailConfirmationCode')
            .send({
                key: bodyData.key,
                code: user.email_verification_code
            })
            .set('Accept', 'application/json');

        // Enable email 2fa since it is disabled by default
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        const data = {
            email: true,
            authenticator: false,
            nonce: user.nonce,
            email2faVerification: user.email_verification_code
        };

        const signature = account.sign(JSON.stringify(sortObject(data)));

        await request(app)
            .post('/v1/auth/change2FAMethods')
            .send(data)
            .set('Accept', 'application/json')
            .set('recoveryTypeId', 1)
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        const walletResponse = await request(app)
            .post('/v1/getEncryptedSeed')
            .send(encryptedSeedData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(400);
        expect(walletResponse.body.error).toEqual('SOME_2FA_WRONG');
    });

    it('returns user payload', async () => {
        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        // Get payload with the same key.
        const walletResponse = await request(app)
            .post('/v1/getPayload')
            .send({ key: bodyData.key })
            .set('Accept', 'application/json');

        expect(walletResponse.body.email).toEqual(false);
        expect(walletResponse.body.authenticator).toEqual(false);
        expect(walletResponse.body.authenticatorConfirmed).toEqual(false);
        expect(walletResponse.body.needConfirmation).toEqual(true);
    });

    it('returns error for payload if bad key', async () => {
        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const badData = {
            key: 'randomstring'
        };

        const walletResponse = await request(app)
            .post('/v1/getPayload')
            .send(badData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('USER_NOT_FOUND');
    });

    it('returns user nonce', async () => {
        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        // Get nonce with the same key.
        const walletResponse = await request(app)
            .post('/v1/getNonce')
            .send({ key: bodyData.key })
            .set('Accept', 'application/json');

        expect(walletResponse.body).toHaveProperty('nonce');
    });

    it('returns error for nonce if bad key', async () => {
        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const badData = {
            key: 'randomstring'
        };

        const walletResponse = await request(app)
            .post('/v1/getNonce')
            .send(badData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('USER_NOT_FOUND');
    });

    // facebook recovery
    it('create user with facebook recovery method', async () => {
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const user = await User.findOne();

        facebookData['nonce'] = user.nonce;

        const body = sortObject(facebookData);

        const signature = account.sign(JSON.stringify(body));

        facebookData['nonce'] = user.nonce;

        const response = await request(app)
            .post('/v1/auth/addRecoveryMethod')
            .send(body)
            .set('Accept', 'application/json')
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        const recovery = await Recovery.findOne({ where: { recovery_type_id: facebookData.recoveryTypeId } });

        expect(recovery).toHaveProperty('encrypted_seed');
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('recovery_id');
    });

    // google recovary and login login and apple recovery

    it('google and apple recovery and login', async () => {
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        // Simulate sending an email by changing only user payload.
        const emailData = {
            key: bodyData.key
        };

        await request(app)
            .post('/v1/send2FAEmail')
            .send(emailData)
            .set('Accept', 'application/json');

        // Get the email verification code from the payload.
        let user:any = await User.findOne();
        encryptedSeedData.email2fa = user.email_verification_code;

        // Confirm user first
        await request(app)
            .post('/v1/verifyEmailConfirmationCode')
            .send({
                key: bodyData.key,
                code: user.email_verification_code
            })
            .set('Accept', 'application/json');            

        user = await User.findOne();

        googleData['nonce'] = user.nonce;

        const body = sortObject(googleData);

        const signature = account.sign(JSON.stringify(body));
        const response = await request(app)
            .post('/v1/auth/addRecoveryMethod')
            .send(body)
            .set('Accept', 'application/json')
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        const recovery = await Recovery.findOne({ where: { recovery_type_id: googleData.recoveryTypeId } });

        // login with google
        const googleResponse = await request(app)
        .post('/v1/getEncryptedSeed')
        .send(googleData)
        .set('Accept', 'application/json');

        // add apple recovery
        user = await User.findOne();

        appleData['nonce'] = user.nonce;

        const appleBody = sortObject(appleData);

        const appleSignature = account.sign(JSON.stringify(appleBody));

        const appleResponse = await request(app)
            .post('/v1/auth/addRecoveryMethod')
            .send(appleBody)
            .set('Accept', 'application/json')
            .set('Signature', JSON.stringify(appleSignature))
            .set('key',  bodyData.key);

        const recoveryData = await Recovery.findAll({  });

        expect(recovery).toHaveProperty('encrypted_seed');
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('recovery_id');
        expect(googleResponse.status).toEqual(200);
        //expect(appleResponse.status).toEqual(200);
        //expect(recoveryData.length).toEqual(3);
    });

    it('returns recovery methods', async () => {
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const user = await User.findOne();

        const signature = account.sign(JSON.stringify(sortObject({ nonce: user.nonce })));

        const response = await request(app)
            .post('/v1/auth/getRecoveryMethods')
            .send({ nonce: user.nonce })
            .set('Accept', 'application/json')
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        expect(response.status).toEqual(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('tests change password user auth', async () => {
        // Create account with private key that corresponds to eth wallet in user database.
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const encryptedSeedBeforeUpdate = (await Recovery.findOne()).encrypted_seed;

        const user = await User.findOne();

        newBodyData['nonce'] = user.nonce;

        const signature = account.sign(JSON.stringify(sortObject(newBodyData)));

        const response = await request(app)
            .post('/v1/auth/updatePassword')
            .send(newBodyData)
            .set('Accept', 'application/json')
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        const encryptedSeedAfterUpdate = (await Recovery.findOne()).encrypted_seed;

        // Password change is reflected in changed encrypted seed.
        expect(response.status).toEqual(200);
        expect(encryptedSeedBeforeUpdate).not.toEqual(encryptedSeedAfterUpdate);
    });

    it('tests change email user auth', async () => {
        // Create account with private key that corresponds to eth wallet in user database.
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        // Simulate sending an email by changing only user payload.
        const emailData = {
            key: bodyData.key
        };

        await request(app)
            .post('/v1/send2FAEmail')
            .send(emailData)
            .set('Accept', 'application/json');

        // Get the email verification code from the payload.
        let user = await User.findOne();
        encryptedSeedData.email2fa = user.email_verification_code;

        const newEmailData = {
            email2faVerification: user.email_verification_code,
            newEmail: 'test@morpher.io'
        };

        newEmailData['nonce'] = user.nonce;

        const signature = account.sign(JSON.stringify(sortObject(newEmailData)));

        const response = await request(app)
            .post('/v1/auth/updateEmail')
            .send(newEmailData)
            .set('Accept', 'application/json')
            .set('recoveryTypeId', 1)
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        user = await User.findOne();

        expect(response.status).toEqual(200);
        expect(response.body.updated).toEqual(true);
        expect(user.email).toEqual(newEmailData.newEmail);
    });

    it('tests change password user auth error if bad body data', async () => {
        // Create account with private key that corresponds to eth wallet in user database.
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        newBodyData['nonce'] = '6565';

        const signature = account.sign(JSON.stringify(sortObject(newBodyData)));

        const response = await request(app)
            .post('/v1/auth/updatePassword')
            .send(newBodyData)
            .set('Accept', 'application/json')
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        expect(response.status).toEqual(400);
        expect(response.body).not.toEqual('AUTH_ERROR');
    });

    it('tests change 2fa methods', async () => {
        // Create account with private key that corresponds to eth wallet in user database.
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const data = {
            email: false,
            authenticator: false
        };

        let user = await User.findOne();

        data['nonce'] = user.nonce;

        const signature = account.sign(JSON.stringify(sortObject(data)));

        const response = await request(app)
            .post('/v1/auth/change2FAMethods')
            .send(data)
            .set('Accept', 'application/json')
            .set('recoveryTypeId', 1)
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        user = await User.findOne();

        // By default payload.email is set to true.
        expect(response.status).toEqual(200);
        expect(response.body.message).toEqual('User payload updated successfully.');
        expect(user.payload.email).toEqual(false);
        expect(user.payload.authenticator).toEqual(false);
    });

    it('tests generate qr code', async () => {
        // Create account with private key that corresponds to eth wallet in user database.
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        let user = await User.findOne();

        const signature = account.sign(JSON.stringify(sortObject({ nonce: user.nonce })));

        const response = await request(app)
            .post('/v1/auth/generateAuthenticatorQR')
            .send({ nonce: user.nonce })
            .set('Accept', 'application/json')
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        user = await User.findOne();

        expect(response.status).toEqual(200);
        expect(user.payload.authenticator).toEqual(false);
        expect(user.payload.authenticatorConfirmed).toEqual(false);
        expect(user.authenticator_qr).not.toEqual(null);
    });

    // Create account with private key that corresponds to eth wallet in user database.
    it('verifies email code', async () => {
        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        // Simulate sending an email by changing only user payload.
        const emailData = {
            key: bodyData.key
        };

        await request(app)
            .post('/v1/send2FAEmail')
            .send(emailData)
            .set('Accept', 'application/json');

        const data = {
            key: bodyData.key,
            code: (await User.findOne()).email_verification_code
        };

        const response = await request(app)
            .post('/v1/verifyEmailCode')
            .send(data)
            .set('Accept', 'application/json');

        expect(response.status).toEqual(200);
        expect(response.body.success).toEqual(true);
    });

    // Create account with private key that corresponds to eth wallet in user database.
    it('returns error if email code not right', async () => {
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const email2FAData = {
            email: true,
            authenticator: false
        };

        const user = await User.findOne();

        email2FAData['nonce'] = user.nonce;

        const signature = account.sign(JSON.stringify(sortObject(email2FAData)));

        await request(app)
            .post('/v1/auth/change2FAMethods')
            .send(email2FAData)
            .set('Accept', 'application/json')
            .set('recoveryTypeId', 1)
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        // Simulate sending an email by changing only user payload.
        const emailData = {
            key: bodyData.key
        };

        await request(app)
            .post('/v1/send2FAEmail')
            .send(emailData)
            .set('Accept', 'application/json');

        const data = {
            key: bodyData.key,
            code: 'randomString'
        };

        const response = await request(app)
            .post('/v1/verifyEmailCode')
            .send(data)
            .set('Accept', 'application/json');

        expect(response.status).toEqual(400);
        expect(response.body.error).toEqual('CANNOT_VERIFY_EMAIL_CODE');
    });

    // Create account with private key that corresponds to eth wallet in user database.
    it('tests verify authenticator code', async () => {
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        let user = await User.findOne();

        const signature = account.sign(JSON.stringify(sortObject({ nonce: user.nonce })));

        await request(app)
            .post('/v1/auth/generateAuthenticatorQR')
            .send({ nonce: user.nonce })
            .set('Accept', 'application/json')
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        user = await User.findOne();

        const secret = user.authenticator_secret;

        const token = authenticator.generate(secret);

        const isValid = authenticator.verify({ token, secret });

        expect(isValid).toEqual(true);
    });

    // Create account with private key that corresponds to eth wallet in user database.
    it('tests verify authenticator code error', async () => {
        const account = Account.privateKeyToAccount(secureAccount.privateKey);

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        let user = await User.findOne();

        const signature = account.sign(JSON.stringify(sortObject({ nonce: user.nonce })));

        await request(app)
            .post('/v1/auth/generateAuthenticatorQR')
            .send({ nonce: user.nonce })
            .set('Accept', 'application/json')
            .set('Signature', JSON.stringify(signature))
            .set('key', bodyData.key);

        user = await User.findOne();

        const secret = user.authenticator_secret;

        const token = 'randomString';

        const isValid = authenticator.verify({ token, secret });

        expect(isValid).toEqual(false);
    });
});
