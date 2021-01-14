<template>
	<div class="container">
		<h1 class="title">Settings</h1>

		<ChangePassword></ChangePassword>

		<ChangeEmail></ChangeEmail>

		<Change2FA></Change2FA>

		<ExportWallet :accounts="accounts" :keystore="keystore"></ExportWallet>

		<div class="field is-grouped">
			<router-link to="/addrecovery" tag="button" class="button is-danger">
				<span class="icon is-small">
					<i class="fas fa-life-ring"></i>
				</span>
				<span> Add Account Recovery </span>
			</router-link>
		</div>
		<div class="field is-grouped">
			<router-link to="/" tag="button" class="button is-grey">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
				<span> Back </span>
			</router-link>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapState } from 'vuex';
import ChangePassword from '../components/ChangePassword.vue';
import ChangeEmail from '../components/ChangeEmail.vue';
import Change2FA from '../components/Change2FA.vue';
import ExportWallet from '../components/ExportWallet.vue';

@Component({
	components: {
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
			accounts: (state: any) => state.accounts,
			keystore: (state: any) => state.keystore
		})
	}
})
export default class Settings extends Vue {
	dropdownIsActive = false;
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
