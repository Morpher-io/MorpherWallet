<template>
	<div class="container">
		<h2 class="title">Recover Your Wallet</h2>
		<p class="subtitle">Forgot your password? Login with your recovery account to unlock your wallet.
		</p>

		<div class="field is-grouped">
			<RecoverWalletGoogle></RecoverWalletGoogle>
		</div>
		<div class="field is-grouped">
			<RecoverWalletFacebook :walletEmail="store.email"></RecoverWalletFacebook>
		</div>
		<div class="field is-grouped">
			<RecoverWalletVkontakte :walletEmail="store.email"></RecoverWalletVkontakte>
		</div>

		<div class="field is-grouped">
			<router-link to="/login" tag="button" class="button">
				<span>Back</span>
			</router-link>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import RecoverWalletVkontakte from '../components/RecoverWalletVkontakte.vue';
import RecoverWalletGoogle from '../components/RecoverWalletGoogle.vue';
import RecoverWalletFacebook from '../components/RecoverWalletFacebook.vue';
import { Global } from '../mixins/mixins';

@Component({
	components: {
		RecoverWalletVkontakte,
		RecoverWalletFacebook,
		RecoverWalletGoogle
	}
})
export default class RecoveryAdd extends mixins(Global) {
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
