<template>
	<div class="control is-expanded">
		<GoogleLogin class="button is-grey big-button outlined-button is-thick transition-faster" :params="{ clientId }" :onSuccess="onLogin" :onCurrentUser="onLogin" :onFailure="onError">
			<span class="icon img">
				<img src="@/assets/img/google_logo.svg" alt="Google Logo" />
			</span>
			<span>Google</span>
		</GoogleLogin>
	</div>
</template>

<script>
import GoogleLogin from 'vue-google-login';
import ChangePassword from './ChangePassword.vue';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';

@Component({
	components: {
		GoogleLogin,
		ChangePassword
	}
})
export default class RecoverWalletGoogle extends mixins(Global) {
	clientId = process.env.VUE_APP_GOOGLE_APP_ID;
	
	recoveryTypeId = 3;

	@Emit('setPassword')
	setPassword(data) {
		return data;
	}

	onError(error) {
		console.log('google login error', error)
		this.setPassword({
				success: false,
				error: 'Google Access Error'
			});
	}

	onLogin(googleUser) {
		
		this.showSpinner('Trying to Login...');
		try {
			const userID = googleUser.getBasicProfile().getId();
			const accessToken = googleUser.getAuthResponse(true).access_token;

			this.fetchWalletFromRecovery({ accessToken, password: userID, recoveryTypeId: this.recoveryTypeId })
				.then(() => {
					googleUser.disconnect();
					this.hideSpinner();
					this.setPassword({
						success: true,
						oldPassword: userID
					});
				})
				.catch(() => {
					googleUser.disconnect();
					this.showSpinnerThenAutohide('No recovery found');
					this.setPassword({
						success: false,
						error: 'No recovery found'
					});
				});
		} catch (e) {
			this.showSpinnerThenAutohide('No recovery found');
			this.setPassword({
				success: false,
				error: 'No recovery found'
			});
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.google-icon {
	color: #fc6404;
}
</style>
