<template>
	<div>
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div class="container">
			<spinner v-model="showSpinner" v-bind:status="status"></spinner>
			<h2 class="title">Confirm Transaction</h2>
			<p class="subtitle" v-if="store.transactionDetails">{{ chainName }}</p>
			<div class="settings-data user-details">
				<div class="details is-flex is-align-items-center">
					<p
						class="layout split first eth-address-copy"
						:data-tooltip="copyTextSrc"
						@click="copySrcETHAddress(store.transactionDetails.from)"
					>
						{{ formatEthAddress(store.transactionDetails.from) }}
					</p>
					<i class="fas fa-arrow-right transfer-icon"></i>
					<p
						class="layout split second eth-address-copy"
						:data-tooltip="copyTextDest"
						@click="copyDestETHAddress(store.transactionDetails.to)"
					>
						{{ formatEthAddress(store.transactionDetails.to) }}
					</p>
				</div>
			</div>

			<div class="divider just-space"></div>

			<div class="card column">
				<p class="has-text-weight-medium">Send</p>
				<p v-if=isMPH class="eth_balance">{{ roundFormatter(mphValue) }} MPH</p>
				<p v-else class="eth_balance">{{ roundFormatter(store.transactionDetails.value / Math.pow(10, 18)) }} ETH </p>
			</div>

			<div class="payment-description">
				<div class="details-group">
					<p class="subtitle has-text-weight-medium">Gas Fee</p>
					<p class="text">
						{{ roundFormatter((Number(store.transactionDetails.gasPrice) * Number(store.transactionDetails.gas)) / Math.pow(10, 18)) }} ETH
					</p>
				</div>
				<div class="details-group small">
					<p class="subtitle">Gas Price</p>
					<p class="text">{{ roundFormatter(Number(store.transactionDetails.gasPrice) / Math.pow(10, 9)) }} gwei</p>
				</div>
				<div class="details-group small">
					<p class="subtitle">Gas Limit</p>
					<p class="text">{{ roundFormatter(Number(store.transactionDetails.gas)) }} gwei</p>
				</div>

				<div class="divider thick"></div>

				<div v-if="!isMPH" class="details-group mb-0">
					<p class="subtitle has-text-weight-medium">Total</p>
					<p class="text">
						{{
							roundFormatter(
								Number(store.transactionDetails.value || 0) / Math.pow(10, 18) +
									(Number(store.transactionDetails.gasPrice) * Number(store.transactionDetails.gas)) / Math.pow(10, 18)
							)
						}}
						ETH
					</p>
				</div>
				<div v-else class="details-group mb-0 is-align-items-start">
					<p class="subtitle has-text-weight-medium">Total</p>
					<p class="text">
						<span class="is-block has-text-right reset-line-height">{{ roundFormatter(Number(store.transactionDetails.value || 0) / Math.pow(10, 18)) }} MPH</span>
						<span class="is-block has-text-right reset-line-height mt-1"
							>+
							{{
								roundFormatter((Number(store.transactionDetails.gasPrice) * Number(store.transactionDetails.gas)) / Math.pow(10, 18))
							}}
							ETH</span
						>
					</p>
				</div>
			</div>

			<button class="button is-green big-button is-login transition-faster mt-5" @click="sign()">
				<span>Confirm</span>
			</button>

			<button @click="cancel()" class="button is-ghost is-blue big-button medium-text transition-faster">
				<span>Cancel</span>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Global, Authenticated } from '../mixins/mixins';
import { copyToClipboard } from '../utils/utils';

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
			return 'Morpher Sidechain';
		}

		if (this.store.transactionDetails && Number(this.store.transactionDetails.chainId) === 1) {
			return 'Etherum Mainchain';
		}

		if (this.store.transactionDetails && Number(this.store.transactionDetails.chainId) === 42) {
			return 'Kovan Testnet';
		}

		return 'Unknown';
	}
	get mphValue() {
		if (this.store.transactionDetails && this.store.transactionDetails.mph_value) {
			return Number(this.store.transactionDetails.mph_value) / Math.pow(10,18)
		} else {
			return 0;
		}
	}
	
	get isMPH() {
		return this.store.transactionDetails && this.store.transactionDetails.mph_value;
	}
	copySrcETHAddress(text: string) {
		copyToClipboard(text);
		this.copyTextSrc = 'Eth Address Copied';
		setTimeout(() => {
			this.copyTextSrc = 'Copy to clipboard';
		}, 5000);
	}
	copyDestETHAddress(text: string) {
		copyToClipboard(text);
		this.copyTextDest = 'Eth Address Copied';
		setTimeout(() => {
			this.copyTextDest = 'Copy to clipboard';
		}, 5000);
	}
}
</script>

<style lang="scss" scoped>
.eth_balance {
	font-size: 24px;
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
	font-size: 22px;
}
.eth-address-copy {
	cursor: pointer;
	font-size: 16px;
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
	padding: 15px;
	background: #f9f9f9;
	margin: 0 10px;
	position: relative;
	border-radius: 0 0 10px 10px;

	.details-group {
		display: flex;
		align-items: center;
		margin-bottom: 5px;

		.subtitle {
			margin: 0;
		}

		.text {
			margin-left: auto;
			font-size: 16px;
		}

		&.small {
			padding-left: 20px;
			position: relative;
			margin-bottom: 0;

			+ .small {
				margin-top: 3px;
			}

			&::before {
				content: '';
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
				left: 0;
				width: 15px;
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
