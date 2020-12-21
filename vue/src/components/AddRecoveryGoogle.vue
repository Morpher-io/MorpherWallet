<template>
	<div class="field">
		<div class="control is-expanded" v-if="!hasRecoveryMethod">
			<GoogleLogin class="button is-fullwidth is-google" :params="{ clientId }" :onSuccess="onLogin">
				<span class="icon google-icon">
					<i class="fab fa-google"></i>
				</span>
				<span style="color: #fff"> Link to Google</span>
			</GoogleLogin>
		</div>
		<div v-if="hasRecoveryMethod" class="has-text-centered">
			<span class="icon google-icon">
				<i class="fas fa-check-circle"></i>
			</span>
			Google Recovery Added
			<button class="button is-danger" @click="resetRecovery">Reset</button>
		</div>
		<div v-if="error">{{ error }}</div>
	</div>
</template>

<script>
import GoogleLogin from 'vue-google-login';
import { sha256 } from './../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';

@Component({
	components: {
		GoogleLogin
	}
})
export default class AddRecoveryGoogle extends mixins(Global, Authenticated) {
	error = '';
	hasRecoveryMethod = false;
	clientId = process.env.VUE_APP_GOOGLE_APP_ID;
	recoveryTypeId = 3;

	async mounted() {
		this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
	}

	async resetRecovery(){
		const success = await this.resetRecoveryMethod({ recoveryTypeId: this.recoveryTypeId });
		if(success) {
			this.hasRecoveryMethod = false;
		}
	}

	async onLogin(googleUser) {
		this.showSpinner('Saving Keystore for Recovery');
		const userID = googleUser.getBasicProfile().getId();
		const key = await sha256(this.clientId + userID);
		// console.log(this.clientId + userID, key);
		this.addRecoveryMethod({ key, password: userID, recoveryTypeId: this.recoveryTypeId })
			.then(async () => {
				this.showSpinnerThenAutohide('Saved Successfully');
				this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId);
			})
			.catch(e => {
				// console.log(e);
				this.showSpinnerThenAutohide('Error');
				this.error = e.toString();
			});
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.is-google {
	background-color: #34a853;
}
.google-icon {
	font-size: 18px;
	margin-right: 10px;
}
</style>
