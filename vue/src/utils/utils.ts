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

function sortObject(object: any){
	if (typeof object != "object" || object instanceof Array) // Not to sort the array
		return object;
	const keys = Object.keys(object);
	keys.sort();
	const newObject = {};
	for (let i = 0; i < keys.length; i++){
		// @ts-ignore
		newObject[keys[i]] = sort(object[keys[i]])
	}
	return newObject;
}

export { getAccountsFromKeystore, downloadEncryptedKeystore, sortObject };
