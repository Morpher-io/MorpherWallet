<template>
	<div>
		<img src="@/assets/img/email_verification.svg" alt="Email 2FA image" class="mb-3" />
		<h2 data-cy="emailConfirmationTitle" class="title">{{ $t('2fa.EMAIL_CONFIRMATION_TITLE') }}</h2>
		<p class="subtitle">{{ $t('2fa.EMAIL_CONFIRMATION_DESCRIPTION') }}</p>

		<div class="field">
			<label class="label">{{ $t('2fa.VERIFICATION_CODE') }}</label>

			<div class="control">
				<input data-cy="2faEmailCode" type="text" class="input" v-model="authenticatorCode" />
			</div>
		</div>

		<div class="error mt-3" v-if="logonError">
			<p>⚠️ <span v-html="logonError"></span></p>
		</div>

		<button
			data-cy="confirmButton"
			@click="setCode()"
			class="button is-green big-button is-login transition-faster mt-5"
			:disabled="!authenticatorCode"
		>
			<span class="text">{{ $t('common.SUBMIT') }}</span>
		</button>
		<button v-on:click="pageBack()" class="button is-ghost is-blue big-button medium-text transition-faster">
			<span> class="text"{{ $t('common.CANCEL') }}</span>
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
export default class Change2FAEmail extends mixins(Authenticated) {
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
			return false;
		}
	}
}
</script>
