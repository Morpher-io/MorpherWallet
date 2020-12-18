<template>
	<div class="field">
		<div class="control is-expanded">
			<button class="button is-fullwidth is-grey" @click="doLogin" v-if="!hasRecoveryMethod">
				<span class="icon google-icon">
					<i class="fab fa-google"></i>
				</span>
				<span> Link to VKontakte</span>
			</button>
			<div v-if="hasRecoveryMethod" class="has-text-centered">
				<span class="icon google-icon">
					<i class="fas fa-check-circle"></i>
				</span>
				VKontakte Recovery Added
			</div>
			<div v-if="error">{{ error }}</div>
		</div>
	</div>
</template>

<script>
import { sha256 } from './../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';

@Component()
export default class AddRecoveryVkontakte extends mixins(Global, Authenticated) {
	error = '';
	hasRecoveryMethod = false;
	clientId = process.env.VUE_APP_VK_APP_ID;
	recoveryTypeId = 5;

	callbackUrlForPopup = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

	async mounted() {
		this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
	}

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

	async doLogin() {
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
					//console.log(params)
					//console.log("Access token: " + params.access_token)
					//console.log("UserID: " + params.user_id)

					setTimeout(() => {
						win.close();
						//document.location.reload();
					}, 100);

					const userID = params.user_id;
					this.showSpinner('Saving Keystore for Recovery');

					const key = await sha256(this.clientId + userID);
					this.addRecoveryMethod({ key, password: userID, recoveryTypeId: this.recoveryTypeId })
						.then(async () => {
							this.showSpinnerThenAutohide('Saved Successfully');
							this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
						})
						.catch(e => {
							console.log(e);
							this.showSpinnerThenAutohide('Error');
							this.error = e.toString();
						});
				}
			} catch (e) {
				//win.close()
				console.log(e);
			}
		}, 100);
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
