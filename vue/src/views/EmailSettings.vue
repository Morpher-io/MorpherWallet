<template>
	<div class="container">
		<h2 class="title">Change Email</h2>
		<h4 class="subtitle">Enter a new email address.</h4>
		<ChangeEmail v-if="currentPage === 0" @setNewData="setNewData" :error="logonError" />
		<Change2FAEmail v-if="currentPage === 1" @setCode="setCode" @pageBack="pageBack" :error="logonError" />
		<div v-if="currentPage === 2">
			<div>
				<img src="@/assets/img/checkmark.svg" alt="Checkmark image" class="mb-3" />
				<h2 data-cy="emailUpdatedTitle" class="title">Email Updated</h2>
				<p data-cy="emailUpdatedDescription" class="subtitle">Your email was successfully updated!</p>

				<button @click="resetData" tag="button" class="button outlined-button big-button transition-faster">
					<span>Close</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import ChangeEmail from '../components/ChangeEmail.vue';
import Change2FAEmail from '../components/Change2FAEmail.vue';
import { Authenticated, Global } from '../mixins/mixins';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		ChangeEmail,
		Change2FAEmail
	}
})
export default class EmailSettings extends mixins(Authenticated, Global) {
	currentPage = 0;
	newEmail = '';
	password = '';
	twoFaSent = false;
	twoFa: any = null;
	logonError = '';

	async submitChange() {
		return this.changeEmail({ newEmail: this.newEmail, password: this.password, twoFa: this.twoFa });
	}

	async setNewData(data: any) {
		if (!data.email || !data.password) return;

		this.newEmail = data.email;
		this.password = data.password;

		try {
			this.logonError = '';
			await this.submitChange();

			this.currentPage = 1;
			this.twoFaSent = true;
			this.twoFa = false;
		} catch (error) {
			if (error && error.toString() === 'TypeError: Failed to fetch') {
				this.showNetworkError(true);
			} else {
				this.logSentryError('setNewData', error.toString(), data)
			}

			this.logonError = getDictionaryValue(error.toString());
		}
	}

	async setCode(code: string) {
		if (!code) return;

		this.twoFa = code;

		try {
			this.logonError = '';
			await this.submitChange();

			this.currentPage = 2;
		} catch (error) {
			if (error && error.toString() === 'TypeError: Failed to fetch') {
				this.showNetworkError(true);
			} else {
				this.logSentryError('setCode', error.toString(), { code })
			}

			this.logonError = getDictionaryValue(error.toString());
		}
	}

	pageBack() {
		if (this.currentPage > 0) this.currentPage -= 1;
	}

	redirectUser() {
		this.$router.push('/settings').catch(() => undefined);;
	}

	resetData() {
		this.currentPage = 0;
		this.newEmail = '';
		this.password = '';
		this.twoFaSent = false;
		this.twoFa = null;
		this.logonError = '';
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
