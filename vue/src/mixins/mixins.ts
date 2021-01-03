// global mixins
import Vue from 'vue';
import Component from 'vue-class-component';
import Spinner from '../components/loading-spinner/Spinner.vue';
import { Action } from 'vuex-class';
import {
	TypeFetchUser,
	TypeUnlock2fa,
	TypeUnlockWithPassword,
	TypeChangePassword,
	TypeChangeEmail,
	TypePayloadData,
	TypeRecoveryParams,
	TypeAddRecoveryParams,
	TypeResetRecovery
} from '../types/global-types';
import { mapState } from 'vuex';
import { RootState } from '../store';
import isIframe from '../utils/isIframe';
import { Watch } from 'vue-property-decorator';
import VueRouter from 'vue-router';

/**
 * Mixin used for all components
 */
@Component({
	components: {
		Spinner
	},
	computed: {
		...mapState({
			connection: (state: any) => state.connection,
			status: (state: any) => state.status,
			twoFaRequired: (state: any) => state.twoFaRequired
		})
	}
})
export class Global extends Vue {
	// Map store actions
	@Action
	public showSpinner!: (message: string) => void;

	@Action
	public showSpinnerThenAutohide!: (message: string) => void;

	@Action
	public hideSpinner!: () => void;

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

	@Action
	public resetRecoveryMethod!: (params: TypeResetRecovery) => Promise<unknown>;

	@Action
	public clearPage!: () => void;

	// Map store actions
	@Action
	public logoutWallet!: () => void;

	// Map store actions
	@Action
	public fetchWalletFromRecovery!: (params: TypeRecoveryParams) => Promise<unknown>;

	// Map Store Properties
	store: RootState = this.$store.state;

	router: VueRouter = this.$router;

	// map libraries
	isIframe = isIframe;

	@Watch('store.keystore')
	onPropertyChanged(value: any) {
		if (value === null) {
			this.$router.push('/login');
		}
	}

	@Watch('store.openPage')
	onPageChanged(value: any) {
		if (value) {
			if (value === 'wallet') this.$router.push('/');
			if (value === 'settings') this.$router.push('/settings');
			if (value === 'register') this.$router.push('/signup');
			this.clearPage();
		}
	}
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
	},
	watch: {}
})
export class Authenticated extends Global {
	@Action
	public changePassword!: (params: TypeChangePassword) => Promise<unknown>;

	@Action
	public changeEmail!: (params: TypeChangeEmail) => Promise<unknown>;

	@Action
	public generateQRCode!: () => Promise<unknown>;

	@Action
	public change2FAMethods!: (params: TypePayloadData) => Promise<unknown>;

	@Action
	public addRecoveryMethod!: (params: TypeAddRecoveryParams) => Promise<unknown>;

	@Action
	public hasRecovery!: (id: number) => boolean;
}
