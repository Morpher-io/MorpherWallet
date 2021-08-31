<template>
	<div>
		<img src="@/assets/img/email_verification.svg" alt="Email 2FA image" class="mb-3" />
		<h2 class="title">Email Confirmation</h2>
		<p class="subtitle">We sent you an email with code. Enter the verification code below to confirm 2-step activation.</p>

		<div class="field">
			<label class="label">Verification Code</label>

			<div class="control">
				<input type="text" class="input" v-model="authenticatorCode" />
			</div>
		</div>

		<div class="error mt-3" v-if="logonError">
			<p>⚠️ <span v-html="logonError"></span></p>
		</div>

		<button @click="setCode()" class="button is-green big-button is-login transition-faster mt-5" :disabled="!authenticatorCode">
			<span>Submit</span>
		</button>
		<button v-on:click="pageBack()" class="button is-ghost is-blue big-button medium-text transition-faster">
			<span>Cancel</span>
		</button>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { Authenticated } from '../mixins/mixins';
import { verifyEmailCode } from '../utils/backupRestore';
import { getDictionaryValue } from '../utils/dictionary';

@Component({})
export default class Change2faEmail extends mixins(Authenticated) {
	authenticatorCode = '';
	logonError = '';

	@Prop()
	error!: string;

	@Watch('error')
	handleErorrChange(newValue: string) {
		if (newValue) this.logonError = newValue;
	}

	@Emit('setCode')
	async setCode() {
		this.logonError = '';

		const isCodeValid = await this.confirmAuthenticator();
		if (isCodeValid) return this.authenticatorCode;
		else return null;
	}

	@Emit('pageBack')
	pageBack() {
		return;
	}

	async confirmAuthenticator() {
		const confirmCode = await verifyEmailCode(this.store.email, this.authenticatorCode);

		if (confirmCode.success) {
			this.logonError = '';
			return true;
		} else {
			this.logonError = getDictionaryValue(confirmCode.error);
			return false
		}
	}
}
</script>