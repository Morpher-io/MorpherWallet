<template>
	<div class="container">
		<h2 class="title">Authenticator Unlock</h2>
		<h4 class="subtitle">Please input two FA Authenticator code</h4>
		<form v-on:submit.prevent="validateCode">
			<div class="field" v-if="twoFaRequired.email || twoFaRequired.needConfirmation">
				<label class="label">Email 2FA</label>
				<div class="control">
					<input
						type="number"
						min="100000"
						max="999999"
						class="input"
						name="emailCode"
						id="emailCode"
						data-cy="emailCode"
						placeholder="123456"
						v-model="emailCode"
					/>
				</div>

				<p class="help">Enter here the Code that we sent you to your inbox!</p>
				<p class="help is-danger" v-if="invalidEmail">
					{{ invalidEmail }}
				</p>
			</div>
			<div class="field" v-if="twoFaRequired.authenticator">
				<label class="label">Authenticator 2FA</label>
				<div class="control">
					<input
						type="number"
						class="input"
						name="authenticatorCode"
						id="authenticatorCode"
						data-cy="authenticatorCode"
						placeholder="123456"
						v-model="authenticatorCode"
					/>
				</div>

				<p class="help">Enter here the Code from Google Authenticator!</p>
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
			<div class="field is-grouped">
				<div class="layout split first">
					<button class="button is-green" type="submit" data-cy="unlock">
						<span class="icon is-small">
							<i class="far fa-file"></i>
						</span>
						<span> Unlock </span>
					</button>
				</div>
				<div class="layout split second">
					<button class="button is-grey" v-on:click="logout()">
						<span class="icon is-small">
							<i class="far fa-file"></i>
						</span>

						<span> Log Out </span>
					</button>
				</div>
			</div>
		</form>
		<br />
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
