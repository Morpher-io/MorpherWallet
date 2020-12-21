<template>
	<div class="container">
		<h2 class="title">Signup</h2>
		<h4 class="subtitle">Create a new Wallet</h4>
		<form v-on:submit.prevent="signupExecute">
			<div class="field">
				<label class="label">Email</label>
				<div class="control">
					<input type="email" class="input" name="walletEmail" id="walletEmail" placeholder="example@example.com" v-model="walletEmail" />
				</div>

				<p class="help">Use this Email-Address for Wallet Recovery</p>
				<p class="help is-danger" v-if="invalidEmail">
					{{ invalidEmail }}
				</p>
			</div>

			<div class="field">
				<label class="label">Password</label>

				<div class="control">
					<input
						type="password"
						class="input"
						name="walletPassword"
						id="walletPassword"
						placeholder="Strong Password!"
						v-model="walletPassword"
					/>
					<password v-model="walletPassword" :strength-meter-only="true" :secure-length="8" style="max-width: initial; margin-top: -8px" />
					<p class="help">
						Use a strong Password! It encrypts your Wallet and keeps your Funds secure. It must be at least 8 characters long and include
						one lower-case, one upper-case character and a number.
					</p>

					<p class="help is-danger" v-if="invalidPassword">
						{{ invalidPassword }}
					</p>
				</div>
			</div>
			<div class="field">
				<label class="label">Repeat Password</label>
				<div class="control">
					<input
						type="password"
						class="input"
						name="walletPasswordRepeat"
						id="walletPasswordRepeat"
						placeholder="Repeat Password"
						v-model="walletPasswordRepeat"
					/>
				</div>
			</div>

			<div class="field">
				<div class="layout split first">
					<button class="button is-green" type="submit">
						<span class="icon is-small">
							<i class="far fa-file"></i>
						</span>
						<span> Create new Wallet </span>
					</button>
				</div>
				<div class="layout split second">
					<router-link to="/login" tag="button" class="button is-grey">
						<span class="icon is-small">
							<i class="fas fa-unlock"></i>
						</span>
						<span> Login instead </span>
					</router-link>
				</div>
			</div>
		</form>
	</div>
</template>

<script lang="ts">
import Password from 'vue-password-strength-meter';
import { validateInput } from '../utils/backupRestore';

import Component, { mixins } from 'vue-class-component';
import { Global } from '../mixins/mixins';

@Component({
	components: {
		Password
	}
})
export default class Signup extends mixins(Global) {
	// properties
	walletEmail = '';
	walletPassword = '';
	walletPasswordRepeat = '';
	signup = false;
	invalidEmail = '';
	invalidPassword = '';

	// Methods
	async signupExecute(e: any) {
		//console.log(e);
		e.preventDefault();
		this.invalidEmail = '';
		this.invalidPassword = '';

		if (this.walletPassword != this.walletPasswordRepeat) {
			this.invalidPassword = 'The passwords are not the identical, please repeat the password';
			return;
		}

		/**
		 * Validating Email
		 */
		this.updateLoading({ message: 'Validating Email...' });
		const emailMessage = await validateInput('email', this.walletEmail);
		if (emailMessage) {
			this.invalidEmail = emailMessage;
			return;
		}

		/**
		 * Validating Password
		 */

		this.updateLoading({ message: 'Validating Password...' });
		const passwordMessage = await validateInput('password', this.walletPassword);
		if (passwordMessage) {
			this.invalidPassword = passwordMessage;
			return;
		}

		const email = this.walletEmail;

		this.updateLoading({ message: 'Creating Wallet...' });
		this.createWallet({ email, password: this.walletPassword })
			.then(() => {
				this.updateLoading({ message: '' });
				if (this.store.twoFaRequired.email || this.store.twoFaRequired.authenticator) {
					// open 2fa page if 2fa is required
					this.$router.push('/2fa');
				} else {
					this.$router.push('/');
				}
			})
			.catch(e => {
				this.invalidEmail = e.toString();
				console.log(e);
			});
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
