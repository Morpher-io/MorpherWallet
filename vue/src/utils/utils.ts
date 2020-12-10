import download from 'downloadjs';
import { WalletBase } from 'web3-core';

function getAccountsFromKeystore(keystore: WalletBase) {
	const accounts: Array<string> = [];
	for (let i = 0; i < keystore.length; i++) {
		accounts.push(keystore[i].address);
	}
	return accounts;
}

function downloadEncryptedKeystore(keystore: WalletBase) {
	const now = new Date();
	download(JSON.stringify(keystore), now.toISOString() + '--' + keystore[0].address);
}

export { getAccountsFromKeystore, downloadEncryptedKeystore };
