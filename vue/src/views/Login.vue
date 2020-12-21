<template>
	<div class="container">
		<h2 class="title">Wallet Login</h2>
		<h4 class="subtitle">Unlock your Morpher Wallet</h4>
		<form v-on:submit.prevent="login">
			<div class="field">
				<label class="label">Email</label>
				<div class="control">
					<input type="email" class="input" name="walletEmail" placeholder="example@example.com" v-model="walletEmail" />
				</div>
			</div>

			<div class="field">
				<label class="label">Password</label>

				<div class="control">
					<input type="password" class="input" name="walletPassword" placeholder="Strong Password!" v-model="walletPassword" />
					<password v-model="walletPassword" :strength-meter-only="true" :secure-length="8" style="max-width: initial; margin-top: -8px" />
					<p class="help">
						Use a strong Password! It encrypts your Wallet and keeps your Funds secure. It must be at least 8 characters long and include
						one lower-case, one upper-case character and a number.
					</p>

					<div v-if="store.status === 'invalid password' || showRecovery == true">
						<p class="help is-danger">
							The Password you provided can't be used to de-crypt your wallet.
							<router-link to="/recovery">Do you want to restore your Account?</router-link>
						</p>
					</div>
				</div>
			</div>

			<div class="field" v-if="showError">
				<label class="label is-danger">Login Error</label>
				<p class="help is-danger">
					{{ logonError }}
				</p>
			</div>

			<div class="field">
				<div class="layout split first">
					<button type="submit" class="button is-green">
						<span class="icon is-small">
							<i class="fas fa-unlock"></i>
						</span>
						<span> Unlock </span>
					</button>
				</div>
				<div class="layout split second">
					<router-link to="/signup" tag="button" class="button is-grey">
						<span class="icon is-small">
							<i class="far fa-file"></i>
						</span>

						<span> Create new Wallet </span>
					</router-link>
				</div>
			</div>
		</form>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import Password from "vue-password-strength-meter";

@Component({
	components: {
		Password
	}
})
export default class Login extends mixins(Global) {
	// Component properties
	walletEmail = '';
	walletPassword = '';
	showRecovery = false;
	showError = false;
	logonError = '';

	/**
	 * Cmponent mounted lifestyle hook
	 */
	mounted() {
		if (this.store.email) {
			this.walletEmail = this.store.email;
		}
		if (this.store.status !== 'invalid password') {
			// Check if the wallet can be unlocked using the local-storage stored password
			this.unlockWithStoredPassword()
				.then(result => {
					if (result) {
						this.$router.push('/');
					}
				})
				.catch(error => {
					if (error !== true && error !== false) {
						// console.log('Error in unlock', error);
					}
				});
		}
	}

	/**
	 * Execute the logon
	 */
	login() {
		this.showError = false;
		this.updateLoading({ message: 'Loading user...' });
		this.store.loginComplete = false;
		const email = this.walletEmail;
		const password = this.walletPassword;

		// Call the fetchUser store action to process the wallet logon
		this.fetchUser({ email, password })
			.then(() => {
				if (this.store.twoFaRequired.email || this.store.twoFaRequired.authenticator) {
					// open 2fa page if 2fa is required
					this.updateLoading({ message: '' });
					this.$router.push('/2fa');
				} else {
					this.unlockWithStoredPassword()
						.then(() => {
							this.updateLoading({ message: '' });
							// open root page after logon success
							this.$router.push('/');
						})
						.catch(() => {
							this.updateLoading({ message: '' });
							this.showRecovery = true;
						});
				}
			})
			.catch(error => {
				// Logon failed
				this.updateLoading({ message: '' });
				if (error !== true && error !== false) {
					if (error.success === false) {
						this.showError = true;
						this.logonError = error.error;
					} else {
						// console.log('Error in login', error);
					}
				}
			});
	}
}
</script>
