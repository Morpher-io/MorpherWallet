import * as dotEnv from 'dotenv';
dotEnv.config();

import { describe, it } from "mocha";
const puppeteer = require('puppeteer');

const auth = process.env.DEV_USER + ':' + process.env.DEV_PASSWORD;

const devWalletEmail = process.env.DEV_WALLET_EMAIL;
const devWalletPassword = process.env.DEV_WALLET_PASSWORD;

describe('Recovery methods test cases', async () => {
    it('testing', async () => {
        const browser = await puppeteer.launch(  { headless: false });
        const page = await browser.newPage();
        await page.goto(`https://${auth}@wallet-dev.morpher.com`);


        await page.focus('[data-cy=walletEmail]');
        await page.keyboard.type(devWalletEmail);

        await page.focus('[data-cy=walletPassword]');
        await page.keyboard.type(devWalletPassword);

        await page.click('[data-cy=submit]');

        await page.waitForSelector('[data-cy=currentEmail]');

        await page.click('[data-cy=settingsButton]');

        console.log(await page.$('.settings-link'))

        await page.screenshot({ path: 'example.png' });

        await browser.close();
    })
})