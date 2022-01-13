<template>
	<div class="container">
		<vue-recaptcha
			ref="recaptcha"
			size="invisible"
			:sitekey="recaptchaSiteKey"
			:load-recaptcha-script="true"
			@verify="onCaptchaVerified"
			@error="onCaptchaError"
			@expired="onCaptchaExpired"
			@render="onCaptchaLoaded"
			style="display: none"
		/>
		<img
			v-if="(twoFaRequired.email || twoFaRequired.needConfirmation) && !twoFaRequired.authenticator"
			src="@/assets/img/email_verification.svg"
			alt="Email 2FA image"
			class="mb-3"
		/>
		<img v-if="twoFaRequired.authenticator" src="@/assets/img/authenticator.svg" alt="Phone authenticator image" class="mb-3" />
		<h2 data-cy="verificationTitle" class="title">{{ $t('settings.2_STEP_VERIFICATION') }}</h2>
		<p v-if="(twoFaRequired.email || twoFaRequired.needConfirmation) && !twoFaRequired.authenticator" class="subtitle">
			{{ $t('2fa.ENTER_EMAIL_CODE') }}
		</p>
		<p v-if="twoFaRequired.authenticator && !twoFaRequired.email && !twoFaRequired.needConfirmation" class="subtitle">
			{{ $t('2fa.ENTER_AUTH_CODE') }}
		</p>
		<p v-if="twoFaRequired.email && twoFaRequired.authenticator" class="subtitle">
			{{ $t('2fa.ENTER_BOTH_CODES') }}
		</p>
		<form v-on:submit.prevent="validateCode" novalidate>
			<div class="field" v-if="twoFaRequired.email || twoFaRequired.needConfirmation">
				<label class="label">{{ $t('2fa.EMAIL_CODE') }}</label>
				<div class="control">
					<input
						type="number"
						min="100000"
						max="999999"
						class="input"
						name="emailCode"
						id="emailCode"
						data-cy="emailCode"
						v-model="emailCode"
						ref="email_code"
					/>
				</div>
			</div>
			<div class="field" v-if="twoFaRequired.authenticator">
				<label class="label">{{ $t('2fa.AUTH_CODE') }}</label>
				<div class="control">
					<input
						type="number"
						class="input"
						name="authenticatorCode"
						id="authenticatorCode"
						data-cy="authenticatorCode"
						ref="auth_code"
						v-model="authenticatorCode"
					/>
				</div>
			</div>

			<div class="error" v-if="logonError">
				<p>⚠️ <span v-html="logonError"></span></p>
			</div>

			<button class="button is-green big-button is-login transition-faster mt-5" type="submit" data-cy="unlock">
				<span class="text">{{ $t('common.SUBMIT') }}</span>
			</button>

			<button v-on:click="logout()" tag="button" class="button is-ghost is-blue big-button medium-text transition-faster">
				<span class="text">{{ $t('common.CANCEL') }}</span>
			</button>
		</form>

		<p class="mt-5 transition-faster">
			{{ $t('2fa.HAVING_PROBLEMS') }}
			<a
				href="https://support.morpher.com/en/article/2fa-2-step-verification-troubleshooting-ejmssf/"
				target="__blank"
				class="login-router"
				>{{ $t('2fa.2_STEP_SUPPORT') }}</a
			>
		</p>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import { Watch } from 'vue-property-decorator';
import { getDictionaryValue } from '../utils/dictionary';
import { Recaptcha } from '../mixins/recaptcha';

@Component
export default class TwoFA extends mixins(Global, Recaptcha) {
	// Component properties
	emailCode = '';
	authenticatorCode = '';
	showRecovery = false;
	logonError = '';

	mounted() {
		window.setTimeout(() => {
			const email: any = this.$refs.email_code;
			const auth: any = this.$refs.auth_code;
			if (email) email.focus();
			else if (auth) auth.focus();
		}, 100);
		//
	}

	@Watch('authenticatorCode')
	authenticatorCodeChanged() {
		if (this.authenticatorCode.length === 6) {
			this.validateCode();
		}
	}
	/**
	 * Process email 2fa authentication
	 */
	async validateCode() {
		// block if 2fa validation is already executing
		if (this.store.loading) {
			return;
		}
		this.logonError = '';
		this.showSpinner(this.$t('loader.VALIDATING_CODE').toString());
		this.unlock2FA({ email2FA: this.emailCode, authenticator2FA: this.authenticatorCode, recaptchaToken: this.recaptchaToken })
			.then((nextroute) => {
				this.hideSpinner();
				this.router.push(nextroute).catch(() => undefined);
			})
			.catch((error) => {
				this.hideSpinner();
				if (error.error === 'RECAPTCHA_REQUIRED') {
					this.executeRecaptcha(this.validateCode);
					return;
				}

				if (error && error.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				}

				if (error.toString() === 'invalid password') {
					this.store.status = 'invalid password';
					this.router.push('/login').catch(() => undefined);
				}
				this.logonError = getDictionaryValue(error.toString());
			});
	}

	logout() {
		this.logoutWallet();
		//this.router.push('/login').catch(() => undefined);;
	}
}
</script>
