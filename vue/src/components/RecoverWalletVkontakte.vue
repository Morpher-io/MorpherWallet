<template>
	<div class="control is-expanded">
		<button type="button" class="button is-fullwidth" @click="doLogin">Recover using VKontakte</button>
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
export default class RecoveryWalletVkontakte extends mixins(Global) {
	isLoggedIn = false;
	recoveryError = '';
	seedFound = false; //if seed was found, the user can enter a new password
	oldPassword = '';
	clientId = process.env.VUE_APP_VK_APP_ID;
	recoveryTypeId = 5;

	callbackUrlForPopup = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
	vkPopup(options) {
		const screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
			screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
			outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
			outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : document.body.clientHeight - 22,
			width = options.width,
			height = options.height,
			left = parseInt(screenX + (outerWidth - width) / 2, 10),
			top = parseInt(screenY + (outerHeight - height) / 2.5, 10),
			features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
		return window.open(options.url, 'vk_oauth', features);
	}

	doLogin() {
		const redirectUri = this.callbackUrlForPopup;
		const uriRegex = new RegExp(redirectUri);
		const url =
			'http://oauth.vk.com/authorize?client_id=7548057&display=popup&v=5.120&response_type=token&scope=offline&redirect_uri=' + redirectUri;
		const win = this.vkPopup({
			width: 620,
			height: 370,
			url: url
		});

		const watchTimer = setInterval(async () => {
			try {
				if (uriRegex.test(win.location)) {
					clearInterval(watchTimer);

					const hash = win.location.hash.substr(1);
					const params = hash.split('&').reduce((result, item) => {
						const parts = item.split('=');
						result[parts[0]] = parts[1];
						return result;
					}, {});

					setTimeout(() => {
						win.close();
						//document.location.reload();
					}, 500);

					this.showSpinner('Trying to Login...');
					try {
						const userID = params.user_id;
						const accessToken = params.access_token;

						this.fetchWalletFromRecovery({ accessToken, password: userID, recoveryTypeId: this.recoveryTypeId })
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
						this.hideSpinner();
						this.recoveryError = e.toString();
						console.error(e);
					}
				}
			} catch (e) {
				console.log(e);
			}
		}, 100);
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
