<template>
	<div class="card">
		<div class="collapse" data-cy="exportHeader">
			<div class="is-flex is-align-items-center">
					<span class="header" @click="collapsed = !collapsed">
						Export Private Keys / Seed
					</span>
					<span :class="{
						'icon collapseIcon header': true,
						'open': !collapsed
					}" @click="collapsed = !collapsed">
						<i class="fas fa-chevron-right"></i>
					</span>
				</div>
			<div :class="collapsed ? 'hidden' : 'visible'">
				<div class="message-body">
					<p class="header-text help warning">Before you delete your account, make sure you have exported your Seed Phrase.</p>
					<div class="field">
								<label class="label">Wallet Password</label>
								<div class="control">
									<input
										class="input is-primary"
										name="password"
										type="password"
										data-cy="password"
										v-model="password"
									/>
								</div>
							</div>
					<h2 class="title">Seed Phrase</h2>
					<p class="subtitle is-text-small">Enter your password above to manipulate seed pharse.</p>
					<div class="is-flex">
						<button class="button is-green big-button is-login transition-faster" data-cy="exportSeed" type="submit" @click="exportPhrase(store.accounts[0])" :disabled="!password">
							<span>Export Phrase</span>
						</button>
						<button data-cy="showSeed" class="button is-grey outlined-button big-button transition-faster small-text squared ml-3" type="submit" @click="showPhrase()" :disabled="!password">
							<span class="icon is-small">
								<i class="fas fa-eye"></i>
							</span>
						</button>
					</div>
					<div class="private-key" v-if="store.seedPhrase !== ''">
						<h2 data-cy="seedTitle" class="private-key-text private-key-header">Your Phrase</h2>
						<h4 data-cy="seedValue" class="private-key-text">{{ store.seedPhrase }}</h4>
						<button data-cy="clearSeed" class="button big-button is-danger transition-faster small-text mt-3" @click="clearPhrase()" type="submit">
							<span>Clear</span>
						</button>
					</div>
					<div class="divider"></div>

					<h2 class="title">Private Key</h2>
					<p class="subtitle is-text-small">Enter your password above to export private key.</p>
					<div class="is-flex">
						<button class="button is-green big-button is-login transition-faster" data-cy="exportSeed" type="submit" @click="exportKey(store.accounts[0])" :disabled="!password">
							<span>Export Key</span>
						</button>
						<button data-cy="showSeed" class="button is-grey outlined-button big-button transition-faster small-text squared ml-3" type="submit" @click="showKey()" :disabled="!password">
							<span class="icon is-small">
								<i class="fas fa-eye"></i>
							</span>
						</button>
					</div>
					<div class="private-key" v-if="store.privateKey !== ''">
						<h2 data-cy="seedTitle" class="private-key-text private-key-header">Your Key</h2>
						<h4 data-cy="seedValue" class="private-key-text">{{ store.privateKey }}</h4>
						<button data-cy="clearSeed" class="button big-button is-danger transition-faster small-text mt-3" @click="clearKey()" type="submit">
							<span>Clear</span>
						</button>
					</div>
					<div class="divider"></div>

					<button v-if="store.seedExported" data-cy="deleteAccount" class="button big-button is-danger transition-faster" type="submit" @click="deleteAccount()">
						<span class="icon is-small">
							<i class="fas fa-trash"></i>
						</span>
						<span>Delete Account</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { sha256 } from '../utils/cryptoFunctions';
import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '@/mixins/mixins';

@Component({})
export default class ExportWallet extends mixins(Global, Authenticated) {
	password = '';
	seedPhrase = '';
	collapsed = true;

	async exportKey(account) {
		await this.exportKeystore({ account, password: this.password });
		this.password = '';
	}

	async exportPhrase(account) {
		const password = await sha256(this.password);
		await this.exportSeedPhrase({ account, password });
		this.password = '';
	}

	async showKey() {
		const password = await sha256(this.password);
		await this.showPrivateKey({ password });
		this.password = '';
	}

	async showPhrase() {
		const password = await sha256(this.password);
		await this.showSeedPhrase({ password });
		this.password = '';
	}

	async clearKey() {
		await this.clearPrivateKey();
	}

	async clearPhrase() {
		await this.clearSeedPhrase();
	}

	async deleteAccount() {
		const password = await sha256(this.password);
		await this.deleteWalletAccount({ password });
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.password {
	margin-bottom: 10px;
}
.export {
	height: 60px;
	margin: 20px 0;
}
.account {
	font-size: 14px;
}
.private-key-text {
	text-align: center;
	word-break: break-word;
}
.private-key {
	border-style: solid;
    border-style: solid;
    border-radius: 10px;
    border-color: #363636;
    border-width: 1px;
    margin: 20px 0;
    padding: 15px;
    color: #363636;
    font-size: 14px;

	.private-key-header {
		font-weight: 500;
		font-size: 18px;
	}
}
.header-text {
	text-align: center;
	word-break: break-word;
	margin-top: 20px;
	margin-left: 20px;
	margin-right: 20px;
	margin-bottom: 10px;
}
.warning {
    border-style: solid;
    font-size: 14px;
    border-radius: 10px;
    border-color: #fc6404;
    margin: 20px 0;
    padding: 10px;
    color: #fc6404;
    border-width: 2px;
    background: rgb(252 100 4 / 10%);
}
</style>
