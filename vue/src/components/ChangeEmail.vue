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

				<span class="header" @click="collapsed = !collapsed"> Change Email Address </span>
				<div :class="collapsed ? 'hidden' : 'visible'">
					<div class="card-content">
						<div class="content">
							<div class="field">
								<label class="label">New Email</label>
								<div class="control">
									<input class="input is-primary" name="newEmail" placeholder="New Email Address" v-model="newEmail" />
								</div>
							</div>
							<div class="field">
								<label class="label">Password</label>
								<div class="control">
									<input type="password" class="input is-primary" name="password" placeholder="Enter password" v-model="password" />
								</div>
							</div>
						</div>
					</div>

					<div class="field is-grouped">
						<div class="layout split">
							<button class="button is-green" type="submit">
								<span class="icon is-small">
									<i class="fas fa-save"></i>
								</span>
								<span> Update Email </span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<script>
import isIframe from '../utils/isIframe';

import { sha256 } from '../utils/cryptoFunctions';
import { changeEmail, validateInput } from '../utils/backupRestore';

export default {
	name: 'ChangeEmail',
	data: function() {
		return {
			newEmail: '',
			password: '',
			showSpinner: false,
			status: '',
			collapsed: true
		};
	},
	props: ['emailChanged'],
	methods: {
		async formSubmitChangeEmail(e) {
			e.preventDefault();
			if (!this.newEmail) return;

			const emailMessage = await validateInput('email', this.newEmail);
			if (emailMessage) alert(emailMessage);
			else {
				const storedPassword = window.sessionStorage.getItem('password');
				const password = await sha256(this.password);
				if (storedPassword === password) {
					const encryptedSeed = JSON.parse(localStorage.getItem('encryptedSeed'));
					const oldEmail = localStorage.getItem('email');
					await changeEmail(oldEmail, this.newEmail, encryptedSeed);
					window.localStorage.setItem('email', this.newEmail);
					alert('Email changed successfully.');

					this.newEmail = '';
					this.password = '';
					this.emailChanged();
					this.collapsed = true;
					await this.logout();
				} else alert('Password is not right!');
			}
		},

		async logout() {
			this.showSpinner = true;
			this.status = 'Logging out...';
			if (isIframe()) {
				(await this.connection.promise).onLogout();
			}
			localStorage.clear();
			window.location.reload();
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
