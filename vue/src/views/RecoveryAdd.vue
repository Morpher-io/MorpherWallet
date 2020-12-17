<template>
	<div class="container">
		<spinner v-model="showSpinner" v-bind:status="status"></spinner>

		<h1 class="title">Add Recovery Options</h1>

		<GoogleAddRecovery></GoogleAddRecovery>

		<FBAddRecovery :walletEmail="store.email"></FBAddRecovery>

		<VKAddRecovery :walletEmail="store.email"></VKAddRecovery>

		<div class="field is-grouped">
			<div class="layout split first">
				<router-link to="/" tag="button" class="button is-grey">
					<span class="icon is-small">
						<i class="fas fa-chevron-left"></i>
					</span>
					<span> Back </span>
				</router-link>
			</div>

			<div class="layout split second"></div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { mapState } from 'vuex';
import FBAddRecovery from '../components/FBAddRecovery.vue';
import GoogleAddRecovery from '../components/GoogleAddRecovery.vue';
import VKAddRecovery from '../components/VKAddRecovery.vue';
import { Global, Authenticated } from '../mixins/mixins';

@Component({
	components: {
		FBAddRecovery,
		VKAddRecovery,
		GoogleAddRecovery
	},
	computed: {
		...mapState({
			twoFaRequired: (state: any) => state.twoFaRequired,
			walletEmail: (state: any) => state.email,
			status: (state: any) => state.status,
			accounts: (state: any) => state.accounts
		})
	}
})
export default class RecoveryAdd extends mixins(Global, Authenticated) {
	dropdownIsActive = false;
	showSpinner = false;
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
