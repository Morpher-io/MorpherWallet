<template>
	<div class="container">
		<ConfirmAccess v-if="currentPage === 0" @pageBack="pageBack" @setPassword="setPassword" />
		<div v-if="currentPage === 1">
			<div class="title-container has-text-left">
				<button
					@click="redirectUser"
					tag="button"
					class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only"
				>
					<span class="icon is-small">
						<i class="fas fa-chevron-left"></i>
					</span>
				</button>
				<h2 class="title ml-4">Account Recovery</h2>
			</div>
			<p class="subtitle">Add a trusted online account as the recovery method for your wallet (in case you forget your wallet password).</p>

			<div class="divider just-space" />

			<div>
				<AddRecoveryGoogle v-if="whatRecovery.google" @processMethod="processMethod"></AddRecoveryGoogle>

				<AddRecoveryFacebook v-if="whatRecovery.facebook" :walletEmail="store.email" @processMethod="processMethod"></AddRecoveryFacebook>

				<AddRecoveryVkontakte v-if="whatRecovery.vkontakte" :walletEmail="store.email" @processMethod="processMethod"></AddRecoveryVkontakte>
			</div>

			<div v-if="!whatRecovery.google || !whatRecovery.facebook || !whatRecovery.vkontakte">
				<p v-if="whatRecovery.google || whatRecovery.facebook || whatRecovery.vkontakte" class="another-text has-text-left mt-5">
					Add another trusted account:
				</p>

				<AddRecoveryGoogle v-if="!whatRecovery.google" @processMethod="processMethod"></AddRecoveryGoogle>

				<AddRecoveryFacebook v-if="!whatRecovery.facebook" :walletEmail="store.email" @processMethod="processMethod"></AddRecoveryFacebook>

				<AddRecoveryVkontakte v-if="!whatRecovery.vkontakte" :walletEmail="store.email" @processMethod="processMethod"></AddRecoveryVkontakte>
			</div>

			<div class="error mt-3" v-if="logonError">
				<p>⚠️ <span v-html="logonError"></span></p>
			</div>

			<div class="has-text-left mt-5 is-size-7">
				<p class="has-text-weight-bold"><i class="fas fa-shield-alt"></i> Fully Encrypted Backup</p>
				<p>
					Your wallet keys are never shared. These services cannot access your wallet or monitor your funds & activity. Please make sure to
					use a recovery account with a strong password.
				</p>
			</div>
		</div>
		<div v-if="currentPage === 2">
			<div>
				<img src="@/assets/img/checkmark.svg" alt="Checkmark image" class="mb-3" />
				<h2 class="title">{{ currentMethod }} Recovery {{ isEnabled ? 'Enabled' : 'Disabled' }}</h2>
				<p class="subtitle">Trusted account successfully {{ isEnabled ? 'activated' : 'deactivated' }} for recovery.</p>

				<button @click="resetData" tag="button" class="button outlined-button big-button transition-faster">
					<span>Close</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import AddRecoveryGoogle from '../components/AddRecoveryGoogle.vue';
import AddRecoveryFacebook from '../components/AddRecoveryFacebook.vue';
import AddRecoveryVkontakte from '../components/AddRecoveryVkontakte.vue';
import ConfirmAccess from '../components/ConfirmAccess.vue';
import { getDictionaryValue } from '../utils/dictionary';

@Component({
	components: {
		AddRecoveryGoogle,
		AddRecoveryFacebook,
		AddRecoveryVkontakte,
		ConfirmAccess
	}
})
export default class RecoverySettings extends mixins(Authenticated, Global) {
	currentPage = 0;
	newPassword = '';
	logonError = '';
	currentMethod = '';
	isEnabled = false;
	whatRecovery = {
		facebook: false,
		google: false,
		vkontakte: false
	};
	processing = {
		facebook: false,
		google: false,
		vkontakte: false
	};

	async mounted() {
		const facebook = await this.hasRecovery(2);
		const google = await this.hasRecovery(3);
		const vkontakte = await this.hasRecovery(5);

		this.whatRecovery = {
			facebook,
			google,
			vkontakte
		};
	}

	pageBack() {
		this.redirectUser();
	}

	async setPassword(password: string) {
		if (!password) return;

		this.newPassword = password;
		this.currentPage = 1;
	}

	redirectUser() {
		this.$router.push('/settings');
	}

	processMethod(data: any): void {
		this.logonError = '';

		if (data.success) {
			this.currentMethod = data.method;
			this.isEnabled = data.enabled;
			this.currentPage = 2;
		} else {
			this.logonError = data.method + ': ' + getDictionaryValue(data.error);
		}
	}

	async resetData() {
		this.currentPage = 1;
		this.logonError = '';
		this.currentMethod = '';
		this.isEnabled = false;

		const facebook = await this.hasRecovery(2);
		const google = await this.hasRecovery(3);
		const vkontakte = await this.hasRecovery(5);

		this.whatRecovery = {
			facebook,
			google,
			vkontakte,
		};
	}
}
</script>

<style lang="scss" scoped>
.title-container {
	display: flex;
	align-items: center;

	.title {
		margin: 0;
	}
}

.another-text {
	margin-bottom: -10px;
}
</style>
