<template>

   <section class="section">
		 <spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div class="container">
			<article class="message" v-if="$route.params.setting === 'password'">
					<div class="message-header">
						<p>Change the Password</p>
						<button class="delete" aria-label="delete" v-on:click="$router.push('/')"></button>
					</div>
					<div class="message-body">
						<ChangePassword></ChangePassword>
					</div>
				</article>

				<article class="message" v-if="$route.params.setting === 'email'">
					<div class="message-header">
						<p>Change Your Email Address</p>
						<button class="delete" aria-label="delete" v-on:click="$router.push('/')"></button>
					</div>
					<div class="message-body">
						<ChangeEmail :emailChanged="emailChanged"></ChangeEmail>
					</div>
				</article>

				<article class="message" v-if="$route.params.setting === '2fa'">
					<div class="message-header">
						<p>Change the 2-Factor-Authentication method</p>
						<button class="delete" aria-label="delete" v-on:click="$router.push('/')"></button>
					</div>
					<div class="message-body">
						<Change2FA></Change2FA>
					</div>
				</article>

				<article class="message" v-if="$route.params.setting === '2fa'">
					<div class="message-header">
						<p>Export the Wallet Seed Phrase</p>
						<button class="delete" aria-label="delete" v-on:click="$router.push('/')"></button>
					</div>
					<div class="message-body">
						<ExportWallet></ExportWallet>
					</div>
				</article>
		</div>
	</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Spinner from '../components/loading-spinner/Spinner.vue';
import { TypeFetchUser } from '../types/global-types';
import { Action } from 'vuex-class';
import { mapState } from 'vuex';
import ChangePassword from '../components/ChangePassword.vue';
import ChangeEmail from '../components/ChangeEmail.vue';
import Change2FA from '../components/Change2FA.vue';
import ExportWallet from '../components/ExportWallet.vue';

@Component({
	components: {
		Spinner,
		ChangePassword,
		ChangeEmail,
		Change2FA,
		ExportWallet
	},
	computed: {
		...mapState({
			twoFaRequired: (state: any) => state.twoFaRequired,
			walletEmail: (state: any) => state.email,
			status: (state: any) => state.status,
			accounts: (state: any) => state.accounts
		})
	}
})

export default class Settings extends Vue {
	dropdownIsActive = false;
	showSpinner = false;

			
	

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
