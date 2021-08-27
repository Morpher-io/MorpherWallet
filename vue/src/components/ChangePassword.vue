<template>
	<div class="card">
		<form v-on:submit.prevent="changePasswordExecute">
			<div :class="{
				'collapse': true,
				'hide-border': activePage
			}">
				<div v-if="!activePage" class="is-flex is-align-items-center">
					<span class="header" data-cy="openPasswordChange" @click="changeActive" v-show="!hideOldPassword">
						Change Password
					</span>
					<span v-show="!hideOldPassword" :class="{
						'icon collapseIcon header': true
					}" @click="changeActive">
						<i class="fas fa-chevron-right"></i>
					</span>
				</div>
				<div :class="activePage === 'password' ? 'visible' : 'hidden'">
					<div class="field" v-if="!hideOldPassword">
						<label class="label">Old Password</label>
						<div class="control">
							<input
								type="password"
								data-cy="oldPassword"
								name="oldPassword"
								class="input is-primary"
								v-model="oldPassword"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label">New Password</label>
						<div class="control">
							<input
								type="password"
								name="newPassword"
								data-cy="newPassword"
								class="input is-primary password-input"
								v-model="walletPassword"
							/>
							<password
								v-model="walletPassword"
								:strength-meter-only="true"
								:secure-length="8"
								style="max-width: initial"
							/>
							<div class="password-help">
							<p>Requirements:</p>
								<ul class="items">
									<li :class="{
										'done': passwordChecks.min === 'pass',
										'fail': passwordChecks.min === 'fail'
									}">Min. 8 characters</li>
									<li :class="{
										'done': passwordChecks.lowercase === 'pass',
										'fail': passwordChecks.lowercase === 'fail'
									}">Lowercase letter</li>
									<li :class="{
										'done': passwordChecks.uppercase === 'pass',
										'fail': passwordChecks.uppercase === 'fail'
									}">Uppercase letter</li>
									<li :class="{
										'done': passwordChecks.number === 'pass',
										'fail': passwordChecks.number === 'fail'
									}">Number</li>
									<li :class="{
										'done': passwordChecks.match === 'pass',
										'fail': passwordChecks.match === 'fail'
									}">Passwords match</li>
								</ul>
							</div>

							<p class="help is-danger" v-if="invalidPassword" data-cy="invalidMessage">
								{{ invalidPassword }}
							</p>
						</div>
					</div>
					<div class="field">
						<label class="label">Confirm Password</label>
						<div class="control">
							<input
								type="password"
								class="input is-primary"
								name="newPasswordRepeat"
								data-cy="newPasswordRepeat"
								v-model="walletPasswordRepeat"
							/>
						</div>
					</div>

					<div class="field is-grouped">
						<button class="button is-green big-button is-login transition-faster" type="submit" data-cy="passwordSubmit" :disabled="!oldPassword || !walletPassword || !walletPasswordRepeat">
							<span> Update Password </span>
						</button>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<script lang="ts">
import { validateInput } from '../utils/backupRestore';
import Password from 'vue-password-strength-meter';
import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { Emit, Prop, Watch } from 'vue-property-decorator';

@Component({
	components: {
		Password
	}
})
export default class ChangePassword extends mixins(Global, Authenticated) {
	oldPassword = '';
	hideOldPassword = false;
	walletPassword = '';
	walletPasswordRepeat = '';
	invalidPassword = '';
	success = false;
	passwordChecks: any = {
		min: '',
		uppercase: '',
		lowercase: '',
		number: '',
		match: '',
	};

	@Prop()
	activePage!: string;

	@Prop()
	presetOldPassword!: string;

	@Emit('changeActive')
	changeActive() {
		return;
	}

	@Watch('walletPassword')
	handlePasswordChange(newValue: string) {
		this.passwordChecks = this.checkPassword(newValue, false, this.passwordChecks, this.walletPasswordRepeat);
	}

	@Watch('walletPasswordRepeat')
	handlePasswordRepeatChange(newValue: string) {
		this.passwordChecks = this.checkPassword(this.walletPassword, false, this.passwordChecks, newValue, true);
	}

	mounted() {
		if (this.presetOldPassword !== undefined) {
			this.oldPassword = this.presetOldPassword;
			this.hideOldPassword = true;
		}
	}

	async changePasswordExecute() {
		//this.invalidPassword = '';

		this.passwordChecks = this.checkPassword(this.walletPassword, true, this.passwordChecks, this.walletPasswordRepeat);

		if (Object.keys(this.passwordChecks).some((value: string) => this.passwordChecks[value] !== 'pass')) {
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
				this.oldPassword = '';
				this.walletPassword = '';
				this.walletPasswordRepeat = '';
				this.success = true;
				this.showSpinnerThenAutohide('Password Changed Successfully');
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
