import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { sha256 } from '../utils/cryptoFunctions';
import {
	getEncryptedSeedFromMail,
	verifyAuthenticatorCode,
	verifyEmailCode,
	saveWalletEmailPassword,
	send2FAEmail,
	getPayload,
	getKeystoreFromEncryptedSeed,
	changePasswordEncryptedSeed,
	getBackendEndpoint,
	getNonce,
	recoverSeedSocialRecovery
} from '../utils/backupRestore';
import { getAccountsFromKeystore, sortObject } from '../utils/utils';
import { getKeystore } from '../utils/keystore';

import {
	Type2FARequired,
	TypeSeedFoundData,
	TypeSeedCreatedData,
	TypeFetchUser,
	TypeUnlock2fa,
	TypeUserFoundData,
	TypeUnlockWithPassword,
	ZeroWalletConfig,
	TypeChangePassword,
	TypeEncryptedSeed,
	TypeKeystoreUnlocked,
	TypeRequestParams,
	TypeChangeEmail,
	TypePayloadData,
	TypeRecoveryParams,
	TypeAddRecoveryParams
} from '../types/global-types';

import isIframe from '../utils/isIframe';
import { connectToParent } from 'penpal';
import { WalletBase, SignedTransaction } from 'web3-core';
import { CallSender, Connection } from 'penpal/lib/types';
import router from '@/router';

Vue.use(Vuex);

/*
 * Store type definition
 */
export interface RootState {
	loading: boolean;
	status: string;
	spinnerStatusText: string;
	message: string;
	email: string;
	hashedPassword: string;
	encryptedSeed: TypeEncryptedSeed;
	encryptedWallet: string;
	keystore: WalletBase | null;
	accounts: Array<string>;
	token: string;
	twoFaRequired: Type2FARequired;
	connection: Connection<CallSender> | null;
	transactionDetails: any;
	messageDetails: any;
	openPage: string;
	loginComplete: boolean;
	recoveryMethods: Array<any>;
}

/**
 * initialize the store
 */
function initialState(): RootState {
	const email = localStorage.getItem('email') || '';
	const hashedPassword = window.sessionStorage.getItem('password') || '';
	let encryptedSeed: TypeEncryptedSeed = {};
	if (localStorage.getItem('encryptedSeed')) {
		try {
			encryptedSeed = JSON.parse(String(localStorage.getItem('encryptedSeed')));
		} catch {
			encryptedSeed = {};
		}
	}

	return {
		loading: false,
		status: '',
		spinnerStatusText: '',
		message: '',
		email,
		hashedPassword,
		encryptedSeed,
		encryptedWallet: '',
		keystore: null,
		accounts: [],
		twoFaRequired: {
			email: false,
			authenticator: false,
			authenticatorConfirmed: false
		},
		token: '',
		connection: null,
		transactionDetails: {},
		messageDetails: {},
		openPage: '',
		loginComplete: false,
		recoveryMethods: []
	} as RootState;
}

/**
 * Store state object
 */
const store: Store<RootState> = new Vuex.Store({
	state: initialState(),

	modules: {},
	mutations: {
		authRequested(state: RootState) {
			state.status = 'loading';
		},
		loading(state: RootState, statusMessage: string) {
			if (statusMessage != '') {
				state.loading = true;
				state.spinnerStatusText = statusMessage;
			} else {
				state.spinnerStatusText = '';
				state.loading = false;
			}
		},
		delayedSpinnerMessage(state: RootState, statusMessage: string) {
			state.spinnerStatusText = statusMessage;
			setTimeout(() => {
				state.loading = false;
			}, 1500);
		},
		seedFound(state: RootState, seedFoundData: TypeSeedFoundData) {
			state.status = 'success';
			state.encryptedSeed = seedFoundData.encryptedSeed;
			localStorage.setItem('encryptedSeed', JSON.stringify(seedFoundData.encryptedSeed));
		},
		recoveryMethodsFound(state: RootState, recoveryMethodsData: Array<any>) {
			state.recoveryMethods = recoveryMethodsData;
		},
		updatePayload(state: RootState, payload: Type2FARequired) {
			state.twoFaRequired.email = payload.email;
			state.twoFaRequired.authenticator = payload.authenticator;
			state.twoFaRequired.authenticatorConfirmed = payload.authenticatorConfirmed;
		},
		userFound(state: RootState, userData: TypeUserFoundData) {
			state.email = userData.email;
			state.hashedPassword = userData.hashedPassword;

			window.localStorage.setItem('email', userData.email);
			window.sessionStorage.setItem('password', userData.hashedPassword);
		},
		seedCreated(state: RootState, seedCreatedData: TypeSeedCreatedData) {
			state.status = 'created';
			state.email = seedCreatedData.email;
			state.encryptedSeed = seedCreatedData.encryptedSeed;
			state.hashedPassword = seedCreatedData.hashedPassword;
			localStorage.setItem('encryptedSeed', JSON.stringify(seedCreatedData.encryptedSeed));
			localStorage.setItem('email', seedCreatedData.email);
			sessionStorage.setItem('password', seedCreatedData.hashedPassword);
		},
		setPage(state: RootState, page) {
			state.openPage = page;
		},
		authError(state: RootState, message) {
			(state.status = 'error'), (state.message = message);
			localStorage.removeItem('encryptedSeed');
			localStorage.removeItem('email');
			sessionStorage.removeItem('password');
		},
		logout(state: RootState) {
			localStorage.removeItem('email');
			sessionStorage.removeItem('password');
			localStorage.removeItem('encryptedSeed');

			state.email = '';
			state.hashedPassword = '';
			state.encryptedSeed = {};
			state.keystore = null;

			state.status = '';
			state.token = '';
		},
		clearUser(state: RootState) {
			state.email = '';
			state.hashedPassword = '';
			state.encryptedSeed = {};
			state.keystore = null;

			state.status = '';
			state.token = '';
		},
		keystoreUnlocked(state: RootState, payload: TypeKeystoreUnlocked) {
			state.keystore = payload.keystore;
			state.accounts = payload.accounts;
			state.hashedPassword = payload.hashedPassword;
			sessionStorage.setItem('password', payload.hashedPassword);
		}
	},
	actions: {
		showSpinner({ commit }, message: string) {
			commit('loading', message);
		},
		hideSpinner({ commit }) {
			commit('loading', '');
		},
		showSpinnerThenAutohide({ commit }, message: string) {
			commit('delayedSpinnerMessage', message);
		},
		/**
		 * Fetch the user data from the database and attempt to unlock the wallet using the mail encrypted seed
		 */
		async fetchUser({ commit }, params: TypeFetchUser) {
			const email: string = params.email;
			const password: string = params.password;
			commit('logout');
			return new Promise((resolve, reject) => {
				commit('authRequested');
				sha256(password)
					.then(hashedPassword => {
						getPayload(email)
							.then(payload => {
								commit('userFound', { email, hashedPassword });
								commit('updatePayload', payload);
								if (payload.email) {
									send2FAEmail(email)
										.then(resolve)
										.catch(reject);
								} else {
									getEncryptedSeedFromMail(email, '', '')
										.then(encryptedSeed => {
											commit('seedFound', { encryptedSeed });
											resolve(true);
										})
										.catch(reject);
								}
							})
							.catch(err => {
								commit('authError', "The user wasn't found: Signup first!");
								reject(err);
							});
					})
					.catch(reject);
			});
		},
		fetchWalletFromRecovery({ state, commit }, params: TypeRecoveryParams) {
			return new Promise((resolve, reject) => {
				recoverSeedSocialRecovery(params.accessToken, state.email, params.recoveryTypeId)
					.then(encryptedSeed => {
						commit('seedFound', { encryptedSeed });
						getKeystoreFromEncryptedSeed(state.encryptedSeed, params.password)
							.then((keystore: WalletBase) => {
								const accounts = getAccountsFromKeystore(keystore);
								//not setting any password here, this is simply for the password change mechanism
								commit('keystoreUnlocked', { keystore, accounts, hashedPassword: '' });
								resolve(true);
							})
							.catch(() => {
								commit('authError', 'Cannot unlock the Keystore, wrong ID');
								reject(false);
							});
					})
					.catch(reject);
			});
		},
		addRecoveryMethod({ state, dispatch }, params: TypeAddRecoveryParams) {
			return new Promise(async (resolve, reject) => {
				const encryptedSeed = await changePasswordEncryptedSeed(state.encryptedSeed, state.hashedPassword, params.password);
				dispatch('sendSignedRequest', {
					body: {
						encryptedSeed,
						recoveryTypeId: params.recoveryTypeId,
						key: params.key
					},
					method: 'POST',
					url: getBackendEndpoint() + '/v1/auth/addRecoveryMethod'
				})
					.then(() => {
						dispatch('updateRecoveryMethods').then(() => {
							resolve(true);
						});
					})
					.catch(reject);
			});
		},
		hasRecovery({ state }, id: number) {
			return (
				state.recoveryMethods
					.map(obj => {
						return obj.id;
					})
					.indexOf(id) !== -1
			);
		},
		/**
		 * Fetch the user data from the database and attempt to unlock the wallet using the mail encrypted seed
		 */
		createWallet({ commit, dispatch }, params: TypeFetchUser) {
			return new Promise((resolve, reject) => {
				sha256(params.password).then(hashedPassword => {
					getPayload(params.email)
						.then(() => {
							commit('delayedSpinnerMessage', 'The user already exists.');
							reject('Wallet for this mail already exists.');
						})
						.catch(async () => {
							commit('authRequested');
							commit('loading', 'Creating new Keystore...');
							/**
							 * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
							 */
							const createdKeystoreObj = await getKeystore(hashedPassword, {}, 1);

							const accounts = getAccountsFromKeystore(createdKeystoreObj.keystore);

							saveWalletEmailPassword(params.email, createdKeystoreObj.encryptedSeed, accounts[0]).then(() => {
								commit('clearUser');
								dispatch('fetchUser', { email: params.email, password: params.password })
									.then(resolve)
									.catch(e => {
										commit('delayedSpinnerMessage', 'Unknown Error occurred during saving.');
										reject(e);
									});
							});
						});
				});
			});
		},
		logoutWallet({ commit }) {
			commit('logout');
		},
		clearPage({ commit }) {
			commit('setPage', '');
		},
		/**
		 * Unlock wallet using 2fa codes
		 */
		unlock2FA({ commit, dispatch, state, rootState }, params: TypeUnlock2fa) {
			return new Promise(async (resolve, reject) => {
				let emailCorrect = false;
				let authenticatorCorrect = false;
				if (state.twoFaRequired.email == true) {
					if (await verifyEmailCode(rootState.email, params.email2FA)) {
						emailCorrect = true;
					} else {
						commit('authError', '2FA Email code not correct');
						reject('The 2FA Mail Code seems to be incorrect. Try again.');
					}
				} else {
					emailCorrect = true;
				}

				if (state.twoFaRequired.authenticator == true) {
					if (!(await verifyAuthenticatorCode(rootState.email, params.authenticator2FA))) {
						commit('authError', '2FA Authenticator code not correct');
						reject('2FA Authenticator not correct');
					} else {
						authenticatorCorrect = true;
					}
				} else {
					authenticatorCorrect = true;
				}

				if (emailCorrect && authenticatorCorrect) {
					getEncryptedSeedFromMail(rootState.email, params.email2FA, params.authenticator2FA)
						.then(encryptedSeed => {
							//const encryptedSeed = state.encryptedSeed; //normally that would need decrypting using 2fa codes
							//commit('updatePayload', { email: false, authenticator: false });
							commit('seedFound', { encryptedSeed });
							if (state.hashedPassword) {
								//console.log(password found);
								dispatch('unlockWithStoredPassword')
									.then(() => resolve('/'))
									.catch(() => {
										const email = rootState.email;
										commit('logout');
										rootState.email = email;
										reject('invalid password');
									});
							} else {
								//unlock page
								resolve('/unlock');
							}
						})
						.catch(err => {
							if (err.toString() === 'seed not found') {
								commit('authError', '2FA Authentication code not correct');
								reject('2FA Authentication not correct');
							} else {
								// console.log(err);
								reject('error');
							}
						});
				} else {
					// console.log('Reached here for wathever reason');
					reject();
				}
			});
		},
		/**
		 * Unlock wallet using the password stored in local state
		 */
		unlockWithStoredPassword({ dispatch, state }) {
			return new Promise((resolve, reject) => {
				if (state.hashedPassword && state.encryptedSeed.ciphertext !== undefined) {
					dispatch('unlockWithPassword', { password: state.hashedPassword })
						.then(() => {
							resolve(true);
						})
						.catch(() => {
							// console.log('unlockWithStoredPassword error', err);
							reject(false);
						});
				} else {
					reject(false);
				}
			});
		},
		/**
		 * Unlock wallet using the password entered on the logon form
		 */
		unlockWithPassword({ commit, state, dispatch }, params: TypeUnlockWithPassword) {
			return new Promise((resolve, reject) => {
				getKeystoreFromEncryptedSeed(state.encryptedSeed, params.password)
					.then((keystore: WalletBase) => {
						const accounts = getAccountsFromKeystore(keystore);

						commit('keystoreUnlocked', { keystore, accounts, hashedPassword: params.password });
						getPayload(state.email).then(payload => {
							commit('updatePayload', payload);
							dispatch('updateRecoveryMethods').then(() => {
								resolve(true);
							});
						});
					})
					.catch(err => {
						// console.log('unlockWithPassword error', err);
						commit('authError', "The user wasn't found: Signup first!");
						reject(err);
					});
			});
		},
		updateRecoveryMethods({ commit, dispatch }) {
			return new Promise((resolve, reject) => {
				dispatch('sendSignedRequest', {
					body: {},
					method: 'POST',
					url: getBackendEndpoint() + '/v1/auth/getRecoveryMethods'
				})
					.then(methods => {
						commit('recoveryMethodsFound', methods);
						resolve(true);
					})
					.catch(reject);
			});
		},
		changePassword({ commit, state, dispatch }, params: TypeChangePassword) {
			return new Promise(async (resolve, reject) => {
				try {
					if (state.keystore !== undefined && state.keystore !== null) {
						const newEncryptedSeed = await changePasswordEncryptedSeed(state.encryptedSeed, params.oldPassword, params.newPassword);
						const key = await sha256(state.email.toLowerCase());
						const body = {
							oldKey: key,
							newKey: key,
							oldEmail: state.email,
							newEmail: state.email,
							encryptedSeed: newEncryptedSeed
						};
						await dispatch('sendSignedRequest', {
							body,
							method: 'POST',
							url: getBackendEndpoint() + '/v1/auth/updatePassword'
						});
						commit('seedFound', { encryptedSeed: newEncryptedSeed });
						commit('userFound', { email: state.email, hashedPassword: params.newPassword });
						resolve(true);
					}
				} catch (e) {
					console.error(e);
					reject(e);
				}
			});
		},
		changeEmail({ commit, state, dispatch }, params: TypeChangeEmail) {
			return new Promise(async (resolve, reject) => {
				try {
					if (state.keystore !== undefined && state.keystore !== null) {
						if (params.password == state.hashedPassword) {
							if (params.twoFa != undefined && params.twoFa > 0) {
								//twoFA was sent
								if (await verifyEmailCode(state.email, params.twoFa.toString())) {
									const body = {
										oldEmail: state.email,
										newEmail: params.newEmail,
										email2faVerification: params.twoFa
									};
									dispatch('sendSignedRequest', {
										body,
										method: 'POST',
										url: getBackendEndpoint() + '/v1/auth/updateEmail'
									})
										.then(() => {
											commit('userFound', { email: params.newEmail, hashedPassword: state.hashedPassword });
											resolve(true);
										})
										.catch(reject);
								} else {
									reject('Two FA Code is incorrect!');
								}
							} else {
								//twoFA wasn't sent yet, send it with the first request to the new email address
								const body = {
									oldEmail: state.email,
									newEmail: params.newEmail
								};
								dispatch('sendSignedRequest', {
									body,
									method: 'POST',
									url: getBackendEndpoint() + '/v1/auth/updateEmail'
								})
									.then(resolve)
									.catch(reject);
							}
						} else {
							reject('Password is not correct!');
						}
					}
				} catch (e) {
					console.error(e);
					reject(e);
				}
			});
		},
		generateQRCode({ dispatch }) {
			return new Promise((resolve, reject) => {
				dispatch('sendSignedRequest', {
					body: {},
					method: 'POST',
					url: getBackendEndpoint() + '/v1/auth/generateAuthenticatorQR'
				})
					.then(resolve)
					.catch(reject);
			});
		},
		change2FAMethods({ dispatch, commit }, params: TypePayloadData) {
			return new Promise((resolve, reject) => {
				dispatch('sendSignedRequest', {
					body: params,
					method: 'POST',
					url: getBackendEndpoint() + '/v1/auth/change2FAMethods'
				})
					.then(response => {
						commit('updatePayload', params);
						resolve(response);
					})
					.catch(reject);
			});
		},
		sendSignedRequest({ state }, params: TypeRequestParams) {
			return new Promise(async (resolve, reject) => {
				const body = params.body;
				const key = await sha256(state.email.toLowerCase());
				body.nonce = (await getNonce(key)).nonce;
				const signMessage = JSON.stringify(sortObject(body));
				if (state.keystore != null) {
					const signature = await state.keystore[0].sign(signMessage);
					const options: RequestInit = {
						method: params.method,
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json',
							Signature: JSON.stringify(signature),
							key: key
						},
						body: JSON.stringify(body),
						mode: 'cors',
						cache: 'default'
					};

					try {
						const response = await fetch(params.url, options);
						if (!response.ok) {
							reject((await response.json()).error);
						}
						resolve(await response.json());
					} catch (e) {
						reject(e);
					}
				} else {
					reject('Keystore not found, aborting');
				}
			});
		}
	},
	getters: {
		isLoggedIn: state => {
			return state.keystore !== undefined && state.keystore !== null;
		},
		twoFaRequired: state => {
			return (state.twoFaRequired.email || state.twoFaRequired.authenticator) && state.encryptedSeed.ciphertext === undefined;
		},
		authStatus: state => state.status,
		walletEmail: state => state.email,
		hasEncryptedKeystore: state => state.encryptedSeed.ciphertext !== undefined
	}
});

/*
initialize the iframe parent connection
*/
if (isIframe()) {
	store.state.connection = connectToParent({
		//parentOrigin: 'http://localhost:8081',
		// Methods child is exposing to parent
		methods: {
			async getAccounts() {
				if (store.state.keystore != null) {
					return store.state.accounts;
				} else {
					return [];
				}
			},
			async signTransaction(txObj: any) {
				if (txObj.nonce == undefined) {
					console.error('No nonce defined, aborting tx signing');
				}

				const signedTx = await new Promise((resolve, reject) => {
					//see if we are logged in?!
					try {
						if (store.state.keystore !== null) {
							store.state.keystore[0]
								.signTransaction(txObj)
								.then((tran: SignedTransaction) => {
									resolve(tran.rawTransaction);
								})
								.catch(reject);
						}
					} catch (e) {
						reject(e);
					}
				});
				return signedTx;
			},
			async signMessage(txObj: any, config: ZeroWalletConfig) {
				const signedTx = await new Promise((resolve, reject) => {
					//see if we are logged in?!
					try {
						if (store.state.keystore !== null) {
							if (config?.confirm_message) {
								router.push('/signmsg');
							} else {
								const signedData = store.state.keystore[0].sign(txObj.data); //

								resolve(signedData.signature);
							}
						}
					} catch (e) {
						reject(e);
					}
				});
				return signedTx;
			},
			showPage(pageName: string) {
				if (pageName === 'wallet' || pageName === 'settings' || pageName === 'register') {
					store.state.openPage = pageName;
					return true;
				}

				return false;
			},
			isLoggedIn() {
				//return 'ok'
				if (store.state.keystore)
					return {
						isLoggedIn: true,
						walletEmail: store.state.email,
						accounts: store.state.accounts
					};
				else return { isLoggedIn: false };
			},
			logout() {
				store.commit('logout');
			}
		}
	});
}

export default store;
