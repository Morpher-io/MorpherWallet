<template>
	<div>
		<div class="container">
			<h2 class="title">Sign Up</h2>
			<p class="subtitle">Create a new wallet.</p>
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
						<password v-model="walletPassword" :strength-meter-only="true" :secure-length="8" style="max-width: initial" />
						<div class="password-help">
							<p>Requirements:</p>
							<ul class="items">
								<li :class="{
									'done': passwordChecks.min === 'pass',
									'fail': passwordChecks.min === 'fail'
								}">Min. 8 characters</li>
								<li :class="{
									'done': passwordChecks.lowercase === 'pass',
									'fail': passwordChecks.lowercase === 'fail'
								}">Lowercase letter</li>
								<li :class="{
									'done': passwordChecks.uppercase === 'pass',
									'fail': passwordChecks.uppercase === 'fail'
								}">Uppercase letter</li>
								<li :class="{
									'done': passwordChecks.number === 'pass',
									'fail': passwordChecks.number === 'fail'
								}">Number</li>
								<li :class="{
									'done': passwordChecks.match === 'pass',
									'fail': passwordChecks.match === 'fail'
								}">Passwords match</li>
							</ul>
						</div>

						<p class="help is-danger" v-if="invalidPassword">
							Error: {{ invalidPassword }}
						</p>
					</div>
				</div>
				<div class="field">
					<label class="label">Confirm Password</label>
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

import { Watch } from 'vue-property-decorator';

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
	passwordChecks: any = {
		min: '',
		uppercase: '',
		lowercase: '',
		number: '',
		match: '',
	};

	@Watch('walletPassword')
	handlePasswordChange(newValue: string) {
		this.passwordChecks = this.checkPassword(newValue, false, this.passwordChecks, this.walletPasswordRepeat);
	}

	@Watch('walletPasswordRepeat')
	handlePasswordRepeatChange(newValue: string) {
		this.passwordChecks = this.checkPassword(this.walletPassword, false, this.passwordChecks, newValue, true);
	}

	// Methods
	async signupExecute(e: any) {
		e.preventDefault();
		this.invalidEmail = '';
		this.invalidPassword = '';

		this.passwordChecks = this.checkPassword(this.walletPassword, true, this.passwordChecks, this.walletPasswordRepeat);

		if (Object.keys(this.passwordChecks).some((value: string) => this.passwordChecks[value] !== 'pass')) {
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
