<template>
	<div class="control is-expanded">
		<GoogleLogin class="button is-fullwidth is-google" :params="{ clientId }" :onSuccess="onLogin">
			<span class="icon google-icon">
				<i class="fab fa-google"></i>
			</span>
			<span> Recover using Google</span>
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

	onLogin(data) {
		this.showSpinner('Trying to Login...');
		try {
			const userID = data.getBasicProfile().getId();
			const accessToken = data.getAuthResponse(true).access_token;

			this.fetchWalletFromRecovery({ accessToken, password: userID, recoveryTypeId: 3 })
				.then(() => {
					this.hideSpinner();
					this.seedFound = true;
					this.oldPassword = userID;
				})
				.catch(error => {
					this.hideSpinner();
					this.recoveryError = error;
				});
		} catch (e) {
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
</style>
