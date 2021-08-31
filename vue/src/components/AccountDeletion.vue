<template>
	<div class="card">
		<div>
			<div class="alert warning mb-5 is-size-7 has-text-left">
				⚠ If you want to delete your account, please export a your seed in Export Wallet settings first.
			</div>
			<div class="field is-grouped">
				<button @click="setNewPage" tag="button" class="button is-danger big-button is-login transition-faster" :disabled="!store.seedExported">
					<span class="icon is-small">
						<i class="fas fa-ban"></i>
					</span>
					<span>Delete Account</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Emit } from 'vue-property-decorator';
import { Authenticated, Global } from '../mixins/mixins';

@Component({})
export default class AccountDeletion extends mixins(Authenticated, Global) {
	@Emit('setNewPage')
	setNewPage() {
		return;
	}
}
</script>
