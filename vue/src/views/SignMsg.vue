<template>
	<section class="section">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<div class="container">
					<spinner v-model="showSpinner" v-bind:status="status"></spinner>
		<h2 class="title">Sign Message</h2>
		<h4 class="subtitle">Your signature is being requested</h4>
		
			<div class="field">
				<label class="label">You are signing:</label>
				<div class="control">
					{{ store.messageDetails }}
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
import Component, { mixins } from 'vue-class-component';
import { Global, Authenticated } from '../mixins/mixins';


export default class SignMsg extends mixins(Global, Authenticated) {



	sign() {
		this.$router.push('/');
	}
	cancel() {
		this.$router.push('/');
	}

}
</script>

<style scoped>

</style>
