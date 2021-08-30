<template>
	<div>
		<h2 class="title">Confirm Access</h2>
		<p class="subtitle">Please enter your password before making changes.</p>

		<div class="field">
			<label class="label">Password</label>

			<div class="control">
				<input type="password" class="input" name="walletPassword" v-model="walletPassword" />
			</div>
		</div>

		<button @click="setPassword()" class="button is-green big-button is-login transition-faster mt-5" :disabled="!walletPassword">
			<span>Continue</span>
		</button>
		<button v-on:click="pageBack()" class="button is-ghost is-blue big-button medium-text transition-faster">
			<span>Back</span>
		</button>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Emit } from 'vue-property-decorator';
import { Authenticated } from '../mixins/mixins';

@Component({})
export default class ConfirmAccess extends mixins(Authenticated) {
    walletPassword = '';

	@Emit('setPassword')
	setPassword() {
		return this.walletPassword;
	}

    @Emit('pageBack')
	pageBack() {
		return;
	}
}
</script>
