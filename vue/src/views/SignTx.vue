<template>
	<div>
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div class="container">
			<spinner v-model="showSpinner" v-bind:status="status"></spinner>
			<h2 class="title">Confirm Transaction</h2>
			<p class="subtitle" v-if="store.transactionDetails">{{ chainName  }}</p>
			<div class="card">
				
				<div class="layout split first eth-address-copy" :data-tooltip="copyTextSrc" @click="copySrcETHAddress(store.transactionDetails.from)">
					{{ formatEthAddress(store.transactionDetails.from) }}
				</div>
				<i class="fas fa-arrow-right transfer-icon" ></i>
				<div class="layout split second eth-address-copy" :data-tooltip="copyTextDest" @click="copyDestETHAddress(store.transactionDetails.to)">
					 <div class=has-text-right>{{ formatEthAddress(store.transactionDetails.to) }}</div>
				</div>

			</div>

			<div class="divider thick"></div>

			<div class="card column">
					<p>Balance: </p>
					<p class='eth_balance'>{{ roundFormatter(Number(store.ethBalance)/ Math.pow(10,18)) }} ETH</p>
			</div>

			<div class="payment-description">
				<div class="details-group" v-if="true" >
					<p class="subtitle"><b>Gas Fee</b></p>
					<p class="text">{{ roundFormatter(Number(store.transactionDetails.gasPrice) * Number(store.transactionDetails.gas) / Math.pow(10,18)) }} ETH</p>
				</div>
				<div class="details-group small">
					<p class="subtitle">Gas Price</p>
					<p class="text">{{ roundFormatter(Number(store.transactionDetails.gasPrice) / Math.pow(10,9)) }} gwei</p>
				</div>
				<div class="details-group small">
					<p class="subtitle">Gas Limit</p>
					<p class="text">{{ roundFormatter(Number(store.transactionDetails.gas)) }} gwei</p>
				</div>

				<div class="divider thick"></div>
		
				<div class="details-group" v-if="store.transactionDetails.value" >
					<p class="subtitle"><b>ETH</b></p>
					<p class="text">{{ roundFormatter(store.transactionDetails.value / Math.pow(10,18)) }} ETH</p>
				</div>

				<div class="divider thick"></div>

				<div class="details-group" v-if="store.transactionDetails.value" >
					<p class="subtitle"><b>Total</b></p>
					<p class="text">{{ roundFormatter(Number(store.transactionDetails.value || 0)/ Math.pow(10,18) + (Number(store.transactionDetails.gasPrice) * Number(store.transactionDetails.gas)) / Math.pow(10,18)) }} ETH</p>
				</div>
			</div>

			<button class="button is-green big-button is-login transition-faster mt-5" @click="sign()">
				<span>Confirm</span>
			</button>

			<div class="divider thick"></div>	

			<button class="button" @click="cancel()">
				<span>Cancel</span>
			</button>
		</div>
	</div>
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
		copyToClipboard(text, this);
		this.copyTextSrc = "Eth Address Copied"
		setTimeout(() => {
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

<style lang="scss" scoped>
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

.card {
	display: flex;
    padding: 10px 20px;
    border-radius: 10px;
    align-items: center;
    justify-content: center;
	background-color: rgba(0, 195, 134, 0.1);
	border: 1px solid #00c386;
    box-shadow: 0 1px 2px 0 rgb(0 195 134 / 20%), 0 5px 12px 0 rgb(0 0 0 / 10%);
	position: relative;
	z-index: 1;

	&.column {
		flex-direction: column;
	}
}

.payment-description {
	padding: 20px;
    background: #f9f9f9;
    margin: 0 10px;
    position: relative;
    border-radius: 0 0 10px 10px;

	.details-group {
		display: flex;
		align-items: center;

		.subtitle {
			margin: 0;
		}

		.text {
			margin-left: auto;
			font-size: 16px;
		}

		&.small {
			padding-left: 15px;
			margin-top: 5px;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
				left: 0;
				width: 10px;
				height: 1px;
				background: #bababa;
			}

			.subtitle {
				font-size: 14px;
			}

			.text {
				font-size: 14px;
			}
		}
	}
}
</style>
