import Vuex from 'vuex'
import Vue from 'vue';
import { sha256 } from "../utils/cryptoFunctions";
import { getEncryptedSeedFromMail, verifyAuthenticatorCode, verifyEmailCode, getEncryptedSeed, saveWalletEmailPassword, send2FAEmail, getPayload } from "../utils/backupRestore";
import {getAccountsFromKeystore} from "../utils/utils";
import { getKeystore } from '../utils/keystore';

import { connectToParent } from "penpal";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        status: '',
        message: '',
        email: localStorage.getItem('email') || '',
        hashedPassword: window.sessionStorage.getItem("password") || "",
        encryptedSeed: localStorage.getItem('encryptedSeed') || '',
        keystore: undefined,
        twoFaRequired: {
            email: false,
            authenticator: false
        },

    },
    mutations: {
        auth_requested(state) {
            console.log(state);
            state.status = 'loading'
        },
        seed_found(state, email, encryptedSeed, hashedPassword) {
            state.status = 'success';
            state.email = email;
            state.encryptedSeed = encryptedSeed;
            state.hashedPassword = hashedPassword;
        },
        update_payload(state, payload) {
            state.twoFaRequired.email = payload.email;
            state.twoFaRequired.authenticator = payload.authenticator;
        },
        seed_created(state, email, encryptedSeed, hashedPassword, unencryptedKeystore) {
            state.status = 'created';
            state.email = email;
            state.encryptedSeed = encryptedSeed;
            state.keystore = unencryptedKeystore;
            state.hashedPassword = hashedPassword;
        },
        auth_error(state, message) {
            state.status = 'error',
                state.message = message
        },
        logout(state) {
            state.status = ''
            state.token = ''
        },
    },
    actions: {
        fetchUser({ commit }, email, password) {
            return new Promise((resolve, reject) => {
                commit('auth_requested');

                getEncryptedSeedFromMail(email).then(encryptedSeed => {
                    window.localStorage.setItem("email", email);
                    let hashedPassword = sha256(password);
                    sessionStorage.setItem('password', hashedPassword);
                    commit('seed_found', email, encryptedSeed, hashedPassword);
                    getPayload(email).then(payload => {
                        commit('update_payload', payload);
                        resolve();
                    }).catch(reject)

                }).catch(err => {

                    commit('auth_error', "The user wasn't found: Signup first!");
                    localStorage.removeItem('encryptedSeed');
                    localStorage.removeItem('email');
                    sessionStorage.removeItem('password');
                    reject(err)
                });
            })
        },
        createWallet({ commit }, email, password) {
            return new Promise((resolve, reject) => {

                console.log("trying to find keystore from mail");
                getEncryptedSeedFromMail(email).then(keystore => {

                    commit('auth_error', "The user found: Login instead!");
                    reject("Wallet for this mail already exists.");
                }).catch(e => {

                    commit('auth_requested');
                    console.log("keystore not found in mail, creating a new one");
                    /**
                     * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
                     */
                    getKeystore(password).then(unlockedKeystore => {

                        let encryptedKeystore = getEncryptedSeed(unlockedKeystore, password);
                        localStorage.setItem(
                            "encryptedSeed",
                            JSON.stringify(encryptedKeystore)
                        );
                        localStorage.setItem("email", email);
                        sessionStorage.setItem("password", password);

                        saveWalletEmailPassword(email, encryptedKeystore);
                        send2FAEmail(email);
                        

                    }).catch(reject)
                });


            })

        },
        unlock2FA({ commit, state }, email2FA, authenticator2FA) {
            return new Promise((resolve, reject) => {
                if (state.twoFaRequired.email == true) {
                    let result = verifyEmailCode(store.email, email2FA);
                    if (!result.verified) {
                        commit('auth_error', result, "2FA Email code not correct");
                        reject("2FA Mail not correct");
                    }
                }
                if (state.twoFaRequired.authenticator == true) {
                    let result = verifyAuthenticatorCode(store.email, authenticator2FA);
                    if (!result.verified) {
                        commit('auth_error', result, "2FA Authenticator code not correct");
                        reject("2FA Authenticator not correct");
                    }
                }
                let encryptedSeed = state.encryptedSeed; //normally that would need decrypting using 2fa codes
                localStorage.setItem("encryptedSeed", encryptedSeed);
                resolve(encryptedSeed);
            })


        },
        unlockWithStoredPassword({ dispatch, commit, state }) {
            dispatch('unlockWithPassword', state.hashedPassword)
        },
        unlockWithPassword({ commit }, password) {
            return new Promise((resolve, reject) => {
                getKeystoreFromEncryptedSeed(encryptedWallet, password)
                    .then(async (keystore) => {

                        let accounts = getAccountsFromKeystore(keystore);
                        commit('keystore_unlocked', keystore, accounts)
                    });
            });
        },
    },
    getters: {
        isLoggedIn: state => {
            return state.keystore !== undefined;
        },
        twoFaRequired: state => {
            return state.twoFaRequired.email || state.twoFaRequired.authenticator;
        },
        authStatus: state => state.status,
    }

})

export default store