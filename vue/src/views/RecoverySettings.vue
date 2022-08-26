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
				<h2 class="title ml-3">{{ $t('recovery.ACCOUNT_RECOVERY') }}</h2>
			</div>
			<p class="subtitle has-text-left">
				{{ $t('recovery.ADD_TRUSTED_ACCOUNT') }}
			</p>

			<div class="error mt-3 mb-3" v-if="logonError">
				<p>⚠️ <span v-html="logonError"></span></p>
			</div>

			<div>
				<AddRecoveryApple v-if="whatRecovery.apple" @processMethod="processMethod"></AddRecoveryApple>

				<AddRecoveryGoogle v-if="whatRecovery.google" @processMethod="processMethod"></AddRecoveryGoogle>

				<AddRecoveryFacebook v-if="whatRecovery.facebook" :walletEmail="store.email" @processMethod="processMethod"></AddRecoveryFacebook>

				<AddRecoveryVkontakte
					v-if="whatRecovery.vkontakte"
					:walletEmail="store.email"
					@processMethod="processMethod"
				></AddRecoveryVkontakte>
			</div>

			<div v-if="!whatRecovery.google || !whatRecovery.facebook || !whatRecovery.vkontakte || !whatRecovery.apple">
				<p v-if="whatRecovery.google || whatRecovery.facebook || whatRecovery.vkontakte || whatRecovery.apple" class="another-text has-text-left mt-5">
					{{ $t('recovery.ADD_ANOTHER_ACCOUNT') }}
				</p>

				<AddRecoveryApple v-if="!whatRecovery.apple" @processMethod="processMethod"></AddRecoveryApple>

				<AddRecoveryGoogle v-if="!whatRecovery.google" @processMethod="processMethod"></AddRecoveryGoogle>

				<AddRecoveryFacebook v-if="!whatRecovery.facebook" :walletEmail="store.email" @processMethod="processMethod"></AddRecoveryFacebook>

				<AddRecoveryVkontakte
					v-if="!whatRecovery.vkontakte"
					:walletEmail="store.email"
					@processMethod="processMethod"
				></AddRecoveryVkontakte>
			</div>

			<div class="divider just-space" />

			<div class="has-text-left mt-5 is-size-7">
				<p class="has-text-weight-bold"><i class="fas fa-shield-alt"></i> {{ $t('recovery.ADD_ACCOUNT_TIP_TITLE') }}</p>
				<p>
					{{ $t('recovery.ADD_ACCOUNT_TIP_DESCRIPTION') }}
				</p>
			</div>
		</div>
		<div v-if="currentPage === 2">
			<div>
				<img src="@/assets/img/checkmark.svg" alt="Checkmark image" class="mb-3" />
				<h2 class="title">
					{{
						$t('recovery.RECOVERY_ENABLED', {
							currentMethod,
							isEnabled: $t(isEnabled ? 'common.ENABLED' : 'common.DISABLED')
						})
					}}
				</h2>
				<p class="subtitle">
					{{
						$t('recovery.TRUSTED_CHANGED', {
							isActivated: $t(isEnabled ? 'common.ACTIVATED' : 'common.DEACTIVATED')
								.toString()
								.toLowerCase()
						})
					}}
				</p>

				<button @click="resetData" tag="button" class="button outlined-button big-button transition-faster">
					<span class="text">{{ $t('common.CLOSE') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import AddRecoveryApple from '../components/AddRecoveryApple.vue';
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
		ConfirmAccess,
		AddRecoveryApple
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
		vkontakte: false,
		apple: false,
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
		const apple = await this.hasRecovery(6);

		this.whatRecovery = {
			facebook,
			google,
			vkontakte,
			apple
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
		this.$router.push('/settings').catch(() => undefined);
	}

	processMethod(data: any): void {
		this.logonError = '';

		if (data.success) {
			this.currentMethod = data.method;
			this.isEnabled = data.enabled;
			this.currentPage = 2;
		} else {
			if (data.error === 'popup_closed_by_user') {
				this.logonError = getDictionaryValue('GOOGLE_COOKIES_BLOCKED');
			} else if (data.error === 'google_script_blocked') {
				this.logonError = getDictionaryValue('GOOGLE_SCRIPT_BLOCKED');
			} else {
				this.logonError = data.method + ': ' + getDictionaryValue(data.error);
			}
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
		const apple = await this.hasRecovery(6);

		this.whatRecovery = {
			facebook,
			google,
			vkontakte,
			apple
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
