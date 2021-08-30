<template>
	<div class="container">
		<div class="title-container has-text-left">
			<button @click="redirectUser" tag="button" class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
			</button>
			<h2 class="title ml-4">Settings</h2>
		</div>

		<div class="divider just-space"/>

		<div class="settings-link is-flex is-align-items-center" @click="changeActive('email')">
			<span class="text">
				Edit Email Address
			</span>
			<span class="icon">
				<i class="fas fa-chevron-right" />
			</span>
		</div>

		<div class="settings-link is-flex is-align-items-center" @click="changeActive('password')">
			<span class="text">
				Change Password
			</span>
			<span class="icon">
				<i class="fas fa-chevron-right" />
			</span>
		</div>

		<div class="settings-link is-flex is-align-items-center" @click="changeActive('2FA')">
			<span class="text">
				Two-Factor Authentication
			</span>
			<span class="icon">
				<i class="fas fa-chevron-right" />
			</span>
		</div>

		<div class="settings-link is-flex is-align-items-center" @click="changeActive('keys')">
			<span class="text">
				Export Private Keys / Seed
			</span>
			<span class="icon">
				<i class="fas fa-chevron-right" />
			</span>
		</div>

		<div class="settings-link is-flex is-align-items-center" @click="changeActive('recovery')">
			<span class="text">
				Trusted Account Recovery
			</span>
			<span class="icon">
				<i class="fas fa-chevron-right" />
			</span>
		</div>

		<!-- <ChangeEmail :activePage="activePage" @changeActive="activePage = 'email'"></ChangeEmail>

		<ChangePassword :activePage="activePage" @changeActive="activePage = 'password'"></ChangePassword>

		<Change2FA :activePage="activePage" @changeActive="activePage = '2FA'"></Change2FA>

		<ExportWallet :activePage="activePage" @changeActive="activePage = 'keys'"></ExportWallet>

		<AccountRecovery :activePage="activePage" @changeActive="activePage = 'recovery'"></AccountRecovery> -->
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
	redirectUser() {
		this.$router.push('/');
	}

	changeActive(page: string) {
		this.$router.push('/settings/' + page);
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
