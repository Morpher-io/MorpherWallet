<template>
	<div class="container">
		<img
			v-if="(twoFaRequired.email || twoFaRequired.needConfirmation) && !twoFaRequired.authenticator"
			src="@/assets/img/email_verification.svg"
			alt="Email 2FA image"
			class="mb-3"
		/>
		<img v-if="twoFaRequired.authenticator" src="@/assets/img/authenticator.svg" alt="Phone authenticator image" class="mb-3" />
		<h2 class="title">2-Step Verification</h2>
		<p v-if="(twoFaRequired.email || twoFaRequired.needConfirmation) && !twoFaRequired.authenticator" class="subtitle">
			Please enter the code we sent to your email.
		</p>
		<p v-if="twoFaRequired.authenticator && !twoFaRequired.email && !twoFaRequired.needConfirmation" class="subtitle">
			Please enter the code from your authenticator app.
		</p>
		<p v-if="twoFaRequired.email && twoFaRequired.authenticator" class="subtitle">
			Please input both code we sent you over the email and two FA Authenticator code.
		</p>
		<form v-on:submit.prevent="validateCode" novalidate>
			<div class="field" v-if="twoFaRequired.email || twoFaRequired.needConfirmation">
				<label class="label">Email Code</label>
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
				<label class="label">Authenticator Code</label>
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
				<span>Submit</span>
			</button>

			<button v-on:click="logout()" tag="button" class="button is-ghost is-blue big-button medium-text transition-faster">
				<span>Cancel</span>
			</button>
		</form>

		<p class="mt-5 transition-faster">
			Having problems?
			<a href="https://support.morpher.com/en/article/2fa-2-step-verification-troubleshooting-ejmssf/" target="__blank" class="login-router"
				>2-Step Support</a
			>
		</p>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import { Watch } from 'vue-property-decorator';
import { getDictionaryValue } from '../utils/dictionary';

@Component
export default class TwoFA extends mixins(Global) {
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
		this.logonError = '';
		this.showSpinner('Validating code...');
		this.unlock2FA({ email2FA: this.emailCode, authenticator2FA: this.authenticatorCode })
			.then(nextroute => {
				this.hideSpinner();
				this.router.push(nextroute);
			})
			.catch(error => {
				this.hideSpinner();

				if (error && error.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				}

				if (error.toString() === 'invalid password') {
					this.store.status = 'invalid password';
					this.router.push('/login');
				}
				this.logonError = getDictionaryValue(error.toString());
			});
	}

	logout() {
		this.logoutWallet();
		this.router.push('/login');
	}
}
</script>
