<template>
	<div class="control is-expanded">
		<v-facebook-login
			:logo-style="{
				display: 'none'
			}"
			type="button"
			class="button is-grey big-button outlined-button is-thick transition-faster facebook-button"
			:appId="clientId"
			@sdk-init="handleSdkInit"
			@login="onLogin"
			v-model="facebook.model"
		>
			<span class="is-flex is-align-items-center" slot="login">
				<span class="icon img">
					<img src="@/assets/img/fb_logo.svg" alt="Facebook Logo" />
				</span>
				<span>Facebook</span>
			</span>
		</v-facebook-login>
	</div>
</template>

<script>
import VFacebookLogin from 'vue-facebook-login-component';
import ChangePassword from './ChangePassword.vue';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';

@Component({
	components: {
		VFacebookLogin,
		ChangePassword
	}
})
export default class RecoverWalletFacebook extends mixins(Global) {
	isLogined = false;
	facebook = {
		FB: {},
		model: {},
		scope: {}
	};
	clientId = process.env.VUE_APP_FACEBOOK_APP_ID;
	recoveryTypeId = 2;

	@Emit('setPassword')
	setPassword(data) {
		return data;
	}

	handleSdkInit({ FB, scope }) {
		this.facebook.scope = scope;
		this.facebook.FB = FB;
	}

	async onLogin(data) {
		this.showSpinner(this.$t('recovery.RECOVERY_LOG_IN'));
		try {
			const userID = data.authResponse.userID;
			const accessToken = data.authResponse.accessToken;

			this.fetchWalletFromRecovery({ accessToken, password: userID, recoveryTypeId: this.recoveryTypeId })
				.then(() => {
					this.facebook.FB.api('/me/permissions', 'DELETE', async () => {
						this.facebook.scope.logout();
						this.hideSpinner();
						this.setPassword({
							success: true,
							oldPassword: userID
						});
					});
				})
				.catch((error) => {
					this.logSentryError('facebookRecovery', error.toString(), { userID });
					this.facebook.FB.api('/me/permissions', 'DELETE', async () => {
						this.facebook.scope.logout();
						this.showSpinnerThenAutohide(this.$t('recovery.NO_RECOVERY_FOUND'));
						this.recoveryError = error;
						this.setPassword({
							success: false,
							oldPassword: null,
							error: error
						});
					});
				});
		} catch (e) {
			this.logSentryError('facebookRecovery', e.toString(), data);
			this.showSpinnerThenAutohide(this.$t('recovery.NO_ACCOUNT_FOUND'));
			this.recoveryError = this.$t('recovery.NO_ACCOUNT_FOUND');
			this.setPassword({
				success: false,
				oldPassword: null,
				error: this.$t('recovery.NO_ACCOUNT_FOUND')
			});
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.facebook-button {
	border-radius: 7px !important;
}
</style>
