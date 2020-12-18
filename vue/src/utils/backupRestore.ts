const { getKeystore } = require('./keystore');
const config = require('./../config.json');
const { cryptoEncrypt, cryptoDecrypt, sha256 } = require('./cryptoFunctions');

import { TypeEncryptedSeed, TypePayloadData, TypeCreatedKeystore } from '../types/global-types';
import { WalletBase } from 'web3-core';

const getBackendEndpoint = () => {
	return process.env.VUE_APP_BACKEND_ENDPOINT || config.BACKEND_ENDPOINT;
};

const changePasswordEncryptedSeed = async (encryptedSeed: TypeEncryptedSeed, oldPassword: string, newPassword: string) => {
	const seed = await cryptoDecrypt(oldPassword, encryptedSeed.ciphertext, encryptedSeed.iv, encryptedSeed.salt);
	return await cryptoEncrypt(newPassword, seed);
};

const getKeystoreFromEncryptedSeed = async (encryptedWalletObject: TypeEncryptedSeed, password: string): Promise<WalletBase> =>
	new Promise((resolve, reject) => {
		getKeystore(password, encryptedWalletObject)
			.then((returnObj: TypeCreatedKeystore) => {
				resolve(returnObj.keystore);
			})
			.catch(reject);
	});

const getEncryptedSeedFromMail = async (email: string, email2fa: string, authenticator2fa: string) =>
	new Promise<TypeEncryptedSeed>((resolve, reject) => {
		sha256(email.toLowerCase()).then((key: string) => {
			const options: RequestInit = {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ key, email2fa, authenticator2fa }),
				mode: 'cors',
				cache: 'default'
			};

			fetch(getBackendEndpoint() + '/v1/getEncryptedSeed', options).then(response => {
				response.json().then(responseBody => {
					/**
					 * Login /Create Wallet is in one function
					 * @todo: Separate Login and Create Wallet into separate functions so that upon failed "login" a recovery can be suggested
					 */
					if (responseBody.success) {
						/**
						 * Wallet was found on server, attempting to decrypt with the password
						 */
						resolve(JSON.parse(responseBody.encryptedSeed));
					}
					reject('seed not found');
				});
			});
		});
	});

const validateInput = async (fieldName: string, inputFieldValue: string) => {
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			fieldName,
			inputFieldValue
		}),
		mode: 'cors',
		cache: 'default'
	};
	const result = await fetch(getBackendEndpoint() + '/v1/validateInput', options);

	const response = await result.json();

	if (fieldName === 'email') {
		if (response.success === false) return 'Please input a valid email.';
	}

	if (fieldName === 'password') {
		if (response.success === false) {
			let badPasswordMessage = 'Password must have';

			for (const reason of response.validationFails) {
				if (reason === 'min') badPasswordMessage += ' at least 8 characters,';
				if (reason === 'uppercase') badPasswordMessage += ' at least 1 uppercase character,';
				if (reason === 'lowercase') badPasswordMessage += ' at least 1 lowercase character,';
				if (reason === 'digits') badPasswordMessage += ' at least 1 numerical digit,';
			}

			badPasswordMessage = badPasswordMessage.slice(0, -1) + '.';
			return badPasswordMessage;
		}
	}
};

const saveWalletEmailPassword = async (userEmail: string, encryptedSeed: TypeEncryptedSeed, ethAddress: string) => {
	const key = await sha256(userEmail.toLowerCase());
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			key,
			encryptedSeed,
			email: userEmail.toLowerCase(),
			ethAddress
		}),
		mode: 'cors',
		cache: 'default'
	};
	const result = await fetch(getBackendEndpoint() + '/v1/saveEmailPassword', options);

	const response = await result.json();
	return response;
};

const backupGoogleSeed = async (userEmail: string, userid: string, encryptedSeed: string) =>
	new Promise((resolve, reject) => {
		sha256(config.GOOGLE_APP_ID + userid).then((key: any) => {
			const options: RequestInit = {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					encryptedSeed,
					key,
					email: userEmail.toLowerCase(),
					recoveryTypeId: 3
				}),
				mode: 'cors',
				cache: 'default'
			};
			try {
				fetch(getBackendEndpoint() + '/v1/saveEmailPassword', options).then(r => {
					r.json().then(response => {
						resolve(response);
					});
				});
			} catch (e) {
				reject(e);
			}
		});
	});

const backupFacebookSeed = async (userEmail: string, userid: string, encryptedSeed: string) =>
	new Promise((resolve, reject) => {
		sha256(config.FACEBOOK_APP_ID + userid).then((key: any) => {
			const options: RequestInit = {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					encryptedSeed,
					key: key,
					email: userEmail.toLowerCase(),
					recoveryTypeId: 2
				}),
				mode: 'cors',
				cache: 'default'
			};
			try {
				fetch(getBackendEndpoint() + '/v1/saveEmailPassword', options).then(r => {
					r.json().then(response => {
						resolve(response);
					});
				});
			} catch (e) {
				reject(e);
			}
		});
	});

const recoverFacebookSeed = async (accessToken: string, signupEmail: string) =>
	new Promise((resolve, reject) => {
		const options: RequestInit = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				accessToken: accessToken,
				signupEmail: signupEmail.toLowerCase()
			}),
			mode: 'cors',
			cache: 'default'
		};
		fetch(getBackendEndpoint() + '/v1/getFacebookEncryptedSeed', options).then(r => {
			r.json().then(async responseBody => {
				if (responseBody.success) {
					//initiate recovery
					const encryptedSeed = JSON.parse(responseBody.encryptedSeed);
					resolve(encryptedSeed);
				} else {
					reject("Your account wasn't found with Facebook recovery, create one with username and password first");
				}
			});
		});
	});

const recoverGoogleSeed = async (accessToken: string, signupEmail: string) =>
	new Promise((resolve, reject) => {
		const options: RequestInit = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				accessToken,
				signupEmail
			}),
			mode: 'cors',
			cache: 'default'
		};
		fetch(getBackendEndpoint() + '/v1/getGoogleEncryptedSeed', options).then(r => {
			r.json().then(async responseBody => {
				if (responseBody.success) {
					//initiate recovery
					const encryptedSeed = JSON.parse(responseBody.encryptedSeed);
					resolve(encryptedSeed);
				} else {
					reject("Your account wasn't found with Google recovery, create one with username and password first");
				}
			});
		});
	});

const recoverVKSeed = async (accessToken: string, signupEmail: string) =>
	new Promise((resolve, reject) => {
		const options: RequestInit = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				accessToken: accessToken,
				signupEmail: signupEmail.toLowerCase()
			}),
			mode: 'cors',
			cache: 'default'
		};
		fetch(getBackendEndpoint() + '/v1/getVKontakteEncryptedSeed', options).then(r => {
			r.json().then(async responseBody => {
				if (responseBody.success) {
					//initiate recovery
					const encryptedSeed = JSON.parse(responseBody.encryptedSeed);
					resolve(encryptedSeed);
				} else {
					reject("Your account wasn't found with VK recovery, create one with username and password first");
				}
			});
		});
	});

const backupVKSeed = async (userEmail: string, userid: string, encryptedSeed: string) =>
	new Promise((resolve, reject) => {
		sha256(config.VK_APP_ID + userid).then((key: any) => {
			const options: RequestInit = {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					encryptedSeed,
					key,
					email: userEmail.toLowerCase(),
					recoveryTypeId: 5
				}),
				mode: 'cors',
				cache: 'default'
			};
			try {
				fetch(getBackendEndpoint() + '/v1/saveEmailPassword', options).then(r => {
					r.json().then(response => {
						resolve(response);
					});
				});
			} catch (e) {
				reject(e);
			}
		});
	});

const changeEmail = async (oldEmail: string, newEmail: string, encryptedSeed: string) => {
	newEmail = newEmail.toLowerCase();
	oldEmail = oldEmail.toLowerCase();
	const key = await sha256(newEmail);
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			key,
			encryptedSeed,
			oldEmail,
			newEmail
		}),
		mode: 'cors',
		cache: 'default'
	};
	const result = await fetch(getBackendEndpoint() + '/v1/changeEmail', options);

	const response = await result.json();
	return response;
};

const getPayload = (email: string) =>
	new Promise<TypePayloadData>(async (resolve, reject) => {
		const key = await sha256(email.toLowerCase());
		const options: RequestInit = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				key
			}),
			mode: 'cors',
			cache: 'default'
		};
		const result = await fetch(getBackendEndpoint() + '/v1/getPayload', options);
		const response: TypePayloadData = await result.json();
		if (result.status != 200) {
			reject(response);
		}

		resolve(response);
	});

const getNonce = async (key: string) => {
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			key
		}),
		mode: 'cors',
		cache: 'default'
	};
	const result = await fetch(getBackendEndpoint() + '/v1/getNonce', options);

	const response = await result.json();
	return response;
};

const change2FAMethods = async (email: string, signedMessage: string, toggleEmail: string, toggleAuthenticator: string) => {
	const key = await sha256(email.toLowerCase());
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			key,
			signedMessage,
			toggleEmail,
			toggleAuthenticator
		}),
		mode: 'cors',
		cache: 'default'
	};
	const result = await fetch(getBackendEndpoint() + '/v1/change2FAMethods', options);

	const response = await result.json();
	return response;
};

const send2FAEmail = async (email: string) => {
	const key = await sha256(email.toLowerCase());
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			key
		}),
		mode: 'cors',
		cache: 'default'
	};
	const result = await fetch(getBackendEndpoint() + '/v1/send2FAEmail', options);

	const response = await result.json();
	return response;
};

const verifyAuthenticatorCode = async (email: string, code: string) => {
	const key = await sha256(email.toLowerCase());
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			key,
			code
		}),
		mode: 'cors',
		cache: 'default'
	};
	try {
		const response = await fetch(getBackendEndpoint() + '/v1/verifyAuthenticatorCode', options);
		//it will throw an exception if it fails
		if (!response.ok) {
			return false;
		}
		return true;
	} catch (e) {
		return false;
	}
};

const verifyEmailCode = async (email: string, code: string) => {
	if (email == '' || code == '') {
		return false;
	}
	const key = await sha256(email.toLowerCase());
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			key,
			code
		}),
		mode: 'cors',
		cache: 'default'
	};
	try {
		const result = await fetch(getBackendEndpoint() + '/v1/verifyEmailCode', options);
		const body = await result.json();
		return body.success;
	} catch (e) {
		return false;
	}
};

export {
	validateInput,
	saveWalletEmailPassword,
	getKeystoreFromEncryptedSeed,
	changePasswordEncryptedSeed,
	backupFacebookSeed,
	recoverFacebookSeed,
	getEncryptedSeedFromMail,
	backupGoogleSeed,
	recoverGoogleSeed,
	backupVKSeed,
	recoverVKSeed,
	changeEmail,
	getPayload,
	getNonce,
	change2FAMethods,
	send2FAEmail,
	verifyAuthenticatorCode,
	verifyEmailCode,
	getBackendEndpoint
};
