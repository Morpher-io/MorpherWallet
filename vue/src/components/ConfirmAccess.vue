<template>
	<div>
		<h2 class="title">{{ $t('confirm.CONFIRM_ACCESS_TITLE') }}</h2>
		<img src="@/assets/img/password.svg" :alt="$t('images.PASSWORD_IMAGE')" class="mb-3" />

		<p data-cy="confirmAccessTitle" v-if="!store.twoFaRequired.authenticator"  class="subtitle">{{ $t('confirm.CONFIRM_ACCESS_DESCRIPTION') }}</p>
		<p data-cy="confirmAccessTitle" v-else  class="subtitle">{{ $t('confirm.CONFIRM_ACCESS_DESCRIPTION_AUTHENTICATOR') }}</p>

		<div class="field">
			<label v-if="!store.twoFaRequired.authenticator" class="label">{{ $t('2fa.VERIFICATION_CODE') }}</label>
			<label v-else class="label">{{ $t('2fa.AUTH_CODE') }}</label>

			<div class="control">
				<input data-cy="2faEmailCode" type="number" inputmode="numeric" class="input" v-model="authenticatorCode" @keypress="handleKeyPress" />
			</div>
		</div>

		<div class="error mt-3" v-if="logonError">
			<p>⚠️ <span data-cy="passwordError" v-html="logonError"></span></p>
		</div>

		<button
			data-cy="confirmAccessButton"
			@click="accessConfirmed()"
			class="button is-green big-button is-login transition-faster mt-5"
			:disabled="!authenticatorCode || authenticatorCode.length != 6"
		>
			<span class="text">{{ $t('common.CONTINUE') }}</span>
		</button>
		<button v-on:click="pageBack()" class="button is-ghost is-blue big-button medium-text transition-faster">
			<span class="text">{{ $t('common.BACK') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { Authenticated } from '../mixins/mixins';
import { sha256 } from '../utils/cryptoFunctions';
import { verifyEmailCode, send2FAEmail, verifyAuthenticatorCode } from '../utils/backupRestore';
import { getDictionaryValue } from '../utils/dictionary';

@Component({})
export default class ConfirmAccess extends mixins(Authenticated) {
	walletPassword = '';
	logonError = '';
	authenticatorCode = '';
	initialized = false;
	confirmed = false;
	

	@Prop()
	error!: string;

	@Watch('error')
	handleErorrChange(newValue: string) {
		if (newValue) this.logonError = newValue;
	}

	
	async mounted() {
		try {
			send2FAEmail(this.$store.getters.walletEmail)
										.then(() => {
											this.initialized = true;
										})
										.catch((e) => {
											this.initialized = false;
										});

		} catch (err) {
			console.log('init error', err)
		}

	}

	@Watch('authenticatorCode')
	authenticatorCodeChanged() {
		if (this.authenticatorCode.length === 6 && this.store.twoFaRequired.authenticator) {
			this.accessConfirmed();
		}
	}

	

	@Emit('accessConfirmed')
	async accessConfirmed() {
		if (!this.authenticatorCode || this.authenticatorCode.length != 6) {
			return false;
		}
		let confirmCode
		if (this.store.twoFaRequired.authenticator) {
			confirmCode = await verifyAuthenticatorCode(this.store.fetch_key || this.store.email, this.authenticatorCode);
		} else {
			confirmCode = await verifyEmailCode(this.store.fetch_key || this.store.email, this.authenticatorCode);
		}
		


		if (confirmCode.success) {
			this.unlocked()
			this.logonError = '';
			return true;
		} else {
			this.logonError = getDictionaryValue(confirmCode.error);
			return false;
		}

	}

	@Emit('pageBack')
	pageBack() {
		return;
	}

	handleKeyPress(e: any) {
		const key = e.which || e.charCode || e.keyCode || 0;

		if (key === 13) {
			this.accessConfirmed();
		}
	}
}
</script>
