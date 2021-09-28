<template>
	<div class="control is-expanded">
		<button type="button" class="button is-grey big-button outlined-button is-thick transition-faster" @click="doLogin">
			<span class="icon img">
				<img src="@/assets/img/vk_logo.svg" alt="VKontakte Logo" />
			</span>
			<span>VKontakte</span>
		</button>
	</div>
</template>
<script>
import ChangePassword from './ChangePassword.vue';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';

@Component({
	components: {
		ChangePassword
	}
})
export default class RecoveryWalletVkontakte extends mixins(Global) {
	clientId = process.env.VUE_APP_VK_APP_ID;
	recoveryTypeId = 5;
	watchTimer = null;

	@Emit('setPassword')
	setPassword(data) {
		return data;
	}

	unmounted() {
		if (this.watchTimer) clearInterval(this.watchTimer);
	}
	destroyed() {
		if (this.watchTimer) clearInterval(this.watchTimer);
	}

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
		const url = `http://oauth.vk.com/authorize?client_id=${process.env.VUE_APP_VK_APP_ID}&display=popup&v=5.120&response_type=token&scope=offline&redirect_uri=${redirectUri}`;
		const win = this.vkPopup({
			width: 620,
			height: 370,
			url: url
		});

		if (this.watchTimer) clearInterval(this.watchTimer);
		this.watchTimer = setInterval(async () => {
			try {
				if (uriRegex.test(win.location)) {
					if (this.watchTimer) clearInterval(this.watchTimer);

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

					this.showSpinner('Trying to log in...');
					try {
						const userID = params.user_id;
						const accessToken = params.access_token;

						this.fetchWalletFromRecovery({ accessToken, password: userID, recoveryTypeId: this.recoveryTypeId })
							.then(() => {
								this.hideSpinner();
								this.setPassword({
									success: true,
									oldPassword: userID
								});
							})
							.catch(error => {
								this.logSentryError('recoverWalletVK', error.toString(), { accessToken, password: userID, recoveryTypeId: this.recoveryTypeId })
								this.showSpinnerThenAutohide('No recovery found...');
								this.setPassword({
									success: false,
									error: error
								});
							});
					} catch (e) {
						this.logSentryError('recoverWalletVK', e.toString(), {  })
						this.showSpinnerThenAutohide('No recovery found...');
						this.setPassword({
							success: false,
							error: e.toString()
						});
					}
				}
			} catch {
				return;
			}
		}, 100);
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.vk-icon {
	color: #45668e;
}
</style>
