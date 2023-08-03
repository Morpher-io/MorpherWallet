import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { cryptoDecrypt, sha256 } from '../utils/cryptoFunctions';
import {
	getEncryptedSeedFromMail,
	verifyAuthenticatorCode,
	verifyEmailCode,
	saveWalletEmailPassword,
	getPayload,
	getKeystoreFromEncryptedSeed,
	changePasswordEncryptedSeed,
	getBackendEndpoint,
	getNonce,
	recoverSeedSocialRecovery,
	verifyEmailConfirmationCode
} from '../utils/backupRestore';
import { downloadEncryptedKeystore, getAccountsFromKeystore, sortObject } from '../utils/utils';
import { getKeystore } from '../utils/keystore';
import { getSessionStore, saveSessionStore, removeSessionStore } from '../utils/sessionStore';
import * as Sentry from '@sentry/vue';

import {
	Type2FARequired,
	TypeSeedFoundData,
	TypeSeedCreatedData,
	TypeFetchUser,
	TypeUnlock2fa,
	TypeUserFoundData,
	TypeUnlockWithPassword,
	MorpherWalletConfig,
	TypeChangePassword,
	TypeEncryptedSeed,
	TypeKeystoreUnlocked,
	TypeRequestParams,
	TypeChangeEmail,
	Type2FAUpdateParams,
	TypeRecoveryParams,
	TypeAddRecoveryParams,
	TypeResetRecovery,
	TypeUpdatePrivateKey,
	TypeUpdateSeedPhrase,
	TypeShowPhraseKeyVariables,
	TypeExportPhraseKeyVariables,
	TypeUpdateRecovery,
	TypeUpdateUserPayload
} from '../types/global-types';

import isIframe from '../utils/isIframe';
import { connectToParent } from 'penpal';
import { WalletBase, SignedTransaction } from 'web3-core';
import { CallSender, Connection } from 'penpal/lib/types';
import router from '@/router';
import download from 'downloadjs';

import { i18n } from '../plugins/i18n';
import Cookie from 'js-cookie';

Vue.use(Vuex);

/*
 * Store type definition
 */
export interface RootState {
	loading: boolean;
	isNetworkError: boolean;
	status: string;
	spinnerStatusText: string;
	message: string;
	email: string;
	loginEmail: string;
	fetch_key: string;
	
	iconSeed: number;
	hashedPassword: string;
	encryptedSeed: TypeEncryptedSeed;
	encryptedWallet: string;
	keystore: WalletBase | null;
	accounts: Array<string>;
	token: string;
	recoveryTypeId: number;
	twoFaRequired: Type2FARequired;
	connection: Connection<CallSender> | null;
	transactionDetails: any;
	messageDetails: any;
	openPage: string;
	loginComplete: boolean;
	recoveryMethods: Array<any>;
	seedExported: boolean;
	keystoreExported: boolean;
	seedPhrase: string;
	privateKey: string;
	privateKeyKeystore: string;
	signMessage: any;
	signResponse: any;
	ethBalance: string;
	unlocking: boolean;
	redirectPath: string;
	loginRetryCount: number;
	ipCountry: string;
	app_lang: string;
	unlocked: boolean;
	hiddenLogin: any;
}

/**
 * initialize the store
 */
function initialState(): RootState {
	const email = localStorage.getItem('email') || '';
	const iconSeed = parseInt(localStorage.getItem('iconSeed') || '') || null;
	const recoveryTypeId = Number(localStorage.getItem('recoveryTypeId') || '1');
	const hashedPassword = '';

	Sentry.configureScope((scope) => {
		scope.setUser({ id: '', email: email });
	});
	

	return {
		loading: false,
		isNetworkError: false,
		status: '',
		spinnerStatusText: '',
		message: '',
		email,
		loginEmail: '',
		iconSeed,
		hashedPassword,
		encryptedSeed: {},
		encryptedWallet: '',
		keystore: null,
		accounts: [],
		twoFaRequired: {
			email: false,
			authenticator: false,
			authenticatorConfirmed: false,
			needConfirmation: false
		},
		fetch_key: '',
		token: '',
		recoveryTypeId: recoveryTypeId,
		connection: null,
		transactionDetails: {},
		messageDetails: null,
		openPage: '',
		loginComplete: false,
		recoveryMethods: [],
		seedExported: false,
		keystoreExported: false,
		seedPhrase: '',
		privateKey: '',
		privateKeyKeystore: '',
		signMessage: null,
		signResponse: null,
		ethBalance: '0',
		unlocking: true,
		redirectPath: '',
		loginRetryCount: 0,
		ipCountry: '',
		app_lang: '',
		unlocked: false,
		hiddenLogin: undefined
	} as RootState;
}

/**
 * Store state object
 */
const store: Store<RootState> = new Vuex.Store({
	state: initialState(),

	modules: {},
	mutations: {
		hiddenLogin(state: RootState, loginData: any) {
			state.hiddenLogin = loginData;
		},
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
		updateNetworkError(state: RootState, isNetworkError: boolean) {
			state.isNetworkError = isNetworkError;
		},
		setRedirect(state: RootState, path: string) {
			state.redirectPath = path;
		},
		delayedSpinnerMessage(state: RootState, statusMessage: string) {
			state.loading = true;
			state.spinnerStatusText = statusMessage;
			setTimeout(() => {
				state.loading = false;
			}, 2000);
		},
		seedFound(state: RootState, seedFoundData: TypeSeedFoundData) {
			state.status = 'success';
			state.encryptedSeed = seedFoundData.encryptedSeed;
			state.recoveryTypeId = seedFoundData.recoveryTypeId || state.recoveryTypeId;
			sessionStorage.setItem('encryptedSeed', JSON.stringify(seedFoundData.encryptedSeed));
			localStorage.setItem('recoveryTypeId', String(state.recoveryTypeId));
			localStorage.setItem('login', 'true')
		},
		recoveryMethodsFound(state: RootState, recoveryMethodsData: Array<any>) {
			localStorage.setItem('recoveryMethods', JSON.stringify(recoveryMethodsData));
			state.recoveryMethods = recoveryMethodsData;
		},
		updateUnlocking(state: RootState, payload: boolean) {
			state.unlocking = payload;
		},
		unlocked(state: RootState, unlock) {
			state.unlocked = unlock;
			if (unlock) {
				setTimeout(() => {
					state.unlocked = false;
				}, 600000)
			}
		},
		updatePayload(state: RootState, payload: Type2FARequired) {
			state.twoFaRequired.email = payload.email;
			state.twoFaRequired.authenticator = payload.authenticator;
			state.twoFaRequired.authenticatorConfirmed = payload.authenticatorConfirmed;
			state.twoFaRequired.needConfirmation = payload.needConfirmation || false;
			state.app_lang = payload.app_lang || '';
		},
		ipCountry(state: RootState, ipCountry: string) {
			state.ipCountry = ipCountry || '';
		},
		async userFound(state: RootState, userData: TypeUserFoundData) {
			state.email = userData.email;
			state.hashedPassword = userData.hashedPassword;
			state.email = userData.email;
			state.token = userData.token;
			state.recoveryTypeId = userData.recoveryTypeId;
			state.fetch_key = userData.fetch_key;

			if (userData.loginEmail) {
				state.loginEmail = userData.loginEmail;
			}		

			Sentry.configureScope((scope) => {
				scope.setUser({ id: state.accounts && state.accounts.length > 0 ? state.accounts[0] : '', email: state.email });
			});

			window.localStorage.setItem('email', userData.email);
			window.sessionStorage.setItem('fetch_key', await sha256(userData.fetch_key));
			saveSessionStore('password', userData.hashedPassword);
		},
		seedCreated(state: RootState, seedCreatedData: TypeSeedCreatedData) {
			state.status = 'created';
			state.email = seedCreatedData.email;
			state.encryptedSeed = seedCreatedData.encryptedSeed;
			state.hashedPassword = seedCreatedData.hashedPassword;
			state.recoveryTypeId = seedCreatedData.recoveryTypeId || state.recoveryTypeId;
			localStorage.setItem('email', seedCreatedData.email);
			sessionStorage.setItem('encryptedSeed', JSON.stringify(seedCreatedData.encryptedSeed));
			localStorage.setItem('recoveryTypeId', String(state.recoveryTypeId));
			localStorage.setItem('login', 'true')
			saveSessionStore('password', seedCreatedData.hashedPassword);
			Sentry.configureScope((scope) => {
				scope.setUser({ id: state.accounts && state.accounts.length > 0 ? state.accounts[0] : '', email: state.email });
			});
		},
		setPage(state: RootState, page) {
			state.openPage = page;
		},
		authError(state: RootState, message) {
			(state.status = 'error'), (state.message = message);
			state.email = '';
			state.hashedPassword = '';
			state.unlocked = false;
			state.loginEmail = '';

			sessionStorage.removeItem('encryptedSeed');
			localStorage.removeItem('login')
			const email = localStorage.getItem('email')
			if (email)
				localStorage.setItem('lastEmail', email);

			localStorage.removeItem('recoveryTypeId');
			localStorage.removeItem('email');
			localStorage.removeItem('iconSeed');
			removeSessionStore('password');
			removeSessionStore('fetch_key');
			removeSessionStore('encryptedSeed');
			state.loginRetryCount = 0;
			if (router.currentRoute.name !== 'Signup') {
				router.push('/login').catch(() => undefined);
			}
			Sentry.configureScope((scope) => {
				scope.setUser({ id: '', email: '' });
			});
		},
		logout(state: RootState) {
			state.email = '';
			state.hashedPassword = '';
			state.encryptedSeed = {};
			state.keystore = null;
			state.loginEmail = '';

			state.status = '';
			state.token = '';
			state.unlocked = false;
			const email = localStorage.getItem('email')
			if (email)
				localStorage.setItem('lastEmail', email);

			localStorage.removeItem('email');
			localStorage.removeItem('iconSeed');
			localStorage.removeItem('recoveryMethods');
			removeSessionStore('password');
			removeSessionStore('fetch_key');
			removeSessionStore('encryptedSeed');
			localStorage.removeItem('recoveryTypeId');
			sessionStorage.removeItem('encryptedSeed');
			localStorage.removeItem('login')
			Sentry.configureScope((scope) => {
				scope.setUser({ id: '', email: '' });
			});
		},
		clearUser(state: RootState) {
			state.email = '';
			state.hashedPassword = '';
			state.encryptedSeed = {};
			state.keystore = null;

			state.unlocked = false;
			state.status = '';
			state.token = '';
			Sentry.configureScope((scope) => {
				scope.setUser({ id: '', email: '' });
			});
		},
		keystoreUnlocked(state: RootState, payload: TypeKeystoreUnlocked) {
			state.keystore = payload.keystore;
			state.accounts = payload.accounts;
			state.hashedPassword = payload.hashedPassword;

			if (payload.accounts && payload.accounts[0])
				Sentry.configureScope((scope) => {
					scope.setUser({ id: payload.accounts[0], email: state.email });
				});
			window.localStorage.setItem('iconSeed', parseInt(payload.accounts[0].slice(2, 10), 16).toString());
			saveSessionStore('password', payload.hashedPassword);

			const currentLocale = Cookie.get('locale');
			if (currentLocale) {
				store.dispatch('updateUserPayload', { column: 'app_lang', value: currentLocale });
			}
		},
		seedExported(state: RootState) {
			state.seedExported = true;
		},
		keystoreExported(state: RootState) {
			state.keystoreExported = true;
		},
		updatePrivateKey(state: RootState, payload: TypeUpdatePrivateKey) {
			state.privateKey = payload.privateKey;
		},
		updateSeedPhrase(state: RootState, payload: TypeUpdateSeedPhrase) {
			state.seedPhrase = payload.seedPhrase;
		},
		updateEmail(state: RootState, payload: string) {
			state.email = payload;
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
		showNetworkError({ commit }, isNetworkError: boolean) {
			commit('updateNetworkError', isNetworkError);
		},
		async loadEncryptedSeed({ commit }) {
			let encryptedSeed: TypeEncryptedSeed = {};
			const sessionEncryptedSeed = await getSessionStore('encryptedSeed')
			const recoveryTypeId = Number(await localStorage.getItem('recoveryTypeId') || 1)
			if (sessionEncryptedSeed) {
				try {
					encryptedSeed = JSON.parse(String(sessionEncryptedSeed));
					if (encryptedSeed && encryptedSeed.ciphertext)
						await commit('seedFound', { encryptedSeed, recoveryTypeId });
				} catch {
					encryptedSeed = {};
				}
			}

			

		},
		/**
		 * Fetch the user data from the database and attempt to unlock the wallet using the mail encrypted seed
		 */
		async fetchUser({ commit, rootState }, params: TypeFetchUser) {
			commit('updateUnlocking', true);
			const fetch_key: string = params.fetch_key;
			const email: string = params.email;
			const password: string = params.password;
			const recaptchaToken: string = params.recaptchaToken;
			const token: string = params.token;
			const recoveryTypeId: number = params.recoveryTypeId;

			commit('logout');
			return new Promise((resolve, reject) => {
				commit('authRequested');
				sha256(password)
					.then((hashedPassword) => {
						getPayload(fetch_key || email, recaptchaToken)
							.then((payload) => {
								rootState.loginRetryCount = 0;
								commit('ipCountry', payload.ip_country);
								commit('userFound', { email: payload.user_email || email, loginEmail: email, hashedPassword, token: params.token, recoveryTypeId: params.recoveryTypeId, fetch_key });
								commit('updatePayload', payload);

								if (!payload.email && !payload.authenticator && !payload.needConfirmation) {
									getEncryptedSeedFromMail(fetch_key || email, email, '', '', recaptchaToken, token, recoveryTypeId)
										.then((encryptedSeed) => {
											commit('updateUnlocking', false);
											commit('seedFound', { encryptedSeed, recoveryTypeId });
											resolve(true);
										})
										.catch((e) => {
											commit('updateUnlocking', false);
											reject(e);
										});
								} else {
									commit('updateUnlocking', false);
									resolve(true);
								}
							})
							.catch((err) => {
								commit('updateUnlocking', false);
								
								if (err.error !== 'RECAPTCHA_REQUIRED') commit('authError', "The user wasn't found: Signup first!");
								reject(err);
							});
					})
					.catch(() => {
						commit('updateUnlocking', false);
						reject(new Error('error'));
					});
			});
		},
		fetchWalletFromRecovery({ state, commit }, params: TypeRecoveryParams) {
			commit('updateUnlocking', true);
			return new Promise((resolve, reject) => {
				sha256(params.key)
				.then((hashedKey) => {
					recoverSeedSocialRecovery(hashedKey, params.accessToken, state.email, params.recoveryTypeId)
						.then((encryptedSeed) => {
							commit('seedFound', { encryptedSeed, recoveryTypeId: params.recoveryTypeId });
							getKeystoreFromEncryptedSeed(state.encryptedSeed, params.password)
								.then((keystore: WalletBase) => {
									state.loginRetryCount = 0;
									const accounts = getAccountsFromKeystore(keystore);
									//not setting any password here, this is simply for the password change mechanism
									commit('keystoreUnlocked', { keystore, accounts, hashedPassword: '' });
									commit('updateUnlocking', false);
									resolve(true);
								})
								.catch((err) => {
									state.loginRetryCount += 1;
									if (state.loginRetryCount >= 3 && err.error !== 'RECAPTCHA_REQUIRED')  commit('authError', 'Cannot unlock the Keystore, wrong ID');
									commit('updateUnlocking', false);
									reject(false);
								});
						})
						.catch(() => {
							commit('updateUnlocking', false);
							reject(false);
						});
				});
			});
		},
		addRecoveryMethod({ state, dispatch }, params: TypeAddRecoveryParams) {
			return new Promise(async (resolve, reject) => {
				sha256(params.password).then( async(hashedPassword) => {
					const encryptedSeed = await changePasswordEncryptedSeed(state.encryptedSeed, state.hashedPassword, hashedPassword);
					dispatch('sendSignedRequest', {
						body: {
							encryptedSeed,
							recoveryTypeId: params.recoveryTypeId,
							key: params.key,
							email: params.email,
							access_token: params.token,
							currentRecoveryTypeId: params.currentRecoveryTypeId
						},
						method: 'POST',
						url: getBackendEndpoint() + '/v1/auth/addRecoveryMethod'
					})
					.then(() => {
						dispatch('updateRecoveryMethods', { dbUpdate: true, recoveryTypeId: state.recoveryTypeId }).then(async () => {
							try {
								if (state.connection && state.connection !== null) {
									const connection:any = await state.connection.promise;

									let type;
									if (params.recoveryTypeId == 2) {
										type = 'fb'
									}
									if (params.recoveryTypeId == 3) {
										type = 'google'
									}

									if (params.recoveryTypeId == 5) {
										type = 'vk'
									}

									if (type) {
										connection.onRecoveryUpdate(type, true);
									}

								}
							} catch {
								console.error('Error calling onRecoveryUpdate callback')
							}						
							resolve(true);
						});
					})
					.catch(reject);
				})
			});
		},
		fetchVKAuthToken({ state, dispatch }, params: any) {
			return new Promise(async (resolve, reject) => {
				dispatch('sendSignedRequest', {
					body: {
						code: params.code
						
					},
					method: 'POST',
					url: getBackendEndpoint() + '/v1/auth/fetchVKAuthToken'
				})
				.then((response) => {
					
					resolve(response)
				})
				.catch(reject);
			});
		},
		recoveryVKAuthToken({ state, dispatch }, params: any) {
			return new Promise(async (resolve, reject) => {
				const options: RequestInit = {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						code: params.code
					}),
					mode: 'cors',
					cache: 'default'
				};

				fetch(getBackendEndpoint() + '/v1/recoveryVKAuthToken', options).then(async (response) => {
					if (!response.ok) {
						reject((await response.json()).error);
					}
					resolve(await response.json());
				}).catch(reject);

			});
		},
	
		hasRecovery({ state }, id: number) {
			return (
				state.recoveryMethods
					.map((obj) => {
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
				sha256(params.password).then((hashedPassword) => {
					getPayload(params.fetch_key || params.email, params.recaptchaToken)
						.then(() => {
							return reject('USER_ALREADY_EXISTS');
						})
						.catch(async (error) => {
							if (error.error && error.error === 'RECAPTCHA_REQUIRED') {
								return reject(error);
							}
							commit('authRequested');
							commit('loading', 'Creating new Keystore...');
							/**
							 * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
							 */
							const createdKeystoreObj = await getKeystore(hashedPassword, {}, 1);

							const accounts = getAccountsFromKeystore(createdKeystoreObj.keystore);

							saveWalletEmailPassword(params.email, createdKeystoreObj.encryptedSeed, accounts[0], params.recaptchaToken, params.recoveryTypeId, params.token, params.fetch_key)
								.then(() => {
									commit('clearUser');
									dispatch('fetchUser', { fetch_key: params.fetch_key, email: params.email, password: params.password, recaptchaToken: params.recaptchaToken, recoveryTypeId: params.recoveryTypeId, token: params.token })
										.then(resolve)
										.catch((e) => {
											reject(e);
											commit('delayedSpinnerMessage', 'Unknown Error occurred during saving.');
											reject(e);
										});
								})
								.catch((e) => {
									return reject(e);
								});
						});
				});
			});
		},
		async loginWallet({ state, dispatch }, recaptchaToken) {
			if (!state.email && !state.hashedPassword) {
				const email = localStorage.getItem('email') || '';
				const iconSeed = parseInt(localStorage.getItem('iconSeed') || '') || 0;
				const hashedPassword = await getSessionStore('password');

				let encryptedSeed: TypeEncryptedSeed = {};
				const sessionEncryptedSeed = await getSessionStore('encryptedSeed')
				const recoveryTypeId = Number(await localStorage.getItem('recoveryTypeId') || 1)
				if (sessionEncryptedSeed) {
					try {
						encryptedSeed = JSON.parse(String(sessionEncryptedSeed));
					} catch {
						encryptedSeed = {};
					}
				}
				state.email = email;
				state.iconSeed = iconSeed;
				state.hashedPassword = hashedPassword;
				state.encryptedSeed = encryptedSeed;
				state.recoveryTypeId = recoveryTypeId;

				Sentry.configureScope((scope) => {
					scope.setUser({ id: state.accounts && state.accounts.length > 0 ? state.accounts[0] : '', email: state.email });
				});
			}

			dispatch('unlockWithStoredPassword', recaptchaToken)
				.then((result) => {
					if (result) {
						router.push('/').catch(() => undefined);
					}
				})
				.catch((error) => {
					if (error !== true && error !== false) {
						// console.log('Error in unlock', error);
					}
				});
		},
		async logoutWallet({ commit }) {
			await commit('logout');
			if (router.currentRoute.path !== '/login') router.push('/login').catch(() => undefined);
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
				let userConfirmed = false;
				

				if (state.twoFaRequired.email == true) {
					const result = await verifyEmailCode(rootState.email, params.email2FA);

					if (result.success) {
						rootState.loginRetryCount = 0;
						emailCorrect = true;
					} else {
						rootState.loginRetryCount += 1;
						if (rootState.loginRetryCount >= 3) commit('authError', '2FA Email code not correct');
						reject(result.error);
						return;
					}
				} else {
					emailCorrect = true;
				}

				if (state.twoFaRequired.authenticator == true) {
					const result = await verifyAuthenticatorCode(rootState.email, params.authenticator2FA);


					if (result.success) {
						authenticatorCorrect = true;
						rootState.loginRetryCount = 0;
					} else {
						rootState.loginRetryCount += 1;
						if (rootState.loginRetryCount >= 3) commit('authError', '2FA Authenticator code not correct');
						reject(result.error);
						return;
					}
				} else {
					authenticatorCorrect = true;
				}

				if (state.twoFaRequired.needConfirmation == true) {
					const result = await verifyEmailConfirmationCode(rootState.email, params.email2FA);
					if (result.success) {
						userConfirmed = true;
						state.loginRetryCount = 0;
					} else {
						state.loginRetryCount += 1;
						if (state.loginRetryCount >= 3) commit('authError', 'Confirmation Email code not correct');
						reject(result.error);
						return;
					}
				} else {
					userConfirmed = true;
				}

				if (emailCorrect && authenticatorCorrect && userConfirmed) {
					getEncryptedSeedFromMail(rootState.fetch_key || rootState.email, rootState.loginEmail || rootState.email, params.email2FA, params.authenticator2FA, params.recaptchaToken, rootState.token, rootState.recoveryTypeId)
						.then((encryptedSeed) => {
							//const encryptedSeed = state.encryptedSeed; //normally that would need decrypting using 2fa codes
							//commit('updatePayload', { email: false, authenticator: false });
							commit('seedFound', { encryptedSeed, recoveryTypeId: rootState.recoveryTypeId });
							if (state.hashedPassword) {
								dispatch('unlockWithStoredPassword', params.recaptchaToken)
									.then(() => resolve('/'))
									.catch((err) => {
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
						.catch((err) => {
							if (err.toString() === 'seed not found') {
								commit('authError', '2FA Authentication code not correct');
								reject('2FA Authentication not correct');
							} else {
								reject(err);
							}
						});
				} else {
					reject();
				}
			});
		},
		/**
		 * Unlock wallet using the password stored in local state
		 */
		async unlockWithStoredPassword({ dispatch, commit, state }, recaptchaToken: string) {
			commit('updateUnlocking', true);

			const fetch_key = window.sessionStorage.getItem('fetch_key');

			if (!state.encryptedSeed || !state.encryptedSeed.ciphertext) {
				await dispatch('loadEncryptedSeed');
			}

			if (!state.hashedPassword) {
				await dispatch('loadPassword');
			}
			return new Promise((resolve, reject) => {
				if (state.hashedPassword && state.encryptedSeed.ciphertext !== undefined) {
					dispatch('unlockWithPassword', { password: state.hashedPassword, recaptchaToken, fetch_key })
						.then(() => {
							commit('updateUnlocking', false);
							resolve(true);
						})
						.catch((e) => {
							commit('updateUnlocking', false);
							reject(e);
						});
				} else {
					commit('updateUnlocking', false);
					reject(new Error());
				}
			});
		},
		unlockUpdate({ commit }) {
			commit('updateUnlocking', false);
		},
		/**
		 * Unlock wallet using the password entered on the logon form
		 */
		unlockWithPassword({ commit, state, dispatch }, params: TypeUnlockWithPassword) {
			commit('updateUnlocking', true);
			return new Promise((resolve, reject) => {
				getKeystoreFromEncryptedSeed(state.encryptedSeed, params.password)
					.then((keystore: WalletBase) => {
						const accounts = getAccountsFromKeystore(keystore);
						state.loginRetryCount = 0;

						commit('keystoreUnlocked', { keystore, accounts, hashedPassword: params.password });
						getPayload(state.fetch_key || state.email, params.recaptchaToken, params.fetch_key)
							.then((payload) => {
								commit('ipCountry', payload.ip_country);
								commit('updatePayload', payload);
								dispatch('updateRecoveryMethods', { dbUpdate: false, recoveryTypeId: state.recoveryTypeId }).then(() => {
									resolve(true);
								});
							})
							.catch((e) => {
								reject(e);
							});
						commit('updateUnlocking', false);
					})
					.catch((err) => {
						commit('updateUnlocking', false);
						state.loginRetryCount += 1;
						if (state.loginRetryCount >= 3) commit('authError', "The user wasn't found: Signup first!");
						reject(err);
					});
			});
		},
		unlocked({ commit, dispatch }) {
			commit('unlocked', true);
		},
		updateRecoveryMethods({ commit, dispatch }, params: TypeUpdateRecovery) {
			return new Promise((resolve, reject) => {
				if (localStorage.getItem('recoveryMethods') && params.dbUpdate !== true) {
					const methods = JSON.parse(localStorage.getItem('recoveryMethods') || '');
					commit('recoveryMethodsFound', methods);
					resolve(true);
				} else {
					dispatch('sendSignedRequest', {
						body: { recovery_type: params.recoveryTypeId},
						method: 'POST',
						url: getBackendEndpoint() + '/v1/auth/getRecoveryMethods'
					})
						.then((methods) => {
							commit('recoveryMethodsFound', methods);
							resolve(true);
						})
						.catch(reject);
				}
			});
		},
		updateUserPayload({ dispatch, state }, params: TypeUpdateUserPayload) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					// only update the app language if it has changed
					if (params.column !== 'app_lang') {
						return resolve(true);
					}

					if (!state.app_lang || state.app_lang == '') {
						return resolve(true);
					}
					if (!state.email || !state.accounts || state.accounts.length < 1 || !state.accounts[0] || !params.value) {
						return resolve(true);
					}
					if (params.value.toLowerCase() == state.app_lang.toLowerCase()) {
						return resolve(true);
					}
					dispatch('sendSignedRequest', {
						body: { column: params.column, value: params.value },
						method: 'POST',
						url: getBackendEndpoint() + '/v1/auth/updateUserPayload'
					})
						.then(() => {
							return resolve(true);
						})
						.catch(reject);
				}, 2000);
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
						commit('seedFound', { encryptedSeed: newEncryptedSeed, recoveryTypeId: state.recoveryTypeId });
						commit('userFound', { email: state.email, hashedPassword: params.newPassword, recoveryTypeId: state.recoveryTypeId, fetch_key: state.fetch_key  });
						resolve(true);
					}
				} catch (e) {
					//console.error(e);
					reject(e);
				}
			});
		},
		changeEmail({ commit, state, dispatch }, params: TypeChangeEmail) {
			return new Promise(async (resolve, reject) => {
				try {
					if (state.keystore !== undefined && state.keystore !== null) {
						if (params.password == state.hashedPassword || state.recoveryTypeId == 3 || state.recoveryTypeId == 6) {
							

								//twoFA wasn't sent yet, send it with the first request to the new email address
								const body = {
									oldEmail: state.email,
									newEmail: params.newEmail,
									email2faVerification: (params.twoFa || undefined)
								};
								dispatch('sendSignedRequest', {
									body,
									method: 'POST',
									url: getBackendEndpoint() + '/v1/auth/updateEmail'
								})
									.then(resolve)
									.catch(reject);
						} else {
							reject('Password is not correct!');
						}
					}
				} catch (e) {
					//console.error(e);
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
		change2FAMethods({ dispatch, commit, state }, params: Type2FAUpdateParams) {
			return new Promise((resolve, reject) => {
				dispatch('sendSignedRequest', {
					body: params,
					method: 'POST',
					url: getBackendEndpoint() + '/v1/auth/change2FAMethods'
				})
					.then(async (response) => {
						
						let codeSent = false;

						if (response && response.data && response.data == '2FA_CODE_SENT') {
							codeSent = true;
						}
						if (!codeSent) {
							try {
								if (state.connection && state.connection !== null) {
									const connection: any = await state.connection.promise;

									connection.on2FAUpdate('email', params.email);
									connection.on2FAUpdate('authenticator', params.authenticator);
								}
							} catch {
								console.error('Error calling on2FAUpdate callback')
							}
							
							commit('updatePayload', params);
						}
						resolve(response);
					})
					.catch((e) => {
						reject(e);
					});
			});
		},
		sendSignedRequest({ state }, params: TypeRequestParams) {
			return new Promise(async (resolve, reject) => {
				try {
					const body = params.body;
					let key = await getSessionStore('fetch_key')
					if (!key) {
						key = await sha256(state.fetch_key || state.email.toLowerCase());
					}
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
								key: key,
								recoveryTypeId: String(state.recoveryTypeId || 1)
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
				} catch (e) {
					reject(e);
				}
			});
		},
		resetRecoveryMethod({ dispatch, state }, params: TypeResetRecovery) {
			return new Promise((resolve, reject) => {
				dispatch('sendSignedRequest', {
					body: { key: params.key, recoveryTypeId: params.recoveryTypeId, token: params.token},
					method: 'POST',
					url: getBackendEndpoint() + '/v1/auth/resetRecovery'
				})
					.then(() => {
						dispatch('updateRecoveryMethods', { dbUpdate: true, recoveryTypeId: state.recoveryTypeId }).then(async () => {
							try {
								if (state.connection && state.connection !== null) {
									const connection:any =  await state.connection.promise;

									let type;
									if (params.recoveryTypeId == '2') {
										type = 'fb'
									}
									if (params.recoveryTypeId == '3') {
										type = 'google'
									}

									if (params.recoveryTypeId == '5') {
										type = 'vk'
									}

									if (type) {
										connection.onRecoveryUpdate(type, false);
									}

								}
							} catch {
								console.error('Error calling onRecoveryUpdate callback')
							}								
							resolve(true);
						});
					})
					.catch((e) => {
						reject(e);
					});
			});
		},
		showPrivateKey({ commit, state }, params: TypeShowPhraseKeyVariables) {
			const storedPassword = state.hashedPassword;

			if (state.keystore !== null) {
				const privateKey = state.keystore[0].privateKey.substring(2);
				commit('delayedSpinnerMessage', i18n.t('export.PRIVATE_KEY_SUCCESSFUL'));
				commit('updatePrivateKey', { privateKey });
			}

		},
		showPrivateKeyBackground({ state }, params: TypeShowPhraseKeyVariables) {
			const storedPassword = state.hashedPassword;

			
				if (state.keystore !== null) {
					const privateKey = state.keystore[0].privateKey.substring(2);
					return privateKey;
				}
			

			return null;
		},
		exportKeystore({ commit, state }, params: TypeExportPhraseKeyVariables) {
			const storedPassword = state.hashedPassword;

			
				if (state.keystore !== null) {
					downloadEncryptedKeystore(state.keystore[0].encrypt(storedPassword), params.account);
					commit('delayedSpinnerMessage', i18n.t('export.KEYSTORE_SUCCESSFUL'));
					commit('keystoreExported');
				}
		},
		showSeedPhrase({ commit, state }, params: TypeShowPhraseKeyVariables) {
			const storedPassword = state.hashedPassword;

			if (state.keystore !== null) {
				const seed = state.encryptedSeed;
				if (seed.ciphertext !== undefined && seed.iv !== undefined && seed.salt !== undefined) {
					cryptoDecrypt(storedPassword, seed.ciphertext, seed.iv, seed.salt).then((mnemonic) => {
						commit('delayedSpinnerMessage', i18n.t('export.SEED_PHRASE_SUCCESSFUL'));
						commit('updateSeedPhrase', { seedPhrase: mnemonic });
					});
				} else {
					commit('delayedSpinnerMessage', 'Wrong seed given');
				}
			}
		
		},
		async showSeedPhraseBackground({ state }, params: TypeShowPhraseKeyVariables) {
			const storedPassword = state.hashedPassword;

			
				if (state.keystore !== null) {
					const seed = state.encryptedSeed;
					if (seed.ciphertext !== undefined && seed.iv !== undefined && seed.salt !== undefined) {
						const mnemonic = cryptoDecrypt(storedPassword, seed.ciphertext, seed.iv, seed.salt);

						return mnemonic;
					}
				}
			

			return null;
		},
		exportSeedPhrase({ commit, state }, params: TypeExportPhraseKeyVariables) {
			const storedPassword = state.hashedPassword;

			if (storedPassword === params.password) {
				if (state.keystore !== null) {
					const seed = state.encryptedSeed;
					if (seed.ciphertext !== undefined && seed.iv !== undefined && seed.salt !== undefined) {
						cryptoDecrypt(params.password, seed.ciphertext, seed.iv, seed.salt).then((mnemonic) => {
							const now = new Date();
							download(mnemonic, 'seed' + '--' + now.toISOString() + '--' + params.account);
							commit('delayedSpinnerMessage', 'Seed Phrase exported successfully');
							commit('seedExported');
						});
					} else {
						commit('delayedSpinnerMessage', 'Wrong seed given');
					}
				}
			} else {
				commit('delayedSpinnerMessage', 'Wrong password for Seed Phrase');
			}
		},
		clearPrivateKey({ commit }) {
			commit('updatePrivateKey', { privateKey: '' });
		},
		clearSeedPhrase({ commit }) {
			commit('updateSeedPhrase', { seedPhrase: '' });
		},
		async loadPassword({ state }) {
			const password = await getSessionStore('password');
			if (password) {
				state.hashedPassword = password;
			}
		},
		deleteWalletAccount({ dispatch, state }, params: TypeShowPhraseKeyVariables) {
			return new Promise(async (resolve, reject) => {
				dispatch('sendSignedRequest', {
					body: {
						email: state.email.toLowerCase()
					},
					method: 'POST',
					url: getBackendEndpoint() + '/v1/auth/deleteAccount'
				})
					.then(() => {
						dispatch('logoutWallet').then(() => {
							resolve(true);
						});
					})
					.catch((e) => {
						reject(e);
					});
			});
		},
		setUsersEmail({ commit }, email: string) {
			commit('updateEmail', email);
		}
	},
	getters: {
		isLoggedIn: (state) => {
			return state.keystore !== undefined && state.keystore !== null;
		},
		twoFaRequired: (state) => {
			return (
				(state.twoFaRequired.email || state.twoFaRequired.authenticator || state.twoFaRequired.needConfirmation) &&
				state.encryptedSeed.ciphertext === undefined
			);
		},
		authStatus: (state) => state.status,
		walletEmail: (state) => state.email,
		recoveryTypeId: (state) => state.recoveryTypeId,
		
		hasEncryptedKeystore: (state) => state.encryptedSeed.ciphertext !== undefined
	}
});

/*
initialize the iframe parent connection
*/
if (isIframe()) {
	store.state.connection = connectToParent({
		parentOrigin:
			process.env.NODE_ENV === 'production'
				? /(?=.*morpher.com)^(\/www\.|https:\/\/www\.|https:\/\/)?[a-z 0-9]+([-.]{1}[a-z 0-9]+)*\.[a-z]{2,5}?(\/.*)?$/gm
				: /.*/gm,

		// Methods child is exposing to parent
		methods: {
			async getAccounts() {
				if (store.state.keystore != null) {
					return store.state.accounts;
				} else {
					return [];
				}
			},
			async signTransaction(txObj: any, config: MorpherWalletConfig) {
				if (txObj.eth_balance) {
					store.state.ethBalance = txObj.eth_balance;
				}
				//if (txObj.nonce == undefined) {
				//console.error('No nonce defined, aborting tx signing');
				//}

				const signedTx = await new Promise((resolve, reject) => {
					//see if we are logged in?!
					try {
						if (store.state.keystore !== null) {
							if (config?.confirm_transaction || (Number(txObj.chainId) !== 21 && Number(txObj.chainId) !== 210 && Number(txObj.chainId) !== 2100)) {
								if (txObj.amount && !txObj.value) {
									txObj.value = txObj.amount;
								}
								store.state.transactionDetails = txObj;
								store.state.signResponse = null;
								router.push('/signtx').catch(() => undefined);
								const interval = setInterval(() => {
									if (store.state.signResponse) {
										clearInterval(interval);
										if (store.state.signResponse === 'confirm') {
											store.state.signResponse = null;

											if (store.state.keystore !== null) {
												store.state.keystore[0]
													.signTransaction(txObj)
													.then((tran: SignedTransaction) => {
														resolve(tran.rawTransaction);
													})
													.catch(reject);
											} else {
												resolve(null);
											}
										} else {
											store.state.signResponse = null;
											resolve(null);
										}
									}
								}, 500);
							} else {
								store.state.keystore[0]
									.signTransaction(txObj)
									.then((tran: SignedTransaction) => {
										resolve(tran.rawTransaction);
									})
									.catch(reject);
							}
						}
					} catch (e) {
						reject(e);
					}
				});
				return signedTx;
			},
			async signMessage(txObj: any, config: MorpherWalletConfig) {
				const signedTx = await new Promise((resolve, reject) => {
					//see if we are logged in?!
					try {
						if (store.state.keystore !== null) {
							if (config?.confirm_message) {
								const Web3Utils = require('web3-utils');
								store.state.messageDetails = Web3Utils.toAscii(txObj.data);
								store.state.signResponse = null;
								router.push('/signmsg').catch(() => undefined);

								const interval = setInterval(() => {
									if (store.state.signResponse) {
										clearInterval(interval);
										if (store.state.signResponse === 'confirm') {
											store.state.signResponse = null;
											if (store.state.keystore !== null) {
												const signedData = store.state.keystore[0].sign(txObj.data); //
												resolve(signedData.signature);
											} else {
												resolve(null);
											}
										} else {
											store.state.signResponse = null;
											resolve(null);
										}
									}
								}, 500);
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
				if (pageName) {
					store.state.openPage = pageName;
					return true;
				}

				return false;
			},
			async loginWalletHidden(type: string, user: string, password: string)  {
				if (store.getters.isLoggedIn) {
					store.commit('logout')	
				}
				store.commit('hiddenLogin', {type, user, password})
			},
			async signupWalletHidden(type: string, walletEmail: string, walletPassword: string, walletPasswordRepeat: string, loginUser: any)  {
				if (store.getters.isLoggedIn) {
					store.commit('logout')	
				}
				router.push('/signup').catch(() => undefined);
				store.commit('hiddenLogin', {type, walletEmail, walletPassword, walletPasswordRepeat, loginUser})
			},

			async walletRecoveryHidden(type: string)  {
				store.commit('hiddenLogin', {type: 'recovery', recovery: type})

			},
			async loginWallet2fa(twoFACode: string) {
				router.push('/2fa').catch(() => undefined);
				store.commit('hiddenLogin', {type: '2fa', twoFACode: twoFACode})
			},
			async isLoggedIn() {
				let counter = 0;

				const waitForUnlock = () => {
					return new Promise((resolve) => {
						setTimeout(resolve, 200);
					});
				};
				// wait for the store to finish unlocking if it is in progress
				while (store.state.unlocking && counter < 50) {
					counter += 1;
					// wait for the wallet to finish unlocking
					await waitForUnlock();
				}
				//return 'ok'
				if (store.state.keystore)
					return {
						isLoggedIn: true,
						walletEmail: store.state.email,
						accounts: store.state.accounts,
						recovery_type: store.state.recoveryTypeId,
					};
				else return { isLoggedIn: false };
			},
			hasSocialRecoveryMethods() {
				if (store.state.recoveryTypeId && store.state.recoveryTypeId !== 1) {
					return true;	
				}				
				if (!store.state.recoveryMethods.find(method => Number(method.id) !== 1)) {	
					return false;
				}
				return true;
			},
			logout() {
				store.commit('logout');
			},
			setLanguage(lang?: string): void {
				const supportedLocales: string[] = JSON.parse(process.env.VUE_APP_I18N_SUPPORTED_LOCALE || '') || ['en'];

				if (lang && supportedLocales.includes(lang)) {
					i18n.locale = lang;
					document.querySelector('html')?.setAttribute('lang', lang);
					if (lang === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl');
					else document.querySelector('html')?.setAttribute('dir', '');
					Cookie.set('locale', lang);

					if (store.state.keystore) {
						store.dispatch('updateUserPayload', { column: 'app_lang', value: lang });
					}
				}
			}
		}
	});
}

export default store;
