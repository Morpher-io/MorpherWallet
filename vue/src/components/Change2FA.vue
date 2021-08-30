<template>
	<div class="card">
		<form v-on:submit.prevent="formSubmitChange2FA">
			<div>
				<div class="card-content">
					<div class="field">
						<label class="label checkbox">
							2FA with Email Codes enabled
							<input type="checkbox" class="checkbox" id="email" v-model="email" data-cy="twoFaEmail" />
							<span class="checkmark"></span>
						</label>
					</div>

					<div class="field">
						<label class="label checkbox">
							2FA with Authenticator Codes enabled
							<input type="checkbox" class="checkbox" id="authenticator" v-model="authenticator" data-cy="twoFaAuthenticator" />
							<span class="checkmark"></span>
						</label>
					</div>
					<figure
						class="image"
						v-if="!this.authenticatorConfirmed && this.authenticator && (this.qrCode !== '' || this.qrCode !== undefined)"
					>
						<img v-bind:src="this.qrCode" />
					</figure>

					<div class="field" v-if="this.authenticator && !this.qrCode && !this.authenticatorConfirmed">
						<div class="control">
							<button type="button" class="button is-light" value="Generate QR Code" data-cy="generateQR" v-on:click="generateQR">
								Generate QR Code for Authenticator
							</button>
						</div>
					</div>

					<div class="field" v-if="this.authenticator && !this.authenticatorConfirmed && this.qrCode">
						<label class="label">Enter the Authenticator Code to Verify Successful Setup!</label>
						<div class="control">
							<input type="text" placeholder="Authenticator Code" data-cy="authenticatorCode" class="input" v-model="authenticatorCode" />
						</div>
					</div>

					<div class="error mt-3" v-if="logonError">
						<p>⚠️ <span v-html="logonError"></span></p>
					</div>

					<div class="field" v-if="this.authenticator && !this.authenticatorConfirmed && this.qrCode">
						<div class="control">
							<button
								v-if="this.authenticator && !this.authenticatorConfirmed && this.qrCode"
								class="button is-light"
								type="button"
								data-cy="confirmAuthenticator"
								v-on:click="confirmAuthenticator"
							>
								Confirm Authenticator Code
							</button>
						</div>
					</div>
				</div>

				<div class="field is-grouped">
					<button class="button is-green big-button is-login transition-faster" type="submit" data-cy="saveTwoFa">
						<span>Save 2FA Settings</span>
					</button>
				</div>
			</div>
		</form>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { verifyAuthenticatorCode } from '../utils/backupRestore';
import { getDictionaryValue } from '../utils/dictionary';

@Component({})
export default class ChangeEmail extends mixins(Global, Authenticated) {
	email = false;
	authenticator = false;
	authenticatorConfirmed: any = false;
	authenticatorCode = '';
	logonError = '';
	qrCode = '';
	success = false;

	async formSubmitChange2FA() {
		if (this.authenticator && !this.authenticatorConfirmed) {
			this.logonError = 'Please click Confirm Authenticator first before saving 2FA settings.';
			return;
		}

		//user unselected authenticator
		if (!this.authenticator && this.authenticatorConfirmed) {
			this.authenticatorConfirmed = false;
			this.qrCode = '';
			this.authenticatorCode = '';
		}

		try {
			this.showSpinner('Loading');
			await this.change2FAMethods({
				email: this.email,
				authenticator: this.authenticator,
				authenticatorConfirmed: this.authenticatorConfirmed
			});
			this.success = true;
		} catch (e) {
			// console.log(e);
		}

		this.hideSpinner();
	}

	async confirmAuthenticator() {
		this.authenticatorConfirmed = await verifyAuthenticatorCode(this.store.email, this.authenticatorCode);

		if (this.authenticatorConfirmed.success) {
			this.success = true;
			this.logonError = '';
		} else {
			this.logonError = getDictionaryValue(this.authenticatorConfirmed.error);
		}
	}

	async generateQR() {
		this.authenticatorConfirmed = false;
		this.authenticatorCode = '';

		this.qrCode = ((await this.generateQRCode()) as any).image;
		return false;
	}

	async mounted() {
		this.email = this.store.twoFaRequired.email;
		this.authenticator = this.store.twoFaRequired.authenticator;
		this.authenticatorConfirmed = this.store.twoFaRequired.authenticatorConfirmed;
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
