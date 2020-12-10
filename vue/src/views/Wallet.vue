<template>
	<div class="container">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>

		<h1 class="title">Morpher Wallet</h1>

		<div class="container">
			<div class="container">
				<div class="card">
					<div class="card-content">
						<div class="content">
							<h4 class="subtitle mb-0">Hello {{ walletEmail }}</h4>
							Account: {{ accounts[0] }}
						</div>
					</div>
					<footer class="card-footer">
						<router-link to="/settings" tag="a" class="card-footer-item"> Settings </router-link>
						<a class="card-footer-item" v-on:click="logout()">Logout</a>
					</footer>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global, Authenticated } from '../mixins/mixins';

import FBAddRecovery from '../components/FBAddRecovery.vue';
import GoogleAddRecovery from '../components/GoogleAddRecovery.vue';
import VKAddRecovery from '../components/VKAddRecovery.vue';

@Component({
	components: {
		FBAddRecovery,
		GoogleAddRecovery,
		VKAddRecovery
	}
})
export default class Wallet extends mixins(Global, Authenticated) {
	dropdownIsActive = false;
	selectedAccount = '';

	async mounted() {
		if (this.isIframe()) {
			if (this.store.connection && this.store.connection !== null) {
				const promise = this.store.connection.promise;

				(await promise).onLogin(this.store.accounts[0], this.store.email);
			}
		}


		// @ts-ignore
		console.log(this.store.keystore[0].sign('test'))
	}

	logout() {
		this.logoutWallet();
		this.$router.push('/login');
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
