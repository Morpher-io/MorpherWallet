<template>
	<div class="card">
		<div v-if="currentPage === 0">
			<h2 v-if="!hideOldPassword" class="title">{{ $t('password.CHANGE_PASSWORD_TITLE') }}</h2>
			<h2 v-else class="title">{{ $t('password.RESET_PASSWORD_TITLE') }}</h2>
			<h4 v-if="!hideOldPassword" class="subtitle">{{ $t('password.CHANGE_PASSWORD_DESCRIPTION') }}</h4>
			<h4 v-else class="subtitle">{{ $t('password.RESET_PASSWORD_DESCRIPTION') }}</h4>
			<form v-on:submit.prevent="changePasswordExecute">
				<div>
					<div class="field" v-if="!hideOldPassword">
						<label class="label">{{ $t('password.OLD_PASSWORD') }}</label>
						<div class="control">
							<input type="password" data-cy="oldPassword" name="oldPassword" class="input" v-model="oldPassword" @keypress="handleKeyPress" ref="old_password" />
						</div>
					</div>
					<div class="field">
						<label class="label">{{ $t('common.NEW_PASSWORD') }}</label>
						<div class="control">
							<input type="password" name="newPassword" data-cy="newPassword" class="input password-input" v-model="walletPassword" @keypress="handleKeyPress" ref="new_password" />
							<password v-model="walletPassword" :strength-meter-only="true" :secure-length="8" style="max-width: initial" />
							<div class="password-help">
								<p>{{ $t('password.REQUIREMENTS') }}</p>
								<ul class="items">
									<li
										:class="{
											done: passwordChecks.min === 'pass',
											fail: passwordChecks.min === 'fail'
										}"
									>
										{{ $t('password.MIN_CHARACTERS') }}
									</li>
									<li
										:class="{
											done: passwordChecks.lowercase === 'pass',
											fail: passwordChecks.lowercase === 'fail'
										}"
									>
										{{ $t('password.LOWERCASE_LETTER') }}
									</li>
									<li
										:class="{
											done: passwordChecks.uppercase === 'pass',
											fail: passwordChecks.uppercase === 'fail'
										}"
									>
										{{ $t('password.UPPERCASE_LETTER') }}
									</li>
									<li
										:class="{
											done: passwordChecks.number === 'pass',
											fail: passwordChecks.number === 'fail'
										}"
									>
										{{ $t('password.NUMBER') }}
									</li>
									<li
										:class="{
											done: passwordChecks.match === 'pass',
											fail: passwordChecks.match === 'fail'
										}"
									>
										{{ $t('password.PASSWORD_MATCH') }}
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div class="field">
						<label class="label">{{ $t('common.CONFIRM_PASSWORD') }}</label>
						<div class="control">
							<input type="password" class="input" name="newPasswordRepeat" data-cy="newPasswordRepeat" v-model="walletPasswordRepeat" @keypress="handleKeyPress"  ref="new_password_repeat" />
						</div>
					</div>

					<div class="error mt-3" v-if="logonError">
						<p>⚠️ <span data-cy="incorrectPassword" v-html="logonError"></span></p>
					</div>

					<button class="button is-green big-button is-login transition-faster mt-5" type="submit" data-cy="passwordSubmit">
						<span class="text">{{ $t('common.UPDATE_PASSWORD') }}</span>
					</button>

					<div class="mt-2">
						<button
							v-on:click="$router.push(hideOldPassword ? '/login' : '/settings?email_password=true').catch(() => undefined)"
							tag="button"
							type="button"
							class="button is-ghost is-blue big-button medium-text transition-faster"
						>
							<span class="text">{{ $t('common.CANCEL') }}</span>
						</button>
					</div>
				</div>
			</form>
		</div>

		<div v-if="currentPage === 1">
			<div>
				<img src="@/assets/img/checkmark.svg" alt="Checkmark image" class="mb-3" />
				<h2 data-cy="passwordChangeTitle" class="title">{{ $t('password.PASSWORD_UPDATED_TITLE') }}</h2>
				<p data-cy="passwordChangeDescription" class="subtitle">{{ $t('password.PASSWORD_UPDATED_DESCRIPTION') }}</p>

				<button @click="resetData" tag="button" class="button outlined-button big-button transition-faster">
					<span class="text">{{ $t('common.CLOSE') }}</span>
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

	@Watch('store.hiddenLogin')
	onPropertyChanged(value: any) {
		this.executeHiddenRecovery()
	}

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
		this.executeHiddenRecovery()
	}

	executeHiddenRecovery() {
		if (this.store.hiddenLogin && this.store.hiddenLogin.type == 'recovery') {
			let recoveryData = this.store.hiddenLogin.recovery
			if (recoveryData.type == 'password' && recoveryData.data && recoveryData.data.password && recoveryData.data.passwordConfirm) {

				this.walletPassword = recoveryData.data.password;
				this.walletPasswordRepeat = recoveryData.data.passwordConfirm;
				this.changePasswordExecute()
			}
			
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
			.then(async () => {
				this.oldPassword = '';
				this.walletPassword = '';
				this.walletPasswordRepeat = '';
				this.currentPage = 1;

				if (this.presetOldPassword !== undefined) {
					this.logoutWallet();
				}

				if (this.isIframe() && this.store.connection && this.store.connection !== null) {
					const connection: any = await this.store.connection.promise;
					connection.onRecovery('passwordUpdated');
				}
			})
			.catch((error) => {
				if (error && error.toString() === 'TypeError: Failed to fetch') {
					this.showNetworkError(true);
				}

				this.logonError = getDictionaryValue('');
			});
	}

	handleKeyPress(e: any) {
		const key = e.which || e.charCode || e.keyCode || 0;

		if (key === 13) {
			if (this.oldPassword && this.walletPassword && this.walletPasswordRepeat) {
				this.changePasswordExecute()
			} else if (!this.oldPassword) {
				window.setTimeout(() => {
						const element: any = this.$refs.old_password;
						if (element) element.focus();
					}, 100);				
			} else if (!this.walletPassword) {
				window.setTimeout(() => {
						const element: any = this.$refs.new_password;
						if (element) element.focus();
					}, 100);
			} else if (!this.walletPasswordRepeat) {
				window.setTimeout(() => {
						const element: any = this.$refs.new_password_repeat;
						if (element) element.focus();
					}, 100);
			}
		}
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
