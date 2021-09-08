<template>
	<div>
		<h2 class="title">Delete Account</h2>
		<p class="subtitle">Verify your wallet keys before deleting your account.</p>

		<div class="settings-data user-details has-text-left">
			<div
				@click="changeMethod(0)"
				:class="{
					'details select-custom': true,
					active: currentMethod === 0
				}"
			>
				<div class="circle"><div class="inner"></div></div>
				<p class="has-text-weight-medium">Verify with Seed Phrase</p>
			</div>
		</div>
		<div class="settings-data user-details mt-2 has-text-left">
			<div
				@click="changeMethod(1)"
				:class="{
					'details select-custom': true,
					active: currentMethod === 1
				}"
			>
				<div class="circle"><div class="inner"></div></div>
				<p class="has-text-weight-medium">Verify with Private Key</p>
			</div>
		</div>
		<div class="field">
			<label class="label">{{ currentMethod === 0 ? 'Seed Phrase' : 'Private Key' }}</label>
			<div class="control">
				<input type="password" name="input" class="input password-input" v-model="input" />
			</div>
		</div>
		<p class="reset-line-height is-size-7 reset-mt">
			<span v-if="currentMethod === 0">Make sure to have one space between each word.</span>
			<span v-if="currentMethod === 1"
				>Don’t know your keys? <router-link to="/settings/keys" class="login-router">Export your wallet</router-link></span
			>
		</p>

		<div class="error mt-3" v-if="logonError">
			<p>⚠️ <span v-html="logonError"></span></p>
		</div>

		<button @click="deleteAccount()" class="button is-green big-button is-login transition-faster mt-5" :disabled="!input">
			<span>Verify & Delete</span>
		</button>
		<button v-on:click="pageBack()" class="button is-ghost is-blue big-button medium-text transition-faster">
			<span>Cancel</span>
		</button>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { Authenticated, Global } from '../mixins/mixins';

@Component({})
export default class AccountDeletion extends mixins(Authenticated, Global) {
	currentMethod = 0;
	input = '';
	logonError = '';

	@Prop()
	error!: string;

	@Watch('error')
	handleErorrChange(newValue: string) {
		if (newValue) this.logonError = newValue;
	}

	@Emit('pageBack')
	pageBack() {
		return;
	}

	@Emit('deleteAccount')
	deleteAccount() {
		this.logonError = '';
		return {
			input: this.input,
			method: this.currentMethod === 0 ? 'seed' : 'key'
		};
	}

	changeMethod(method: number) {
		this.currentMethod = method;
		this.input = '';
		this.logonError = '';
	}
}
</script>
