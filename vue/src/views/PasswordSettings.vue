<template>
	<div class="container">
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
		this.$router.push('/settings').catch(() => undefined);
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
