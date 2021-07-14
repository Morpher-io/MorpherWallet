<template>
	<div class="container">
		<h2 v-if="twoFaRequired.email" class="title">2-Step Verification</h2>
		<p v-if="twoFaRequired.email && !twoFaRequired.authenticator" class="subtitle">Please enter the code we sent to your email.
		</p>
		<p v-else-if="twoFaRequired.authenticator && !twoFaRequired.email" class="subtitle">Please input two FA Authenticator code.</p>
		<p v-else class="subtitle">Please input both code we sent you over the email and two FA Authenticator code.</p>
		<form v-on:submit.prevent="validateCode">
			<div class="field" v-if="twoFaRequired.email">
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
					/>
				</div>
				<p class="help is-danger" v-if="invalidEmail">
					{{ invalidEmail }}
				</p>
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
						v-model="authenticatorCode"
					/>
				</div>
				<p class="help is-danger" v-if="invalidAuthenticator">
					{{ invalidAuthenticator }}
				</p>
			</div>

			<div class="field" v-if="showError">
				<label class="label is-danger">Login Error</label>
				<p class="help is-danger">
					{{ logonError }}
				</p>
			</div>

			<button class="button is-green big-button is-login transition-faster mt-5" type="submit" data-cy="unlock">
				<span>Submit</span>
			</button>
			<button class="button mt-3" v-on:click="logout()">
				<span>Cancel</span>
			</button>
		</form>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';

@Component
export default class TwoFA extends mixins(Global) {
	// Component properties
	emailCode = '';
	authenticatorCode = '';
	showRecovery = false;
	showError = false;
	logonError = '';
	invalidEmail = false;
	invalidAuthenticator = false;

	/**
	 * Process email 2fa authentication
	 */
	async validateCode() {
		this.showSpinner('Validating 2FA codes...');
		this.showError = false;
		this.unlock2FA({ email2FA: this.emailCode, authenticator2FA: this.authenticatorCode })
			.then(nextroute => {
				this.hideSpinner();
				this.router.push(nextroute);
			})
			.catch(error => {
				this.hideSpinner();
				if (error.toString() === 'invalid password') {
					this.store.status = 'invalid password';
					this.router.push('/login');
				}
				this.showError = true;
				this.logonError = error.toString();

				if (error.indexOf('Mail') !== -1) {
					this.invalidEmail = error;
					return;
				}
			});
	}

	logout() {
		this.logoutWallet();
		this.router.push('/login');
	}
}
</script>
