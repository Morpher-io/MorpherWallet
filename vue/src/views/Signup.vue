<template>
	<div>
		<div class="container">
			<h2 class="title">Sign Up</h2>
			<p class="subtitle">Create a new Wallet</p>
			<form v-on:submit.prevent="signupExecute">
				<div class="field">
					<label class="label">Email</label>
					<div class="control">
						<input
							type="email"
							class="input"
							name="walletEmail"
							data-cy="walletEmail"
							v-model="walletEmail"
						/>
					</div>

					<!-- <p class="help">Use this Email-Address for Wallet Recovery</p> -->
					<p class="help is-danger" v-if="invalidEmail">
						Error: {{ invalidEmail }}
					</p>
				</div>

				<div class="field">
					<label class="label">Password</label>

					<div class="control">
						<input
							type="password"
							class="input password-input"
							name="walletPassword"
							data-cy="walletPassword"
							v-model="walletPassword"
						/>
						<password v-model="walletPassword" :strength-meter-only="true" :secure-length="8" style="max-width: initial; margin-top: -8px" />
						<p class="help">
							Please choose a strong password with at least: 8 characters, 1 lowercase letter, 1 uppercase letter, and 1 number.
						</p>

						<p class="help is-danger" v-if="invalidPassword">
							Error: {{ invalidPassword }}
						</p>
					</div>
				</div>
				<div class="field">
					<label class="label">Repeat Password</label>
					<div class="control">
						<input
							type="password"
							class="input"
							name="walletPasswordRepeat"
							data-cy="walletPasswordRepeat"
							v-model="walletPasswordRepeat"
						/>
					</div>
				</div>

				<button type="submit" data-cy="createNewWallet" class="button is-green big-button is-login transition-faster">
					<span>Create Wallet</span>
				</button>

				<div class="divider"></div>

				<div class="subtitle login-link">
					<span>Already have a wallet?</span>
					<router-link to="/login" class="login-router">
						<span>
							Log In
							<span class="icon is-small">
								<i class="fas fa-chevron-right"></i>
							</span>
						</span>
					</router-link>
				</div>
			</form>
		</div>
	</div>
</template>

<script lang="ts">
import Password from 'vue-password-strength-meter';
import { validateInput } from '../utils/backupRestore';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';

@Component({
	components: {
		Password
	}
})
export default class Signup extends mixins(Global) {
	// properties
	walletEmail = '';
	walletPassword = '';
	walletPasswordRepeat = '';
	signup = false;
	invalidEmail = '';
	invalidPassword = '';

	// Methods
	async signupExecute(e: any) {
		e.preventDefault();
		this.invalidEmail = '';
		this.invalidPassword = '';

		if (this.walletPassword != this.walletPasswordRepeat) {
			this.invalidPassword = 'The passwords are not the identical, please repeat the password';
			return;
		}

		/**
		 * Validating Email
		 */
		this.showSpinner('Validating Email...');
		const emailMessage = await validateInput('email', this.walletEmail);
		if (emailMessage) {
			this.hideSpinner();
			this.invalidEmail = emailMessage;
			return;
		}

		/**
		 * Validating Password
		 */

		this.showSpinner('Validating Password...');
		const passwordMessage = await validateInput('password', this.walletPassword);
		if (passwordMessage) {
			this.hideSpinner();
			this.invalidPassword = passwordMessage;
			return;
		}

		const email = this.walletEmail;

		this.showSpinner('Creating Wallet...');
		this.createWallet({ email, password: this.walletPassword })
			.then(() => {
				this.hideSpinner();
				if (this.store.twoFaRequired.email || this.store.twoFaRequired.authenticator || this.store.twoFaRequired.needConfirmation) {
					// open 2fa page if 2fa is required
					this.$router.push('/2fa');
				} else {
					this.$router.push('/');
				}
			})
			.catch(e => {
				this.hideSpinner();
				this.invalidEmail = e.toString();
			});
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
