<template>
	<div class="container">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>

		<h1 class="title">Morpher Wallet</h1>

		<h2 class="subtitle">Hello {{ walletEmail }}</h2>

		<div class="collapse">
			<div class="field">
				<div class="card-content">
					<div class="content">
						<label class="label">Account:</label>
						<div class="data">
							{{ accounts[0] }}
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="collapse" v-if="noRecoveryMethods">
			<div>
				<p class="help">
					You have no wallet recovery options set. You will not be able to recover your wallet if you forget your password.
				</p>
				<router-link class="help" to="/addrecovery" tag="a">Set recovery options now?</router-link>
			</div>
		</div>
		<div class="field is-grouped">
			<div class="layout split first">
				<button class="button is-green" @click="logout" type="submit">
					<span class="icon is-small">
						<i class="fas fa-lock"></i>
					</span>
					<span> Logout </span>
				</button>
			</div>

			<div class="layout split second">
				<router-link to="/settings" tag="button" class="button is-grey">
					<span class="icon is-small">
						<i class="fas fa-cog"></i>
					</span>
					<span> Settings </span>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global, Authenticated } from '../mixins/mixins';

@Component
export default class Wallet extends mixins(Global, Authenticated) {
	dropdownIsActive = false;
	selectedAccount = '';
	noRecoveryMethods = false;

	async mounted() {
		if (this.isIframe() && !this.store.loginComplete) {
			if (this.store.connection && this.store.connection !== null) {
				const promise = this.store.connection.promise;

				(await promise).onLogin(this.store.accounts[0], this.store.email);
			}
		}
		if (this.store.recoveryMethods.length == 1) {
			this.noRecoveryMethods = true;
		}
		this.store.loginComplete = true;
	}

	logout() {
		this.logoutWallet();
		this.router.push('/login');
	}
}
</script>

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
