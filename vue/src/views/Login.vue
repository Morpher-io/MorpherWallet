<template>
	<div>
		<div class="container">
			<h2 data-cy="logInTitle" class="title">Log In</h2>
			<p data-cy="logInDescription" class="subtitle">Unlock your crypto wallet.</p>
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
						<input type="password" class="input" data-cy="walletPassword" name="walletPassword" v-model="walletPassword" />
					</div>
				</div>

				<div class="error" v-if="logonError">
					<p data-cy="loginError">
						⚠️ <span v-html="logonError"></span>
						<router-link v-if="showRecovery" to="/recovery" class="login-router transition-faster"
							><span class="ml-1">Recover your wallet?</span></router-link
						>
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
						<span data-cy="signUpButton" >
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
						this.$router.push('/').catch(() => undefined);;
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

		if (this.store.status === 'invalid password') {
			this.logonError = getDictionaryValue('DECRYPT_FAILED');
			if (this.walletEmail) this.loginErrorReturn(this.walletEmail, 'INVALID_PASSWORD');
			this.showRecovery = true;
		}
	}

	async loginErrorReturn(email: string, err: any) {
		if (this.isIframe()) {
			if (this.store.connection && this.store.connection !== null) {
				const promise = this.store.connection.promise;

				(await promise).onLoginError(email, err);
			}
		}
	}

	/**
	 * Execute the logon
	 */
	login() {
		// block if login is already executing
		if (this.store.loading) {
			return;
		}
		this.logonError = '';
		this.showSpinner('Loading account...');
		this.store.loginComplete = false;
		const email = this.walletEmail;
		const password = this.walletPassword;

		// Call the fetchUser store action to process the wallet logon
		this.fetchUser({ email, password })
			.then(() => {
				this.hideSpinner();
				if (this.store.twoFaRequired.email || this.store.twoFaRequired.authenticator || this.store.twoFaRequired.needConfirmation) {
					// open 2fa page if 2fa is required
					this.$router.push('/2fa').catch(() => undefined);;
				} else {
					this.unlockWithStoredPassword()
						.then(() => {
							// open root page after logon success
							this.$router.push('/').catch(() => undefined);;
						})
						.catch(() => {
							this.logonError = getDictionaryValue('DECRYPT_FAILED');
							this.loginErrorReturn(email, 'INVALID_PASSWORD');
							this.showRecovery = true;
						});
				}
			})
			.catch(error => {
				// Logon failed
				this.hideSpinner();

				if (error && error.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				} else {
					this.logSentryError('fetchUser', error.toString(), { email, password })
				}

				if (error !== true && error !== false) {
					if (error.success === false) {
						this.loginErrorReturn(email, error.error);
						this.logonError = getDictionaryValue(error.error);
					} else {
						this.loginErrorReturn(email, error);
						// console.log('Error in login', error);
					}
				}
			});
	}
}
</script>
