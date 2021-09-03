<template>
	<div class="control is-expanded">
		<v-facebook-login
			:logo-style="{
				color: '#4267B2',
				marginRight: '5px',
				borderRadius: '100px',
				width: '24px',
				height: '24px'
			}"
			type="button"
			class="button is-grey big-button outlined-button is-thick transition-faster facebook-button"
			:appId="clientId"
			@sdk-init="handleSdkInit"
			@login="onLogin"
			v-model="facebook.model"
		>
			<span slot="login">Facebook</span>
		</v-facebook-login>
	</div>
</template>

<script>
import VFacebookLogin from 'vue-facebook-login-component';
import ChangePassword from './ChangePassword.vue';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';

@Component({
	components: {
		VFacebookLogin,
		ChangePassword
	}
})
export default class RecoverWalletFacebook extends mixins(Global) {
	isLogined = false;
	facebook = {
		FB: {},
		model: {},
		scope: {}
	};
	clientId = process.env.VUE_APP_FACEBOOK_APP_ID;
	recoveryTypeId = 2;

	@Emit('setPassword')
	setPassword(data) {
		return data;
	}

	handleSdkInit({ FB, scope }) {
		this.facebook.scope = scope;
		this.facebook.FB = FB;
	}

	async onLogin(data) {
		this.showSpinner('Trying to Login...');
		try {
			const userID = data.authResponse.userID;
			const accessToken = data.authResponse.accessToken;

			this.fetchWalletFromRecovery({ accessToken, password: userID, recoveryTypeId: this.recoveryTypeId })
				.then(() => {
					this.facebook.FB.api('/me/permissions', 'DELETE', async () => {
						this.facebook.scope.logout();
						this.hideSpinner();
						this.setPassword({
							success: true,
							oldPassword: userID
						});
					});
				})
				.catch(error => {
					this.facebook.FB.api('/me/permissions', 'DELETE', async () => {
						this.facebook.scope.logout();
						this.showSpinnerThenAutohide('No recovery found...');
						this.recoveryError = error;
						this.setPassword({
							success: false,
							oldPassword: null,
							error: error
						});
					});
				});
		} catch (e) {
			this.showSpinnerThenAutohide('Your Account was not found');
			this.recoveryError = 'Your Account was not found.';
			this.setPassword({
				success: false,
				oldPassword: null,
				error: 'Your account was not found.'
			});
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.facebook-button {
	border-radius: 7px !important;
}
</style>
