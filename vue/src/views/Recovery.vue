<template>
	<div>
		<div v-if="currentPage === 0">
			<div v-if="store.email" class="container">
				<img src="@/assets/img/recover_wallet.svg" alt="Recover wallet image" class="mb-3" />
				<h2 class="title">Recover Your Wallet</h2>
				<p class="subtitle">Forgot your password? Login with your recovery account to unlock your wallet.</p>

				<div class="error alert warning is-size-7" v-if="logonError">
					<p data-cy="loginError">⚠️ <span v-html="logonError"></span></p>
					<a
						v-if="showMore"
						href="https://support.morpher.com/en/article/recovering-your-wallet-forgot-password-snvhxu/"
						target="__blank"
						class="login-router transition-faster"
						><span>Learn more</span></a
					>
				</div>

				<div class="field is-grouped">
					<RecoverWalletGoogle @setPassword="setPassword"></RecoverWalletGoogle>
				</div>
				<div class="field is-grouped">
					<RecoverWalletFacebook @setPassword="setPassword"></RecoverWalletFacebook>
				</div>
				<div class="field is-grouped">
					<RecoverWalletVkontakte @setPassword="setPassword"></RecoverWalletVkontakte>
				</div>

				<router-link to="/login" tag="button" class="button is-ghost is-blue big-button medium-text transition-faster">
					<span>Cancel</span>
				</router-link>

				<p class="is-size-7 mt-5 transition-faster">
					Need help with recovery?
					<a
						href="https://support.morpher.com/en/article/recovering-your-wallet-forgot-password-snvhxu/"
						target="__blank"
						class="login-router"
						>Learn more</a
					>
				</p>
			</div>
			<div v-else class="container">
				<img src="@/assets/img/recover_wallet.svg" alt="Recover wallet image" class="mb-3" />
				<h2 class="title">Recover Your Wallet</h2>
				<p class="subtitle">Please enter your email to start recovery.</p>
				<form v-on:submit.prevent="checkEmail" novalidate>
					<div class="field">
						<label class="label">Email</label>
						<div class="control">
							<input type="email" class="input" name="newEmail" v-model="newEmail" />
						</div>
					</div>

					<div class="error" v-if="logonError">
						<p data-cy="loginError">⚠️ <span v-html="logonError"></span></p>
					</div>

					<button type="submit" class="button is-green big-button is-login transition-faster">
						<span>Continue</span>
					</button>
					<router-link to="/login" tag="button" class="button is-ghost is-blue big-button medium-text transition-faster">
						<span>Back</span>
					</router-link>
				</form>
				<p class="is-size-7 mt-5 transition-faster">
					Need help with recovery?
					<a
						href="https://support.morpher.com/en/article/recovering-your-wallet-forgot-password-snvhxu/"
						target="__blank"
						class="login-router"
						>Learn more</a
					>
				</p>
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
import RecoverWalletFacebook from '../components/RecoverWalletFacebook.vue';
import ChangePassword from '../components/ChangePassword.vue';
import { Authenticated, Global } from '../mixins/mixins';
import { getPayload, validateInput } from '../utils/backupRestore';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		RecoverWalletVkontakte,
		RecoverWalletFacebook,
		RecoverWalletGoogle,
		ChangePassword
	}
})
export default class Recovery extends mixins(Authenticated, Global) {
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

		const emailMessage = await validateInput('email', this.newEmail);

		if (emailMessage) {
			this.logonError = emailMessage;
			return;
		}

		try {
			const result: any = await getPayload(this.newEmail);

			if (result.success) {
				this.setUsersEmail(this.newEmail);
			} else {
				if (result && result.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				}

				this.logonError = getDictionaryValue(result.toString());
			}
		} catch (error) {
			if (error && error.toString() === 'TypeError: Failed to fetch') {
				this.showNetworkError(true);
			} else {
				this.logSentryError('checkEmail', error.toString(), { })
			}

			this.logonError = getDictionaryValue(error.toString());
		}
	}

	setPassword(data: any) {
		this.logonError = '';

		if (data.success) {
			this.oldPassword = data.oldPassword;
			this.currentPage = 1;
		} else {
			if (data.error === 'popup_closed_by_user') {
				this.logonError = getDictionaryValue('GOOGLE_COOKIES_BLOCKED');
			} else if (data.error === 'google_script_blocked') {
				this.logonError = getDictionaryValue('GOOGLE_SCRIPT_BLOCKED');
			} else {
				this.logonError = getDictionaryValue('RECOVERY_UNLOCK_ERROR');
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
