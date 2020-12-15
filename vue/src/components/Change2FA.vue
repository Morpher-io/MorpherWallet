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
							<label class="label">
								<input type="checkbox" class="checkbox" id="email" v-model="email" />
								2FA with Email Codes enabled
							</label>
						</div>

						<div class="field">
							<label class="label">
								<input type="checkbox" class="checkbox" id="authenticator" v-model="authenticator" />
								2FA with Authenticator Codes enabled
							</label>
						</div>
						<figure class="image" v-if="this.authenticator && (this.qrCode !== '' || this.qrCode !== undefined)">
							<img v-bind:src="this.qrCode" />
						</figure>

						<div class="field" v-if="this.authenticator && !this.qrCode">
							<div class="control">
								<button type="button" class="button is-light" value="Generate QR Code" v-on:click="generateQR">
									Generate QR Code for Authenticator
								</button>
							</div>
						</div>

						<div class="field" v-if="this.authenticator && !this.authenticatorConfirmed && this.qrCode">
							<label class="label">Enter the Authenticator Code to Verify Successful Setup!</label>
							<div class="control">
								<input type="text" placeholder="Authenticator Code" class="textbox" v-model="authenticatorCode" />
							</div>
						</div>

						<div class="field" v-if="this.authenticator && !this.authenticatorConfirmed && this.qrCode">
							<div class="control">
								<button
									v-if="this.authenticator && !this.authenticatorConfirmed && this.qrCode"
									class="button is-light"
									type="button"
									v-on:click="confirmAuthenticator"
								>
									Confirm Authenticator Code
								</button>
							</div>
						</div>
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
import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { verifyAuthenticatorCode } from '../utils/backupRestore';

@Component({})
export default class ChangeEmail extends mixins(Global, Authenticated) {
	email = false;
	authenticator = false;
	authenticatorConfirmed = false;
	authenticatorCode = '';
	qrCode = '';
	collapsed = true;
	success = true;

	async formSubmitChange2FA() {
		if (this.authenticator && !this.authenticatorConfirmed) {
			alert('Please confirm Authenticator first.');
			return;
		}
		try {
			await this.updatePayload(this.email, this.authenticator, this.authenticatorCode);
			this.success = true;
		} catch (e) {
			console.log(e);
		}
	}

	async confirmAuthenticator() {
		this.authenticatorConfirmed = await verifyAuthenticatorCode(this.store.email, this.authenticatorCode);

		if (this.authenticatorConfirmed) {
			alert('Authenticator confirmed.');
		} else {
			alert('Authenticator code is not right.');
		}
	}

	async generateQR() {
		this.authenticatorConfirmed = false;
		this.authenticatorCode = '';

		this.qrCode = (await this.generateQRCode()).image;
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
<style scoped>
.option,
.boxLabel {
	margin: 10px;
}
</style>
