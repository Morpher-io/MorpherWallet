<template>
	<div class="container">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>

		<h2 class="title">Authenticator Unlock</h2>
		<h4 class="subtitle">Please input two FA Authenticator code</h4>
		<form v-on:submit.prevent="validateCode">
			<div class="field" v-if="twoFaRequired.email">
				<label class="label">Email 2FA</label>
				<div class="control">
					<input type="number" min="100000" max="999999" class="input" name="emailCode" placeholder="123456" v-model="emailCode" />
				</div>

				<p class="help">Enter here the Code that we sent you to your inbox!</p>
				<p class="help is-danger" v-if="invalidEmail">
					{{ invalidEmail }}
				</p>
			</div>
			<div class="field" v-if="twoFaRequired.authenticator">
				<label class="label">Authenticator 2FA</label>
				<div class="control">
					<input type="number" class="input" name="authenticatorCode" placeholder="123456" v-model="authenticatorCode" />
				</div>

				<p class="help">Enter here the Code from Google Authenticator!</p>
				<p class="help is-danger" v-if="invalidAuthenticator">
					{{ invalidAuthenticator }}
				</p>
			</div>
			<div class="field is-grouped">
				<div class="layout split first">
					<button class="button is-green" type="submit">
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
	invalidEmail = false;
	invalidAuthenticator = false;

	/**
	 * Process email 2fa authentication
	 */
	async validateCode() {
		this.unlock2FA({ email2FA: this.emailCode, authenticator2FA: this.emailCode })
			.then(() => {
				this.$router.push('/unlock');
			})
			.catch((error) => {
				if(error.indexOf("Mail") !== -1) {
					this.invalidEmail = error;
					return;
				}
				
				console.log(error);
			});
	}
	
	logout() {
		this.logoutWallet();
		this.$router.push('/login');
	}
}
</script>
