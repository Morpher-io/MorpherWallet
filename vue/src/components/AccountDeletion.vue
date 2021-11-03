<template>
	<div>
		<h2 class="title">{{ $t('delete.DELETE_ACCOUNT_TITLE') }}</h2>
		<p class="subtitle">{{ $t('delete.DELETE_ACCOUNT_DESCRIPTION') }}</p>

		<div class="settings-data user-details has-text-left">
			<div
				@click="changeMethod(0)"
				:class="{
					'details select-custom': true,
					active: currentMethod === 0
				}"
			>
				<div class="circle"><div class="inner"></div></div>
				<p class="has-text-weight-medium">{{ $t('delete.VERIFY_WITH_SEED') }}</p>
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
				<p data-cy="privateKeyOption" class="has-text-weight-medium">{{ $t('delete.VERIFY_WITH_PRIVATE_KEY') }}</p>
			</div>
		</div>
		<div class="field">
			<label class="label">{{ currentMethod === 0 ? $t('delete.SEED_PHRASE') : $t('delete.PRIVATE_KEY') }}</label>
			<div class="control">
				<input data-cy="privateKeyInput" type="password" name="input" class="input password-input" v-model="input" />
			</div>
		</div>
		<p class="reset-line-height is-size-7 reset-mt">
			<span v-if="currentMethod === 0">{{ $t('delete.SEED_TIP') }}</span>
			<span v-if="currentMethod === 1"
				>{{ $t('delete.DO_NOT_KNOW_KEYS') }}
				<router-link to="/settings/keys" class="login-router">{{ $t('delete.EXPORT_YOUR_WALLET') }}</router-link></span
			>
		</p>

		<div class="error mt-3" v-if="logonError">
			<p>⚠️ <span v-html="logonError"></span></p>
		</div>

		<button
			data-cy="confirmDeleteButton"
			@click="deleteAccount()"
			class="button is-green big-button is-login transition-faster mt-5"
			:disabled="!input"
		>
			<span class="text">{{ $t('delete.VERIFY_AND_DELETE') }}</span>
		</button>
		<button v-on:click="pageBack()" class="button is-ghost is-blue big-button medium-text transition-faster">
			<span class="text">{{ $t('common.CANCEL') }}</span>
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
