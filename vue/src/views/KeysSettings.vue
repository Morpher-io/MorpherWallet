<template>
	<div class="container">
		<div v-if="currentPage === 0">
			<div class="title-container has-text-left">
				<button
						data-cy="backArrowButton"
					@click="redirectUser"
					tag="button"
					class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only"
				>
					<span class="icon is-small">
						<i class="fas fa-chevron-left"></i>
					</span>
				</button>
				<h2 class="title ml-3">Export Wallet</h2>
			</div>

			<p class="has-text-left mt-2 transition-faster">
				<span class="has-text-weight-medium">For advanced users only!</span> Export wallet seed phrase & private key for backup or to change
				wallets.
				<a href="https://support.morpher.com/en/article/export-morpher-wallet-d6wr6g/" target="__blank" class="login-router">Learn more</a>
			</p>

			<button
				class="mt-3 button is-blue big-button is-login transition-faster"
				data-cy="exportSeedPhraseButton"
				type="submit"
				@click="setExport('seed')"
			>
				<span>Export Seed Phrase</span>
			</button>

			<div class="divider just-space" />

			<p class="mt-4 has-text-left">Additional options:</p>
			<button data-cy="exportPrivateKeyButton" @click="setExport('key')" tag="button" class="button outlined-button is-thick big-button transition-faster mt-2">
				<span>Export Private Key</span>
			</button>
		</div>

		<ConfirmAccess v-if="currentPage === 1" @pageBack="pageBack" @setPassword="setPassword" :error="logonError" />

		<div v-if="currentPage === 2">
			<h2 class="title">Export Seed Phrase</h2>
			<p data-cy="seedPhraseSuccess" class="subtitle">Save your seed phrase in a safe place (never share it).</p>

			<div class="settings-data user-details">
				<div class="details">
					<p class="seed">{{ store.seedPhrase }}</p>
				</div>
			</div>

			<div class="links is-flex is-align-items-center is-justify-content-center mt-2">
				<div class="link is-flex has-text-weight-medium is-align-items-center">
					<i class="fas fa-copy mr-1"></i>
					<div @click="copyToClipboard(store.seedPhrase)" class="login-router is-size-7 transition-faster">Copy to Clipboard</div>
				</div>
			</div>

			<button @click="resetData()" tag="button" class="button outlined-button is-thick big-button transition-faster mt-4">
				<span>Close</span>
			</button>
		</div>

		<div v-if="currentPage === 3">
			<h2 class="title">Export Private Key</h2>
			<p data-cy="privateKeySuccess" class="subtitle">Save your private key in a safe place (never share it).</p>

			<div class="settings-data user-details">
				<div class="details">
					<p data-cy="privateKeyValue" class="seed">{{ store.privateKey }}</p>
				</div>
			</div>

			<div class="links is-flex is-align-items-center is-justify-content-center mt-2">
				<div class="link is-flex has-text-weight-medium is-align-items-center">
					<i class="fas fa-copy mr-1"></i>
					<div @click="copyToClipboard(store.privateKey)" class="login-router is-size-7 transition-faster">Copy to Clipboard</div>
				</div>
			</div>

			<div data-cy="privateKeyJsonMessage" class="alert warning has-text-left is-size-7 mt-5">
				⚠ The private key JSON file is password protected using your wallet password.
			</div>

			<button data-cy="privateKeyJsonButton" class="button is-blue big-button is-login transition-faster mt-4" @click="exportPhrase(store.accounts[0])">
				<span>Download JSON</span>
			</button>

			<button data-cy="exportBackButton" @click="resetData()" tag="button" class="button outlined-button is-thick big-button transition-faster mt-4">
				<span>Close</span>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import ConfirmAccess from '../components/ConfirmAccess.vue';
import { Authenticated, Global } from '../mixins/mixins';
import { copyToClipboard } from '../utils/utils';

@Component({
	components: {
		ConfirmAccess
	}
})
export default class KeysSettings extends mixins(Global, Authenticated) {
	currentPage = 0;
	logonError = '';
	page = '';
	password = '';
	copyToClipboard = copyToClipboard;

	redirectUser() {
		this.$router.push('/settings');
	}

	setExport(page: string) {
		this.page = page;
		this.currentPage = 1;
	}

	pageBack() {
		if (this.currentPage > 0) this.currentPage -= 1;
	}

	async setPassword(password: string) {
		if (!password) return;

		this.password = password;

		if (this.page === 'seed') {
			this.showPhrase(password);
			this.currentPage = 2;
		} else if (this.page === 'key') {
			this.showKey(password);
			this.currentPage = 3;
		}
	}

	resetData() {
		this.currentPage = 0;
		this.logonError = '';
		this.page = '';
		this.clearPrivateKey();
		this.clearSeedPhrase();
		this.password = '';
	}

	async showKey(password: string) {
		await this.showPrivateKey({ password });
	}

	async showPhrase(password: string) {
		await this.showSeedPhrase({ password });
	}

	async exportPhrase(account: any) {
		if (!this.password) return;
		await this.exportKeystore({ account, password: this.password });
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

.seed {
	line-height: 1.5rem !important;
	overflow-wrap: break-word;
}
</style>
