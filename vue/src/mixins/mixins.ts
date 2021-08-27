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
	TypeResetRecovery,
	TypeExportPhraseKeyVariables,
	TypeShowPhraseKeyVariables
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
	public unlockUpdate!: () => Promise<unknown>;

	@Action
	public unlock2FA!: (params: TypeUnlock2fa) => Promise<string>;

	@Action
	public createWallet!: (params: TypeFetchUser) => Promise<unknown>;

	@Action
	public unlockWithPassword!: (params: TypeUnlockWithPassword) => Promise<unknown>;

	@Action
	public resetRecoveryMethod!: (params: TypeResetRecovery) => Promise<unknown>;

	@Action
	public exportSeed!: (params: TypeExportPhraseKeyVariables) => Promise<unknown>;

	@Action
	public exportKeystore!: (params: TypeExportPhraseKeyVariables) => Promise<unknown>;

	@Action
	public showPrivateKey!: (params: TypeShowPhraseKeyVariables) => Promise<unknown>;

	@Action
	public showSeedPhrase!: (params: TypeShowPhraseKeyVariables) => Promise<unknown>;

	@Action
	public exportSeedPhrase!: (params: TypeExportPhraseKeyVariables) => Promise<unknown>;

	@Action
	public deleteWalletAccount!: (params: TypeShowPhraseKeyVariables) => Promise<unknown>;

	@Action
	public clearPrivateKey!: () => void;

	@Action
	public clearSeedPhrase!: () => void;

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

	
	roundFormatter(param:any) {
		const price = parseFloat(param);
		const abs = Math.abs(price);
		let round = 0;
		if (10000 > abs && abs >= 10) round = 2;
		else if (10 > abs && abs >= 1) round = 3;
		else if (1 > abs && abs >= 0.1) round = 4;
		else if (0.1 > abs && abs >= 0.01) round = 5;
		else if (0.01 > abs) round = 6;
		return price ? price.toFixed(round) : 0;
	}

	
	formatEthAddress(ethAddress: string) {
		if (!ethAddress) return '';
		if (ethAddress.length <= 11) return ethAddress;
		return ethAddress ? ethAddress.substr(0, 5) + '...' + ethAddress.substr(ethAddress.length - 3) : '';
	}

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

	checkPassword(newValue: string, checkErrors: boolean, oldChecks: any, comparePassword: string, checkRepeatOnly = false) {
		let updatedChecks = checkRepeatOnly ? oldChecks : {
			min: '',
			uppercase: '',
			lowercase: '',
			number: '',
			match: '',
		};

		if (checkErrors) {
			updatedChecks = {
				min: 'fail',
				uppercase: 'fail',
				lowercase: 'fail',
				number: 'fail',
				match: 'fail',
			};
		}

		if (newValue) {
			if (!checkRepeatOnly) {
				if (newValue.length >= 8) {
					updatedChecks.min = 'pass';
				} else if (checkErrors) updatedChecks.min = 'fail';

				if (/[A-Z]/.test(newValue)) {
					updatedChecks.uppercase = 'pass';
				} else if (checkErrors) updatedChecks.uppercase = 'fail';

				if (/[a-z]/.test(newValue)) {
					updatedChecks.lowercase = 'pass';
				} else if (checkErrors) updatedChecks.lowercase = 'fail';

				if (/[0-9]/.test(newValue)) {
					updatedChecks.number = 'pass';
				} else if (checkErrors) updatedChecks.number = 'fail';
			}
			
			if (comparePassword) {
				if(newValue === comparePassword) {
					updatedChecks.match = 'pass';
				} else updatedChecks.match = 'fail';
			} else {
				if (checkErrors) updatedChecks.match = 'fail';
				else updatedChecks.match = '';
			}
		}

		return updatedChecks;
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

	@Action
	public setUsersEmail!: (email: string) => void;
}
