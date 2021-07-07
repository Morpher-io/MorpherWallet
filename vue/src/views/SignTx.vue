<template>
	<section class="section">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div class="container">
			<spinner v-model="showSpinner" v-bind:status="status"></spinner>
			<h2 class="title">Confirm Transaction</h2>
			<h4 class="subtitle">Confirm the transaction to continue</h4>

			<div class="field">
				<label class="label">Transaction Details</label>
				<div class="control">
					Chain: {{ chainName }}<br>
					
				</div>
				<div class="control">
					Eth Address: <br>
					{{ formatEthAddress(store.transactionDetails.from) }}
				</div>
				<div class="control">
					Contract: <br>
					{{ formatEthAddress(store.transactionDetails.to) }}
				</div>
				<div class="control">
					Balance: <br>
					{{ roundFormatter(Number(store.balance)/ Math.pow(10,18)) }} ETH
				</div>	

				<div class="control">
					Gas Cost: <br>
					{{ roundFormatter(Number(store.transactionDetails.gasPrice) * Number(store.transactionDetails.gas) / Math.pow(10,18)) }} ETH<br>
					Gas Price: {{ roundFormatter(Number(store.transactionDetails.gasPrice) / Math.pow(10,9)) }} gwei - Gas Limit: {{ roundFormatter(Number(store.transactionDetails.gas)) }} 
				</div>			
		
				<div v-if="store.transactionDetails.value" class="control">
					Eth: <br>
					{{ roundFormatter(store.transactionDetails.value) }} ETH
				</div>	
				<div class="control">
					Total: <br>
					{{ roundFormatter(Number(store.transactionDetails.value || 0) + (Number(store.transactionDetails.gasPrice) * Number(store.transactionDetails.gas)) / Math.pow(10,18)) }} ETH
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
import { mixins } from 'vue-class-component';
import { Global, Authenticated } from '../mixins/mixins';

export default class SignTx extends mixins(Global, Authenticated) {
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

}
</script>

<style scoped></style>
