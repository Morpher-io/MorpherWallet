<template>
	<div class="container">
		<div class="title-container has-text-left">
			<button @click="redirectUser" tag="button" class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
			</button>
			<h2 class="title ml-4">{{
				generateTitle()
			}}</h2>
		</div>

		<ChangeEmail :activePage="activePage" @changeActive="activePage = 'email'"></ChangeEmail>

		<ChangePassword :activePage="activePage" @changeActive="activePage = 'password'"></ChangePassword>

		<Change2FA :activePage="activePage" @changeActive="activePage = '2FA'"></Change2FA>

		<ExportWallet :activePage="activePage" @changeActive="activePage = 'keys'"></ExportWallet>

		<AccountRecovery :activePage="activePage" @changeActive="activePage = 'recovery'"></AccountRecovery>
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
	activePage = '';

	generateTitle() {
		let title = 'Settings';

		if (this.activePage === 'email') {
			title = 'Email settings';
		} else if (this.activePage === 'password') {
			title = 'Password settings';
		} else if (this.activePage === '2FA') {
			title = 'Two-Factor settings';
		} else if (this.activePage === 'keys') {
			title = 'Keys settings';
		} else if (this.activePage === 'recovery') {
			title = 'Recovery settings';
		}

		return title;
	}

	redirectUser() {
		if (!this.activePage) {
			this.$router.push('/');
		} else {
			this.activePage = '';
		}
	}
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
