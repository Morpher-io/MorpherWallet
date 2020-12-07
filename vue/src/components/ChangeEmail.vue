<template>
	<div class="card">
		<form v-on:submit.prevent="formSubmitChangeEmail">
			<header class="card-header">
				<p class="card-header-title">Change Email Address</p>
			</header>
			<div class="card-content">
				<div class="content">
					<div class="field">
						<div class="control">
							<input type="password" class="input is-primary" name="newEmail" placeholder="New Email" v-model="newEmail" />
						</div>
					</div>
					<div class="field">
						<div class="control">
							<input type="password" class="input is-primary" name="password" placeholder="Enter password" v-model="password" />
						</div>
					</div>
				</div>
			</div>
			<footer class="card-footer">
				<a href="#" class="card-footer-item">Update Email</a>
			</footer>
		</form>
	</div>
</template>

<script>
import isIframe from '../utils/isIframe';

import { sha256 } from '../utils/cryptoFunctions';
import { changeEmail, validateInput } from '../utils/backupRestore';

export default {
	name: 'ChangeEmail',
	data: function () {
		return {
			newEmail: '',
			password: '',
			showSpinner: false,
			status: ''
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
