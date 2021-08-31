<template>
	<div class="container">
		<div v-if="currentPage === 0" class="title-container has-text-left">
			<button @click="redirectUser" tag="button" class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
			</button>
			<h2 class="title ml-4">Recovery settings</h2>
		</div>

		<div v-if="currentPage === 0" class="divider just-space" />

		<AccountDeletion v-if="currentPage === 0" @setNewPage="setNewPage" />
		<ConfirmAccess v-if="currentPage === 1" @pageBack="pageBack" @setPassword="setPassword" :error="logonError" />
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import AccountDeletion from '../components/AccountDeletion.vue';
import ConfirmAccess from '../components/ConfirmAccess.vue';
import { Authenticated, Global } from '../mixins/mixins';
import { sha256 } from '../utils/cryptoFunctions';
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

	redirectUser() {
		this.$router.push('/settings');
	}

	setNewPage() {
		this.currentPage = 1;
	}

	pageBack() {
		if(this.currentPage > 0) this.currentPage -= 1;
	}

	async setPassword(password: string) {
		try {
			this.logonError = '';
			const newPassword = await sha256(password);
			await this.deleteWalletAccount({ password: newPassword });
		} catch (e) {
			this.logonError = e;
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
