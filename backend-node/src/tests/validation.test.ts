import * as expect from 'expect';
import { describe, it, beforeEach } from 'mocha';

const app = require('../index').app;
const request = require('supertest');

const badAllNumbersPassword = {
    fieldName: 'password',
    inputFieldValue: '123456'
};

const badAllLowercasePassword = {
    fieldName: 'password',
    inputFieldValue: 'abc123456'
};

const goodPassword = {
    fieldName: 'password',
    inputFieldValue: 'Abc123456'
};

const badEmail = {
    fieldName: 'email',
    inputFieldValue: 'test'
};

const badDomainEmail = {
    fieldName: 'email',
    inputFieldValue: 'test@test.com'
};

const shortUsername = {
    fieldName: 'username',
    inputFieldValue: 'a'
};

const invalidCharacterUsername = {
    fieldName: 'username',
    inputFieldValue: 'a*test'
};

describe('Validation controller test cases', async () => {
    it('returns error for all numbers password', async () => {
        const validationResponse = await request(app)
            .post('/v1/validateInput')
            .send(badAllNumbersPassword)
            .set('Accept', 'application/json');

        expect(validationResponse.body.success).toEqual(false);
        expect(validationResponse.body.returnMessage).toEqual('Password insufficient');
        expect(validationResponse.body.validationFails).toEqual(['min', 'uppercase', 'lowercase']);
    });

    it('returns error for all lowercase password', async () => {
        const validationResponse = await request(app)
            .post('/v1/validateInput')
            .send(badAllLowercasePassword)
            .set('Accept', 'application/json');

        expect(validationResponse.body.success).toEqual(false);
        expect(validationResponse.body.returnMessage).toEqual('Password insufficient');
        expect(validationResponse.body.validationFails).toEqual(['uppercase']);
    });

    it('returns success for good password', async () => {
        const validationResponse = await request(app)
            .post('/v1/validateInput')
            .send(goodPassword)
            .set('Accept', 'application/json');

        expect(validationResponse.body.success).toEqual(true);
        expect(validationResponse.body.returnMessage).toEqual('Password sufficient');
        expect(validationResponse.body.validationFails).toEqual([]);
    });

    it('returns error for no @ email', async () => {
        const validationResponse = await request(app)
            .post('/v1/validateInput')
            .send(badEmail)
            .set('Accept', 'application/json');

        expect(validationResponse.body.success).toEqual(false);
        expect(validationResponse.body.returnMessage).toEqual('EmailFormat');
    });

    it('returns error for bad domain email', async () => {
        const validationResponse = await request(app)
            .post('/v1/validateInput')
            .send(badDomainEmail)
            .set('Accept', 'application/json');

        expect(validationResponse.body.success).toEqual(false);
        expect(validationResponse.body.returnMessage).toEqual('EmailMXRecord');
    });

    it('returns error for short username', async () => {
        const validationResponse = await request(app)
            .post('/v1/validateInput')
            .send(shortUsername)
            .set('Accept', 'application/json');

        expect(validationResponse.body.success).toEqual(false);
        expect(validationResponse.body.returnMessage).toEqual('UserShort');
    });

    it('returns error for invalid symbol in username', async () => {
        const validationResponse = await request(app)
            .post('/v1/validateInput')
            .send(invalidCharacterUsername)
            .set('Accept', 'application/json');

        expect(validationResponse.body.success).toEqual(false);
        expect(validationResponse.body.returnMessage).toEqual('UserSymbol');
    });
});
