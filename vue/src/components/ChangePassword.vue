<template>
	<div class="card">
		<div v-if="currentPage === 0">
			<h2 v-if="!hideOldPassword" class="title">Change Password</h2>
			<h2 v-else class="title">Reset Your Password</h2>
			<h4 v-if="!hideOldPassword" class="subtitle">Create a new account password.</h4>
			<h4 v-else class="subtitle">Account recovered successfully! Please reset your password below.</h4>
			<form v-on:submit.prevent="changePasswordExecute">
				<div>
					<div class="field" v-if="!hideOldPassword">
						<label class="label">Old Password</label>
						<div class="control">
							<input type="password" data-cy="oldPassword" name="oldPassword" class="input" v-model="oldPassword" />
						</div>
					</div>
					<div class="field">
						<label class="label">New Password</label>
						<div class="control">
							<input type="password" name="newPassword" data-cy="newPassword" class="input password-input" v-model="walletPassword" />
							<password v-model="walletPassword" :strength-meter-only="true" :secure-length="8" style="max-width: initial" />
							<div class="password-help">
								<p>Requirements:</p>
								<ul class="items">
									<li
										:class="{
											done: passwordChecks.min === 'pass',
											fail: passwordChecks.min === 'fail'
										}"
									>
										Min. 8 characters
									</li>
									<li
										:class="{
											done: passwordChecks.lowercase === 'pass',
											fail: passwordChecks.lowercase === 'fail'
										}"
									>
										Lowercase letter
									</li>
									<li
										:class="{
											done: passwordChecks.uppercase === 'pass',
											fail: passwordChecks.uppercase === 'fail'
										}"
									>
										Uppercase letter
									</li>
									<li
										:class="{
											done: passwordChecks.number === 'pass',
											fail: passwordChecks.number === 'fail'
										}"
									>
										Number
									</li>
									<li
										:class="{
											done: passwordChecks.match === 'pass',
											fail: passwordChecks.match === 'fail'
										}"
									>
										Passwords match
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div class="field">
						<label class="label">Confirm Password</label>
						<div class="control">
							<input type="password" class="input" name="newPasswordRepeat" data-cy="newPasswordRepeat" v-model="walletPasswordRepeat" />
						</div>
					</div>

					<div class="error mt-3" v-if="logonError">
						<p>⚠️ <span v-html="logonError"></span></p>
					</div>

					<button class="button is-green big-button is-login transition-faster mt-5" type="submit" data-cy="passwordSubmit">
						<span>Update Password</span>
					</button>

					<div class="mt-2">
						<button
							v-on:click="$router.push(hideOldPassword ? '/login' : '/settings?email_password=true').catch(() => undefined);"
							tag="button"
							type="button"
							class="button is-ghost is-blue big-button medium-text transition-faster"
						>
							<span>Cancel</span>
						</button>
					</div>
				</div>
			</form>
		</div>

		<div v-if="currentPage === 1">
			<div>
				<img src="@/assets/img/checkmark.svg" alt="Checkmark image" class="mb-3" />
				<h2 class="title">Password Updated</h2>
				<p class="subtitle">Your password was successfully updated!</p>

				<button @click="resetData" tag="button" class="button outlined-button big-button transition-faster">
					<span>Close</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { validateInput } from '../utils/backupRestore';
import Password from 'vue-password-strength-meter';
import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { Prop, Watch } from 'vue-property-decorator';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		Password
	}
})
export default class ChangePassword extends mixins(Global, Authenticated) {
	currentPage = 0;
	oldPassword = '';
	hideOldPassword = false;
	walletPassword = '';
	walletPasswordRepeat = '';
	logonError = '';
	passwordChecks: any = {
		min: '',
		uppercase: '',
		lowercase: '',
		number: '',
		match: ''
	};

	@Prop()
	presetOldPassword!: string;

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
		this.logonError = '';

		this.passwordChecks = this.checkPassword(this.walletPassword, true, this.passwordChecks, this.walletPasswordRepeat);

		if (Object.keys(this.passwordChecks).some((value: string) => this.passwordChecks[value] !== 'pass')) {
			return;
		}

		const passwordMessage = await validateInput('password', this.walletPassword);

		if (passwordMessage) {
			this.logonError = passwordMessage;
			return;
		}
		const oldPasswordHashed = this.presetOldPassword || (await sha256(this.oldPassword));
		const newPasswordHashed = await sha256(this.walletPassword);

		this.changePassword({ oldPassword: oldPasswordHashed, newPassword: newPasswordHashed })
			.then(() => {
				this.oldPassword = '';
				this.walletPassword = '';
				this.walletPasswordRepeat = '';
				this.currentPage = 1;

				if (this.presetOldPassword !== undefined) {
					this.$router.push('/login').catch(() => undefined);;
				}
			})
			.catch(error => {
				if (error && error.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				}

				this.logonError = getDictionaryValue('');
			});
	}

	resetData() {
		this.currentPage = 0;
		this.oldPassword = '';
		this.hideOldPassword = false;
		this.walletPassword = '';
		this.walletPasswordRepeat = '';
		this.logonError = '';
		this.passwordChecks = {
			min: '',
			uppercase: '',
			lowercase: '',
			number: '',
			match: ''
		};
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
