import * as expect from 'expect';
import { describe, it, beforeEach } from 'mocha';
import { sequelize } from '../database/models';
import {sha256} from "../helpers/functions/util";

const app = require('../index').app;
const request = require('supertest');

async function clearDatabase() {
    await sequelize.sync({ force: true });
}

const bodyData = {
    email: 'arjet@morpher.com',
    key: 'secureKey',
    encryptedSeed: 'encrypted'
};

const bodyData2 = {
    email: 'arjet@morpher.com',
    key: 'secureKeyBad',
    encryptedSeed: 'encrypted'
};

const facebookData = {
    email: 'arjet@morpher.com',
    key: sha256(process.env.FACEBOOK_APP_ID + '.' + '1212'),
    encryptedSeed: 'encrypted',
    recoveryTypeId: 2
};

const facebookRecovery = {
    accessToken: 'longAccessToken',
    originalSignupEmail: 'arjet@morpher.com'
}

describe('Wallet controller test cases', async () => {
    it('successfully creates the user and recovery method', async () => {
        const walletResponse = await request(app)
            .post('/v1/saveEmailPassword')
            .send(bodyData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body).toHaveProperty('recovery_id');
    });

    it('create user with facebook recovery method', async () => {
        const walletResponse = await request(app)
            .post('/v1/saveEmailPassword')
            .send(facebookData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body).toHaveProperty('recovery_id');
    });

    it('successfully returns the encrypted seed', async () => {
        const walletResponse = await request(app)
            .post('/v1/getEncryptedSeed')
            .send(bodyData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body).toHaveProperty('encryptedSeed');
        expect(walletResponse.body.encryptedSeed).toEqual(bodyData.encryptedSeed);
    });

    it('returns an error if encrypted seed could not be found', async () => {
        const walletResponse = await request(app)
            .post('/v1/getEncryptedSeed')
            .send(bodyData2)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('Encrypted seed could not be found.');
    });

    it('returns recovery methods', async () => {
        const walletResponse = await request(app).get('/v1/getRecoveryTypes');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body.length).toBeGreaterThan(0);
    });

    // The third party recovery unit testing is on hold because
    // access tokens change frequently and we will need to setup
    // proper testing apps and accounts.
    it('test facebook recovery', async () => {
        const walletResponse = await request(app)
            .post('/v1/getFacebookEncryptedSeed')
            .send(facebookRecovery)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('Encrypted seed could not be found.');
    });
});
