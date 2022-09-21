<template>
	<div>
		<vue-recaptcha ref="recaptcha" size="invisible" :sitekey="recaptchaSiteKey" :load-recaptcha-script="true"
			@verify="onCaptchaVerified" @error="onCaptchaError" @expired="onCaptchaExpired" @render="onCaptchaLoaded"
			style="display: none" />
		<div class="container">
			<h2 data-cy="signUpTitle" class="title">{{  $t('auth.SIGNUP')  }}</h2>
			<p data-cy="signUpDescription" class="subtitle">{{  $t('auth.SIGNUP_DESCRIPTION')  }}</p>

			<!-- Pick signing method -->
			<div v-if="!passwordSignin">
				<LoginApple @processMethod="processMethod" :signIn="true"></LoginApple>
				<LoginGoogle @processMethod="processMethod" :signIn="true"></LoginGoogle>

				<button class="button is-grey big-button outlined-button is-thick facebook-button transition-faster"
					@click="passwordSignin = true" data-cy="vkontakteButton">
					<span class="icon img">
						<img src="@/assets/img/email_icon.svg" alt="Email Icon" />
					</span>
					<span>Sign up Using Email</span>
				</button>
			</div>
			<!-- Signin with email/password -->
			<div v-else>
				<div class="field">
					<label class="label">{{  $t('common.EMAIL')  }}</label>
					<div class="control">
						<input ref="login_email"  @keydown="checkKeyPress" type="email" class="input" name="walletEmail" data-cy="walletEmail"
							v-model="walletEmail" />
					</div>
				</div>

				<div class="field">
					<label class="label">{{  $t('common.PASSWORD')  }}</label>

					<div class="control">
						<input ref="login_password"  @keydown="checkKeyPress" type="password" class="input password-input" name="walletPassword"
							data-cy="walletPassword" v-model="walletPassword" />
						<password v-model="walletPassword" :strength-meter-only="true" :secure-length="8"
							style="max-width: initial" />
						<div class="password-help">
							<p>{{  $t('password.REQUIREMENTS')  }}</p>
							<ul class="items">
								<li :class="{
									done: passwordChecks.min === 'pass',
									fail: passwordChecks.min === 'fail'
								}">
									{{  $t('password.MIN_CHARACTERS')  }}
								</li>
								<li :class="{
									done: passwordChecks.lowercase === 'pass',
									fail: passwordChecks.lowercase === 'fail'
								}">
									{{  $t('password.LOWERCASE_LETTER')  }}
								</li>
								<li :class="{
									done: passwordChecks.uppercase === 'pass',
									fail: passwordChecks.uppercase === 'fail'
								}">
									{{  $t('password.UPPERCASE_LETTER')  }}
								</li>
								<li :class="{
									done: passwordChecks.number === 'pass',
									fail: passwordChecks.number === 'fail'
								}">
									{{  $t('password.NUMBER')  }}
								</li>
								<li :class="{
									done: passwordChecks.match === 'pass',
									fail: passwordChecks.match === 'fail'
								}">
									{{  $t('password.PASSWORD_MATCH')  }}
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="field">
					<label class="label">{{  $t('common.CONFIRM_PASSWORD')  }}</label>
					<div class="control">
						<input type="password" ref="login_password_repeat"  @keydown="checkKeyPress" class="input" name="walletPasswordRepeat" data-cy="walletPasswordRepeat"
							v-model="walletPasswordRepeat" />
					</div>
				</div>

				<div class="error" v-if="logonError">
					<p>⚠️ <span v-html="logonError"></span></p>
				</div>

				<button type="submit" @click="signupExecute" data-cy="createNewWallet"
					class="button is-green big-button is-login transition-faster">
					<span class="text">{{  $t('auth.CREATE_WALLET')  }}</span>
				</button>
			</div>

			<div class="divider"></div>

			<div class="login-link">
				<span>{{  $t('auth.ALREADY_HAVE_WALLET')  }}</span>
				<router-link to="/login" class="login-router transition-faster">
					<span data-cy="logInButton">
						{{  $t('auth.LOGIN')  }}
					</span>
				</router-link>
			</div>
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
import LoginGoogle from '../components/LoginGoogle.vue';
import LoginApple from '../components/LoginApple.vue';
import { sha256 } from '../utils/cryptoFunctions';

@Component({
	components: {
		Password, LoginApple, LoginGoogle
	}
})
export default class Signup extends mixins(Global, Recaptcha) {
	// properties
	walletEmail = '';
	walletPassword = '';
	walletPasswordRepeat = '';
	signup = false;
	logonError = '';
	loginUser: any = {};
	passwordSignin = false;
	passwordChecks: any = {
		min: '',
		uppercase: '',
		lowercase: '',
		number: '',
		match: ''
	};

	mounted() {

		this.executeHiddenLogin()

	}

	@Watch('walletPassword')
	handlePasswordChange(newValue: string) {
		this.passwordChecks = this.checkPassword(newValue, false, this.passwordChecks, this.walletPasswordRepeat);
	}

	@Watch('walletPasswordRepeat')
	handlePasswordRepeatChange(newValue: string) {
		this.passwordChecks = this.checkPassword(this.walletPassword, false, this.passwordChecks, newValue, true);
	}

	@Watch('store.hiddenLogin')
	onPropertyChanged(value: any) {
		this.executeHiddenLogin()
	}

	executeHiddenLogin() {
		try {
			
			 if (this.store.hiddenLogin && this.store.hiddenLogin.walletEmail && this.store.hiddenLogin.walletPassword && this.store.hiddenLogin.type == 'email') {
				this.passwordSignin = true;
				this.walletEmail = this.store.hiddenLogin.walletEmail;
				this.walletPassword = this.store.hiddenLogin.walletPassword;
				console.log(this.store.hiddenLogin)
				this.walletPasswordRepeat = this.store.hiddenLogin.walletPasswordRepeat;
				this.signupExecute(false);
			} else if (this.store.hiddenLogin && this.store.hiddenLogin.type && this.store.hiddenLogin.type == 'google') {
				this.loginUser = this.store.hiddenLogin.loginUser;
				this.signupExecute(false);

			} else if (this.store.hiddenLogin && this.store.hiddenLogin.type && this.store.hiddenLogin.type == 'apple') {
				this.loginUser = this.store.hiddenLogin.loginUser;
				this.signupExecute(false);

			}
		} catch (err) {
			console.log('error processing hidden login', err)
			
		}
		
		

	}

	processMethod(data: any): void {
		this.logonError = '';



		if (data.success) {

			this.loginUser = data;

			this.signupExecute(false);

		} else {
			if (data.error === 'popup_closed_by_user') {
				this.logonError = getDictionaryValue('GOOGLE_COOKIES_BLOCKED');
			} else if (data.error === 'google_script_blocked') {
				this.logonError = getDictionaryValue('GOOGLE_SCRIPT_BLOCKED');
			} else {
				this.logonError = data.method + ': ' + getDictionaryValue(data.error);
			}
		}
	}

	checkKeyPress(e: any) {
		if (e.key == 'Enter') {
			
			if (this.walletEmail && this.walletPassword && this.walletPasswordRepeat) {
				this.signupExecute(false)
			} else {
				// set focus to the password field if it is blanck
				if (!this.walletEmail) {
					window.setTimeout(() => {
						const passwordElement: any = this.$refs.login_email;
						if (passwordElement) passwordElement.focus();
					}, 100);
				} else if (!this.walletPassword ) {
					window.setTimeout(() => {
						const passwordElement: any = this.$refs.login_password;
						if (passwordElement) passwordElement.focus();
					}, 100);

				} else if (!this.walletPasswordRepeat ) {
					window.setTimeout(() => {
						const passwordElement: any = this.$refs.login_password_repeat;
						if (passwordElement) passwordElement.focus();
					}, 100);
					
				}
			}
		}
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


		let email = this.walletEmail;
		let password = this.walletPassword
		let recoveryTypeId = 1
		let token = '';
		let fetch_key = email;

		if (!this.passwordSignin && this.loginUser && this.loginUser.userID && this.loginUser.key) {
			fetch_key = this.loginUser.key
			email = this.loginUser.email || this.loginUser.key
			password = this.loginUser.userID;
			recoveryTypeId = this.loginUser.recoveryTypeId;

			token = this.loginUser.token;
		}

		if (recoveryTypeId == 1) {
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
		}

		const recaptchaToken = this.recaptchaToken;


		this.showSpinner('Creating Wallet...');
		this.createWallet({ email, password: password, recaptchaToken, token: token, recoveryTypeId: recoveryTypeId, fetch_key })
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
