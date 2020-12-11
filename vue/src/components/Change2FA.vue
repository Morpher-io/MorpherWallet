<template>
	<div class="card">
		<form v-on:submit.prevent="formSubmitChange2FA">
			<div class="collapse">
				<span v-show="collapsed" class="icon collapseIcon collapseIcon" @click="collapsed = !collapsed">
					<i class="fas fa-chevron-right"></i>
				</span>
				<span v-show="!collapsed" class="icon collapseIcon collapseIcon" @click="collapsed = !collapsed">
					<i class="fas fa-chevron-down"></i>
				</span>

				<span class="header" @click="collapsed = !collapsed"> Change 2-Factor authentication (2FA) </span>
				<div :class="collapsed ? 'hidden' : 'visible'">
					<div class="card-content">
						<div class="field">
							<input type="checkbox" class="checkbox" id="email" v-model="email" />
							<label class="label">
								2FA with Email Codes enabled
							</label>
						</div>

						<div class="field">
							<input type="checkbox" class="checkbox" id="authenticator" v-model="authenticator" />
							<label class="label">
								2FA with Authenticator Codes enabled
							</label>
						</div>

						<img
							v-if="this.authenticator && (this.qrCode !== '' || this.qrCode !== undefined)"
							style="height: 400px; margin: 10px"
							v-bind:src="this.qrCode"
						/>

						<input
							v-if="this.authenticator"
							type="submit"
							style="margin: 10px; display: block"
							value="Generate QR Code"
							v-on:click="generateQR"
						/>

						<input
							v-if="this.authenticator && !this.authenticatorConfirmed"
							type="text"
							style="margin: 10px"
							placeholder="Authenticator Code"
							class="textbox"
							v-model="authenticatorCode"
						/>

						<input
							v-if="this.authenticator && !this.authenticatorConfirmed"
							style="margin: 10px; display: block"
							type="submit"
							value="Confirm Authenticator"
							v-on:click="confirmAuthenticator"
						/>
					</div>

					<div class="field is-grouped">
						<div class="layout split">
							<button class="button is-green" type="submit">
								<span class="icon is-small">
									<i class="fas fa-save"></i>
								</span>
								<span> Save 2FA Settings </span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
		<br />
	</div>
</template>

<script>
import {
	getPayload,
	change2FAMethods,
	getQRCode,
	generateQRCode,
	verifyAuthenticatorCode,
	getKeystoreFromEncryptedSeed
} from '../utils/backupRestore';

export default {
	name: 'change2FA',
	data: function() {
		return {
			email: false,
			authenticator: false,
			authenticatorConfirmed: false,
			authenticatorCode: '',
			qrCode: '',
			collapsed: true
		};
	},
	props: [''],
	methods: {
		async formSubmitChange2FA(e) {
			e.preventDefault();

			const email = localStorage.getItem('email');

			try {
				if (!this.email && this.authenticator && !this.authenticatorConfirmed) {
					alert('Please confirm Authenticator first.');
				} else {
					const nonce = (await change2FAMethods(email, null, this.email, this.authenticator)).nonce;

					const password = window.sessionStorage.getItem('password');
					const encryptedSeed = window.localStorage.getItem('encryptedSeed');
					const keystore = await getKeystoreFromEncryptedSeed(JSON.parse(encryptedSeed), password);
					await change2FAMethods(email, keystore[0].sign('authentication' + '_' + nonce), this.email, this.authenticator);
					// const self = this;

					// keystore.keyFromPassword(password, async function (err, pwDerivedKey) {
					//     let signedMessage = Lightwallet.signing.signMsg(keystore, pwDerivedKey, "authentication" + '_' + nonce, keystore.addresses[0])
					//     await change2FAMethods(email, signedMessage, self.email, self.authenticator);
					// })
					alert('2FA methods changed successfully.');
				}
			} catch (e) {
				console.log(e);
			}
		},

		async confirmAuthenticator() {
			const email = localStorage.getItem('email');

			this.authenticatorConfirmed = (await verifyAuthenticatorCode(email, this.authenticatorCode)).verified;

			if (this.authenticatorConfirmed) {
				alert('Authenticator confirmed.');
			} else {
				alert('Authenticator code is not right.');
			}
		},

		async generateQR() {
			const email = localStorage.getItem('email');
			this.authenticatorConfirmed = false;
			this.authenticatorCode = '';

			const qrCode = await generateQRCode(email);
			this.qrCode = qrCode.image;
		}
	},
	async mounted() {
		const email = localStorage.getItem('email');

		try {
			const twoFAMethods = await getPayload(email);

			const qrCode = await getQRCode(email);
			this.qrCode = qrCode.image;

			if (twoFAMethods.email !== undefined) this.email = twoFAMethods.email;
			if (twoFAMethods.authenticator !== undefined) this.authenticator = twoFAMethods.authenticator;
			if (twoFAMethods.authenticatorConfirmed !== undefined) this.authenticatorConfirmed = twoFAMethods.authenticatorConfirmed;
		} catch (e) {
			alert('Email is not right.');
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.option,
.boxLabel {
	margin: 10px;
}
</style>
