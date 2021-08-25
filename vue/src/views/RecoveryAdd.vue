<template>
	<div class="container">
		<h2 class="title">Add Trusted Account</h2>
		<p class="subtitle">Add trusted online account as the recovery method for your funds & wallet.
		</p>

		<AddRecoveryGoogle></AddRecoveryGoogle>

		<AddRecoveryFacebook :walletEmail="store.email"></AddRecoveryFacebook>

		<AddRecoveryVkontakte :walletEmail="store.email"></AddRecoveryVkontakte>

		<div class="field is-grouped">
			<router-link to="/" tag="button" class="button">
				<span>Cancel</span>
			</router-link>
		</div>

		<p class="mt-10 is-small-text">These services will not have direct access to your wallet. Your wallet keys are never shared and always encrypted.</p>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import AddRecoveryFacebook from '../components/AddRecoveryFacebook.vue';
import AddRecoveryGoogle from '../components/AddRecoveryGoogle.vue';
import AddRecoveryVkontakte from '../components/AddRecoveryVkontakte.vue';
import { Global, Authenticated } from '../mixins/mixins';

@Component({
	components: {
		AddRecoveryFacebook,
		AddRecoveryVkontakte,
		AddRecoveryGoogle
	}
})
export default class RecoveryAdd extends mixins(Global, Authenticated) {
	dropdownIsActive = false;
}
</script>

<style scoped>
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
