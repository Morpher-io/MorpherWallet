const { getKeystore } = require('./keystore');
const { cryptoEncrypt, cryptoDecrypt, sha256 } = require('./cryptoFunctions');

import { TypeEncryptedSeed, TypePayloadData, TypeCreatedKeystore } from '../types/global-types';
import { WalletBase } from 'web3-core';

const getBackendEndpoint = () => {
	return process.env.VUE_APP_BACKEND_ENDPOINT || 'http://localhost:8080';
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
			.catch((error: Error) => {
				reject(error);
			});
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

			fetch(getBackendEndpoint() + '/v1/getEncryptedSeed', options)
				.then(response => {
					response
						.json()
						.then(responseBody => {
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
						})
						.catch(() => {
							reject('seed not found');
						});
				})
				.catch(err => {
					reject(err);
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

	try {
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
	} catch (e) {
		return;
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

const recoverSeedSocialRecovery = async (accessToken: string, signupEmail: string, recoveryTypeId: number) =>
	new Promise((resolve, reject) => {
		const options: RequestInit = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				accessToken,
				signupEmail,
				recoveryTypeId
			}),
			mode: 'cors',
			cache: 'default'
		};
		fetch(getBackendEndpoint() + '/v1/recoverSeedSocialRecovery', options)
			.then(r => {
				r.json().then(async responseBody => {
					if (responseBody.success) {
						//initiate recovery
						const encryptedSeed = JSON.parse(responseBody.encryptedSeed);
						resolve(encryptedSeed);
					} else {
						reject("Your account wasn't found with Facebook recovery, create one with username and password first");
					}
				});
			})
			.catch(err => {
				reject(err);
			});
	});

const getPayload = (email: string) =>
	new Promise<TypePayloadData>(async (resolve, reject) => {
		try {
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
		} catch (err) {
			reject(err);
		}
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

	if (result.ok) {
		const response = await result.json();

		return response;
	}

	return result;
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
		const result = await fetch(getBackendEndpoint() + '/v1/verifyAuthenticatorCode', options);
		//it will throw an exception if it fails
		const response = await result.json();

		return response;
	} catch (e) {
		return {
			success: false,
			error: e
		};
	}
};

const verifyEmailCode = async (email: string, code: string) => {
	if (email == '' || code == '') {
		return {
			success: false,
			error: 'CANNOT_VERIFY_EMAIL_CODE'
		};
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
		return body;
	} catch (e) {
		return {
			success: false,
			error: e
		};
	}
};

const verifyEmailConfirmationCode = async (email: string, code: string) => {
	if (email == '' || code == '') {
		return {
			success: false,
			error: 'CANNOT_VERIFY_EMAIL_CODE'
		};
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
		const result = await fetch(getBackendEndpoint() + '/v1/verifyEmailConfirmationCode', options);
		const body = await result.json();
		return body;
	} catch (e) {
		return {
			success: false,
			error: e
		};
	}
};

export {
	validateInput,
	saveWalletEmailPassword,
	getKeystoreFromEncryptedSeed,
	changePasswordEncryptedSeed,
	recoverSeedSocialRecovery,
	getEncryptedSeedFromMail,
	getPayload,
	getNonce,
	send2FAEmail,
	verifyAuthenticatorCode,
	verifyEmailCode,
	getBackendEndpoint,
	verifyEmailConfirmationCode
};
