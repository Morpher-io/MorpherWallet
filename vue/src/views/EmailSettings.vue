<template>
	<div class="container">
		<h2 class="title">Change Email</h2>
		<h4 class="subtitle">Enter a new email address.</h4>
		<ChangeEmail v-if="currentPage === 0" @setNewData="setNewData" :error="logonError" />
		<Change2faEmail v-if="currentPage === 1" @setCode="setCode" @pageBack="pageBack" :error="logonError" />
		<div v-if="currentPage === 2">
			<div>
				<img src="@/assets/img/checkmark.svg" alt="Checkmark image" class="mb-3" />
				<h2 class="title">Email Updated</h2>
				<p class="subtitle">Your email was successfully updated!</p>

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
import Change2faEmail from '../components/Change2faEmail.vue';
import { Authenticated, Global } from '../mixins/mixins';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		ChangeEmail,
		Change2faEmail
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
		} catch (e) {
			this.logonError = getDictionaryValue(e);
		}
	}

	async setCode(code: string) {
		if (!code) return;

		this.twoFa = code;

		try {
			this.logonError = '';
			await this.submitChange();

			this.currentPage = 2;
		} catch (e) {
			this.logonError = getDictionaryValue(e);
		}
	}

	pageBack() {
		if(this.currentPage > 0) this.currentPage -= 1;
	}

	redirectUser() {
		this.$router.push('/settings');
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
