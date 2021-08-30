<template>
	<div>
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div class="container">
			<spinner v-model="showSpinner" v-bind:status="status"></spinner>
			<h2 class="title">Sign Message</h2>
			<p class="subtitle">Your signature is being requested</p>

			<div class="field">
				<label class="label">You are signing:</label>
				<div class="card">
					{{ store.messageDetails }}
				</div>
			</div>

			<button class="button is-green big-button is-login transition-faster mt-5" @click="sign()">
				<span>Sign</span>
			</button>

			<div class="divider thick"></div>	

			<button @click="cancel()" class="button is-ghost is-blue big-button medium-text transition-faster">
				<span>Cancel</span>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component';
import { Global, Authenticated } from '../mixins/mixins';

export default class SignMsg extends mixins(Global, Authenticated) {
	sign() {
		this.store.signResponse = 'confirm';
		this.$router.push('/');
	}
	cancel() {
		this.store.signResponse = 'cancel';
		this.$router.push('/');
	}
}
</script>

<style lang="scss" scoped>
.card {
	padding: 20px;
    border-radius: 10px;
    background: #f9f9f9;
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
}
</style>
