<template>
	<div class="container">
		<div v-if="currentPage === 0" class="title-container has-text-left">
			<button @click="redirectUser" tag="button" class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
			</button>
			<h2 class="title ml-4">Two-Factor settings</h2>
		</div>

		<div v-if="currentPage === 0">
			<div class="divider just-space" />
			<Change2FA @setCurrentMethod="setCurrentMethod" />
		</div>
		<div v-if="currentPage === 1">
			<ConfirmAccess @setPassword="setPassword" @pageBack="pageBack" />
		</div>
		<div v-if="currentPage === 2">
			<ChangeAuthenticator v-if="currentMethod === 'authenticator'" :qrCode="qrCode" @setCode="setCode" @pageBack="pageBack" />
			<Change2faEmail v-if="currentMethod === 'email'" @setCode="setCode" @pageBack="pageBack" />
		</div>
		<div v-if="currentPage === 3">
			<div>
				<img src="@/assets/img/checkmark.svg" alt="Checkmark image" class="mb-3" />
				<h2 class="title">2-Step {{ isEnabling ? 'Activated' : 'Deactivated' }}</h2>
				<p v-if="isEnabling" class="subtitle">
					All done, 2-step verification has been added to your account. Your account is now more secure!
				</p>
				<p v-else class="subtitle">2-step verification has been removed from your account.</p>

				<div v-if="!isEnabling" class="alert warning mt-3 is-size-7 has-text-left mb-5">
					⚠ Your account security is much lower now.
				</div>

				<button @click="resetData" tag="button" class="button outlined-button big-button transition-faster">
					<span>Close</span>
				</button>

				<div v-if="isEnabling">
					<div class="divider"></div>
					<p class="has-text-left has-text-weight-bold mb-0">KYC Recovery</p>
					<p class="has-text-left subtitle mt-0">
						Please complete KYC in the Morpher app if you want to be able to restore your account. If you lose 2FA access and we cannot
						verify your identity, your wallet will be lost.
					</p>
				</div>
			</div>
		</div>
		<div class="error mt-3" v-if="updateError">
			<p>⚠️ <span v-html="updateError"></span></p>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Change2FA from '../components/Change2FA.vue';
import ConfirmAccess from '../components/ConfirmAccess.vue';
import ChangeAuthenticator from '../components/ChangeAuthenticator.vue';
import Change2faEmail from '../components/Change2faEmail.vue';
import { Authenticated, Global } from '../mixins/mixins';
import { getDictionaryValue } from '../utils/dictionary';
import { Watch } from 'vue-property-decorator';

@Component({
	components: {
		Change2FA,
		ConfirmAccess,
		ChangeAuthenticator,
		Change2faEmail
	}
})
export default class TwoFactorSettings extends mixins(Authenticated, Global) {
	currentPage = 0;
	currentMethod = '';
	qrCode = '';
	authenticatorCode = '';
	emailCode = '';
	email = false;
	authenticator = false;
	authenticatorConfirmed: any = false;
	isEnabling = true;
	updateError = '';
	passwordTimeout: number | undefined = undefined;

	async submitChange(type: 'email' | 'authenticator') {
		try {
			this.updateError = '';
			if (type === 'email') {
				this.showSpinner('Loading');
				let email = true;
				let authenticator = false;

				if (!this.isEnabling) {
					email = false;
					authenticator = this.authenticator;
				}

				await this.change2FAMethods({
					email,
					authenticator,
					email2faVerification: this.emailCode,
					authenticator2faVerification: this.authenticatorCode
				});

				if (this.isEnabling && !this.emailCode) {
					this.email = false;
					this.currentPage = 2;
				} else {
					this.authenticatorConfirmed = true;
					this.email = email;
					this.authenticator = authenticator;
					this.isEnabling = email;
					this.currentPage = 3;
				}
			} else if (type === 'authenticator') {
				this.showSpinner('Loading');

				let email = false;
				let authenticator = true;

				if (!this.isEnabling) {
					email = this.email;
					authenticator = false;
				}

				await this.change2FAMethods({
					email,
					authenticator,
					email2faVerification: this.emailCode,
					authenticator2faVerification: this.authenticatorCode
				});

				this.email = email;
				this.authenticator = authenticator;
				this.authenticatorConfirmed = authenticator;
				this.currentPage = 3;
			}

			this.hideSpinner();
		} catch (err) {
			this.hideSpinner();
			this.updateError = getDictionaryValue(err.toString());
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

	redirectUser() {
		this.$router.push('/settings');
	}

	pageBack() {
		if (this.currentMethod === 'authenticator' && !this.authenticator && this.currentPage === 2) {
			this.currentPage = 0;
			this.qrCode = '';
			this.authenticatorCode = '';
		} else {
			if (this.currentPage > 0) this.currentPage -= 1;
		}
	}

	setCurrentMethod(method: any) {
		this.isEnabling = method['isEnabling'];
		this.currentMethod = method['method'];
		this.currentPage = 1;
	}

	@Watch('currentPage')
	currentPageChange(newValue: number) {
		if (newValue !== 2 && this.passwordTimeout) {
			clearTimeout(this.passwordTimeout);
		}
	}

	setPassword(password: string) {
		if (!password) {
			return;
		}

		if (this.currentMethod === 'email') {
			this.emailCode = '';
			this.submitChange('email');
			return;
		}

		if (this.passwordTimeout) clearTimeout(this.passwordTimeout);
		this.passwordTimeout = window.setTimeout(() => {
			clearTimeout(this.passwordTimeout);
			this.currentPage = 0;
		}, 600000);

		if (!this.authenticator) {
			this.generateQR();
			this.currentPage = 2;
		} else {
			this.submitChange('authenticator');
		}
	}

	resetData() {
		this.currentPage = 0;
		this.currentMethod = '';
	}

	setCode(code: string) {
		if (!code) return;

		if (this.currentMethod === 'email') {
			this.emailCode = code;
			this.submitChange('email');
			return;
		}

		this.authenticatorCode = code;
		this.submitChange('authenticator');
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
