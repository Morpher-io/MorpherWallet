<template>
	<div class="control is-expanded">
		<GoogleLogin
			class="button is-fullwidth is-google"
			:params="{ client_id: '376509986959-k6tstmq30f4spbp9vd1u94tvt8dg714b.apps.googleusercontent.com' }"
			:onSuccess="onLogin"
		>
			<span class="icon google-icon">
				<i class="fab fa-google"></i>
			</span>
			<span> Recover using Google</span>
		</GoogleLogin>
		<ChangePassword v-bind:presetOldPassword="oldPassword"></ChangePassword>
	</div>
</template>

<script>
import GoogleLogin from 'vue-google-login';
import ChangePassword from './ChangePassword.vue';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';

@Component({
	components: {
		GoogleLogin,
		ChangePassword
	}
})
export default class GoogleRecoverWallet extends mixins(Global, Authenticated) {
	isLoggedIn = false;
	recoveryError = '';
	seedFound = false; //if seed was found, the user can enter a new password
	oldPassword = '123456';
	async onLogin(data) {
		const userID = data.Da;
		const accessToken = data.wc.access_token;
		this.fetchWalletFromRecovery({ accessToken, userId: userID, recoveryTypeId: 3 })
			.then(() => {
				this.seedFound = true;
				this.oldPassword = userID;
			})
			.catch(error => {
				this.recoveryError = error;
			});
		// //const encryptedSeedFacebook = await recoverGoogleSeed(accessToken, this.walletEmail);
		// let newPasswordForLocalStorage = prompt('Enter a new password for you local vault', 'Super Strong Pass0wrd!');
		// //double hashing the password
		// newPasswordForLocalStorage = await sha256(newPasswordForLocalStorage);
		// const encryptedSeedPassword = await changePasswordEncryptedSeed(encryptedSeedFacebook, userID, newPasswordForLocalStorage);
		// saveWalletEmailPassword(this.walletEmail, encryptedSeedPassword);
		// window.localStorage.setItem('encryptedSeed', JSON.stringify(encryptedSeedPassword));
		// window.sessionStorage.setItem('password', newPasswordForLocalStorage);
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
