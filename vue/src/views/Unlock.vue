<template>
	<div class="container">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>

		<h2 class="title">Login</h2>
		<h4 class="subtitle">Unlock your Morpher Wallet</h4>
		<form v-on:submit.prevent="login">
			<h5>Hi {{ email }}!</h5>
			Enter the password to unlock your wallet!<br />
			Not you? <a v-on:click="logout()">Logout</a>

			<div class="field">
				<label class="label">Password</label>

				<div class="control">
					<input type="password" class="input" name="walletPassword" placeholder="Strong Password!" v-model="walletPassword" />

					<div v-if="showRecovery">
						<p class="help is-danger">
							The Password you provided can't be used to de-crypt your wallet.
							<router-link to="/recovery">Do you want to restore your Account?</router-link>
						</p>
					</div>
				</div>
			</div>

			<div class="field is-grouped">
				<div class="control is-expanded">
					<button class="button is-primary is-fullwidth" type="submit">
						<span class="icon is-small">
							<i class="fas fa-unlock"></i>
						</span>
						<span> Unlock </span>
					</button>
				</div>
				<div class="control">
					<button class="button is-light" v-on:click="logout()">
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
export default class Unlock extends mixins(Global) {
	// Component properties
	walletPassword = '';
	showRecovery = false;

	/**
	 * Cmponent mounted lifestyle hook
	 */
	mounted() {
		// Check if the wallet can be unlocked using the local-storage stored password
		this.unlockWithStoredPassword()
			.then((result) => {
				if (result) {
					this.$router.push('/');
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	/**
	 * Execute the logon
	 */
	login() {
		const password = this.walletPassword;

		// Call the fetchUser store action to process the wallet logon
		this.unlockWithPassword({ password })
			.then(() => {
				// open root page after logon success
				this.$router.push('/');
			})
			.catch((error) => {
				// Logon failed
				console.log(error);
			});
	}

	logout() {
		this.logoutWallet();
		this.$router.push('/login');
	}
}
</script>
