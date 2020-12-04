<template>
	<section class="section">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div class="container">
			<div class="container">
				<div class="field is-grouped">
					<div class="control is-expanded">
						<button class="button is-primary is-fullwidth" v-on:click="logout()">
							Logout
						</button>
					</div>
				</div>
			</div>

			<div class="container">
				<div class="columns is-mobile">
					<div class="column">
						<h4 class="subtitle mb-0">Hello {{ walletEmail }}</h4>
						<p class="content is-small has-text-weight-light">Not you? <a v-on:click="logout">Sign Out!</a></p>
					</div>
					<div class="column is-narrow">
						<div class="dropdown is-right" v-bind:class="{ 'is-active': dropdownIsActive }">
							<div class="dropdown-trigger">
								<figure
									class="image is-64x64"
									style="cursor: pointer"
									v-on:click="dropdownIsActive = !dropdownIsActive"
									aria-haspopup="true"
									aria-controls="dropdown-menu"
								>
									<img
										class="is-rounded"
										style="border: 3px solid #00c386"
										:src="'https://robohash.org/' + accounts[0] + '?gravatar=hashed&set=3'"
									/>
								</figure>
							</div>
							<div class="dropdown-menu" id="dropdown-menu" role="menu">
								<div class="dropdown-content">
									<div class="dropdown-item">
										<p>Add Social Recovery</p>
									</div>
									<div class="dropdown-item">
										<FBAddRecovery :walletEmail="walletEmail"></FBAddRecovery>
									</div>
									<div class="dropdown-item">
										<GoogleAddRecovery :walletEmail="walletEmail"></GoogleAddRecovery>
									</div>
									<div class="dropdown-item">
										<VKAddRecovery :walletEmail="walletEmail"> </VKAddRecovery>
									</div>
									<hr class="dropdown-divider" />
									<div class="dropdown-item">
										<p>Settings</p>
									</div>
									<a
										href="#"
										class="dropdown-item"
										@click="
											dropdownIsActive = !dropdownIsActive;
											$router.push('/settings/password');
										"
										>Change Password</a
									>
									<a
										href="#"
										class="dropdown-item"
										@click="
											dropdownIsActive = !dropdownIsActive;
											$router.push('/settings/email');
										"
										>Change Email</a
									>
									<a
										href="#"
										class="dropdown-item"
										@click="
											dropdownIsActive = !dropdownIsActive;
											$router.push('/settings/2fa');
										"
										>Change 2FA</a
									>
									<a
										href="#"
										class="dropdown-item"
										@click="
											dropdownIsActive = !dropdownIsActive;
											$router.push('/settings/export');
										"
										>Export Keystore V3 Object</a
									>
									<hr class="dropdown-divider" />

									<a
										href="#"
										class="dropdown-item"
										v-on:click="
											logout();
											dropdownIsActive = !dropdownIsActive;
										"
										>Logout</a
									>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div>
					<p>Your Account: {{ accounts[0] }}</p>
				</div>

				<div class="field is-grouped">
					<div class="control is-expanded">
						<button class="button is-primary is-fullwidth" v-on:click="logout()">
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>
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
