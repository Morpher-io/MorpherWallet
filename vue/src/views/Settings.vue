<template>
	<div class="container">
		<div class="title-container has-text-left">
			<router-link to="/" tag="button" class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
			</router-link>
			<h2 class="title ml-4">Settings</h2>
		</div>

		<ChangeEmail></ChangeEmail>

		<ChangePassword></ChangePassword>

		<Change2FA></Change2FA>

		<ExportWallet></ExportWallet>

		<AccountRecovery></AccountRecovery>
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
import AccountRecovery from '../components/AccountRecovery.vue';

@Component({
	components: {
		ChangePassword,
		ChangeEmail,
		Change2FA,
		ExportWallet,
		AccountRecovery,
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

<style lang="scss" scoped>
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

.title-container {
	display: flex;
    align-items: center;

	.title {
		margin: 0;
	}
}
</style>
