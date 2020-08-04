import * as expect from 'expect';
import { describe, it, beforeEach } from 'mocha';
import {sequelize} from "../database/models";

const httpServer = require('../index').httpServer;
const request = require('supertest');

async function clearDatabase(){
    await sequelize.sync({ force: true });
}

const bodyData = {
    email: 'arjet@morpher.com',
    key: 'secureKey',
    encryptedSeed: 'encrypted'
};

describe('Wallet controller test cases', async () => {
    it('successfully creates the user and recovery method', async () => {
        const walletResponse = await request(httpServer)
        .post(`/v1/saveEmailPassword`)
        .send(bodyData)
        .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body).toHaveProperty('recovery_id');
    });

    it('successfully returns the encrypted seed', async () => {
        const walletResponse = await request(httpServer)
            .post(`/v1/getEncryptedSeed`)
            .send(bodyData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body).toHaveProperty('encryptedSeed');
        expect(walletResponse.body.encryptedSeed).toEqual(bodyData.encryptedSeed);
    });

    it('returns an error if encrypted seed could not be found', async () => {
        const walletResponse = await request(httpServer)
            .post(`/v1/getEncryptedSeed`)
            .send(bodyData)
            .set('Accept', 'application/json');

        expect(walletResponse.status).toEqual(404);
        expect(walletResponse.body.error).toEqual('Encrypted seed could not be found');
    });

    it('returns recovery methods', async () => {
        const walletResponse = await request(httpServer)
            .get(`/v1/getRecoveryMethods`)

        expect(walletResponse.status).toEqual(200);
        expect(walletResponse.body.length).toBeGreaterThan(0);
    });
});