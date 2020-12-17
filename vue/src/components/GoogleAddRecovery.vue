<template>
	<div class="field">
		<div class="control is-expanded" v-if="!successfullySaved && showRecoveryMethod">
			<GoogleLogin
				class="button is-fullwidth is-google"
				:params="{ client_id: '376509986959-k6tstmq30f4spbp9vd1u94tvt8dg714b.apps.googleusercontent.com' }"
				:onSuccess="onLogin"
			>
				<span class="icon google-icon">
					<i class="fab fa-google"></i>
				</span>
				<span> Link to Google</span>
			</GoogleLogin>
		</div>
		<div v-if="successfullySaved">Saved Successfully</div>
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
export default class GoogleAddRecovery extends mixins(Global, Authenticated) {
	successfullySaved = false;
	error = '';
	showRecoveryMethod = false;

	async mounted() {
		this.showRecoveryMethod = !(await this.hasRecovery(3));
	}

	async onLogin(data) {
		const userID = data.Da;
		const key = await sha256(process.env.VUE_APP_GOOGLE_APP_ID + userID);
		this.addRecoveryMethod({ key, password: userID, recoveryTypeId: 3 })
			.then(() => {
				this.successfullySaved = true;
			})
			.catch(e => {
				console.log(e);
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
