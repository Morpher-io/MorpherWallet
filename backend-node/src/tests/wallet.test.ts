import * as expect from 'expect';
import { describe, it, beforeEach } from 'mocha';
import {Recovery, Recovery_Type, sequelize, User, Userhistory} from '../database/models';
import {randomFixedInteger, sha256} from '../helpers/functions/util';

const app = require('../index').app;
const request = require('supertest');

async function clearDatabase() {
    await Recovery.destroy({where: {}});
    await User.destroy({where: {}});
    // await Userhistory.destroy({where: {}});
    // await Recovery_Type.bulkCreate(recoveryTypes);
}

const recoveryTypes = [
    {
        id: 1,
        name: 'Password'
    },
    {
        id: 2,
        name: 'Facebook'
    },
    {
        id: 3,
        name: 'Google'
    },
    {
        id: 4,
        name: 'Twitter'
    },
    {
        id: 5,
        name: 'VKontakte'
    },

]

const bodyData = {
    email: 'arjet@morpher.com',
    key: '5eb8f7d40f8b67dec627deeb9f18620c40014e1346994b567a27374001c337ad',
    encryptedSeed: '{"ciphertext":"yqm+4z2w6XcqTveYC7uXjadFHJsIaS+OQ/hC2Zu/e4Jas7ha6U0dxf4pVvISUxSEkyKuTENcDyBYNjnQ8HgPNZ/Wdesw3R/IkghBz8c5wi2EnRe6lRxCCEeIpLGgPQ==","iv":"TljpH9fl8eUC/6M3","salt":"zAdVIXo4K+QJvSbjeqFVug=="}',
    eth_address: '0x0Aaa3dB0B463075A327C7f0c586dad80538b8Db0'
};

const badBodyKey = {
    email: 'arjet@morpher.com',
    key: 'secureKeyBad',
    encryptedSeed: '{"ciphertext":"yqm+4z2w6XcqTveYC7uXjadFHJsIaS+OQ/hC2Zu/e4Jas7ha6U0dxf4pVvISUxSEkyKuTENcDyBYNjnQ8HgPNZ/Wdesw3R/IkghBz8c5wi2EnRe6lRxCCEeIpLGgPQ==","iv":"TljpH9fl8eUC/6M3","salt":"zAdVIXo4K+QJvSbjeqFVug=="}',
    eth_address: '0x0Aaa3dB0B463075A327C7f0c586dad80538b8Db0'
};

const badBodyEncryptedSeed = {
    email: 'arjet@morpher.com',
    key: '5eb8f7d40f8b67dec627deeb9f18620c40014e1346994b567a27374001c337ad',
    encryptedSeed: 'badBodySeed'
};

const encryptedSeedData = {
    key: '5eb8f7d40f8b67dec627deeb9f18620c40014e1346994b567a27374001c337ad',
    email2fa: '',
    authenticator2fa: ''
}

const facebookData = {
    email: 'arjet@morpher.com',
    key: sha256(process.env.FACEBOOK_APP_ID + '.' + '1212'),
    encryptedSeed: 'encrypted',
    recoveryTypeId: 2
};

const facebookRecovery = {
    accessToken: 'longAccessToken',
    originalSignupEmail: 'arjet@morpher.com'
};

describe('Wallet controller test cases', async () => {
    it('successfully creates the user and recovery method', async () => {
        await clearDatabase();

        const walletResponse = await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body).toHaveProperty('recovery_id');
    });

    it('returns error if bad body key', async () => {
        await clearDatabase();

        const walletResponse = await request(app)
            .post('/v1/saveEmailPassword')
            .send(badBodyKey)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('Bad body data.');
    });

    it('returns error if bad body encryptedSeed', async () => {
        await clearDatabase();

        const walletResponse = await request(app)
            .post('/v1/saveEmailPassword')
            .send(badBodyEncryptedSeed)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('Bad body data.');
    });

    it('returns encryptedSeed if email2fa is false', async () => {
        await clearDatabase();

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const user = await User.findOne();

        // Simulating email sent not to spam the email address when running tests.
        user.payload.email = false;
        user.changed('payload', true);
        await user.save()

        const walletResponse = await request(app)
            .post('/v1/getEncryptedSeed')
            .send(encryptedSeedData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body).toHaveProperty('encryptedSeed');
    });

    it('returns error if no email verification code', async () => {
        await clearDatabase();

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const walletResponse = await request(app)
            .post('/v1/getEncryptedSeed')
            .send(encryptedSeedData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('Either Email2FA or Authenticator2FA was wrong. Try again.');
    });

    it('returns user payload', async () => {
        await clearDatabase();

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const walletResponse = await request(app)
            .post('/v1/getPayload')
            .send(bodyData)
            .set('Accept', 'application/json');

        expect(walletResponse.body.email).toEqual(true);
        expect(walletResponse.body.authenticator).toEqual(false);
        expect(walletResponse.body.authenticatorConfirmed).toEqual(false);
    });

    it('returns error for payload if bad key', async () => {
        await clearDatabase();

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const badData = {
            key: 'randomstring'
        }

        const walletResponse = await request(app)
            .post('/v1/getPayload')
            .send(badData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('User not found');
    });

    it('returns user nonce', async () => {
        await clearDatabase();

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const walletResponse = await request(app)
            .post('/v1/getNonce')
            .send(bodyData)
            .set('Accept', 'application/json');

        expect(walletResponse.body).toHaveProperty('nonce');
    });

    it('returns error for nonce if bad key', async () => {
        await clearDatabase();

        await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        const badData = {
            key: 'randomstring'
        }

        const walletResponse = await request(app)
            .post('/v1/getNonce')
            .send(badData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('User not found');
    });

    // it('create user with facebook recovery method', async () => {
    //     const walletResponse = await request(app)
    //         .post('/v1/saveEmailPassword')
    //         .send(facebookData)
    //         .set('Accept', 'application/json');
    //
    //     expect(walletResponse.status).toEqual(200);
    //     expect(walletResponse.body).toHaveProperty('recovery_id');
    // });
    //
    // it('successfully returns the encrypted seed', async () => {
    //     const walletResponse = await request(app)
    //         .post('/v1/getEncryptedSeed')
    //         .send(bodyData)
    //         .set('Accept', 'application/json');
    //
    //     expect(walletResponse.status).toEqual(200);
    //     expect(walletResponse.body).toHaveProperty('encryptedSeed');
    //     expect(walletResponse.body.encryptedSeed).toEqual(bodyData.encryptedSeed);
    // });
    //
    // it('returns recovery methods', async () => {
    //     const walletResponse = await request(app).get('/v1/getRecoveryTypes');
    //
    //     expect(walletResponse.status).toEqual(200);
    //     expect(walletResponse.body.length).toBeGreaterThan(0);
    // });
    //
    // // The third party recovery unit testing is on hold because
    // // access tokens change frequently and we will need to setup
    // // proper testing apps and accounts.
    // it('test facebook recovery', async () => {
    //     const walletResponse = await request(app)
    //         .post('/v1/getFacebookEncryptedSeed')
    //         .send(facebookRecovery)
    //         .set('Accept', 'application/json');
    //
    //     expect(walletResponse.status).toEqual(404);
    //     expect(walletResponse.body.error).toEqual('Encrypted seed could not be found.');
    // });
});
