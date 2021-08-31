<template>
	<div class="container">
		<h2 class="subtitle" data-cy="subtitle">Hello <b>{{ walletEmail }}</b></h2>

		<div class="field">
				<div class="card-content">
					<div class="content">
						<div class="user-data data">
							<div ref="userImage" class="jazz-icon" />
							{{ formatEthAddress(accounts[0]) }}
							<button
								class="button is-icon-only copy-button"
								@click="copyETHAddress(accounts[0])"
								title="Copy ETH Address"
							>
								<i class="fas fa-copy" />
							</button>
						</div>
					</div>
				</div>
		</div>
		<div class="buttons horizontal-buttons">
			<router-link to="/send" tag="button" class="button is-purple big-button is-thick transition-faster" disabled>
				<span class="icon is-small">
					<i class="fas fa-paper-plane"></i>
				</span>
				<span data-cy="settings">Send</span>
			</router-link>
			<router-link to="/settings" tag="button" class="button is-blue big-button is-thick transition-faster">
				<span class="icon is-small">
					<i class="fas fa-cog"></i>
				</span>
				<span data-cy="settings">Settings</span>
			</router-link>
		</div>
		<div class="divider"></div>
		<h2 class="title has-text-left">Account Status</h2>
		<div class="has-text-left" v-if="noRecoveryMethods">
			<div>
				<p class="subtitle">
					Your account is currently at risk. <b>Losing your password means losing your funds.</b> Please add a trusted account backup.
				</p>
				<router-link to="/addrecovery" tag="button" class="button is-green big-button is-thick transition-faster">
					Add Trusted Account
				</router-link>
			</div>
		</div>
		<div class="divider thick"></div>
		<div class="has-text-left" v-if="!twoFactorActive && !twoFactorEmailActive">
			<div>
				<p class="subtitle">
					We strongly recommend you add 2FA verification to increase wallet security. Please turn on 2FA verification in settings.
				</p>
				<router-link to="/settings/2fa" tag="button" class="button is-light-purple big-button is-thick transition-faster">
					Enable 2-Step
				</router-link>
			</div>
		</div>
		<div class="has-text-left protection-enabled" v-if="twoFactorEmailActive">
			<i class="fas fa-envelope"></i>
			<p>2FA Email</p>
			<span class="enabled">Enabled</span>
		</div>
		<div class="has-text-left protection-enabled mt-5" v-if="twoFactorActive">
			<i class="fas fa-mobile-alt"></i>
			<p>2FA Authenticator</p>
			<span class="enabled">Enabled</span>
		</div>
		<div class="divider"></div>
		<button class="button is-danger big-button is-thick transition-faster" @click="logout" type="submit" data-cy="logout">
			<span>Logout</span>
		</button>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global, Authenticated } from '../mixins/mixins';
import jazzicon from "@metamask/jazzicon";
import { copyToClipboard } from '../utils/utils';

@Component
export default class Wallet extends mixins(Global, Authenticated) {
	dropdownIsActive = false;
	selectedAccount = '';
	noRecoveryMethods = false;
	twoFactorActive = false;
	twoFactorEmailActive = false;

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
		ref.innerHTML = "";
		if (!ethAddress) {
			return;
		}
		const seed = parseInt(ethAddress.slice(2, 10), 16);
		if (!seed) return;
		const image = jazzicon(36, seed);
		ref.append(image);
	}

	copyETHAddress(ethAddress: string): void {
		copyToClipboard(ethAddress, this);
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
.user-data {
	display: flex;
    padding: 10px 20px;
    background: #eee;
    border-radius: 10px;
    align-items: center;
    justify-content: center;
	
	.jazz-icon {
		height: 36px;
		width: 36px;
		margin-right: 10px;
	}
}
.copy-button {
	margin-left: auto;
}
</style>
