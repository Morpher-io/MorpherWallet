<template>
	<div v-if="store.email" class="container">
		<h2 class="title">Recover Your Wallet</h2>
		<p class="subtitle">Forgot your password? Login with your recovery account to unlock your wallet.
		</p>

		<div class="field is-grouped">
			<RecoverWalletGoogle></RecoverWalletGoogle>
		</div>
		<div class="field is-grouped">
			<RecoverWalletFacebook></RecoverWalletFacebook>
		</div>
		<div class="field is-grouped">
			<RecoverWalletVkontakte></RecoverWalletVkontakte>
		</div>

		<div class="mt-2 is-grouped">
			<router-link to="/login" tag="button" class="button is-ghost is-blue big-button medium-text transition-faster">
				<span>Back</span>
			</router-link>
		</div>
	</div>
	<div v-else class="container">
		<img src="@/assets/img/recover_wallet.svg" alt="Recover wallet image" class="mb-3" />
		<h2 class="title">Recover Your Wallet</h2>
		<p class="subtitle">Please enter your email to start recovery.</p>
		<form v-on:submit.prevent="checkEmail" novalidate>
			<div class="field">
				<label class="label">Email</label>
				<div class="control">
					<input
						type="email"
						class="input"
						name="newEmail"
						v-model="newEmail"
					/>
				</div>
			</div>

			<div class="error" v-if="logonError">
				<p data-cy="loginError">
					⚠️ <span v-html="logonError"></span>
				</p>
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
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import RecoverWalletVkontakte from '../components/RecoverWalletVkontakte.vue';
import RecoverWalletGoogle from '../components/RecoverWalletGoogle.vue';
import RecoverWalletFacebook from '../components/RecoverWalletFacebook.vue';
import { Authenticated, Global } from '../mixins/mixins';
import { getPayload, validateInput } from '../utils/backupRestore';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		RecoverWalletVkontakte,
		RecoverWalletFacebook,
		RecoverWalletGoogle
	}
})
export default class RecoveryAdd extends mixins(Authenticated, Global) {
	newEmail = '';
	dropdownIsActive = false;
	logonError = '';
	
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
