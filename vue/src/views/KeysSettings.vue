<template>
	<div class="container">
		<div class="title-container has-text-left">
			<button @click="redirectUser" tag="button" class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
			</button>
			<h2 class="title ml-4">Export Wallet settings</h2>
		</div>

		<div class="divider just-space" />

		<ExportWallet />
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ExportWallet from '../components/ExportWallet.vue';

@Component({
	components: {
		ExportWallet
	}
})
export default class KeysSettings extends Vue {
	redirectUser() {
		this.$router.push('/settings');
	}
}
</script>

<style lang="scss" scoped>
.title-container {
	display: flex;
	align-items: center;

	.title {
		margin: 0;
	}
}
</style>