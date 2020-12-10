<template>
	<div class="card">
		<form v-on:submit.prevent="formSubmitChangePassword">
			<div class="collapse">
				<span v-show="collapsed" class="icon collapseIcon header" @click="collapsed = !collapsed">
					<i class="fas fa-chevron-right"></i>
				</span>
				<span v-show="!collapsed" class="icon collapseIcon header" @click="collapsed = !collapsed">
					<i class="fas fa-chevron-down"></i>
				</span>

				<span class="header" @click="collapsed = !collapsed"> Change Password </span>
				<div :class="collapsed ? 'hidden' : 'visible'">
					<div class="field">
						<label class="label">Old Password</label>
						<div class="control">
							<input type="password" name="oldPassword" class="input is-primary" placeholder="Current Password" v-model="oldPassword" />
						</div>
					</div>
					<div class="field">
						<label class="label">New Password</label>
						<div class="control">
							<input type="password" name="newPassword" class="input is-primary" placeholder="New Password" v-model="newPassword" />
						</div>
					</div>
					<div class="field">
						<label class="label">Repeat Password</label>
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

					<div class="field is-grouped">
						<div class="layout split">
							<button class="button is-green" type="submit">
								<span class="icon is-small">
									<i class="fas fa-save"></i>
								</span>
								<span> Update Password </span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<script>
import { sha256 } from '../utils/cryptoFunctions';
import { getKeystoreFromEncryptedSeed, changePasswordEncryptedSeed, saveWalletEmailPassword, validateInput } from '../utils/backupRestore';

export default {
	name: 'ChangePassword',
	data: function() {
		return {
			oldPassword: '',
			newPassword: '',
			newPasswordRepeat: '',
			collapsed: true
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
					this.collapsed = true;
				}
			} else alert('New passwords do not match.');
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
