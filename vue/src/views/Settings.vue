<template>
	<div class="container">
		<div class="title-container has-text-left">
			<button @click="redirectUser" tag="button" class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
			</button>
			<h2 v-if="!isEmailPasswordPage" class="title ml-3">{{ $t('settings.SETTINGS_TITLE') }}</h2>
			<h2 v-if="isEmailPasswordPage" class="title ml-3">{{ $t('settings.EMAIL_AND_PASSWORD') }}</h2>
		</div>

		<div class="divider just-space" />

		<div v-if="!isEmailPasswordPage" class="settings-data">
			<div data-cy="emailPasswordButton" key="email_passowrd" class="settings-link is-flex is-align-items-center" @click="changeActive('email_password')">
				<i class="fas fa-user-circle" />
				<span class="text">
					{{ $t('settings.EMAIL_AND_PASSWORD') }}
				</span>
				<span class="icon">
					<i class="fas fa-chevron-right" />
				</span>
			</div>

			<div data-cy="recoverySettings" key="recovery" class="settings-link is-flex is-align-items-center" @click="changeActive('recovery')">
				<i class="fas fa-life-ring" />
				<span class="text">
					{{ $t('settings.TRUSTED_ACCOUNT') }}
				</span>
				<span class="icon">
					<i class="fas fa-chevron-right" />
				</span>
			</div>

			<div data-cy="verificationSettings"  key="2FA" class="settings-link is-flex is-align-items-center" @click="changeActive('2FA')">
				<i class="fas fa-check-double" />
				<span class="text">
					{{ $t('settings.2_STEP_VERIFICATION') }}
				</span>
				<span class="icon">
					<i class="fas fa-chevron-right" />
				</span>
			</div>

			<div key="keys" class="settings-link is-flex is-align-items-center" data-cy="exportWalletButton" @click="changeActive('keys')">
				<i class="fas fa-file-download" />
				<span class="text">
					{{ $t('settings.EXPORT_WALLET') }}
				</span>
				<span class="icon">
					<i class="fas fa-chevron-right" />
				</span>
			</div>

			<div data-cy="deleteAccountSettings" key="delete" class="settings-link is-flex is-align-items-center" @click="changeActive('delete')">
				<i class="fas fa-ban" />
				<span class="text">
					{{ $t('settings.DELETE_ACCOUNT') }}
				</span>
				<span class="icon">
					<i class="fas fa-chevron-right" />
				</span>
			</div>
		</div>

		<div v-else class="settings-data">
			<div key="email" class="settings-link email-password is-flex is-align-items-center reset-cursor">
				<div class="data">
					<p class="has-text-weight-bold">{{ $t('common.EMAIL') }}</p>
					<p>{{ store.email }}</p>
				</div>
				<div class="link">
					<div class="login-router transition-faster" data-cy="emailChangeButton" @click="changeActive('email')">
						<i class="fas fa-pen-square" />
					</div>
				</div>
			</div>
			<div key="password" class="settings-link email-password is-flex is-align-items-center reset-cursor">
				<div class="data">
					<p class="has-text-weight-bold">{{ $t('common.PASSWORD') }}</p>
					<p>********</p>
				</div>
				<div class="link">
					<div class="login-router transition-faster" data-cy="passwordChangeButton"  @click="changeActive('password')">
						<i class="fas fa-pen-square" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import ChangePassword from '../components/ChangePassword.vue';
import ChangeEmail from '../components/ChangeEmail.vue';
import Change2FA from '../components/Change2FA.vue';
import AccountRecovery from '../components/AccountRecovery.vue';
import { Authenticated, Global } from '../mixins/mixins';

@Component({
	components: {
		ChangePassword,
		ChangeEmail,
		Change2FA,
		AccountRecovery
	}
})
export default class Settings extends mixins(Authenticated, Global) {
	activePage = '';
	isEmailPasswordPage = false;

	redirectUser() {
		if (this.activePage === 'email_password') {
			this.isEmailPasswordPage = false;
			this.activePage = '';
			return;
		}

		this.$router.push('/').catch(() => undefined);;
	}

	changeActive(page: string) {
		this.activePage = page;

		if (page === 'email_password') {
			this.isEmailPasswordPage = true;
			return;
		}

		this.$router.push('/settings/' + page).catch(() => undefined);;
	}

	mounted() {
		if (this.$route.query.email_password) {
			this.isEmailPasswordPage = true;
			this.activePage = 'email_password';
			this.$router.replace({ query: {} });
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
