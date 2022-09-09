<template>
	<div class="field">
		<!-- <div id="appleid-signin" data-color="black" data-border="true" data-type="sign in"></div> -->
		<div class="control is-expanded" v-if="!hasRecoveryMethod">
			<button class="button is-grey big-button outlined-button is-thick facebook-button transition-faster"
				@click="doLogin" v-if="!hasRecoveryMethod" data-cy="vkontakteButton">
				<span class="icon img">
					<img src="@/assets/img/apple_logo.svg" alt="Apple Logo" />
				</span>
				<span>Apple</span>
			</button>


		</div>
		<div v-if="hasRecoveryMethod" class="has-text-centered">
			<div class="control is-expanded" v-if="hasRecoveryMethod">
				<button class="button is-grey big-button outlined-button is-thick facebook-button transition-faster"
					@click="doLogin" v-if="hasRecoveryMethod" data-cy="vkontakteButton">
					<span class="icon img">
						<img src="@/assets/img/apple_logo.svg" alt="Apple Logo" />
					</span>
					<span>Revoke Access</span>
				</button>


			</div>
			<div class="recovery-active is-text-small">
				<span class="icon">
					<i class="fas fa-check-circle"></i>
				</span>
				{{
				 $t('recovery.RECOVERY_ACTIVE', {
				 	currentMethod: 'Apple'
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
import { v4 as uuid } from 'uuid'
import jwt_decode from 'jwt-decode';

const rawNonce = uuid();
const state = uuid();

@Component({
	components: {

	}
})
export default class AddRecoveryApple extends mixins(Global, Authenticated) {
	hasRecoveryMethod = false;
	clientId = process.env.VUE_APP_APPLE_CLIENT_ID;
	recoveryTypeId = 6;

	@Emit('processMethod')
	processMethod(data) {
		return data;
	}

	async mounted() {
		try {

			await window.AppleID.auth.init({
				clientId: this.clientId,
				scope: 'email',
				redirectURI: 'https://wallet-dev.morpher.com',
				state: state,
				nonce: rawNonce,
				usePopup: true
			});

			this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);

		} catch (err) {
			console.log('init error', err)
		}

	}

	async doLogin() {
		try {
			window.AppleID.auth.signIn().then(userData => {
				this.onLogin(userData)
			}).catch(err => {
				this.onError(err)
			})

		} catch (err) {
			this.onError(err)
		}

	}

	onError(error) {
		if (error && error.detail && error.detail.error && error.detail.error == "popup_closed_by_user") {
			return;
		}
		let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
		if (error && error.detail && error.detail.error && error.detail.error) {
			errorMessage = error.detail.error
		}
		if (errorMessage == 'popup_closed_by_user' || errorMessage == 'user_trigger_new_signin_flow') {
			return;
		}

		this.logSentryError('addAppleRecovery', errorMessage, {
			hasRecoveryMethod: this.hasRecoveryMethod,
			clientId: this.clientId,
			recoveryTypeId: this.recoveryTypeId
		});
		let errorText = error.error || error.err || 'Apple login Error';

		if (String(errorText.toLowerCase()).includes('script not loaded correctly')) {
			errorText = 'apple_script_blocked';
		}

		this.processMethod({
			success: false,
			error: errorText
		});
	}

	async onLogin(appleUser) {

		this.showSpinner(this.$t('loader.SAVING_KEYSTORE_RECOVERY'));
		if (appleUser.authorization)
		appleUser = appleUser.authorization;

		const authorizationCode = appleUser.code || appleUser.authorizationCode;
		const identityToken = appleUser.id_token || appleUser.identityToken;
		const nonce = appleUser.nonce;

		const decoded = jwt_decode(identityToken);

		const userID = decoded.sub;
		const email = decoded.email;
		const key = this.clientId + userID

		this.addRecoveryMethod({ key, password: userID, recoveryTypeId: this.recoveryTypeId, token: JSON.stringify({ identityToken, authorizationCode, nonce }), email, currentRecoveryTypeId: this.store.recoveryTypeId })
			.then(async () => {
				if (this.$gtag && window.gtag)
					window.gtag('event', 'add_recovery', {
						method: 'apple'
					});

				this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_SUCCESSFULLY'));
				this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
				this.processMethod({
					success: true,
					method: 'Apple',
					enabled: true,
					erorr: ''
				});
			})
			.catch((error) => {
				let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
				console.log('onLogin error', errorMessage)
				this.logSentryError('addAppleRecovery', errorMessage, {
					hasRecoveryMethod: this.hasRecoveryMethod,
					clientId: this.clientId,
					recoveryTypeId: this.recoveryTypeId,
					appleUser
				});
				this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_ERROR'));
				this.processMethod({
					success: false,
					method: 'Apple',
					enabled: true,
					erorr: ''
				});
			});
	}

	async onDelete(appleUser) {
		console.log('onDelete', appleUser)

		return;
		// this.showSpinner(this.$t('loader.DELETING_KEYSTORE_RECOVERY'));
		// const userID = appleUser.getBasicProfile().getId();
		// const key = await sha256(this.clientId + userID);
		// this.resetRecoveryMethod({ key, recoveryTypeId: this.recoveryTypeId })
		// 	.then(async () => {
		// 		this.showSpinnerThenAutohide(this.$t('loader.DELETED_KEYSTORE_SUCCESSFULLY'));
		// 		this.hasRecoveryMethod = false;
		// 		this.processMethod({
		// 			success: true,
		// 			method: 'Apple',
		// 			enabled: false,
		// 			erorr: ''
		// 		});
		// 	})
		// 	.catch((error) => {
		// 		this.logSentryError('deleteAppleRecovery', error.toString(), {
		// 			hasRecoveryMethod: this.hasRecoveryMethod,
		// 			clientId: this.clientId,
		// 			recoveryTypeId: this.recoveryTypeId,
		// 			appleUser
		// 		});
		// 		this.showSpinnerThenAutohide(this.$t('common.ERROR_FIND_USER'));
		// 		this.processMethod({
		// 			success: false,
		// 			method: 'Apple',
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
