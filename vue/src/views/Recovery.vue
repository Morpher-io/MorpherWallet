<template>
	<div>
		<div v-if="currentPage === 0">
			<div v-if="store.email" class="container">
				<img src="@/assets/img/recover_wallet.svg" alt="Recover wallet image" class="mb-3" />
				<h2 class="title">Recover Your Wallet</h2>
				<p class="subtitle">Forgot your password? Login with your recovery account to unlock your wallet.</p>

				<div class="error alert warning is-size-7" v-if="logonError">
					<p data-cy="loginError">⚠️ <span v-html="logonError"></span></p> <a v-if="showMore" href="#" class="login-router"><span>Learn more</span></a>
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

				<p class="is-size-7 mt-5">Need help with recovery? <a href="#" class="login-router">Learn more</a></p>
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
				</form>

				<div class="mt-2 is-grouped">
					<router-link to="/login" tag="button" class="button is-ghost is-blue big-button medium-text transition-faster">
						<span>Back</span>
					</router-link>
				</div>

				<p class="is-size-7 mt-5">Need help with recovery? <a href="#" class="login-router">Learn more</a></p>
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
			const user: any = await getPayload(this.newEmail);

			if (user.success) {
				this.setUsersEmail(this.newEmail);
			} else {
				this.logonError = getDictionaryValue(user);
			}
		} catch (e) {
			this.logonError = getDictionaryValue(e.error);
		}
	}

	setPassword(data: any) {
		this.logonError = '';

		if (data.success) {
			this.oldPassword = data.oldPassword;
			this.currentPage = 1;
		} else {
			this.logonError = 'Unable to unlock your wallet. This may be because you used a different account or never set up account recovery. ';
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
