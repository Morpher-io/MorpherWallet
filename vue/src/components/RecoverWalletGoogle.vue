<template>
	<div class="control is-expanded" v-if="clientId">
		<LoginGoogle @processMethod="processMethod" ></LoginGoogle>
	</div>
</template>

<script>
import LoginGoogle from '../components/LoginGoogleV2.vue';

import ChangePassword from './ChangePassword.vue';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';
import { sha256 } from '../utils/cryptoFunctions';
import { getDictionaryValue } from '../utils/dictionary';
import { Watch } from 'vue-property-decorator';

@Component({
	components: {
		LoginGoogle,
		ChangePassword
	}
})
export default class RecoverWalletGoogle extends mixins(Global) {
	clientId = process.env.VUE_APP_GOOGLE_APP_ID;

	recoveryTypeId = 3;

	logonError = '';

	@Emit('setPassword')
	setPassword(data) {
		return data;
	}

	@Watch('store.hiddenLogin')
	onPropertyChanged(value) {
		this.executeHiddenRecovery()
	}

	onError(error) {
		let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
		console.log('onError', errorMessage)

		this.logSentryError('recoverWalletGoogle', errorMessage, { clientId: this.clientId });
		let errorText = error.error || error.err || 'Google login Error';

		if (String(errorText.toLowerCase()).includes('script not loaded correctly')) {
			errorText = 'google_script_blocked';
		}

		this.setPassword({
			success: false,
			error: errorText
		});
	}

	executeHiddenRecovery() {


		if (this.store.hiddenLogin && this.store.hiddenLogin.type == 'recovery') {
			let recoveryData = this.store.hiddenLogin.recovery
			if (recoveryData.type == 'google') {
				this.processMethod(recoveryData.data)
			}
		

		}

	}

		/**
	 * Cmponent mounted lifestyle hook
	 */
	 async mounted() {
		this.executeHiddenRecovery();
	}

	processMethod(data) {
		this.logonError = '';

		if (data.success) {
			this.onLogin(data)
		} else {
			if (data.error === 'popup_closed_by_user') {
				this.logonError = getDictionaryValue('GOOGLE_COOKIES_BLOCKED');
			} else if (data.error === 'google_script_blocked') {
				this.logonError = getDictionaryValue('GOOGLE_SCRIPT_BLOCKED');
			} else {
				this.logonError = data.method + ': ' + getDictionaryValue(data.error);
			}
		}
	}

	async onLogin(googleUser) {
		this.showSpinner(this.$t('loader.RECOVERY_LOG_IN'));
		try {
			const userID = googleUser.userID;

			const accessToken = googleUser.token;

			const key = googleUser.key

			const oldPassword = await sha256(userID)
			
			this.fetchWalletFromRecovery({ key, accessToken, password: oldPassword, recoveryTypeId: this.recoveryTypeId })
				.then(() => {
					this.hideSpinner();
					this.setPassword({
						success: true,
						oldPassword: oldPassword
					});
				})
				.catch((error) => {
					let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
					console.log('onLogin error', errorMessage)

					this.logSentryError('recoverWalletGoogle', errorMessage, { userID });
					this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'));
					this.setPassword({
						success: false,
						error: this.$t('loader.NO_RECOVERY_FOUND')
					});
				});
		} catch (error) {
			let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
			console.log('onLogin error', errorMessage)

			this.logSentryError('recoverWalletGoogle', errorMessage, { googleUser });
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
