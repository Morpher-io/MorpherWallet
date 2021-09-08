<template>
	<div class="container">
		<div class="user-details settings-data">
			<div class="details">
				<div class="is-flex has-text-left">
					<div ref="userImage" class="jazz-icon" />
					<div class="ml-3">
						<p class="medium-text has-text-weight-medium">
							<span class="important-font"> {{ formatEthAddress(accounts[0]) }} </span>
							<span class="copy-icon" @click="copyETHAddress(accounts[0])"><i class="fas fa-copy"/></span>
						</p>
						<p>{{ store.email }}</p>
					</div>
				</div>
				<div class="buttons horizontal-buttons mt-3">
					<button
						tag="button"
						:class="{ 'cursor-not-allowed': !this.isIframe() }"
						@click="sendInApp"
						class="button is-light-purple is-small-button has-text-weight-bold transition-faster"
					>
						<span class="icon is-small">
							<i class="fas fa-paper-plane"></i>
						</span>
						<span>Send</span>
						<div class="tooltip" v-if="!this.isIframe()">
							Sending on Ethereum only available when using wallet inside the Morpher app.
						</div>
					</button>
					<router-link to="/settings" tag="button" class="button is-light-blue is-small-button has-text-weight-bold transition-faster">
						<span class="icon is-small">
							<i class="fas fa-cog"></i>
						</span>
						<span>Settings</span>
					</router-link>
				</div>
			</div>
		</div>

		<p class="mt-5 has-text-weight-medium is-size-6 is-flex is-align-items-center important-font">
			<i class="fas fa-life-ring is-size-6 mr-1"></i>
			{{ noRecoveryMethods ? 'Recovery Missing' : 'Recovery' }}
		</p>

		<div class="mt-1 user-details settings-data">
			<div v-if="noRecoveryMethods" class="details has-text-left">
				<p>
					Your account is at risk, <b>losing your password means losing all your funds</b>. We recommend adding a trusted recovery account.
				</p>
				<router-link
					to="/settings/recovery"
					tag="button"
					class="button is-light-green is-small-button has-text-weight-bold transition-faster mt-3"
				>
					<span>Add Recovery Account</span>
				</router-link>
			</div>
			<div v-else class="details has-text-left">
				<div class="protection-enabled mt-1" v-if="whatRecovery.google">
					<span class="icon img mr-1">
						<img src="@/assets/img/google_logo.svg" alt="Google Logo" />
					</span>
					<p class="mr-1">Google Recovery</p>
					<span class="enabled">Enabled</span>
				</div>
				<div class="protection-enabled mt-1" v-if="whatRecovery.facebook">
					<span class="icon img mr-1">
						<img src="@/assets/img/fb_logo.svg" alt="Facebook Logo" />
					</span>
					<p class="mr-1">Facebook Recovery</p>
					<span class="enabled">Enabled</span>
				</div>
				<div class="protection-enabled mt-1" v-if="whatRecovery.vkontakte">
					<span class="icon img mr-1">
						<img src="@/assets/img/vk_logo.svg" alt="VKontakte Logo" />
					</span>
					<p class="mr-1">VKontakte Recovery</p>
					<span class="enabled">Enabled</span>
				</div>
			</div>
		</div>

		<p class="mt-4 has-text-weight-medium is-size-6 is-flex is-align-items-center important-font">
			<i class="fas fa-shield-alt is-size-6 mr-1"></i> Security
		</p>

		<div class="mt-1 user-details settings-data">
			<div v-if="!twoFactorActive && !twoFactorEmailActive" class="details has-text-left">
				<p>
					Please add 2-step verification to increase wallet security.
					<router-link to="/settings/2fa" class="login-router transition-faster">Enable in Settings</router-link>
				</p>
			</div>
			<div v-else class="details has-text-left">
				<div class="protection-enabled" v-if="twoFactorEmailActive">
					<i class="fas fa-envelope mr-1 is-size-6"></i>
					<p class="mr-1">Email</p>
					<span class="enabled">Enabled</span>
				</div>
				<div class="protection-enabled mt-1" v-if="twoFactorActive">
					<i class="fas fa-mobile-alt mr-1 is-size-6"></i>
					<p class="mr-1">2-Step Authenticator</p>
					<span class="enabled">Enabled</span>
				</div>
			</div>
		</div>

		<div v-if="twoFactorActive || twoFactorEmailActive" class="mt-2 has-text-left is-size-7">
			<p class="has-text-weight-medium">2-Step Recommendation</p>
			<p>Complete KYC on Morpher to avoid losing wallet after losing 2FA device.</p>
		</div>

		<div class="divider just-space"></div>

		<div class="links is-flex is-align-items-center is-justify-content-center">
			<div class="link is-flex has-text-weight-medium is-align-items-center">
				<i class="fas fa-question-circle mr-1 is-size-6"></i>
				<a href="https://support.morpher.com/en/category/morpher-wallet-idvnts/" target="__blank" class="login-router transition-faster"
					>Support</a
				>
			</div>
			<div class="divider vertical"></div>
			<div class="link is-flex has-text-weight-medium is-align-items-center">
				<i class="fas fa-door-open mr-1 is-size-6"></i>
				<div @click="logout()" class="login-router transition-faster">Logout</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global, Authenticated } from '../mixins/mixins';
import jazzicon from '@metamask/jazzicon';
import { copyToClipboard } from '../utils/utils';

@Component
export default class Wallet extends mixins(Global, Authenticated) {
	dropdownIsActive = false;
	selectedAccount = '';
	noRecoveryMethods = false;
	twoFactorActive = false;
	twoFactorEmailActive = false;
	whatRecovery = {
		facebook: false,
		google: false,
		vkontakte: false
	};

	async mounted() {
		if (this.isIframe() && !this.store.loginComplete) {
			if (this.store.connection && this.store.connection !== null) {
				const promise = this.store.connection.promise;

				(await promise).onLogin(this.store.accounts[0], this.store.email);
			}
		}
		if (this.store.recoveryMethods.length == 1) {
			this.noRecoveryMethods = true;
		}
		if (this.store.twoFaRequired.authenticator) {
			this.twoFactorActive = true;
		}
		if (this.store.twoFaRequired.email) {
			this.twoFactorEmailActive = true;
		}
		if (this.store.accounts && this.store.accounts[0]) {
			this.generateImage(this.store.accounts[0]);
		}

		const facebook = await this.hasRecovery(2);
		const google = await this.hasRecovery(3);
		const vkontakte = await this.hasRecovery(5);

		this.whatRecovery = {
			facebook,
			google,
			vkontakte
		};

		this.store.loginComplete = true;
	}

	generateImage(ethAddress: any): void {
		if (!ethAddress) {
			return;
		}
		const ref: any = this.$refs.userImage;
		if (!ref) {
			if (ethAddress) {
				setTimeout(() => {
					this.generateImage(ethAddress);
				}, 100);
			}
			return;
		}
		ref.innerHTML = '';
		if (!ethAddress) {
			return;
		}
		const seed = parseInt(ethAddress.slice(2, 10), 16);
		if (!seed) return;
		const image = jazzicon(32, seed);
		ref.append(image);
	}

	async sendInApp() {
		if (this.isIframe()) {
			if (this.store.connection && this.store.connection !== null) {
				const promise = this.store.connection.promise;
				(await promise).openSendInApp();
			}
		}
	}

	copyETHAddress(ethAddress: string): void {
		copyToClipboard(ethAddress);
	}

	logout() {
		this.logoutWallet();
		this.router.push('/login');
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
.copy-button {
	margin-left: auto;
}
</style>
