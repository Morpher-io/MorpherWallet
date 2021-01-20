<template>
	<div class="card">
		<div class="collapse" data-cy="exportHeader">
			<span v-show="collapsed" class="icon collapseIcon header" @click="collapsed = !collapsed">
				<i class="fas fa-chevron-right"></i>
			</span>
			<span v-show="!collapsed" class="icon collapseIcon header" @click="collapsed = !collapsed">
				<i class="fas fa-chevron-down"></i>
			</span>

			<span class="header" @click="collapsed = !collapsed"> Export the Wallet Seed Phrase and Keys</span>

			<div :class="collapsed ? 'hidden' : 'visible'">
				<div class="message-body">
					<p class="help header-text warning">Before you delete your account, make sure you have exported your Seed Phrase.</p>
					<input class="password" data-cy="seedPassword" type="password" name="password" placeholder="Enter Wallet password" v-model="password" />
					<br />
					<button data-cy="showSeed" class="button is-green export" type="submit" @click="showPhrase()">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Show Seed Phrase </span>
					</button>
					<h4 data-cy="seedTitle" v-if="store.seedPhrase !== ''" class="private-key-header private-key-text">Seed Phrase</h4>
					<h4 data-cy="seedValue" v-if="store.seedPhrase !== ''" class="private-key-text">{{ store.seedPhrase }}</h4>
					<button v-if="store.seedPhrase !== ''" data-cy="clearSeed" class="button is-danger export" @click="clearPhrase()" type="submit">
						<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Clear </span>
					</button>
					<button class="button is-green export" data-cy="exportSeed" type="submit" @click="exportPhrase(store.accounts[0])">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Export Seed Phrase </span>
					</button>
					<button class="button is-green export" data-cy="showPrivateKey" type="submit" @click="showKey()">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Show Private Key for </span>
						<br />
						<span class="account"> {{ store.accounts[0] }} </span>
					</button>
					<h4 data-cy="privateKeyTitle" v-if="store.privateKey !== ''" class="private-key-header private-key-text">Private Key</h4>
					<h4 data-cy="privateKeyValue" v-if="store.privateKey !== ''" class="private-key-text">{{ store.privateKey }}</h4>
					<button v-if="store.privateKey !== ''" class="button is-danger export" @click="clearKey()" type="submit">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Clear </span>
					</button>
					<button class="button is-green export" data-cy="exportPrivateKey" type="submit" @click="exportKey(store.accounts[0])">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Export Private Key Keystore for </span>
						<br />
						<span class="account"> {{ store.accounts[0] }} </span>
					</button>
					<button v-if="store.seedExported" data-cy="deleteAccount" class="button is-danger export" type="submit" @click="deleteAccount()">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Delete account </span>
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

@Component({

})
export default class ExportWallet extends mixins(Global, Authenticated) {
	password = '';
	seedPhrase = '';
	collapsed = true;

	async exportKey(account) {
		const password = await sha256(this.password);
		await this.exportKeystore({ account, password });
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

	async clearKey(){
		await this.clearPrivateKey();
	}

	async clearPhrase(){
		await this.clearSeedPhrase();
	}

	async deleteAccount(){
		const password = await sha256(this.password);
		await this.deleteWalletAccount({ password });
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.password{
		margin-bottom: 10px;
	}
	.export{
		height: 60px;
		margin: 20px 0;
	}
	.account{
		font-size: 14px;
	}
	.private-key-text{
		text-align: center;
		word-break: break-word;
		margin: 20px;
	}
	.private-key-header {
		border-style: solid;
		border-radius: 10px;
		border-color: #00c386;
		margin: 20px;
	}
	.header-text{
		text-align: center;
		word-break: break-word;
		margin-top: 20px;
		margin-left: 20px;
		margin-right: 20px;
		margin-bottom: 10px;
	}
	.warning {
		font-size: 18px;
	}
</style>
