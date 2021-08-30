<template>
	<div class="container">
		<div class="title-container has-text-left">
			<button @click="redirectUser" tag="button" class="button is-grey big-button outlined-button is-thick transition-faster is-icon-only">
				<span class="icon is-small">
					<i class="fas fa-chevron-left"></i>
				</span>
			</button>
			<h2 class="title ml-4">Password settings</h2>
		</div>

		<div class="divider just-space" />

		<ChangePassword />
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ChangePassword from '../components/ChangePassword.vue';

@Component({
	components: {
		ChangePassword
	}
})
export default class PasswordSettings extends Vue {
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
