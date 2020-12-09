<template>
	<div class="container">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>

		<h1 class="title">Settings</h1>

		<div class="container mb-6">
			<ChangePassword></ChangePassword>
		</div>
		<div class="container mb-6">
			<ChangeEmail :emailChanged="emailChanged"></ChangeEmail>
		</div>
		<div class="container mb-6">
			<Change2FA></Change2FA>
		</div>
		<div class="container mb-6" v-if="false">
			<article class="message">
				<div class="message-header">
					<p>Export the Wallet Seed Phrase</p>
					<button class="delete" aria-label="delete" v-on:click="$router.push('/')"></button>
				</div>
				<div class="message-body">
					<ExportWallet></ExportWallet>
				</div>
			</article>
			
		</div>
		<button type="button" class="button is-fullwidth is-primary" v-on:click="$router.push('/')">Back</button>
	</div>
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
