<template>
	<div class="field">
		<div class="control is-expanded" v-if="!hasRecoveryMethod">
			<LoginGoogle @processMethod="processMethod" :recovery="true"></LoginGoogle>
		</div>
		<div v-if="hasRecoveryMethod" class="has-text-centered">
			<div class="control is-expanded" v-if="hasRecoveryMethod">
				<LoginGoogle @processMethod="revokeAccess"></LoginGoogle>
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
import LoginGoogle from '../components/LoginGoogleV2.vue';
import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { Emit } from 'vue-property-decorator';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		LoginGoogle
	}
})
export default class AddRecoveryGoogle extends mixins(Global, Authenticated) {
	hasRecoveryMethod = false;
	clientId = process.env.VUE_APP_GOOGLE_APP_ID;
	recoveryTypeId = 3;
	logonError = '';

	async mounted() {
		this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
	}

	onError(error) {
		let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
		this.logSentryError('addGoogleRecovery', errorMessage, {
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

	revokeAccess(data) {

		this.logonError = '';

		if (data.success) {
			this.onDelete(data)
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
		try {

			const userID = googleUser.userID;
			const key = googleUser.key;
			const keyEnc = await sha256(key);
			const token = googleUser.token;

			this.addRecoveryMethod({ key: keyEnc, password: userID, recoveryTypeId: this.recoveryTypeId, token, email: googleUser.email, currentRecoveryTypeId: this.store.recoveryTypeId })
			.then(async () => {
				if (this.$gtag && window.gtag)
					window.gtag('event', 'add_recovery', {
						method: 'google'
					});

				this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_SUCCESSFULLY'));
				this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);

			})
			.catch((error) => {
				let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
				this.logSentryError('addGoogleRecovery', errorMessage, {
					hasRecoveryMethod: this.hasRecoveryMethod,
					clientId: this.clientId,
					recoveryTypeId: this.recoveryTypeId,
					googleUser
				});
				this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_ERROR'));
				this.processMethod({
					success: false,
					method: 'Google',
					enabled: true,
					erorr: ''
				});
			});


		} catch (error) {
			//Not sure what to do here - or if we want to do anything at all?!
			this.onError(error);
		}
	}

	async onDelete(googleUser) {
		this.showSpinner(this.$t('loader.DELETING_KEYSTORE_RECOVERY'));
		const userID = googleUser.userID;
		const key = googleUser.key;
		const keyEnc = await sha256(key);
		const token = googleUser.token;

		this.resetRecoveryMethod({ key: keyEnc, recoveryTypeId: this.recoveryTypeId, token })
			.then(async () => {
				this.showSpinnerThenAutohide(this.$t('loader.DELETED_KEYSTORE_SUCCESSFULLY'));
				this.hasRecoveryMethod = false;
				// this.processMethod({
				// 	success: true,
				// 	method: 'Google',
				// 	enabled: false,
				// 	erorr: ''
				// });
			})
			.catch((error) => {
				let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
				console.log('onDelete error', errorMessage)					
				this.logSentryError('deleteGoogleRecovery', errorMessage, {
					hasRecoveryMethod: this.hasRecoveryMethod,
					clientId: this.clientId,
					recoveryTypeId: this.recoveryTypeId,
					googleUser
				});
				this.showSpinnerThenAutohide(this.$t('common.ERROR_FIND_USER'));
				this.processMethod({
					success: false,
					method: 'Google',
					enabled: false,
					erorr: ''
				});
			});
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.google-icon {
	color: #fc6404;
}
</style>
