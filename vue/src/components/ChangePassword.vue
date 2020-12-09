<template>
	<div class="card">
		<form v-on:submit.prevent="formSubmitChangePassword">
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
					<div class="control">
						<input type="password" name="newPassword" class="input is-primary" placeholder="New Password" v-model="newPassword" />
					</div>
				</div>
				<div class="field">
					<div class="control">
						<input
							type="password"
							class="input is-primary"
							name="newPasswordRepeat"
							placeholder="Repeat New Password"
							v-model="newPasswordRepeat"
						/>
					</div>
				</div>
			</div>
			<footer class="card-footer">
				<a href="#" class="card-footer-item">Save</a>
			</footer>
		</form>
	</div>
</template>

<script>
import { sha256 } from '../utils/cryptoFunctions';
import { getKeystoreFromEncryptedSeed, changePasswordEncryptedSeed, saveWalletEmailPassword, validateInput } from '../utils/backupRestore';

export default {
	name: 'ChangePassword',
	data: function () {
		return {
			oldPassword: '',
			newPassword: '',
			newPasswordRepeat: ''
		};
	},
	methods: {
		async formSubmitChangePassword(e) {
			e.preventDefault();

			if (this.newPassword === this.newPasswordRepeat) {
				const encryptedSeed = JSON.parse(localStorage.getItem('encryptedSeed'));

				const oldPassword = await sha256(this.oldPassword);
				const newPassword = await sha256(this.newPassword);

				const passwordMessage = await validateInput('password', this.newPassword);

				if (passwordMessage) alert(passwordMessage);
				else {
					try {
						await getKeystoreFromEncryptedSeed(encryptedSeed, oldPassword);
					} catch (e) {
						alert('Old password is not right.');
					}

					const newEncryptedSeed = await changePasswordEncryptedSeed(encryptedSeed, oldPassword, newPassword);

					await saveWalletEmailPassword(window.localStorage.getItem('email'), newEncryptedSeed);

					window.localStorage.setItem('encryptedSeed', JSON.stringify(newEncryptedSeed));

					window.sessionStorage.setItem('password', newPassword);

					alert('Password changed successfully.');

					this.oldPassword = '';
					this.newPassword = '';
					this.newPasswordRepeat = '';
				}
			} else alert('New passwords do not match.');
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
