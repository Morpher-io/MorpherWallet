<template>
	<div class="card">
		<div class="collapse">
			<span v-show="collapsed" class="icon collapseIcon header" @click="collapsed = !collapsed">
				<i class="fas fa-chevron-right"></i>
			</span>
			<span v-show="!collapsed" class="icon collapseIcon header" @click="collapsed = !collapsed">
				<i class="fas fa-chevron-down"></i>
			</span>

			<span class="header" @click="collapsed = !collapsed"> Export the Wallet Seed Phrase </span>

			<div :class="collapsed ? 'hidden' : 'visible'">
				<div class="message-body">
					<input class="password" type="password" name="password" placeholder="Enter Wallet password" v-model="password" />
					<br />
					<button v-for="account in accounts" :key="account" class="button is-green export" type="submit" @click="exportSeedPhrase(account)">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Export Keystore for </span>
						<br />
						<span class="account"> {{ account }} </span>
					</button>
					<button class="button is-green export" type="submit" @click="showKey()">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Show private key </span>
					</button>
					<p v-if="store.seedExported" class="help private-key-text warning">Before you delete your account, make sure you have exported your Keystore.</p>
					<button v-if="store.seedExported" class="button is-danger export" type="submit">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Delete account </span>
					</button>
					<div v-if="seedPhrase">
						<h3>Seed Phrase:</h3>
						<h4>{{ seedPhrase }}</h4>
					</div>
					<h4 v-if="store.privateKey !== ''" class="private-key-header private-key-text">Private Key</h4>
					<h4 v-if="store.privateKey !== ''" class="private-key-text">{{ store.privateKey }}</h4>
					<button v-if="store.privateKey !== ''" class="button is-danger export" @click="clearKey()" type="submit">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Clear </span>
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

	async exportSeedPhrase(account) {
		const password = await sha256(this.password);
		await this.exportSeed({ account, password });
		this.password = '';
	}

	async showKey() {
		const password = await sha256(this.password);
		await this.showPrivateKey({ password });
		this.password = '';
	}

	async clearKey(){
		await this.clearPrivateKey();
	}

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.password{
		margin-bottom: 10px;
	}
	.export{
		height: 60px;
		margin: 10px 0;
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
	.warning {
		font-size: 18px;
	}
</style>
