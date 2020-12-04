<template>
	<div class="container">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div v-if="twoFaRequired.email" class="container">
			<h2 class="title">Email Authenticaion</h2>
			<h4 class="subtitle">Please input two FA email code</h4>
			<form v-on:submit.prevent="validateEmailCode">
				<input style="margin:10px" type="text" id="email" class="option" v-model="emailCode" />
				<label style="margin:10px" class="boxLabel" for="email">Email Code</label>
				<span></span>
				<input type="submit" style="margin: 10px" value="Submit" />
			</form>
			<br />
		</div>
		<div v-if="twoFaRequired.authenticator" class="container">
			<h2 class="title">Authenticator Unlock</h2>
			<h4 class="subtitle">Please input two FA Authenticator code</h4>
			<form v-on:submit.prevent="validateAuthenticatorCode">
				<input style="margin:10px" type="text" id="authenticator" class="option" v-model="authenticatorCode" />
				<label style="margin:10px" class="boxLabel" for="authenticator">Authenticator Code</label>
				<span></span>
				<input type="submit" style="margin: 10px" value="Submit" />
			</form>
			<br />
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';

@Component
export default class TwoFA extends mixins(Global) {
	// Component properties
	emailCode = '';
	authenticatorCode = '';
	showRecovery = false;

	/**
	 * Process email 2fa authentication
	 */
	async validateEmailCode() {
		this.unlock2FA({ email2FA: this.emailCode, authenticator2FA: '' })
			.then(() => {
				this.$router.push('/');
			})
			.catch(error => {
				console.log(error);
			});
	}

	/**
	 * Process authenticator 2fa validation
	 */
	async validateAuthenticatorCode() {
		this.unlock2FA({ email2FA: '', authenticator2FA: this.authenticatorCode })
			.then(() => {
				this.$router.push('/');
			})
			.catch(err => {
				console.log(err);
			});
	}
}
</script>
