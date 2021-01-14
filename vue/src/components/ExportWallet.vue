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
					<button class="button is-green export" type="submit">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Show private key </span>
					</button>
					<button v-if="store.seedExported" class="button is-danger export" type="submit">
							<span class="icon is-small">
								<i class="fas fa-key"></i>
							</span>
						<span> Delete account </span>
					</button>
					<p v-if="store.seedExported" class="help">Before you delete your account, make sure you have exported your Keystore.</p>
					<div v-if="seedPhrase">
						<h3>Seed Phrase:</h3>
						<h4>{{ seedPhrase }}</h4>
					</div>
					<div v-if="privateKey">
						<h3>Private Key:</h3>
						<h4>{{ privateKey }}</h4>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { sha256 } from '../utils/cryptoFunctions';
import { getKeystoreFromEncryptedSeed } from '../utils/backupRestore';
import { getAccountsFromKeystore } from '../utils/utils';
import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '@/mixins/mixins';

@Component({})
export default class ExportWallet extends mixins(Global, Authenticated) {
	password = '';
	seedPhrase = '';
	privateKey = '';
	collapsed = true;

	async exportSeedPhrase(account) {
		const password = await sha256(this.password);
		await this.exportSeed({ account, password });
	}

	async exportPrivateKey() {
		const storedPassword = window.sessionStorage.getItem('password');
		const password = await sha256(this.password);
		if (storedPassword === password) {
			const encryptedSeed = JSON.parse(localStorage.getItem('encryptedSeed'));

			const keystore = await getKeystoreFromEncryptedSeed(encryptedSeed, password);
			const address = getAccountsFromKeystore(keystore)[0];

			keystore.keyFromPassword(password, function(err, pwDerivedKey) {
				if (err) throw err;
				this.privateKey = keystore.exportPrivateKey(address, pwDerivedKey);
			});
		} else alert('Password is not right!');
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
</style>
