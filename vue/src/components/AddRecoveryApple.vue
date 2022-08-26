<template>
	<div class="field">
		<div class="control is-expanded" v-if="!hasRecoveryMethod">
		<vue-apple-login
			mode="center-align"
			type="sign in"
			color="white"
			:border="true"
			:radius="15"
			width="100%"
			height="45px"
			logoSize="large"
			:logoPosition="0"
			:labelPosition="0"
			className="vue-apple-login"
			:onSuccess="onLogin"
			:onFailure="onError"
			>
		
			</vue-apple-login>


		</div>
		<div v-if="hasRecoveryMethod" class="has-text-centered">
			<div class="control is-expanded" v-if="hasRecoveryMethod">
			<vue-apple-login
				mode="center-align"
				type="sign in"
				color="white"
				:border="true"
				:radius="15"
				width="100%"
				height="45px"
				logoSize="large"
				:logoPosition="0"
				:labelPosition="0"
				className="vue-apple-login"
				:onSuccess="onDelete"
				:onFailure="onError"
			>
		
			</vue-apple-login>
			</div>
			<div class="recovery-active is-text-small">
				<span class="icon">
					<i class="fas fa-check-circle"></i>
				</span>
				{{
					$t('recovery.RECOVERY_ACTIVE', {
						currentMethod: 'Google'
					})
				}}
			</div>
		</div>
	</div>
</template>

<script>

import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';

@Component({
	components: {
		
	}
})
export default class AddRecoveryApple extends mixins(Global, Authenticated) {
	hasRecoveryMethod = false;
	clientId = process.env.VUE_APP_GOOGLE_APP_ID;
	recoveryTypeId = 6;

	@Emit('processMethod')
	processMethod(data) {
		return data;
	}

	async mounted() {
		this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
	}

	onError(error) {
		if (error && error.detail && error.detail.error  && error.detail.error == "popup_closed_by_user") {
			return;
		}
		let errorMessage = error.error || error.err || error.message || JSON.stringify(error)		
		if (error && error.detail && error.detail.error  && error.detail.error) {
			errorMessage = error.detail.error
		}
		
		console.log('onError', errorMessage)

		this.logSentryError('addAppleRecovery', errorMessage, {
			hasRecoveryMethod: this.hasRecoveryMethod,
			clientId: this.clientId,
			recoveryTypeId: this.recoveryTypeId
		});
		let errorText = error.error || error.err || 'Google login Error';

		if (String(errorText.toLowerCase()).includes('script not loaded correctly')) {
			errorText = 'google_script_blocked';
		}

		this.processMethod({
			success: false,
			error: errorText
		});
	}

	async onLogin(googleUser) {
		console.log('success', googleUser)
		
		// this.showSpinner(this.$t('loader.SAVING_KEYSTORE_RECOVERY'));
		// const userID = googleUser.getBasicProfile().getId();
		// const key = await sha256(this.clientId + userID);
		// this.addRecoveryMethod({ key, password: userID, recoveryTypeId: this.recoveryTypeId })
		// 	.then(async () => {
		// 		if (this.$gtag && window.gtag)
		// 			window.gtag('event', 'add_recovery', {
		// 				method: 'google'
		// 			});

		// 		googleUser.disconnect();
		// 		this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_SUCCESSFULLY'));
		// 		this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
		// 		this.processMethod({
		// 			success: true,
		// 			method: 'Google',
		// 			enabled: true,
		// 			erorr: ''
		// 		});
		// 	})
		// 	.catch((error) => {
		// let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
		// 		console.log('onLogin error', errorMessage)					
		// 		this.logSentryError('addAppleRecovery', errorMessage, {
		// 			hasRecoveryMethod: this.hasRecoveryMethod,
		// 			clientId: this.clientId,
		// 			recoveryTypeId: this.recoveryTypeId,
		// 			googleUser
		// 		});
		// 		this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_ERROR'));
		// 		this.processMethod({
		// 			success: false,
		// 			method: 'Google',
		// 			enabled: true,
		// 			erorr: ''
		// 		});
		// 	});
	}

	async onDelete(googleUser) {
		console.log('onDelete', googleUser)

		return;
		// this.showSpinner(this.$t('loader.DELETING_KEYSTORE_RECOVERY'));
		// const userID = googleUser.getBasicProfile().getId();
		// const key = await sha256(this.clientId + userID);
		// this.resetRecoveryMethod({ key, recoveryTypeId: this.recoveryTypeId })
		// 	.then(async () => {
		// 		googleUser.disconnect();
		// 		this.showSpinnerThenAutohide(this.$t('loader.DELETED_KEYSTORE_SUCCESSFULLY'));
		// 		this.hasRecoveryMethod = false;
		// 		this.processMethod({
		// 			success: true,
		// 			method: 'Google',
		// 			enabled: false,
		// 			erorr: ''
		// 		});
		// 	})
		// 	.catch((error) => {
		// 		this.logSentryError('deleteGoogleRecovery', error.toString(), {
		// 			hasRecoveryMethod: this.hasRecoveryMethod,
		// 			clientId: this.clientId,
		// 			recoveryTypeId: this.recoveryTypeId,
		// 			googleUser
		// 		});
		// 		this.showSpinnerThenAutohide(this.$t('common.ERROR_FIND_USER'));
		// 		this.processMethod({
		// 			success: false,
		// 			method: 'Google',
		// 			enabled: false,
		// 			erorr: ''
		// 		});
		// 	});
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.google-icon {
	color: #fc6404;
}
</style>
