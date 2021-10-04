<template>
	<div>
		<img src="@/assets/img/password.svg" alt="Recover wallet image" class="mb-3" />
		<h2 class="title">Confirm Access</h2>
		<p data-cy="confirmAccessTitle" class="subtitle">Please enter your password before making changes.</p>

		<div class="field">
			<label class="label">Password</label>

			<div class="control">
				<input
					data-cy="confirmAccessPassword"
					type="password"
					class="input"
					name="walletPassword"
					v-model="walletPassword"
					@keypress="handleKeyPress"
				/>
			</div>
		</div>

		<div class="error mt-3" v-if="logonError">
			<p>⚠️ <span data-cy="passwordError" v-html="logonError"></span></p>
		</div>

		<button
			data-cy="confirmAccessButton"
			@click="setPassword()"
			class="button is-green big-button is-login transition-faster mt-5"
			:disabled="!walletPassword"
		>
			<span>Continue</span>
		</button>
		<button v-on:click="pageBack()" class="button is-ghost is-blue big-button medium-text transition-faster">
			<span>Back</span>
		</button>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { Authenticated } from '../mixins/mixins';
import { sha256 } from '../utils/cryptoFunctions';

@Component({})
export default class ConfirmAccess extends mixins(Authenticated) {
	walletPassword = '';
	logonError = '';

	@Prop()
	error!: string;

	@Watch('error')
	handleErorrChange(newValue: string) {
		if (newValue) this.logonError = newValue;
	}

	@Emit('setPassword')
	async setPassword() {
		const newPassword = await sha256(this.walletPassword);

		if (this.store.hashedPassword !== newPassword) {
			this.logonError = 'The password you entered is not correct.';
			return null;
		}

		return newPassword;
	}

	@Emit('pageBack')
	pageBack() {
		return;
	}

	handleKeyPress(e: any) {
		const key = e.which || e.charCode || e.keyCode || 0;

		if (key === 13) {
			this.setPassword();
		}
	}
}
</script>
