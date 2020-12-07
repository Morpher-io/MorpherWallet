import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { sha256 } from '../utils/cryptoFunctions';
import {
	getEncryptedSeedFromMail,
	verifyAuthenticatorCode,
	verifyEmailCode,
	getEncryptedSeed,
	saveWalletEmailPassword,
	send2FAEmail,
	getPayload,
	getKeystoreFromEncryptedSeed
} from '../utils/backupRestore';
import { getAccountsFromKeystore } from '../utils/utils';
import { getKeystore } from '../utils/keystore';
import { Type2FARequired, TypeSeedFoundData, TypeSeedCreatedData, TypeFetchUser, TypeUnlock2fa, TypeUserFoundData } from '../types/global-types';

import isIframe from '../utils/isIframe';
import { connectToParent } from 'penpal';
import { WalletBase, SignedTransaction } from 'web3-core';
import { CallSender, Connection } from 'penpal/lib/types';

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
}

/**
 * initialize the store
 */
function initialState(): RootState {

	return {
		loading: false,
		status: '',
		message: '',
		email: localStorage.getItem('email') || '',
		hashedPassword: window.sessionStorage.getItem('password') || '',
		encryptedSeed: localStorage.getItem('encryptedSeed') !== null ? JSON.parse(String(localStorage.getItem('encryptedSeed'))) : '',
		encryptedWallet: '',
		keystore: null,
		accounts: [],
		twoFaRequired: {
			email: false,
			authenticator: false
		},
		token: '',
		connection: null
	};
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
			state.email = seedFoundData.email;
			state.encryptedSeed = seedFoundData.encryptedSeed;
			state.hashedPassword = seedFoundData.hashedPassword;
		},
		updatePayload(state: RootState, payload) {
			state.twoFaRequired.email = payload.email;
			state.twoFaRequired.authenticator = payload.authenticator;
		},
		userFound(state: RootState, userData: TypeUserFoundData) {
			state.email = userData.email;
			state.hashedPassword = userData.hashedPassword;
		},
		seedCreated(state: RootState, seedCreatedData: TypeSeedCreatedData) {
			state.status = 'created';
			state.email = seedCreatedData.email;
			state.encryptedSeed = seedCreatedData.encryptedSeed;
			state.keystore = seedCreatedData.unencryptedKeystore;
			state.hashedPassword = seedCreatedData.hashedPassword;
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
		keystoreUnlocked(state: RootState, payload) {
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
				sha256(password).then(hashedPassword => {
					
					sessionStorage.setItem('password', hashedPassword);
					getPayload(email).then(payload => {
						window.localStorage.setItem('email', email);
						commit('userFound', {email, hashedPassword});
						commit('updatePayload', payload);
						if (payload.email) {
							send2FAEmail(email).then(resolve).catch(reject);
						} else {
							resolve();
						}
					}).catch(err => {
						commit('auth_error', "The user wasn't found: Signup first!");
						localStorage.removeItem('encryptedSeed');
						localStorage.removeItem('email');
						sessionStorage.removeItem('password');
						reject(err);
					});
				}).catch(reject);
					
			});
		},
		/**
		 * Fetch the user data from the database and attempt to unlock the wallet using the mail encrypted seed
		 */
		createWallet({ commit }, params: TypeFetchUser) {
			return new Promise((resolve, reject) => {
				console.log('Does the User exist?');
				getPayload(params.email)
					.then(paypload => {
						commit('authError', 'The user found: Login instead!');
						reject('Wallet for this mail already exists.');
					})
					.catch(async e => {
						commit('authRequested');
						console.log('keystore not found in mail, creating a new one');
						/**
						 * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
						 */
						const unlockedKeystore = await getKeystore(params.password, []);

						const encryptedKeystore = await getEncryptedSeed(unlockedKeystore, params.password);
						localStorage.setItem('encryptedSeed', JSON.stringify(encryptedKeystore));
						localStorage.setItem('email', params.email);
						sessionStorage.setItem('password', params.password);
						commit('seedCreated', { email: params.email, hashedPassword: params.password, unencryptedKeystore: unlockedKeystore, encryptedSeed: encryptedKeystore });

						saveWalletEmailPassword(params.email, encryptedKeystore).then(res => {
							getPayload(params.email)
								.then(payload => {
									//2FA for signup is hard to do, because the wallet is created client side. We can still "try" to lure the user into this flow
									commit('updatePayload', payload);
									send2FAEmail(params.email);
									resolve();
								})
								.catch(reject);

						}).catch(reject);

					});
			});
		},
		logoutWallet({ commit }) {
			commit('logout');
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
						commit('updatePayload', { email: false, authenticator: false });
						localStorage.setItem('encryptedSeed', JSON.stringify(encryptedSeed));
						resolve();
					})
					
				} else {
					console.log("Reached here for wathever reason");
					reject();
				}
			});

		},
		/**
		 * Unlock wallet using the password stored in local state
		 */
		unlockWithStoredPassword({ dispatch, commit, state }) {
			return new Promise((resolve, reject) => {
				if (state.hashedPassword && state.encryptedSeed) {
					dispatch('unlockWithPassword', state.hashedPassword)
						.then(() => {
							resolve(true);
						})
						.catch(err => {
							console.log('unlockWithPassword error', err);
							resolve(false);
						});
				} else {
					resolve(false);
				}
			});
		},
		/**
		 * Unlock wallet using the password entered on the logon form
		 */
		unlockWithPassword({ commit, state }, password) {
			return new Promise((resolve, reject) => {
				getKeystoreFromEncryptedSeed(state.encryptedSeed, password)
					.then(keystore => {
						const accounts = getAccountsFromKeystore(keystore);

						commit('keystoreUnlocked', { keystore, accounts });
						resolve();
					})
					.catch(err => {
						console.log('unlockWithPassword error', err);
						commit('auth_error', "The user wasn't found: Signup first!");
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
			return state.twoFaRequired.email || state.twoFaRequired.authenticator;
		},
		authStatus: state => state.status
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
							store.state.keystore[0].signTransaction(txObj, function (signTransaction: SignedTransaction) {

								resolve(signTransaction.rawTransaction);
							});
						}
					} catch (e) {
						reject(e);
					}

				});
				console.log(signedTx);
				return signedTx;
			},
			isLoggedIn() {
				//return "ok"
				if (store.state.keystore)
					return {
						isLoggedIn: true,
						unlockedWallet: store.state.keystore,
						walletEmail: store.state.email,
						accounts: store.state.accounts
					};
				else return { isLoggedIn: false };
			},
			logout() {
				//maybe confirm?!
				//call onLogout callback to parent
			}
		}
	});
}

export default store;
