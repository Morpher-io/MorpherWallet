<template>
	<div class="control is-expanded">
		<v-facebook-login
			class="button is-fullwidth"
			app-id="299132904630133"
			@sdk-init="handleSdkInit"
			@login="onLogin"
			v-model="facebook.model"
			><span slot="login">Facebook</span>
		</v-facebook-login>
	</div>
</template>

<script>
import { backupFacebookSeed, changePasswordEncryptedSeed } from '../utils/backupRestore';
import VFacebookLogin from 'vue-facebook-login-component';

export default {
	name: 'FBAddRecovery',
	components: {
		VFacebookLogin
	},
	data: function() {
		return {
			isLogined: false,
			facebook: {
				FB: {},
				model: {},
				scope: {}
			}
		};
	},
	props: {
		walletEmail: {
			type: String,
			default: ''
		}
	},
	methods: {
		handleSdkInit({ FB, scope }) {
			this.facebook.scope = scope;
			this.facebook.FB = FB;
		},
		async onLogin(data) {
			const userID = data.authResponse.userID;
			const encryptedSeedFromPassword = localStorage.getItem('encryptedSeed') || '';
			if (encryptedSeedFromPassword === '') {
				throw new Error('Keystore not found, aborting');
			}

			const encryptedSeedFromFacebookUserID = await changePasswordEncryptedSeed(
				JSON.parse(encryptedSeedFromPassword),
				window.sessionStorage.getItem('password'),
				userID
			);
			try {
				await backupFacebookSeed(this.walletEmail, userID, encryptedSeedFromFacebookUserID);
				this.hasWalletRecovery = true;
			} catch {
				this.hasWalletRecovery = false;
			}
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
