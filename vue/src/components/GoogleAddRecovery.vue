<template>
	<div class="control is-expanded">
		<GoogleLogin
			class="button is-fullwidth"
			:params="{ client_id: '376509986959-k6tstmq30f4spbp9vd1u94tvt8dg714b.apps.googleusercontent.com' }"
			:onSuccess="onLogin"
			>Google</GoogleLogin
		>
	</div>
</template>

<script>
import {
	backupGoogleSeed,
	changePasswordEncryptedSeed
} from "../utils/backupRestore";
import GoogleLogin from "vue-google-login";

export default {
	name: "GoogleAddRecovery",
	components: {
		GoogleLogin
	},
	data: function() {
		return {
			isLogined: false
		};
	},
	props: {
		walletEmail: {
			type: String,
			default: ""
		}
	},
	methods: {
		async onLogin(data) {
			const userID = data.Da;
			const encryptedSeedFromPassword =
				localStorage.getItem("encryptedSeed") || "";
			if (encryptedSeedFromPassword === "") {
				throw new Error("Keystore not found, aborting");
			}

			const encryptedSeedFromFacebookUserID = await changePasswordEncryptedSeed(
				JSON.parse(encryptedSeedFromPassword),
				window.sessionStorage.getItem("password"),
				userID
			);
			try {
				await backupGoogleSeed(
					this.walletEmail,
					userID,
					encryptedSeedFromFacebookUserID
				);
				this.hasWalletRecovery = true;
			} catch (e) {
				console.log(e);
				this.hasWalletRecovery = false;
			}
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
