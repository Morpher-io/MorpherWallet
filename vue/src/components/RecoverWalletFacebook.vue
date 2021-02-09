<template>
	<div class="control is-expanded">
		<v-facebook-login
			type="button"
			class="button is-fullwidth"
			:appId="clientId"
			@sdk-init="handleSdkInit"
			@login="onLogin"
			v-model="facebook.model"
		>
			<span slot="login">Recover using Facebook</span>
		</v-facebook-login>
		<ChangePassword v-if="seedFound" :presetOldPassword="oldPassword"></ChangePassword>
	</div>
</template>

<script>
import VFacebookLogin from 'vue-facebook-login-component';
import ChangePassword from './ChangePassword.vue';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';

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
	seedFound = false; //if seed was found, the user can enter a new password
	oldPassword = '';

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
					this.facebook.FB.api("/me/permissions","DELETE", async () =>{
						this.facebook.scope.logout();
						this.hideSpinner();
						this.seedFound = true;
						this.oldPassword = userID;
					});
				})
				.catch(error => {
					this.facebook.FB.api("/me/permissions","DELETE", async () =>{
						this.facebook.scope.logout();
						this.showSpinnerThenAutohide('No recovery found...');
						this.recoveryError = error;
					});
				});
		} catch (e) {
			this.showSpinnerThenAutohide('Your Account was not found');
			this.recoveryError = 'Your Account was not found.';
			console.error(e);
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
