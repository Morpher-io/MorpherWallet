<template>
	<div class="control is-expanded">
		<GoogleLogin class="button is-fullwidth is-google" :params="{ clientId }" :onSuccess="onLogin">
			<span class="icon google-icon">
				<i class="fab fa-google"></i>
			</span>
			<span class="header-text"> Recover using Google</span>
		</GoogleLogin>
		<ChangePassword v-if="seedFound" :presetOldPassword="oldPassword"></ChangePassword>
	</div>
</template>

<script>
import GoogleLogin from 'vue-google-login';
import ChangePassword from './ChangePassword.vue';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';

@Component({
	components: {
		GoogleLogin,
		ChangePassword
	}
})
export default class RecoverWalletGoogle extends mixins(Global) {
	isLoggedIn = false;
	recoveryError = '';
	seedFound = false; //if seed was found, the user can enter a new password
	oldPassword = '';
	clientId = process.env.VUE_APP_GOOGLE_APP_ID;
	recoveryTypeId = 3;

	onLogin(googleUser) {
		this.showSpinner('Trying to Login...');
		try {
			const userID = googleUser.getBasicProfile().getId();
			const accessToken = googleUser.getAuthResponse(true).access_token;

			this.fetchWalletFromRecovery({ accessToken, password: userID, recoveryTypeId: this.recoveryTypeId })
				.then(() => {
					googleUser.disconnect();
					this.hideSpinner();
					this.seedFound = true;
					this.oldPassword = userID;
				})
				.catch(error => {
					googleUser.disconnect();
					this.showSpinnerThenAutohide('No recovery found...');
					this.recoveryError = error;
				});
		} catch (e) {
			this.showSpinnerThenAutohide('No recovery found...');
			this.recoveryError = e.toString();
			console.error(e);
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.is-google {
	background-color: #34a853;
}
.google-icon {
	font-size: 18px;
	margin-right: 10px;
}
.header-text {
	color: #fff;
}
</style>
