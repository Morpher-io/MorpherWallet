<template>
	<div class="field">
		<button class="button is-grey big-button outlined-button is-thick transition-faster" v-if="clientId"
			@click="googleTokenLogin" data-cy="googleButton">
			<span class="icon img">
				<img src="@/assets/img/google_logo.svg" alt="Google Logo" />
			</span>
			<span v-if="signIn">{{ $t('auth.SIGN_UP_GOOGLE') }} </span>
			<span v-else-if="unlock">{{ $t('auth.UNLOCK_GOOGLE') }} </span>
			<span v-else-if="update">{{ $t('auth.UPDATE_GOOGLE') }} </span>
			<span v-else-if="recovery">{{ $t('auth.GOOGLE') }} </span>
			<span v-else>{{ $t('auth.LOG_IN_GOOGLE') }} </span>
		</button>



	</div>
</template>

<script>
import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { Emit, Prop, Watch } from 'vue-property-decorator';

import jwt_decode from 'jwt-decode';

@Component({
	components: {
	}
})
export default class AddRecoveryGoogle extends mixins(Global, Authenticated) {
	hasRecoveryMethod = false;
	clientId = process.env.VUE_APP_GOOGLE_APP_ID;
	googleLibrarySrc = "https://accounts.google.com/gsi/client";
	apiLoadIntitited = false;
	recoveryTypeId = 3;
	@Prop({ default: false })
	signIn;

	@Prop({ default: false })
	unlock;

	@Prop({ default: false })
	update;

	@Prop({ default: false })
	recovery;

	@Emit('processMethod')
	processMethod(data) {
		return data;
	}

	googleTokenLogin() {

		window.google.accounts.oauth2
			.initTokenClient({
				client_id: process.env.VUE_APP_GOOGLE_APP_ID,
				scope: "email profile",
				callback: (response) => {
					if (response.access_token) {
						this.onLogin(response);
					} else {
						this.onError(response);
					}
				},
			})
			.requestAccessToken();
	}


	async mounted() {


		await this.loadGApi();
		this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
	}

	async loadGApi() {
		return new Promise((resolve) => {
			// To resolve errors in nuxt3
			const isRunningInBrowser = typeof window !== "undefined";

			if (!this.apiLoadIntitited && isRunningInBrowser) {
				const script = document.createElement("script");
				this.apiLoadIntitited = true;
				script.addEventListener("load", () => {
					resolve(window.google);
				});
				script.src = this.googleLibrarySrc;
				script.async = true;
				script.defer = true;
				document.head.appendChild(script);
			}
		});
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




	async onLogin(googleUser) {
		const request = new XMLHttpRequest();

		try {
			request.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo');
			request.setRequestHeader('Authorization', 'Bearer ' + googleUser.access_token);
			request.addEventListener('load', () => {
				let googlePayload = JSON.parse(request.response);
				const userID = googlePayload.id;
				const key = this.clientId + userID;
				const token = googleUser.access_token;
				this.processMethod({
					success: true,
					userID, key, token, recoveryTypeId: this.recoveryTypeId, email: googlePayload.email
				})
				return;
			});
			request.addEventListener('error', () => console.error('XHR error'));

			request.send();

		} catch (error) {
			//Not sure what to do here - or if we want to do anything at all?!
			this.onError(error);
			console.error(`XHR error ${request.status}`);
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
