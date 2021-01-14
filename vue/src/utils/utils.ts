import download from 'downloadjs';
import { WalletBase, EncryptedKeystoreV3Json } from 'web3-core';

function getAccountsFromKeystore(keystore: WalletBase) {
	const accounts: Array<string> = [];
	for (let i = 0; i < keystore.length; i++) {
		accounts.push(keystore[i].address);
	}
	return accounts;
}

function downloadEncryptedKeystore(exportedSeed: EncryptedKeystoreV3Json, account: string) {
	const now = new Date();
	download(JSON.stringify(exportedSeed), now.toISOString() + '--' + account);
}

function sortObject(object: any) {
	if (typeof object != 'object' || object instanceof Array)
		// Not to sort the array
		return object;
	const keys = Object.keys(object);
	keys.sort();
	const newObject: any = {};
	for (let i = 0; i < keys.length; i++) {
		newObject[keys[i]] = sortObject(object[keys[i]]);
	}
	return newObject;
}

export { getAccountsFromKeystore, downloadEncryptedKeystore, sortObject };
