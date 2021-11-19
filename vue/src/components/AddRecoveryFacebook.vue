<template>
	<div class="field">
		<div class="control is-expanded" v-if="!hasRecoveryMethod">
			<v-facebook-login
				:logo-style="{
					display: 'none'
				}"
				class="button is-grey big-button outlined-button is-thick facebook-button transition-faster"
				:appId="clientId"
				@sdk-init="handleSdkInit"
				@login="onLogin"
				v-model="facebook.model"
				data-cy="facebookButton"
				><span class="is-flex is-align-items-center" slot="login">
					<span class="icon img">
						<img src="@/assets/img/fb_logo.svg" alt="Facebook Logo" />
					</span>
					<span>Facebook</span>
				</span>
			</v-facebook-login>
		</div>
		<div class="control is-expanded has-text-centered" v-if="hasRecoveryMethod">
			<v-facebook-login
				:logo-style="{
					display: 'none'
				}"
				class="button is-danger big-button is-thick transition-faster facebook-button"
				:appId="clientId"
				@sdk-init="handleSdkInit"
				@login="deleteRecovery"
				v-model="facebook.model"
				><span class="is-flex is-align-items-center" slot="login">
					<span class="icon img">
						<img src="@/assets/img/fb_logo_white.svg" alt="Facebook Logo" />
					</span>
					<span>{{ $t('recovery.REVOKE_ACCESS') }}</span>
				</span>
			</v-facebook-login>
			<div class="recovery-active is-text-small">
				<span class="icon">
					<i class="fas fa-check-circle"></i>
				</span>
				{{
					$t('recovery.RECOVERY_ACTIVE', {
						currentMethod: 'Facebook'
					})
				}}
			</div>
		</div>
	</div>
</template>

<script>
import VFacebookLogin from 'vue-facebook-login-component';
import { sha256 } from './../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';

@Component({
	components: {
		VFacebookLogin
	}
})
export default class AddRecoveryFacebook extends mixins(Global, Authenticated) {
	facebook = {
		FB: {},
		model: {},
		scope: {}
	};
	clientId = process.env.VUE_APP_FACEBOOK_APP_ID;
	recoveryTypeId = 2;
	hasRecoveryMethod = false;
	processing = false;

	@Emit('processMethod')
	processMethod(data) {
		return data;
	}

	handleSdkInit({ FB, scope }) {
		this.facebook.scope = scope;
		this.facebook.FB = FB;
	}

	async mounted() {
		this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
	}

	async onLogin(data) {
		this.processing = true;

		if (data == undefined) {
			// this.showSpinnerThenAutohide('Aborted Facebook Recovery');
			this.processMethod({
				success: false,
				method: 'Facebook',
				enabled: true,
				erorr: ''
			});
			return;
		}
		this.showSpinner(this.$t('loader.SAVING_KEYSTORE_RECOVERY'));
		const userID = data.authResponse.userID;
		const key = await sha256(this.clientId + userID);

		this.addRecoveryMethod({ key, password: userID, recoveryTypeId: this.recoveryTypeId })
			.then(async () => {
				const self = this;
				const win = window;
				if (self.$gtag && win.gtag)
					win.gtag('event', 'add_recovery', {
						method: 'fb'
					});

				this.facebook.FB.api('/me/permissions', 'DELETE', async () => {
					this.facebook.scope.logout();
					this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_SUCCESSFULLY'));
					this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
					this.processing = false;
					this.processMethod({
						success: true,
						method: 'Facebook',
						enabled: true,
						erorr: ''
					});
				});

			})
			.catch(error => {
				this.logSentryError('addFacebookRecovery', error.toString(), { key, password: userID, recoveryTypeId: this.recoveryTypeId });
				this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_ERROR'));
				this.processing = false;
				this.processMethod({
					success: false,
					method: 'Facebook',
					enabled: true,
					erorr: ''
				});
			});
	}

	async deleteRecovery(data) {
		this.processing = true;
		if (data == undefined) {
			// this.showSpinnerThenAutohide('Aborted Facebook Recovery');
			this.processMethod({
				success: false,
				method: 'Facebook',
				enabled: false,
				erorr: ''
			});
			return;
		}

		this.showSpinner(this.$t('loader.DELETING_KEYSTORE_RECOVERY'));
		const userID = data.authResponse.userID;
		const key = await sha256(this.clientId + userID);
		this.resetRecoveryMethod({ key, recoveryTypeId: this.recoveryTypeId })
			.then(async () => {
				this.facebook.FB.api('/me/permissions', 'DELETE', () => {
					this.facebook.scope.logout();
					this.showSpinnerThenAutohide(this.$t('loader.DELETED_KEYSTORE_SUCCESSFULLY'));
					this.hasRecoveryMethod = false;
					this.processing = false;
					this.processMethod({
						success: true,
						method: 'Facebook',
						enabled: false,
						erorr: ''
					});
				});
			})
			.catch(error => {
				this.logSentryError('deleteFacebookRecovery', error.toString(), { data, recoveryTypeId: this.recoveryTypeId });
				this.showSpinnerThenAutohide(this.$t('common.ERROR_FIND_USER'));
				this.processing = false;
				this.processMethod({
					success: false,
					method: 'Facebook',
					enabled: false,
					erorr: ''
				});
			});
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.facebook-button {
	border-radius: 7px !important;
	align-items: center;
}
</style>
