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
	download(JSON.stringify(exportedSeed), 'keystore' + '--' + now.toISOString() + '--' + account + '.json');
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

/*
 * Function uses to copy the given text to the clipboard. ses a hidden textArea to copy the text
 */
const copyToClipboard = (text: string) => {
	const textArea = document.createElement('textarea');
	// Place in top-left corner of screen regardless of scroll position.
	textArea.style.position = 'fixed';
	textArea.style.top = '0px';
	textArea.style.left = '0px';

	// Ensure it has a small width and height. Setting to 1px / 1em
	// doesn't work as this gives a negative w/h on some browsers.
	textArea.style.width = '2em';
	textArea.style.height = '2em';

	// We don't need padding, reducing the size if it does flash render.
	textArea.style.padding = '0px';

	// Clean up any borders.
	textArea.style.border = 'none';
	textArea.style.outline = 'none';
	textArea.style.boxShadow = 'none';

	// Avoid flash of white box if rendered for any reason.
	textArea.style.background = 'transparent';
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		const successful = document.execCommand('copy');
		textArea.style.display = 'none';

		if (successful) {
			document.body.removeChild(textArea);
			return 'COPY_CLIPBOARD_SUCCESS';
		} else {
			document.body.removeChild(textArea);
			return 'COPY_CLIPBOARD_FAIL';
		}
	} catch (err) {
		document.body.removeChild(textArea);
		//console.error('Fallback: Oops, unable to copy', err);
		return 'COPY_CLIPBOARD_FAIL';
	}
};

const formatEthAddress = (ethAddress: string) => {
	if (!ethAddress) return '';
	if (ethAddress.length <= 11) return ethAddress;
	return ethAddress ? ethAddress.substr(0, 5) + '...' + ethAddress.substr(ethAddress.length - 3) : '';
};

export { getAccountsFromKeystore, downloadEncryptedKeystore, sortObject, copyToClipboard, formatEthAddress };
