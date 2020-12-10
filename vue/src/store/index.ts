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
	getKeystoreFromEncryptedSeed
} from '../utils/backupRestore';
import { getAccountsFromKeystore } from '../utils/utils';
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
	TypeKeystoreUnlocked
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
	message: string;
	email: string;
	hashedPassword: string;
	encryptedSeed: string;
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
}

/**
 * initialize the store
 */
function initialState(): RootState {
	const email = localStorage.getItem('email') || '';
	const hashedPassword = window.sessionStorage.getItem('password') || '';
	let encryptedSeed = localStorage.getItem('encryptedSeed');
	if (encryptedSeed) {
		try {
			encryptedSeed = JSON.parse(String(encryptedSeed));
		} catch {
			encryptedSeed = '';
		}
	}

	return {
		loading: false,
		status: '',
		message: '',
		email,
		hashedPassword,
		encryptedSeed,
		encryptedWallet: '',
		keystore: null,
		accounts: [],
		twoFaRequired: {
			email: false,
			authenticator: false
		},
		token: '',
		connection: null,
		transactionDetails: {},
		messageDetails: {},
		openPage: '',
		loginComplete: false
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
		seedFound(state: RootState, seedFoundData: TypeSeedFoundData) {
			state.status = 'success';
			state.encryptedSeed = seedFoundData.encryptedSeed;
			localStorage.setItem('encryptedSeed', JSON.stringify(seedFoundData.encryptedSeed));
		},
		updatePayload(state: RootState, payload) {
			state.twoFaRequired.email = payload.email;
			state.twoFaRequired.authenticator = payload.authenticator;
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
		},
		logout(state: RootState) {
			localStorage.removeItem('email');
			sessionStorage.removeItem('password');
			localStorage.removeItem('encryptedSeed');

			state.email = '';
			state.hashedPassword = '';
			state.encryptedSeed = '';
			state.keystore = null;

			state.status = '';
			state.token = '';
		},
		clearUser(state: RootState) {
			state.email = '';
			state.hashedPassword = '';
			state.encryptedSeed = '';
			state.keystore = null;

			state.status = '';
			state.token = '';
		},
		keystoreUnlocked(state: RootState, payload: TypeKeystoreUnlocked) {
			state.keystore = payload.keystore;
			state.accounts = payload.accounts;
		}
	},
	actions: {
		/**
		 * Fetch the user data from the database and attempt to unlock the wallet using the mail encrypted seed
		 */
		async fetchUser({ commit }, params: TypeFetchUser) {
			const email: string = params.email;
			const password: string = params.password;
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
											resolve();
										})
										.catch(reject);
								}
							})
							.catch(err => {
								commit('authError', "The user wasn't found: Signup first!");
								localStorage.removeItem('encryptedSeed');
								localStorage.removeItem('email');
								sessionStorage.removeItem('password');
								reject(err);
							});
					})
					.catch(reject);
			});
		},
		/**
		 * Fetch the user data from the database and attempt to unlock the wallet using the mail encrypted seed
		 */
		createWallet({ commit, dispatch }, params: TypeFetchUser) {
			return new Promise((resolve, reject) => {
				console.log('Does the User exist?');
				sha256(params.password).then(hashedPassword => {
					getPayload(params.email)
						.then(() => {
							console.log('payload found, error');
							commit('authError', 'The user found: Login instead!');
							reject('Wallet for this mail already exists.');
						})
						.catch(async () => {
							commit('authRequested');
							console.log('keystore not found in mail, creating a new one');
							/**
							 * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
							 */
							const createdKeystoreObj = await getKeystore(hashedPassword, '', 1);

							//const encryptedKeystore = await getEncryptedSeed(unlockedKeystore, params.password);

							commit('seedCreated', {
								email: params.email,
								hashedPassword: hashedPassword,
								encryptedSeed: createdKeystoreObj.encryptedSeed
							});

							saveWalletEmailPassword(params.email, createdKeystoreObj.encryptedSeed).then(() => {
								commit('clearUser');
								dispatch('fetchUser', { email: params.email, password: params.password })
									.then(() => {
										resolve();
									})
									.catch(reject);
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
					getEncryptedSeedFromMail(rootState.email, params.email2FA, params.authenticator2FA).then(encryptedSeed => {
						//const encryptedSeed = state.encryptedSeed; //normally that would need decrypting using 2fa codes
						//commit('updatePayload', { email: false, authenticator: false });
						commit('seedFound', { encryptedSeed });
						if (state.hashedPassword) {
							//console.log(password found);
							dispatch('unlockWithStoredPassword').then(() => resolve('/'));
						} else {
							//unlock page
							resolve('/unlock');
						}
					});
				} else {
					console.log('Reached here for wathever reason');
					reject();
				}
			});
		},
		/**
		 * Unlock wallet using the password stored in local state
		 */
		unlockWithStoredPassword({ dispatch, state }) {
			return new Promise((resolve, reject) => {
				if (state.hashedPassword && state.encryptedSeed) {
					dispatch('unlockWithPassword', { password: state.hashedPassword })
						.then(() => {
							resolve(true);
						})
						.catch(err => {
							console.log('unlockWithStoredPassword error', err);
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
		unlockWithPassword({ commit, state }, params: TypeUnlockWithPassword) {
			return new Promise((resolve, reject) => {
				getKeystoreFromEncryptedSeed(state.encryptedSeed, params.password)
					.then((keystore: WalletBase) => {
						const accounts = getAccountsFromKeystore(keystore);

						commit('keystoreUnlocked', { keystore, accounts });
						resolve();
					})
					.catch(err => {
						console.log('unlockWithPassword error', err);
						commit('authError', "The user wasn't found: Signup first!");
						localStorage.removeItem('encryptedSeed');
						localStorage.removeItem('email');
						sessionStorage.removeItem('password');
						reject(err);
					});
			});
		}
	},
	getters: {
		isLoggedIn: state => {
			return state.keystore !== undefined && state.keystore !== null;
		},
		twoFaRequired: state => {
			return (state.twoFaRequired.email || state.twoFaRequired.authenticator) && !state.encryptedSeed;
		},
		authStatus: state => state.status,
		walletEmail: state => state.email,
		hasEncryptedKeystore: state => state.encryptedSeed
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
