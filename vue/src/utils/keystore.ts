import Accounts from 'web3-eth-accounts';
import { AccountsBase, WalletBase } from 'web3-core';

declare module 'web3-eth-accounts' {
	export default class Accounts extends AccountsBase {}
}

export function getKeystore(password: string, encryptedWalletObject: []) {
	return new Promise((resolve, reject) => {
		try {
			const account = new Accounts();
			if (encryptedWalletObject.length === 0) {
				console.log('Creating new Wallet');
				resolve(account.wallet.create(1));
			} else {
				console.log('Trying to unlock wallet');
				resolve(account.wallet.decrypt(encryptedWalletObject, password));
			}
		} catch (err) {
			reject(err);
		}
	});
}
