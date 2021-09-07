<template>
	<div>
		<div class="container">
			<h2 class="title">Log In</h2>
			<p class="subtitle">Unlock your crypto wallet.</p>
			<form v-on:submit.prevent="login">
				<div class="field">
					<label class="label">Email</label>
					<div class="control">
						<input type="email" class="input" data-cy="walletEmail" name="walletEmail" v-model="walletEmail" />
					</div>
				</div>

				<div class="field">
					<label class="label">Password</label>

					<div class="control">
						<input type="password" class="input" data-cy="walletPassword" name="walletPassword" v-model="walletPassword" @keydown="checkKeyPress" />
					</div>
				</div>

				<div class="error" v-if="logonError">
					<p data-cy="loginError">
						⚠️ <span v-html="logonError"></span>
						<router-link v-if="showRecovery" to="/recovery" class="login-router transition-faster"><span>Recover your wallet?</span></router-link>
					</p>
				</div>

				<button type="submit" data-cy="submit" class="button is-green big-button is-login transition-faster">
					<span>Log In</span>
				</button>

				<p class="forgot-password">
					Forgot password? <router-link to="/recovery" class="login-router transition-faster"><span>Recover your wallet</span></router-link>
				</p>

				<div class="divider"></div>

				<div class="login-link">
					<span>Don't have a wallet?</span>
					<router-link to="/signup" class="login-router transition-faster">
						<span>
							Sign up
						</span>
					</router-link>
				</div>
			</form>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import Password from 'vue-password-strength-meter';
import { getDictionaryValue } from '../utils/dictionary';

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
	logonError = '';

	/**
	 * Cmponent mounted lifestyle hook
	 */
	mounted() {
		if (this.store.email) {
			this.walletEmail = this.store.email;
		}
		if (this.store.status !== 'invalid password' && this.store.email) {
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
		} else {
			this.unlockUpdate();
		}
	}

	checkKeyPress(e:any) {
		if (e.keyCode === 13) {
        	this.login()
      }
	}

	/**
	 * Execute the logon
	 */
	login() {
		this.logonError = '';
		this.showSpinner('Loading User...');
		this.store.loginComplete = false;
		const email = this.walletEmail;
		const password = this.walletPassword;

		// Call the fetchUser store action to process the wallet logon
		this.fetchUser({ email, password })
			.then(() => {
				if (this.store.twoFaRequired.email || this.store.twoFaRequired.authenticator || this.store.twoFaRequired.needConfirmation) {
					// open 2fa page if 2fa is required
					this.hideSpinner();
					this.$router.push('/2fa');
				} else {
					this.unlockWithStoredPassword()
						.then(() => {
							this.hideSpinner();
							// open root page after logon success
							this.$router.push('/');
						})
						.catch(() => {
							this.hideSpinner();
							this.logonError = getDictionaryValue('DECRYPT_FAILED');
							this.showRecovery = true;
						});
				}
			})
			.catch(error => {
				// Logon failed
				this.hideSpinner();
				if (error !== true && error !== false) {
					if (error.success === false) {
						this.logonError = getDictionaryValue(error.error);
					} else {
						// console.log('Error in login', error);
					}
				}
			});
	}
}
</script>
