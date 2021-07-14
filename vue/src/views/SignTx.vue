<template>
	<section class="section-no-header">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div class="container">
			<spinner v-model="showSpinner" v-bind:status="status"></spinner>
			<h2 class="title">Confirm Transaction</h2>
			<h4 class="subtitle" v-if="store.transactionDetails">{{ chainName  }}</h4>
			<i class="fas fa-arrow-circle-right transfer-icon" ></i>
			<div class="field source-dest-output">
				
				<div class="layout split first eth-address-copy" :data-tooltip="copyTextSrc" @click="copySrcETHAddress(store.transactionDetails.from)">
					{{ formatEthAddress(store.transactionDetails.from) }}
				</div>
				<div class="layout split second eth-address-copy" :data-tooltip="copyTextDest" @click="copyDestETHAddress(store.transactionDetails.to)">
					 <div class=has-text-right>{{ formatEthAddress(store.transactionDetails.to) }}</div>
				</div>

			</div>

			<div class="field source-dest-output">
					<p>Balance: </p>
					<p class='eth_balance'>{{ roundFormatter(Number(store.ethBalance)/ Math.pow(10,18)) }} ETH</p>
			</div>

			<div class="field">
				<label class="label">Transaction Details</label>
			</div>

			<div class="field">
				<div class="layout split first transaction-breakdown">
					<p>Gas Fee: </p>
				</div>
				<div class="layout split second has-text-right transaction-breakdown">
					{{ roundFormatter(Number(store.transactionDetails.gasPrice) * Number(store.transactionDetails.gas) / Math.pow(10,18)) }} ETH<br>
				</div>
			</div>

			<div class="field">
				
				<div class="layout split first eth-address-copy">
					<p>Gas Price:</p>
					{{ roundFormatter(Number(store.transactionDetails.gasPrice) / Math.pow(10,9)) }} gwei
				</div>
				<div class="layout split second eth-address-copy">
					<p>Gas Limit:</p>
					{{ roundFormatter(Number(store.transactionDetails.gas)) }} gwei
				</div>

			</div>

			<div class="field" v-if="store.transactionDetails.value" >
				<div class="layout split first transaction-breakdown">
					<p>Eth Amount: </p>
				</div>
				<div class="layout split second has-text-right transaction-breakdown">
					{{ roundFormatter(store.transactionDetails.value / Math.pow(10,18)) }} ETH
				</div>
			</div>

			<div class="field" v-if="store.transactionDetails.value" >
				<div class="layout split first transaction-breakdown">
					<p>Total: </p>
				</div>
				<div class="layout split second has-text-right transaction-breakdown">
					{{ roundFormatter(Number(store.transactionDetails.value || 0)/ Math.pow(10,18) + (Number(store.transactionDetails.gasPrice) * Number(store.transactionDetails.gas)) / Math.pow(10,18)) }} ETH
				</div>
			</div>			

			<div class="field">
				<div class="layout split first">
					<button class="button is-green" @click="sign()">
						<span class="icon is-small">
							<i class="far fa-file"></i>
						</span>
						<span> Confirm </span>
					</button>
				</div>
				<div class="layout split second">
					<button class="button is-green" @click="cancel()">
						<span class="icon is-small">
							<i class="fas fa-unlock"></i>
						</span>
						<span> Cancel </span>
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global, Authenticated } from '../mixins/mixins';
import { copyToClipboard } from '../utils/utils'

@Component({})
export default class SignTx extends mixins(Global, Authenticated) {
	
	copyTextSrc = 'Copy to Clipboard';
	copyTextDest = 'Copy to Clipboard';
	copyToClipboard = copyToClipboard;

	sign() {
		this.store.signResponse = 'confirm';
		this.$router.push('/');
	}
	cancel() {
		this.store.signResponse = 'cancel';
		this.$router.push('/');
	}
	get chainName() {
		if (this.store.transactionDetails && Number(this.store.transactionDetails.chainId) === 21) {
			return 'Morpher Sidechain'	
		}

		if (this.store.transactionDetails && Number(this.store.transactionDetails.chainId) === 1) {
			return 'Etherum Mainchain'	
		}		

		if (this.store.transactionDetails && Number(this.store.transactionDetails.chainId) === 42) {
			return 'Kovan Testnet'	
		}		

		
		return 'Unknown'
	}
	copySrcETHAddress(text: string) {
		console.log(1)
		copyToClipboard(text, this);
		console.log(2)
		this.copyTextSrc = "Eth Address Copied"
		console.log(3)
		setTimeout(() => {
			console.log(4)
			this.copyTextSrc = 'Copy to clipboard';
		}, 5000)
	}
	copyDestETHAddress(text: string) {
		copyToClipboard(text, this);
		this.copyTextDest = "Eth Address Copied"
		setTimeout(() => {
			this.copyTextDest = 'Copy to clipboard';
		}, 5000)

	}

}
</script>

<style scoped>
.eth_balance {
	font-size: 21px;
}
.transaction-breakdown {
font-size: 20px;
}
.section-no-header {
    padding: 1rem 1.5rem;
}
.source-dest-output {
	border-bottom: 1px solid grey;
}
.transfer-icon {
	display: inline-block;
	font-size: 18px;
	position: absolute;
	left: 50%;
}
.eth-address-copy {
	cursor: pointer;
}
</style>
