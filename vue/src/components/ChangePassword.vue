<template>
	<div class="card">
		<form v-on:submit.prevent="changePasswordExecute">
			<div class="collapse">
				<span v-show="collapsed && !hideOldPassword" class="icon collapseIcon header" @click="collapsed = !collapsed">
					<i class="fas fa-chevron-right"></i>
				</span>
				<span v-show="!collapsed && !hideOldPassword" class="icon collapseIcon header" @click="collapsed = !collapsed">
					<i class="fas fa-chevron-down"></i>
				</span>

				<span class="header" @click="collapsed = !collapsed" v-show="!hideOldPassword">
					Password Change
					<span class="help is-success" v-if="success">Saved!</span>
				</span>
				<div :class="collapsed ? 'hidden' : 'visible'">
					<div class="field" v-if="!hideOldPassword">
						<label class="label">Old Password</label>
						<div class="control">
							<input type="password" name="oldPassword" class="input is-primary" placeholder="Current Password" v-model="oldPassword" />
						</div>
					</div>
					<div class="field">
						<label class="label">New Password</label>
						<div class="control">
							<input type="password" name="newPassword" class="input is-primary" placeholder="New Password" v-model="walletPassword" />
							<password
								v-model="walletPassword"
								:strength-meter-only="true"
								:secure-length="8"
								style="max-width: initial; margin-top: -8px"
							/>
							<p class="help">Use a strong Password! It encrypts your Wallet and keeps your Funds secure.</p>

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

					<div class="field is-grouped">
						<button class="button is-green" type="submit">
							<span class="icon is-small">
								<i class="fas fa-save"></i>
							</span>
							<span> Update Password </span>
						</button>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<script>
import { validateInput } from '../utils/backupRestore';
import Password from 'vue-password-strength-meter';
import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';

@Component({
	components: {
		Password
	},
	props: {
		presetOldPassword: String
	}
})
export default class ChangePassword extends mixins(Global, Authenticated) {
	oldPassword = '';
	hideOldPassword = false;
	walletPassword = '';
	walletPasswordRepeat = '';
	invalidPassword = '';
	collapsed = true;
	success = false;

	mounted() {
		if (this.presetOldPassword !== undefined) {
			this.oldPassword = this.presetOldPassword;
			this.hideOldPassword = true;
			this.collapsed = false;
		}
	}

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
		const oldPasswordHashed = this.presetOldPassword || (await sha256(this.oldPassword));
		const newPasswordHashed = await sha256(this.walletPassword);

		this.showSpinner('Changing Password');
		this.changePassword({ oldPassword: oldPasswordHashed, newPassword: newPasswordHashed })
			.then(() => {
				this.collapsed = true;
				this.oldPassword = '';
				this.walletPassword = '';
				this.walletPasswordRepeat = '';
				this.success = true;
				this.showSpinnerThenAutohide('Password Change Successfully');
				if (this.presetOldPassword !== undefined) {
					this.$router.push('/login');
				}
			})
			.catch(() => {
				this.showSpinnerThenAutohide('Error happened!');
				this.invalidPassword = 'Error happened during Update. Aborted.';
			});
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
