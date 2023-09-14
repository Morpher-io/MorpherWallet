<template>
	<div>
		<div v-if="currentPage === 0">
			<div v-if="store.email" class="container">
				<img src="@/assets/img/recover_wallet.svg" :alt="$t('images.RECOVER_WALLET')" class="mb-3" />
				<h2 class="title">{{ $t('recovery.RECOVERY_TITLE') }}</h2>
				<p class="subtitle">{{ $t('recovery.RECOVERY_DESCRIPTION') }}</p>

				<div class="error alert warning is-size-7" v-if="logonError">
					<p data-cy="loginError">⚠️ <span v-html="logonError || '&nbsp;'"></span></p>
					<a
						v-if="showMore"
						href="https://support.morpher.com/en/article/recovering-your-wallet-forgot-password-snvhxu/"
						target="__blank"
						class="login-router transition-faster"
						><span>{{ $t('common.LEARN_MORE') }}</span></a
					>
				</div>
				
				<div class="field is-grouped">
					<RecoverWalletGoogle @setPassword="setPassword"></RecoverWalletGoogle>
				</div>
				<div class="field is-grouped">
					<RecoverWalletApple @setPassword="setPassword"></RecoverWalletApple>
				</div>				
				<div class="field is-grouped">
					<RecoverWalletFacebook @setPassword="setPassword"></RecoverWalletFacebook>
				</div>
				<div class="field is-grouped">
					<RecoverWalletVkontakte @setPassword="setPassword"></RecoverWalletVkontakte>
				</div>

				<router-link to="/login">
					<button class="button is-ghost is-blue big-button medium-text transition-faster">
						<span>{{ $t('common.CANCEL') }}</span>
					</button>
				</router-link>

				<p class="is-size-7 mt-5 transition-faster">
					{{ $t('recovery.RECOVERY_NEED_HELP') }}&nbsp;
					<a
						href="https://support.morpher.com/en/article/recovering-your-wallet-forgot-password-snvhxu/"
						target="__blank"
						class="login-router"
						>{{ $t('common.LEARN_MORE') }}</a
					>
				</p>
			</div>
			<div v-else class="container">
				<img src="@/assets/img/recover_wallet.svg" :alt="$t('images.RECOVER_WALLET')" class="mb-3" />
				<h2 class="title">{{ $t('recovery.RECOVERY_TITLE') }}</h2>
				<p class="subtitle">{{ $t('recovery.ENTER_EMAIL') }}</p>
				<form v-on:submit.prevent="checkEmail" novalidate>
					<div class="field">
						<label class="label">{{ $t('common.EMAIL') }}</label>
						<div class="control">
							<input type="email" class="input" name="newEmail" v-model="newEmail" @keypress="handleKeyPress"  />
						</div>
					</div>

					<div class="error" v-if="logonError">
						<p data-cy="loginError">⚠️ <span v-html="logonError"></span></p>
					</div>

					<button data-cy="confirmButton" type="submit" class="button is-green big-button is-login transition-faster">
						<span class="text">{{ $t('common.CONTINUE') }}</span>
					</button>
					<router-link to="/login">
						<button class="button is-ghost is-blue big-button medium-text transition-faster">
							<span class="text">{{ $t('common.BACK') }}</span>
						</button>
					</router-link>
				</form>
				<p class="is-size-7 mt-5 transition-faster">
					{{ $t('recovery.RECOVERY_NEED_HELP') }}&nbsp;
					<a
						href="https://support.morpher.com/en/article/recovering-your-wallet-forgot-password-snvhxu/"
						target="__blank"
						class="login-router"
						>{{ $t('common.LEARN_MORE') }}</a
					>
				</p>

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
			</div>
		</div>
		<div class="container">
			<ChangePassword v-if="currentPage === 1" :presetOldPassword="oldPassword"></ChangePassword>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import RecoverWalletVkontakte from '../components/RecoverWalletVkontakte.vue';
import RecoverWalletGoogle from '../components/RecoverWalletGoogle.vue';
import RecoverWalletApple from '../components/RecoverWalletApple.vue';
import RecoverWalletFacebook from '../components/RecoverWalletFacebook.vue';
import ChangePassword from '../components/ChangePassword.vue';
import { Authenticated, Global } from '../mixins/mixins';
import { Recaptcha } from '../mixins/recaptcha';
import { getPayload, validateInput } from '../utils/backupRestore';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		RecoverWalletVkontakte,
		RecoverWalletFacebook,
		RecoverWalletGoogle,
		RecoverWalletApple,
		ChangePassword
	}
})
export default class Recovery extends mixins(Authenticated, Global, Recaptcha) {
	currentPage = 0;
	newEmail = '';
	logonError = '';
	oldPassword = '';
	showMore = true;

	async checkEmail() {
		this.logonError = '';

		if (!this.newEmail) {
			return;
		}
		if (!this.recaptchaToken && (!localStorage.getItem('recaptcha_date') || Number(localStorage.getItem('recaptcha_date')) < Date.now() - (1000 * 60 * 8))) return this.executeRecaptcha(this.checkEmail);

		const emailMessage = await validateInput('email', this.newEmail);

		if (emailMessage) {
			this.logonError = emailMessage;
			if (this.isIframe() && this.store.connection && this.store.connection !== null) {
				const connection: any = await this.store.connection.promise;
				connection.onError(emailMessage);
			}	
			return;
		}

		try {
			const result: any = await getPayload(this.newEmail, this.recaptchaToken);

			if (result.success) {
				this.setUsersEmail(this.newEmail);
			} else {
				if (result && result.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				}

				this.logonError = getDictionaryValue(result.toString());
			}
		} catch (error: any) {
			if (error.error === 'RECAPTCHA_REQUIRED') {
				this.executeRecaptcha(this.checkEmail);
				return;
			}

			if (error && error.toString() === 'TypeError: Failed to fetch') {
				this.showNetworkError(true);
			} else {
				if (!error.error) {
					this.logSentryError('checkEmail', error.toString(), {});
				}
			}

			let err = ''
			if (error.error) {
				this.logonError = getDictionaryValue(error.error);
				err = error.error
			} else {
				this.logonError = getDictionaryValue(error.toString());
				err = error.toString()
			}

			if (this.isIframe() && this.store.connection && this.store.connection !== null) {
				const connection: any = await this.store.connection.promise;
				connection.onError(err);
			}	
		}
	}

	handleKeyPress(e: any) {
		const key = e.which || e.charCode || e.keyCode || 0;

		if (key === 13) {
			this.checkEmail();
		}
	}

	async setPassword(data: any) {
		this.logonError = '';

		if (data.success) {
			this.oldPassword = data.oldPassword;
			this.currentPage = 1;
		} else {
			let error = '';
			if (data.error === 'popup_closed_by_user') {
				error = 'GOOGLE_COOKIES_BLOCKED'
				this.logonError = getDictionaryValue('GOOGLE_COOKIES_BLOCKED');
			} else if (data.error === 'google_script_blocked') {
				error = 'GOOGLE_SCRIPT_BLOCKED'
				this.logonError = getDictionaryValue('GOOGLE_SCRIPT_BLOCKED');
			} else {
				error = 'RECOVERY_UNLOCK_ERROR'
				this.logonError = getDictionaryValue('RECOVERY_UNLOCK_ERROR');
			}

			if (this.isIframe() && this.store.connection && this.store.connection !== null) {
				const connection: any = await this.store.connection.promise;
				connection.onError(error);
			}	
			this.currentPage = 0;
		}
	}
}
</script>

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
