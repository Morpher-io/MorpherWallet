// global mixins
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapState } from 'vuex';
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

	onCaptchaVerified(data: any) {
		localStorage.setItem('recaptcha_date', Date.now().toString())
		this.recaptchaToken = data;
		this.racaptchaCallback();
	}

	onCaptchaError(data: any) {
		console.log('onCaptchaError', data);
	}

	onCaptchaExpired(data: any) {
		//console.log('onCaptchaExpired', data);
	}

	onCaptchaLoaded() {
		this.recaptchaLoaded = true;
	}

	executeRecaptcha(callback: any) {
		this.racaptchaCallback = callback;
		if (this.recaptchaSiteKey == 'DISABLED') {
			this.recaptchaToken = 'disabled';
			this.racaptchaCallback();
			return;
		}
		this.recaptchaExecuting = true;
		if (this.recaptchaLoaded) {
			if (this.$refs.recaptcha) {
				const recapObj: any = this.$refs.recaptcha;
				recapObj.execute();
			}
		} else {
			setTimeout(() => {
				this.executeRecaptcha(this.racaptchaCallback);
			}, 500);
		}
	}
}
