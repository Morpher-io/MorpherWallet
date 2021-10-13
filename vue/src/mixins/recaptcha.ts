// global mixins
import Vue from 'vue';
import Component from 'vue-class-component';
import * as Sentry from '@sentry/vue';
import Spinner from '../components/loading-spinner/Spinner.vue';
import { Action } from 'vuex-class';
import {
	TypeFetchUser,
	TypeUnlock2fa,
	TypeUnlockWithPassword,
	TypeChangePassword,
	TypeChangeEmail,
	Type2FAUpdateParams,
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

import VueRecaptcha from 'vue-recaptcha';

/**
 * Mixin used for all components
 */
@Component({
	components: {
		'vue-recaptcha': VueRecaptcha
	},
	computed: {
		...mapState({
			connection: (state: any) => state.connection,
			status: (state: any) => state.status,
			twoFaRequired: (state: any) => state.twoFaRequired
		})
	}
})
export class Recaptcha extends Vue {
	recaptchaSiteKey = process.env.VUE_APP_RECAPTCHA;
	recaptchaToken = '';
	recaptchaMessage = '';
	recaptchaLoaded = false;
	recaptchaExecuting = false;
	racaptchaCallback: any = null;


	onCaptchaVerified(data:any) {
		this.recaptchaToken = data;
		this.racaptchaCallback();
	}

	onCaptchaError(data:any) {
		console.log('onCaptchaError', data)
	}	

	onCaptchaExpired(data:any) {
		console.log('onCaptchaExpired', data)
	}	

	onCaptchaLoaded(data:any) {
		this.recaptchaLoaded = true;
		
	}	
	
	executeRecaptcha(callback:any) {
		this.racaptchaCallback = callback;
		this.recaptchaExecuting = true;
		if (this.recaptchaLoaded) {
			if (this.$refs.recaptcha) {
				const recapObj:any = this.$refs.recaptcha;
				recapObj.execute();
			}
		} else {
			setTimeout(() => {
				this.executeRecaptcha(this.racaptchaCallback);
			}, 500);
		}
	}
}

