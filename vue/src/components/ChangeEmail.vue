<template>
	<div class="card">
		<div>
			<div>
				<div class="card-content">
					<div class="content">
						<div class="field">
							<label class="label">{{ $t('common.CURRENT_EMAIL') }}</label>
							<div class="control">
								{{ currentEmail }}
							</div>
						</div>
						<div class="field">
							<label class="label">{{ $t('common.NEW_EMAIL') }}</label>
							<div class="control">
								<input data-cy="newEmail" class="input" name="newEmail" ref="new_email" v-model="newEmail"  @keypress="handleKeyPress" />
							</div>
						</div>
						<div class="field" v-if="store.recoveryTypeId == 1">
							<label class="label">{{ $t('common.PASSWORD') }}</label>
							<div class="control">
								<input data-cy="confirmPassword" type="password" class="input" name="password"  ref="new_password" v-model="password"  @keypress="handleKeyPress" />
							</div>
						</div>
					</div>
				</div>

				<div class="error mt-3" v-if="logonError">
					<p>⚠️ <span v-html="logonError"></span></p>
				</div>

				<div class="mt-5">
					<!-- <div v-if="recoveryTypeId == 3">
						<LoginGoogle :update="true" @processMethod="processMethod"></LoginGoogle>
					</div>
					<div v-else-if="recoveryTypeId == 6">
						<LoginApple :update="true" @processMethod="processMethod"></LoginApple>
					</div> -->
					<button
						class="button is-green big-button is-login transition-faster"
						data-cy="updateEmailButton"
						:disabled="!newEmail || (!password && recoveryTypeId !== 3 && recoveryTypeId !== 6 )"
						@click="
							setNewData({
								email: newEmail,
								password: password
							})
						"
					>
						<span class="text confirm-button">{{ $t('common.UPDATE_EMAIL') }}</span>
					</button>
					<button
						v-on:click="$router.push('/settings?email_password=true').catch(() => undefined)"
						tag="button"
						class="button is-ghost is-blue big-button medium-text transition-faster"
					>
						<span class="text">{{ $t('common.CANCEL') }}</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { validateInput } from '../utils/backupRestore';
import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import LoginGoogle from '../components/LoginGoogleV2.vue';
import LoginApple from '../components/LoginApple.vue';
import { getDictionaryValue } from '../utils/dictionary';

@Component({components: {
		LoginApple, LoginGoogle
	}})
export default class ChangeEmail extends mixins(Global, Authenticated) {
	newEmail = '';
	password = '';
	logonError = '';
	loginUser: any = {};

	recoveryTypeId = this.$store.getters.recoveryTypeId;
	currentEmail = this.$store.getters.walletEmail;

	@Prop()
	error!: string;

	@Watch('error')
	handleErorrChange(newValue: string) {
		if (newValue) this.logonError = newValue;
	}

	processMethod(data: any): void {
		this.logonError = '';

		if (data.success) {
			this.loginUser = data;

			this.setNewData({
								email: this.newEmail,
								password: this.loginUser.userID
							});

		} else {
			if (data.error === 'popup_closed_by_user') {
				this.logonError = getDictionaryValue('GOOGLE_COOKIES_BLOCKED');
			} else if (data.error === 'google_script_blocked') {
				this.logonError = getDictionaryValue('GOOGLE_SCRIPT_BLOCKED');
			} else {
				this.logonError = data.method + ': ' + getDictionaryValue(data.error);
			}
		}
	}

	@Emit('setNewData')
	async setNewData(data: any) {
		this.logonError = '';

		if (!data.email) {
			return { email: null, password: null };
		}

		const emailMessage = await validateInput('email', data.email);

		if (emailMessage) {
			this.logonError = emailMessage;
			return { email: null, password: null };
		}

		let newPassword = '';
		if (this.recoveryTypeId !== 3 && this.recoveryTypeId !== 6) {
			newPassword = await sha256(data.password);

			if (this.store.hashedPassword !== newPassword) {
				this.logonError = this.$t('errors.WRONG_PASSWORD').toString();
				return { email: null, password: null };
			}
		}

		if (this.store.email === this.newEmail) {
			this.logonError = this.$t('errors.SAME_EMAIL').toString();
			return { email: null, password: null };
		}

		return { email: data.email, password: newPassword };
	}

	handleKeyPress(e: any) {
		const key = e.which || e.charCode || e.keyCode || 0;

		if (key === 13) {
			if (this.newEmail && this.password) {
				this.setNewData({
					email: this.newEmail,
					password: this.password
					})
			} else if (!this.newEmail) {
				window.setTimeout(() => {
						const element: any = this.$refs.new_email;
						if (element) element.focus();
					}, 100);				
			} else if (!this.password) {
				window.setTimeout(() => {
						const element: any = this.$refs.new_password;
						if (element) element.focus();
					}, 100);
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.confirm-button {
	font-size: 18px;
}
</style>
