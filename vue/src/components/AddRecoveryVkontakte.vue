<template>
	<div class="field">
		<div class="control is-expanded">
			<button
				class="button is-grey big-button outlined-button is-thick facebook-button transition-faster"
				@click="doLogin"
				v-if="!hasRecoveryMethod"
				data-cy="vkontakteButton"
			>
				<span class="icon img">
					<img src="@/assets/img/vk_logo.svg" alt="VKontakte Logo" />
				</span>
				<span>VKontakte</span>
			</button>
		</div>

		<div class="control is-expanded has-text-centered" v-if="hasRecoveryMethod">
			<button class="button big-button is-thick transition-faster vk-button" @click="doDelete">
				<span class="icon img">
					<img src="@/assets/img/vk_logo_white.svg" alt="VKontakte Logo" />
				</span>
				<span class="text">{{ $t('recovery.REVOKE_ACCESS') }}</span>
			</button>
			<div class="recovery-active is-text-small">
				<span class="icon">
					<i class="fas fa-check-circle"></i>
				</span>
				{{
					$t('recovery.RECOVERY_ACTIVE', {
						currentMethod: 'VKontakte'
					})
				}}
			</div>
		</div>
	</div>
</template>

<script>
import { sha256 } from './../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';

@Component()
export default class AddRecoveryVkontakte extends mixins(Global, Authenticated) {
	hasRecoveryMethod = false;
	clientId = process.env.VUE_APP_VK_APP_ID;
	recoveryTypeId = 5;
	watchTimer = null;

	callbackUrlForPopup = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

	@Emit('processMethod')
	processMethod(data) {
		return data;
	}

	async mounted() {
		this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
	}
	async unmounted() {
		if (this.watchTimer) clearInterval(this.watchTimer);
	}
	async destroyed() {
		if (this.watchTimer) clearInterval(this.watchTimer);
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
					}, 100);

					const userID = params.user_id;
					this.showSpinner(this.$t('loader.SAVING_KEYSTORE_RECOVERY'));

					const key = await sha256(this.clientId + userID);
					this.addRecoveryMethod({ key, password: userID, recoveryTypeId: this.recoveryTypeId })
						.then(async () => {
							if (this.$gtag && window.gtag)
								window.gtag('event', 'add_recovery', {
									method: 'vk'
								});
							this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_SUCCESSFULLY'));
							this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
							this.processMethod({
								success: true,
								method: 'VKontakte',
								enabled: true,
								erorr: ''
							});
						})
						.catch(error => {
							this.logSentryError('addRecoveryVK', error.toString(), { key, password: userID, recoveryTypeId: this.recoveryTypeId });
							this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_ERROR'));
							this.processMethod({
								success: false,
								method: 'VKontakte',
								enabled: true,
								erorr: ''
							});
						});
				}
			} catch {
				return;
			}
		}, 100);
	}

	async doDelete() {
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
					}, 100);

					const userID = params.user_id;
					this.showSpinner(this.$t('loader.DELETING_KEYSTORE_RECOVERY'));

					const key = await sha256(this.clientId + userID);
					this.resetRecoveryMethod({ key, recoveryTypeId: this.recoveryTypeId })
						.then(async () => {
							this.showSpinnerThenAutohide(this.$t('loader.DELETED_KEYSTORE_SUCCESSFULLY'));
							this.hasRecoveryMethod = false;
							this.processMethod({
								success: true,
								method: 'VKontakte',
								enabled: false,
								erorr: ''
							});
						})
						.catch(error => {
							this.logSentryError('deleteRecoveryVK', error.toString(), { key, password: userID, recoveryTypeId: this.recoveryTypeId });
							this.showSpinnerThenAutohide(this.$t('common.ERROR_FIND_USER'));
							this.processMethod({
								success: false,
								method: 'VKontakte',
								enabled: false,
								erorr: ''
							});
						});
				}
			} catch (e) {
				return;
			}
		}, 100);
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.vk-button {
	background-color: #45668e;
}
.vk-text {
	color: #fff;
}
.vk-icon {
	color: #45668e;
}
</style>
