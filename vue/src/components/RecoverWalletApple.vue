<template>
	<div class="control is-expanded" v-if="clientId">
		<LoginApple recover=true  @processMethod="onLogin"></LoginApple>
	</div>
</template>

<script>
import LoginApple from './LoginApple.vue';
import ChangePassword from './ChangePassword.vue';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';
import { sha256 } from '../utils/cryptoFunctions';
import { Watch } from 'vue-property-decorator';

@Component({
	components: {
		LoginApple,
		ChangePassword
	}
})
export default class RecoverWalletApple extends mixins(Global) {

	clientId = process.env.VUE_APP_APPLE_CLIENT_ID;
	recoveryTypeId = 6;

	@Emit('setPassword')
	setPassword(data) {
		return data;
	}

	@Watch('store.hiddenLogin')
	onPropertyChanged(value) {
		this.executeHiddenRecovery()
	}

	executeHiddenRecovery() {
		if (this.store.hiddenLogin && this.store.hiddenLogin.type == 'recovery') {
			let recoveryData = this.store.hiddenLogin.recovery
			if (recoveryData.type == 'apple') {
				this.onLogin(recoveryData.data)
			}
		}
	}

	/**
	* Cmponent mounted lifestyle hook
	*/
	async mounted() {
		this.executeHiddenRecovery();
	}

	onError(error) {
		this.logSentryError('recoverWalletApple', error.toString(), { clientId: 6 });
		let errorText = error.error || error.err || 'Apple login Error';

		if (String(errorText.toLowerCase()).includes('script not loaded correctly')) {
			errorText = 'apple_script_blocked';
		}

		this.setPassword({
			success: false,
			error: errorText
		});
	}

	async onLogin(appleUser) {
		this.showSpinner(this.$t('loader.RECOVERY_LOG_IN'));
		try {
			const key = appleUser.key
			const email = appleUser.email || appleUser.key
			const userID = appleUser.userID;
			const recoveryTypeId = appleUser.recoveryTypeId;
			const recaptchaToken = this.recaptchaToken;
			const accessToken = appleUser.token;

			const oldPassword = await sha256(userID)


			this.fetchWalletFromRecovery({ key, accessToken, password: oldPassword, recoveryTypeId })
				.then(() => {
					this.hideSpinner();
					this.setPassword({
						success: true,
						oldPassword: oldPassword
					});
				})
				.catch((error) => {
					this.logSentryError('recoverWalletApple', error.toString(), { userID });
					this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'));
					this.setPassword({
						success: false,
						error: this.$t('loader.NO_RECOVERY_FOUND')
					});
				});
		} catch (e) {
			this.logSentryError('recoverWalletApple', e.toString(), { appleUser });
			this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'));
			this.setPassword({
				success: false,
				error: this.$t('loader.NO_RECOVERY_FOUND')
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
