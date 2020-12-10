<template>
	<div class="container">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>

		<h1 class="title">Morpher Wallet</h1>

				<h2 class="subtitle">Hello {{ walletEmail }}</h2>
			
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
			<div class="field is-grouped">
				<div class="layout split first">
					<button class="button is-green" type="submit">
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
		if (this.isIframe() && !this.store.loginComplete) {
			if (this.store.connection && this.store.connection !== null) {
				const promise = this.store.connection.promise;

				(await promise).onLogin(this.store.accounts[0], this.store.email);
			}
		}
		this.store.loginComplete = true;
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
