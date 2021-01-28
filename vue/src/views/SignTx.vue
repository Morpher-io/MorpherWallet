<template>
	<section class="section">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div class="container">
			<spinner v-model="showSpinner" v-bind:status="status"></spinner>
			<h2 class="title">Sign Transaction</h2>
			<h4 class="subtitle">Sign the transaction to continue</h4>

			<div class="field">
				<label class="label">Transaction Details</label>
				<div class="control">
					{{ store.transactionDetails }}
				</div>
			</div>

			<div class="field">
				<div class="layout split first">
					<button class="button is-green" @click="sign()">
						<span class="icon is-small">
							<i class="far fa-file"></i>
						</span>
						<span> Sign </span>
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
		this.$router.push('/');
	}
	cancel() {
		this.$router.push('/');
	}
}
</script>

<style scoped></style>
