<template>
	<div class="card">
		<form v-on:submit.prevent="changePasswordExecute">
			<header class="card-header">
				<p class="card-header-title">Password Change</p>
			</header>
			<div class="card-content">
				<div class="field">
					<label class="label">Old Password</label>
					<div class="control">
						<input type="password" name="oldPassword" class="input is-primary" placeholder="Current Password" v-model="oldPassword" />
					</div>
				</div>
				<div class="field">
          <label class="label">New Password</label>
					<div class="control">
						<input type="password" name="newPassword" class="input is-primary" placeholder="New Password" v-model="walletPassword" />
            <password v-model="walletPassword" :strength-meter-only="true" :secure-length="8" style="max-width: initial; margin-top: -8px" />
					<p class="help">
						Use a strong Password! It encrypts your Wallet and keeps your Funds secure.
					</p>

					<p class="help is-danger" v-if="invalidPassword">
						{{ invalidPassword }}
					</p>
					</div>
				</div>
				<div class="field">
					<div class="control">
						<input
							type="password"
							class="input is-primary"
							name="newPasswordRepeat"
							placeholder="Repeat New Password"
							v-model="walletPasswordRepeat"
						/>
					</div>
				</div>
			</div>
			<footer class="card-footer">
				<button type="submit" class="card-footer-item" v-on:click="changePasswordExecute()">Save Password</button>
			</footer>
		</form>
	</div>
</template>

<script>
import { getKeystoreFromEncryptedSeed, changePasswordEncryptedSeed, saveWalletEmailPassword, validateInput } from '../utils/backupRestore';
import Password from 'vue-password-strength-meter';
import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';


@Component({
	components: {
		Password
	}
})
export default class ChangePassword extends mixins(Global, Authenticated) {
	oldPassword = '';
	walletPassword = '';
  walletPasswordRepeat = '';
  invalidPassword = '';

	async changePasswordExecute() {
   
    
		//this.invalidPassword = '';

		if (this.walletPassword != this.walletPasswordRepeat) {
			this.invalidPassword = 'The passwords are not the identical, please repeat the password';
			return;
    }
    
    const passwordMessage = await validateInput('password', this.walletPassword);

		if (passwordMessage) {
			this.invalidPassword = passwordMessage;
			return;
    }
    const oldPasswordHashed = await sha256(this.oldPassword);
    const newPasswordHashed = await sha256(this.walletPassword);
    
    this.changePassword({oldPassword: oldPasswordHashed, newPassword: newPasswordHashed});

		// if (this.newPassword === this.newPasswordRepeat) {
		// 	const encryptedSeed = JSON.parse(localStorage.getItem('encryptedSeed'));

		// 	const oldPassword = await sha256(this.oldPassword);
		// 	const newPassword = await sha256(this.newPassword);

		// 	const passwordMessage = await validateInput('password', this.newPassword);

		// 	if (passwordMessage) alert(passwordMessage);
		// 	else {
		// 		try {
		// 			await getKeystoreFromEncryptedSeed(encryptedSeed, oldPassword);
		// 		} catch (e) {
		// 			alert('Old password is not right.');
		// 		}

		// 		const newEncryptedSeed = await changePasswordEncryptedSeed(encryptedSeed, oldPassword, newPassword);

		// 		await saveWalletEmailPassword(window.localStorage.getItem('email'), newEncryptedSeed);

		// 		window.localStorage.setItem('encryptedSeed', JSON.stringify(newEncryptedSeed));

		// 		window.sessionStorage.setItem('password', newPassword);

		// 		alert('Password changed successfully.');

		// 		this.oldPassword = '';
		// 		this.newPassword = '';
		// 		this.newPasswordRepeat = '';
		// 	}
		// } else alert('New passwords do not match.');
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button.card-footer-item {
  background-color: transparent;
  cursor: pointer;
  border: 0;
  font-size: 1rem;
  line-height: 1.5;
}
</style>
