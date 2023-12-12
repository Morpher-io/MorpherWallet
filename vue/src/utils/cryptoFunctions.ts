import { TypeEncryptedSeed } from '../types/global-types';

const cryptoEncrypt = (password: string, seedPhrase: string): Promise<TypeEncryptedSeed> =>
	new Promise(async (resolve, reject) => {
		try {
			const start = Date.now();
			const enc = new TextEncoder();
			const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

			const salt = await crypto.getRandomValues(new Uint8Array(16));
			const iv = await crypto.getRandomValues(new Uint8Array(12));

			const key = await crypto.subtle.deriveKey(
				{
					name: 'PBKDF2',
					salt: salt,
					iterations: 100000,
					hash: 'SHA-256'
				},
				keyMaterial,
				{ name: 'AES-GCM', length: 256 },
				true,
				['encrypt', 'decrypt']
			);

			const encoded = enc.encode(seedPhrase);

			const ciphertext = await crypto.subtle.encrypt(
				{
					name: 'AES-GCM',
					iv: iv
				},
				key,
				encoded
			);

			const ctArray = Array.from(new Uint8Array(ciphertext)); // ciphertext as byte array
			const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join(''); // ciphertext as string
			const ctBase64 = btoa(ctStr); // encode ciphertext as base64

			const ivArray = Array.from(new Uint8Array(iv));
			const ivStr = ivArray.map((byte) => String.fromCharCode(byte)).join('');
			const ivBase64 = btoa(ivStr);

			const saltArray = Array.from(new Uint8Array(salt));
			const saltStr = saltArray.map((byte) => String.fromCharCode(byte)).join('');
			const saltBase64 = btoa(saltStr);

			if (process.env.NODE_ENV !== 'production')
				console.log('encrypt done', Date.now() - start)

			//const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join(''); // iv as hex string
			resolve({ ciphertext: ctBase64, iv: ivBase64, salt: saltBase64 });
			//send to server
		} catch (e) {
			reject(e);
		}
	});

const cryptoDecrypt = (password: string, ciphertext: string, iv: string, salt: string) =>
	new Promise<string>(async (resolve, reject) => {
		const start = Date.now()
		//https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
		const ctStr = atob(ciphertext); // decode base64 ciphertext
		const ctUint8 = new Uint8Array((ctStr.match(/[\s\S]/g) || []).map((ch) => ch.charCodeAt(0))); // ciphertext as Uint8Array
		const ivStr = atob(iv);
		const ivUint8 = new Uint8Array((ivStr.match(/[\s\S]/g) || []).map((ch) => ch.charCodeAt(0)));
		const saltStr = atob(salt);
		const saltUint8 = new Uint8Array((saltStr.match(/[\s\S]/g) || []).map((ch) => ch.charCodeAt(0)));
		const enc = new TextEncoder();
		const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
		//let salt = crypto.getRandomValues(new Uint8Array(16));
		//let iv = crypto.getRandomValues(new Uint8Array(12));

		const key = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: saltUint8,
				iterations: 100000,
				hash: 'SHA-256'
			},
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			true,
			['encrypt', 'decrypt']
		);

		try {
			const decrypted = await crypto.subtle.decrypt(
				{
					name: 'AES-GCM',
					iv: ivUint8
				},
				key,
				ctUint8
			);

			const dec = new TextDecoder();
			const return_data = dec.decode(decrypted)
			if (process.env.NODE_ENV !== 'production')
				console.log('decrypt done', Date.now() - start)
			resolve(return_data);
		} catch (e) {
			reject(e);
		}
	});

const sha256 = async (inputString: string) => {
	// encode as UTF-8
	const msgBuffer = new TextEncoder().encode(inputString);

	// hash the message
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

	// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer));

	// convert bytes to hex string
	const hashHex = hashArray.map((b) => ('00' + b.toString(16)).slice(-2)).join('');
	return hashHex;
};

export { cryptoDecrypt, cryptoEncrypt, sha256 };
