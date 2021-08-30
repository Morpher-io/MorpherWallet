<template>
	<div class="card">
		<form v-on:submit.prevent="formSubmitChangeEmail">
			<div>
				<div class="card-content">
					<div class="content">
						<div class="field">
							<label class="label">New Email</label>
							<div class="control">
								<input class="input is-primary" name="newEmail" data-cy="newEmail" v-model="newEmail" :disabled="twoFaSent" />
							</div>
						</div>
						<div class="field">
							<label class="label">Password</label>
							<div class="control">
								<input
									type="password"
									class="input is-primary"
									name="password"
									data-cy="password"
									v-model="password"
									:disabled="twoFaSent"
								/>
							</div>
						</div>
						<div class="field mb-0" v-if="twoFaSent">
							<label class="label">2FA Code</label>
							<div class="control">
								<input type="number" class="input is-primary" data-cy="twoFa" name="twoFa" placeholder="Enter 2FA" v-model="twoFa" />
							</div>
						</div>
					</div>
				</div>

				<div class="error mt-3" v-if="logonError">
					<p>⚠️ <span v-html="logonError"></span></p>
				</div>

				<div class="field is-grouped">
					<button
						class="button is-green big-button is-login transition-faster"
						type="submit"
						data-cy="updateEmail"
						:disabled="!newEmail || !password"
					>
						<span>Update Email</span>
					</button>
				</div>
			</div>
		</form>
	</div>
</template>

<script lang="ts">
import { validateInput } from '../utils/backupRestore';
import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import { getDictionaryValue } from '../utils/dictionary';

@Component({})
export default class ChangeEmail extends mixins(Global, Authenticated) {
	newEmail = '';
	password = '';
	error = '';
	twoFaSent = false;
	twoFa: any = null;
	logonError = '';
	success = false;

	async formSubmitChangeEmail() {
		if (!this.newEmail) {
			return;
		}

		const emailMessage = await validateInput('email', this.newEmail);
		if (emailMessage) {
			this.logonError = emailMessage;
			return;
		}

		const password = await sha256(this.password);

		if (this.store.hashedPassword !== password) {
			this.logonError = 'The password you entered is not correct!';
			return;
		}

		if (this.store.email === this.newEmail) {
			this.logonError = 'The Email Address you entered is the same as you already use.';
			return;
		}

		if (this.twoFaSent == true && this.twoFa == '') {
			this.logonError = 'Two FA cannot be empty!';
		}

		try {
			this.logonError = '';
			await this.changeEmail({ newEmail: this.newEmail, password: password, twoFa: this.twoFa });
			if (!this.twoFaSent) {
				//we show the 2FA fields now
				this.twoFaSent = true;
			} else {
				this.newEmail = '';
				this.password = '';
				this.twoFa = '';
				this.twoFaSent = false;
				this.logonError = '';
				this.success = true;
			}
		} catch (e) {
			this.logonError = getDictionaryValue(e.toString());
		}
	}
}
</script>
