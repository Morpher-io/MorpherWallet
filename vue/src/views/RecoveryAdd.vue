<template>
	<div class="container">
		<h1 class="title">Add Recovery Options</h1>

		<AddRecoveryGoogle></AddRecoveryGoogle>

		<AddRecoveryFacebook :walletEmail="store.email"></AddRecoveryFacebook>

		<AddRecoveryVkontakte :walletEmail="store.email"></AddRecoveryVkontakte>

		<div class="field is-grouped">
			<router-link to="/" tag="button" class="button is-grey">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
				<span> Back </span>
			</router-link>
		</div>
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
