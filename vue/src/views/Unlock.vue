<template>
	<div class="container">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>

		<h2 class="title">Login</h2>
		<h4 class="subtitle">Unlock your Morpher Wallet</h4>
		<form v-on:submit.prevent="login">
			<h5>Hi {{ walletEmail }}!</h5>
			Enter the password to unlock your wallet!<br />

			<div class="field">
				<label class="label">Password</label>

				<div class="control">
					<input type="password" class="input" name="walletPassword" v-model="walletPassword" />
					<password v-model="walletPassword" :strength-meter-only="true" :secure-length="8" style="max-width: initial" />
					<p class="help">
						Use a strong Password! It encrypts your Wallet and keeps your Funds secure. It must be at least 8 characters long and include
						one lower-case, one upper-case character and a number.
					</p>

					<div v-if="showRecovery">
						<p class="help is-danger">
							The Password you provided can't be used to de-crypt your wallet.
							<router-link to="/recovery">Do you want to restore your Account?</router-link>
						</p>
					</div>
				</div>
			</div>

			<button class="button is-green big-button is-login transition-faster mt-5" type="submit" data-cy="unlock" :disabled="!walletPassword">
				<span>Unlock</span>
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
import { sha256 } from '../utils/cryptoFunctions';
import Password from 'vue-password-strength-meter';

@Component({
	components: {
		Password
	}
})
export default class Unlock extends mixins(Global) {
	// Component properties
	walletPassword = '';
	walletEmail = this.$store.getters.walletEmail;
	showRecovery = false;

	/**
	 * Cmponent mounted lifestyle hook
	 */
	mounted() {
		this.showSpinner('Loading User...');
		// Check if the wallet can be unlocked using the local-storage stored password
		this.unlockWithStoredPassword()
			.then(result => {
				this.hideSpinner();
				if (result) {
					this.$router.push('/');
				}
			})
			.catch(error => {
				this.hideSpinner();
				console.log(error);
				// error
			});
	}

	/**
	 * Execute the logon
	 */
	async login() {
		const password = await sha256(this.walletPassword);
		this.showSpinnerThenAutohide('Logging in User...');

		// Call the fetchUser store action to process the wallet logon
		this.unlockWithPassword({ password })
			.then(() => {
				// open root page after logon success
				this.router.push('/');
			})
			.catch(error => {
				console.log(error);
				// Logon failed
			});
	}

	logout() {
		this.logoutWallet();
		this.router.push('/login');
	}
}
</script>
