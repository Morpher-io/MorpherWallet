<template>
	<div class="container">
		<div v-if="currentPage === 0">
			<div class="title-container has-text-left">
				<button
					@click="redirectUser"
					tag="button"
					class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only"
				>
					<span class="icon is-small">
						<i class="fas fa-chevron-left"></i>
					</span>
				</button>
				<h2 class="title ml-4">Delete Account</h2>
			</div>
			<div class="divider just-space" />
			<p class="has-text-left reset-line-height">
				<span class="has-text-weight-medium"
					>Please <router-link to="/settings/keys" class="login-router">export your wallet</router-link> first.</span
				>
				You need to verify ownership with the seed phrase or private key before your account can be removed.
			</p>
			<div class="field is-grouped">
				<button @click="setNewPage()" tag="button" class="button big-button is-danger transition-faster">
					<span>Delete Account</span>
				</button>
			</div>

			<div class="has-text-left mt-5 reset-line-height">
				<p class="has-text-weight-medium">
					What gets deleted?
				</p>
				<p>
					Any information in our databases linked to this wallet account (such as email and settings).
				</p>

				<p class="has-text-weight-medium mt-2">
					Does my wallet get deleted?
				</p>
				<p>
					We don’t control your wallet. As long as you have your keys, you can use your wallet with any other Ethereum service. For example you can import your keys into Metamask.
				</p>

				<p class="has-text-weight-medium mt-2">
					What happens to my funds?
				</p>
				<p>
					Funds on mainnet Ethereum are not affected by account deletion.
				</p>
			</div>
		</div>
		<ConfirmAccess v-if="currentPage === 1" @pageBack="pageBack" @setPassword="setPassword" :error="logonError" />
		<AccountDeletion v-if="currentPage === 2" @pageBack="resetData" @deleteAccount="deleteAccount" :error="logonError" />
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import AccountDeletion from '../components/AccountDeletion.vue';
import ConfirmAccess from '../components/ConfirmAccess.vue';
import { Authenticated, Global } from '../mixins/mixins';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		AccountDeletion,
		ConfirmAccess
	}
})
export default class RecoverySettings extends mixins(Authenticated, Global) {
	currentPage = 0;
	logonError = '';
	password = '';

	redirectUser() {
		this.$router.push('/settings');
	}

	setNewPage() {
		this.currentPage = 1;
	}

	pageBack() {
		if (this.currentPage > 0) this.currentPage -= 1;
	}

	async setPassword(password: string) {
		if (!password) return;

		this.password = password;
		this.currentPage = 2;
	}

	resetData() {
		this.currentPage = 0;
		this.logonError = '';
		this.password = '';
	}

	async deleteAccount(data: any) {
		try {
			this.logonError = '';

			if (data.method === 'seed') {
				const seed = await this.showSeedPhraseBackground({ password: this.password });

				if (!seed || data.input !== seed) {
					this.logonError = 'Wrong seed phrase. Please try again.';
					return;
				}

				try {
					await this.deleteWalletAccount({ password: this.password });
					this.showSpinnerThenAutohide('Account deleted successfully.')
				} catch (e) {
					this.logonError = e;
				}
			} else if (data.method === 'key') {
				const key = await this.showPrivateKeyBackground({ password: this.password });

				if (!key || data.input !== key) {
					this.logonError = 'Wrong private key. Please try again.';
					return;
				}

				try {
					await this.deleteWalletAccount({ password: this.password });
					this.showSpinnerThenAutohide('Account deleted successfully.');
				} catch (e) {
					this.logonError = e;
				}
			}
		} catch (e) {
			this.logonError = getDictionaryValue('');
		}
	}
}
</script>

<style lang="scss" scoped>
.title-container {
	display: flex;
	align-items: center;

	.title {
		margin: 0;
	}
}
</style>
