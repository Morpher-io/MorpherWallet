<template>
	<div>
		<vue-recaptcha
			ref="recaptcha"
			size="invisible"
			:sitekey="recaptchaSiteKey"
			:load-recaptcha-script="true"
			@verify="onCaptchaVerified"
			@error="onCaptchaError"
			@expired="onCaptchaExpired"
			@render="onCaptchaLoaded"
			style="display: none"
		/>
		<div class="container">
			<h2 data-cy="signUpTitle" class="title">{{ $t('auth.SIGNUP') }}</h2>
			<p data-cy="signUpDescription" class="subtitle">{{ $t('auth.SIGNUP_DESCRIPTION') }}</p>
			<form v-on:submit.prevent="signupExecute" novalidate>
				<div class="field">
					<label class="label">{{ $t('common.EMAIL') }}</label>
					<div class="control">
						<input type="email" class="input" name="walletEmail" data-cy="walletEmail" v-model="walletEmail" />
					</div>
				</div>

				<div class="field">
					<label class="label">{{ $t('common.PASSWORD') }}</label>

					<div class="control">
						<input type="password" class="input password-input" name="walletPassword" data-cy="walletPassword" v-model="walletPassword" />
						<password v-model="walletPassword" :strength-meter-only="true" :secure-length="8" style="max-width: initial" />
						<div class="password-help">
							<p>{{ $t('password.REQUIREMENTS') }}</p>
							<ul class="items">
								<li
									:class="{
										done: passwordChecks.min === 'pass',
										fail: passwordChecks.min === 'fail'
									}"
								>
									{{ $t('password.MIN_CHARACTERS') }}
								</li>
								<li
									:class="{
										done: passwordChecks.lowercase === 'pass',
										fail: passwordChecks.lowercase === 'fail'
									}"
								>
									{{ $t('password.LOWERCASE_LETTER') }}
								</li>
								<li
									:class="{
										done: passwordChecks.uppercase === 'pass',
										fail: passwordChecks.uppercase === 'fail'
									}"
								>
									{{ $t('password.UPPERCASE_LETTER') }}
								</li>
								<li
									:class="{
										done: passwordChecks.number === 'pass',
										fail: passwordChecks.number === 'fail'
									}"
								>
									{{ $t('password.NUMBER') }}
								</li>
								<li
									:class="{
										done: passwordChecks.match === 'pass',
										fail: passwordChecks.match === 'fail'
									}"
								>
									{{ $t('password.PASSWORD_MATCH') }}
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="field">
					<label class="label">{{ $t('common.CONFIRM_PASSWORD') }}</label>
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

				<div class="error" v-if="logonError">
					<p>⚠️ <span v-html="logonError"></span></p>
				</div>

				<button type="submit" data-cy="createNewWallet" class="button is-green big-button is-login transition-faster">
					<span class="text">{{ $t('auth.CREATE_WALLET') }}</span>
				</button>

				<div class="divider"></div>

				<div class="login-link">
					<span>{{ $t('auth.ALREADY_HAVE_WALLET') }}</span>
					<router-link to="/login" class="login-router transition-faster">
						<span data-cy="logInButton">
							{{ $t('auth.LOGIN') }}
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
import { Recaptcha } from '../mixins/recaptcha';

import { Watch } from 'vue-property-decorator';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		Password
	}
})
export default class Signup extends mixins(Global, Recaptcha) {
	// properties
	walletEmail = '';
	walletPassword = '';
	walletPasswordRepeat = '';
	signup = false;
	logonError = '';
	passwordChecks: any = {
		min: '',
		uppercase: '',
		lowercase: '',
		number: '',
		match: ''
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
		if (!this.recaptchaToken && (!localStorage.getItem('recaptcha_date') || Number(localStorage.getItem('recaptcha_date')) < Date.now() - (1000 * 60 * 8))) return this.executeRecaptcha(this.signupExecute);

		// block if signup is already executing
		if (this.store.loading) {
			return;
		}
		if (e) e.preventDefault();
		this.logonError = '';

		this.passwordChecks = this.checkPassword(this.walletPassword, true, this.passwordChecks, this.walletPasswordRepeat);

		if (Object.keys(this.passwordChecks).some((value: string) => this.passwordChecks[value] !== 'pass')) {
			return;
		}

		/**
		 * Validating Email
		 */
		const emailMessage = await validateInput('email', this.walletEmail);
		if (emailMessage) {
			this.hideSpinner();
			this.logonError = emailMessage;
			return;
		}

		/**
		 * Validating Password
		 */
		const passwordMessage = await validateInput('password', this.walletPassword);
		if (passwordMessage) {
			this.hideSpinner();
			this.logonError = passwordMessage;
			return;
		}

		const email = this.walletEmail;

		const recaptchaToken = this.recaptchaToken;
		this.showSpinner('Creating Wallet...');
		this.createWallet({ email, password: this.walletPassword, recaptchaToken })
			.then(() => {
				this.hideSpinner();
				if (this.store.twoFaRequired.email || this.store.twoFaRequired.authenticator || this.store.twoFaRequired.needConfirmation) {
					// open 2fa page if 2fa is required
					this.$router.push('/2fa').catch(() => undefined);
				} else {
					this.$router.push('/').catch(() => undefined);
				}
			})
			.catch((error) => {
				this.hideSpinner();
				if (error.error === 'RECAPTCHA_REQUIRED') {
					this.executeRecaptcha(this.signupExecute);
					return;
				}

				if (error && error.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				} else {
					this.logSentryError('createWallet', error.toString(), {});
				}

				this.logonError = getDictionaryValue(error.toString());
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
