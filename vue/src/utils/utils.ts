import download from 'downloadjs';
function getAccountsFromKeystore(keystore: any) {
	const accounts = [];
	for (let i = 0; i < keystore.length; i++) {
		accounts.push(keystore[i].address);
	}
	return accounts;
}

function downloadEncryptedKeystore(keystore: any) {
	const now = new Date();
	download(JSON.stringify(keystore), now.toISOString() + '--' + keystore.address);
}

export { getAccountsFromKeystore, downloadEncryptedKeystore };
