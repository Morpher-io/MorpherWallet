<template>
	<div class="card">
		<form v-on:submit.prevent="formSubmitChangeEmail">
			<div class="collapse">
				<span v-show="collapsed" class="icon collapseIcon header" @click="collapsed = !collapsed">
					<i class="fas fa-chevron-right"></i>
				</span>
				<span v-show="!collapsed" class="icon collapseIcon header" @click="collapsed = !collapsed">
					<i class="fas fa-chevron-down"></i>
				</span>

				<span class="header" @click="collapsed = !collapsed">
					Change Email Address
					<span class="help is-success" v-if="success">Saved!</span>
				</span>
				<div :class="collapsed ? 'hidden' : 'visible'">
					<div class="card-content">
						<div class="content">
							<div class="field">
								<label class="label">New Email</label>
								<div class="control">
									<input
										class="input is-primary"
										name="newEmail"
										placeholder="New Email Address"
										v-model="newEmail"
										:disabled="twoFaSent"
									/>
									<p class="help is-danger" v-if="invalidEmail">
										{{ invalidEmail }}
									</p>
								</div>
							</div>
							<div class="field">
								<label class="label">Password</label>
								<div class="control">
									<input
										type="password"
										class="input is-primary"
										name="password"
										placeholder="Enter password"
										v-model="password"
										:disabled="twoFaSent"
									/>
								</div>
							</div>
							<div class="field" v-if="twoFaSent">
								<label class="label">2FA Code</label>
								<div class="control">
									<input type="number" class="input is-primary" name="twoFa" placeholder="Enter 2FA" v-model="twoFa" />
									<p class="help is-danger" v-if="invalid2FA">
										{{ invalid2FA }}
									</p>
								</div>
							</div>
						</div>
					</div>

					<div class="field is-grouped">
						<button class="button is-green" type="submit">
							<span class="icon is-small">
								<i class="fas fa-save"></i>
							</span>
							<span> Update Email </span>
						</button>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<script>
import { validateInput } from '../utils/backupRestore';
import { sha256 } from '../utils/cryptoFunctions';

import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';

@Component({})
export default class ChangeEmail extends mixins(Global, Authenticated) {
	newEmail = '';
	password = '';
	error = '';
	twoFaSent = false;
	twoFa = null;
	invalidEmail = false;
	collapsed = true;
	invalid2FA = false;
	success = false;

	async formSubmitChangeEmail() {
		if (!this.newEmail) {
			return;
		}

		const emailMessage = await validateInput('email', this.newEmail);
		if (emailMessage) {
			this.invalidEmail = emailMessage;
			return;
		}

		const password = await sha256(this.password);

		if (this.store.hashedPassword !== password) {
			this.invalidEmail = 'The password you entered is not correct!';
			return;
		}

		if (this.store.email === this.newEmail) {
			this.invalidEmail = 'The Email Address you entered is the same as you already use.';
			return;
		}

		if (this.twoFaSent == true && this.twoFa == '') {
			this.invalid2FA = 'Two FA cannot be empty!';
		}

		try {
			this.invalid2FA = false;
			this.invalidEmail = false;
			await this.changeEmail({ newEmail: this.newEmail, password: password, twoFa: this.twoFa });
			if (!this.twoFaSent) {
				//we show the 2FA fields now
				this.twoFaSent = true;
			} else {
				this.newEmail = '';
				this.password = '';
				this.collapsed = true;
				this.twoFa = '';
				this.twoFaSent = false;
				this.invalid2FA = false;
				this.invalidEmail = false;
				this.success = true;
			}
		} catch (e) {
			console.log(e);
			this.invalidEmail = e.toString();
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
