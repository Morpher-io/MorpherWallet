// global mixins
import Vue from 'vue';
import Component from 'vue-class-component';
import Spinner from '../components/loading-spinner/Spinner.vue';
import { Action } from 'vuex-class';
import { TypeFetchUser, TypeUnlock2fa, Type2FARequired, TypeUnlockWithPassword } from '../types/global-types';
import { mapState } from 'vuex';
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
	public unlock2FA!: (params: TypeUnlock2fa) => Promise<string>;

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


}


