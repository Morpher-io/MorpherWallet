// global mixins
import Vue from 'vue';
import Component from 'vue-class-component';
import Spinner from '../components/loading-spinner/Spinner.vue';
import { Action } from 'vuex-class';
import { TypeFetchUser, TypeUnlock2fa, Type2FARequired, TypeUnlockWithPassword } from '../types/global-types';
import { mapState } from 'vuex';
import { connectToParent } from 'penpal';
import isIframe from '../utils/isIframe';
import { CallSender, Connection } from 'penpal/lib/types';
import { WalletBase, SignedTransaction } from 'web3-core';
import { RootState } from '../store'

/**
 * Mixin used for all components
 */
@Component({
	components: {
		Spinner
	},
	computed: {
		...mapState({
			status: (state: any) => state.status,
			twoFaRequired: (state: any) => state.twoFaRequired
		})
	}
})
export class Global extends Vue {
	// Global component properties
	showSpinner = false;

	// Map store actions
	@Action
	public fetchUser!: (params: TypeFetchUser) => Promise<unknown>;

	@Action
	public unlockWithStoredPassword!: () => Promise<unknown>;

	@Action
	public unlock2FA!: (params: TypeUnlock2fa) => Promise<unknown>;

	@Action
	public createWallet!: (params: TypeFetchUser) => Promise<unknown>;

	@Action
	public unlockWithPassword!: (params: TypeUnlockWithPassword) => Promise<unknown>;


	// Map store actions
	@Action
	public logoutWallet!: () => void;

	// Map Store Properties
	store: RootState = this.$store.state;

}

/**
 * Mixin used for components after login
 */
@Component({
	computed: {
		...mapState({
			walletEmail: (state: any) => state.email,
			keystore: (state: any) => state.keystore,
			accounts: (state: any) => state.accounts
		})
	}
})
export class Authenticated extends Global {


	connection: Connection<CallSender> | null = null;

	mounted() {
		if (isIframe()) {
			const storeKeyStore = this.store.keystore;
			const storeAccount: any = this.store.accounts[0];
			const storeEmail = this.store.email;
			const storeAccounts = this.store.accounts;

			this.connection = connectToParent({
				parentOrigin: 'http://localhost:8081',
				// Methods child is exposing to parent
				methods: {
					async getAccounts() {
						if (this.keystore != null) {
							return this.accounts;
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
								if (storeKeyStore !== null) {
									storeKeyStore[storeAccount].signTransaction(txObj, function (signTransaction: SignedTransaction) {

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
						if (storeKeyStore)
							return {
								isLoggedIn: true,
								unlockedWallet: storeKeyStore,
								walletEmail: storeEmail,
								accounts: storeAccounts
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
	}

}
