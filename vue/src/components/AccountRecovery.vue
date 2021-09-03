<template>
	<div class="card">
		<div>
			<div class="field is-grouped">
				<router-link to="/addrecovery" tag="button" class="button is-green big-button is-login transition-faster">
					<span class="icon is-small">
						<i class="fas fa-life-ring"></i>
					</span>
					<span>Add Account Recovery</span>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export default class AccountRecovery extends Vue {}
</script>
