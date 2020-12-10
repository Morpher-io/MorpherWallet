import Accounts from 'web3-eth-accounts';
import { AccountsBase } from 'web3-core';
import { TypeCreatedKeystore } from '@/types/global-types';

import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import { cryptoDecrypt, cryptoEncrypt } from '../utils/cryptoFunctions';

function getPrivateKeyFromMnemonic(mnemonic: string, index: number) {
	const seed = mnemonicToSeedSync(mnemonic);
	const hdwallet = hdkey.fromMasterSeed(seed);
	const walletHdPath = "m/44'/60'/0'/0/";

	const wallet = hdwallet.derivePath(walletHdPath + index).getWallet();
	// let address = "0x" + wallet.getAddress().toString("hex");
	const privateKey = wallet.getPrivateKey().toString('hex');

	return privateKey;
}

declare module 'web3-eth-accounts' {
	export default class Accounts extends AccountsBase {}
}

export function getKeystore(password: string, encryptedSeedPhrase: string, accountIndex: number): Promise<TypeCreatedKeystore> {
	return new Promise(async (resolve, reject) => {
		try {
			const account = new Accounts();
			let mnemonic: string;
			if (encryptedSeedPhrase.length == 0) {
				console.log('Creating new Wallet');
				mnemonic = generateMnemonic();
				encryptedSeedPhrase = JSON.stringify(await cryptoEncrypt(password, mnemonic));
			} else {
				console.log('trying to unlock keystore');
				const encryptedSeedObject = JSON.parse(encryptedSeedPhrase);
				mnemonic = await cryptoDecrypt(password, encryptedSeedObject.ciphertext, encryptedSeedObject.iv, encryptedSeedObject.salt);
			}

			if (accountIndex == undefined) {
				accountIndex = 1;
			}

			const privateKey = getPrivateKeyFromMnemonic(mnemonic, accountIndex);
			account.wallet.add(privateKey);
			resolve({ encryptedSeed: encryptedSeedPhrase, keystore: account.wallet });
		} catch (err) {
			console.log('getKeystore error', err);
			reject(err);
		}
	});
}
