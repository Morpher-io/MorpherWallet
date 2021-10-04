<template>
	<div>
		<h2 class="title">2-Step Activation</h2>
		<p class="subtitle">Scan the QR code with an authenticator app. Enter the verification code below to confirm 2-step activation.</p>

		<div class="custom-card">
			<figure class="image" v-if="qrCode">
				<img v-bind:src="qrCode" alt="QR Code" />
			</figure>
		</div>
		<p class="is-size-7 mt-2 transition-faster">
			Need an authenticator? Get <a href="https://authy.com/download/" target="__blank" class="login-router">Authy</a> or
			<a
				href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US"
				target="__blank"
				class="login-router"
				>Google Authenticator</a
			>.
		</p>

		<div class="field">
			<label class="label">Verification Code</label>

			<div class="control">
				<input data-cy="2faAuthenticatorCode" type="text" class="input" v-model="authenticatorCode" />
			</div>
		</div>

		<div class="error mt-3" v-if="logonError">
			<p>⚠️ <span data-cy="2faAuthenticatorError" v-html="logonError"></span></p>
		</div>

		<button
			data-cy="confirm2faButton"
			@click="setCode()"
			class="button is-green big-button is-login transition-faster mt-5"
			:disabled="!authenticatorCode"
		>
			<span>Confirm</span>
		</button>
		<button v-on:click="pageBack()" class="button is-ghost is-blue big-button medium-text transition-faster">
			<span>Back</span>
		</button>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { Authenticated } from '../mixins/mixins';
import { verifyAuthenticatorCode } from '../utils/backupRestore';
import { getDictionaryValue } from '../utils/dictionary';

@Component({})
export default class ChangeAuthenticator extends mixins(Authenticated) {
	authenticatorCode = '';
	logonError = '';

	@Prop()
	qrCode!: string;

	@Emit('setCode')
	async setCode() {
		const isCodeValid = await this.confirmAuthenticator();
		if (isCodeValid) return this.authenticatorCode;
		else return null;
	}

	@Emit('pageBack')
	pageBack() {
		return;
	}

	async confirmAuthenticator() {
		const confirmCode = await verifyAuthenticatorCode(this.store.email, this.authenticatorCode);

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

<style lang="scss" scoped>
.image {
	img {
		width: 140px;
		height: 140px;
		margin: -10px auto;
	}
}
</style>
