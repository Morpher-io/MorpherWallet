<template>
	<div class="control is-expanded" v-if="clientId">
		<GoogleLogin
			class="button is-grey big-button outlined-button is-thick transition-faster"
			:params="{ client_id: clientId }"
			:onSuccess="onLogin"
			:onCurrentUser="onLogin"
			:onFailure="onError"
		>
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
		this.logSentryError('recoverWalletGoogle', error.toString(), { clientId: this.clientId });
		let errorText = error.error || error.err || 'Google login Error';

		if (String(errorText.toLowerCase()).includes('script not loaded correctly')) {
			errorText = 'google_script_blocked';
		}

		this.setPassword({
			success: false,
			error: errorText
		});
	}

	onLogin(googleUser) {
		this.showSpinner(this.$t('recovery.RECOVERY_LOG_IN'));
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
				.catch(error => {
					this.logSentryError('recoverWalletGoogle', error.toString(), { userID });
					googleUser.disconnect();
					this.showSpinnerThenAutohide(this.$t('recovery.NO_RECOVERY_FOUND'));
					this.setPassword({
						success: false,
						error: this.$t('recovery.NO_RECOVERY_FOUND')
					});
				});
		} catch (e) {
			this.logSentryError('recoverWalletGoogle', e.toString(), { googleUser })
			this.showSpinnerThenAutohide(this.$t('recovery.NO_RECOVERY_FOUND'));
			this.setPassword({
				success: false,
				error: this.$t('recovery.NO_RECOVERY_FOUND')
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
