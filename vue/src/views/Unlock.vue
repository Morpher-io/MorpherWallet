<template>
	<div class="container">
		<vue-recaptcha
			ref="recaptcha"
			size="invisible"
			:sitekey="recaptchaSiteKey"
			:load-recaptcha-script="true"
			@verify="onCaptchaVerified"
			@error="onCaptchaError"
			@expired="onCaptchaExpired"
			@render="onCaptchaLoaded"
			style="display:none"
		/>
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>

		<h2 class="title">👋 {{ $t('auth.UNLOCK_TITLE') }}</h2>
		<p class="subtitle">{{ $t('auth.UNLOCK_DESCRIPTION') }}</p>

		<div class="user-details settings-data">
			<div class="details">
				<div class="is-flex has-text-left">
					<div ref="userImage" class="jazz-icon" />
					<div class="ml-3">
						<p>{{ walletEmail }}</p>
						<div @click="logout()" class="login-router transition-faster reset-line-height">{{ $t('auth.SWITCH_ACCOUNT') }}</div>
					</div>
				</div>
			</div>
		</div>

		<div class="field">
			<label class="label">{{ $t('common.PASSWORD') }}</label>

			<div class="control">
				<input
					type="password"
					ref="unlock_password"
					class="input"
					name="walletPassword"
					v-model="walletPassword"
					@keypress="handleKeyPress"
				/>
				<div v-if="showRecovery">
					<p class="help is-danger">
						{{ $t('auth.CANNOT_DECRYPT_PASSWORD') }}
						<router-link to="/recovery">{{ $t('auth.RESTORE_ACCOUNT') }}</router-link>
					</p>
				</div>
			</div>
		</div>

		<div class="error" v-if="logonError">
			<p>⚠️ <span v-html="logonError"></span></p>
		</div>

		<button @click="login()" class="button is-green big-button is-login transition-faster mt-5" :disabled="!walletPassword">
			<span class="text">{{ $t('auth.LOGIN') }}</span>
		</button>
		<p class="forgot-password">
			{{ $t('auth.FORGOT_PASSWORD') }}
			<router-link to="/recovery" class="login-router transition-faster"
				><span>{{ $t('auth.RECOVER_YOUR_WALLET') }}</span></router-link
			>
		</p>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import { sha256 } from '../utils/cryptoFunctions';
import jazzicon from '@metamask/jazzicon';
import { getDictionaryValue } from '../utils/dictionary';
import { Recaptcha } from '../mixins/recaptcha';

@Component({})
export default class Unlock extends mixins(Global, Recaptcha) {
	// Component properties
	walletPassword = '';
	walletEmail = this.$store.getters.walletEmail;
	iconSeed = this.$store.getters.iconSeed;
	showRecovery = false;
	logonError = '';

	/**
	 * Cmponent mounted lifestyle hook
	 */
	mounted() {
		// set focus to the password field when the control opens
		window.setTimeout(() => {
			const passwordEmelemt: any = this.$refs.unlock_password;
			if (passwordEmelemt) passwordEmelemt.focus();
		}, 100);

		const iconSeed = localStorage.getItem('iconSeed') || '';
		this.generateImage(iconSeed);
		this.showSpinner(this.$t('loader.LOADING_ACCOUNT').toString());
		// Check if the wallet can be unlocked using the local-storage stored password
		this.unlockWithStoredPassword(this.recaptchaToken)
			.then(result => {
				this.hideSpinner();
				if (result) {
					this.$router.push('/').catch(() => undefined);
				}
			})
			.catch(error => {
				this.hideSpinner();

				if (error && error.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				}
				// error
			});
	}

	/**
	 * Execute the logon
	 */
	async login() {
		// block if unlock is already executing
		if (this.store.loading) {
			return;
		}
		this.logonError = '';
		const password = await sha256(this.walletPassword);
		this.showSpinnerThenAutohide(this.$t('loader.RECOVERY_LOG_IN').toString());
		const recaptchaToken = this.recaptchaToken;

		// Call the fetchUser store action to process the wallet logon
		this.unlockWithPassword({ password, recaptchaToken })
			.then(() => {
				// open root page after logon success
				this.$router.push('/').catch(() => undefined);
			})
			.catch(error => {
				this.hideSpinner();
				if (error.error === 'RECAPTCHA_REQUIRED') {
					this.executeRecaptcha(this.login);
					return;
				}

				if (error && error.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				} else {
					this.logSentryError('Unlock', error.toString(), {});
				}

				// Logon failed
				this.logonError = getDictionaryValue('DECRYPT_FAILED');
			});
	}

	logout() {
		this.logoutWallet();
		//this.$router.push('/login').catch(() => undefined);;
	}

	generateImage(seed: any): void {
		if (!seed) {
			return;
		}

		const ref: any = this.$refs.userImage;
		if (!ref) {
			if (seed) {
				setTimeout(() => {
					this.generateImage(seed);
				}, 100);
			}
			return;
		}
		ref.innerHTML = '';

		const image = jazzicon(32, seed);
		ref.append(image);
	}

	handleKeyPress(e: any) {
		const key = e.which || e.charCode || e.keyCode || 0;

		if (key === 13) {
			this.login();
		}
	}
}
</script>
