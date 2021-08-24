<template>
	<div class="card">
			<div 
				:class="{
					'collapse': true,
					'hide-border': activePage
				}"
			>
				<div v-if="!activePage" class="is-flex is-align-items-center">
					<span class="header" @click="changeActive">
						Trusted Account Recovery
					</span>
					<span :class="{
						'icon collapseIcon header': true
					}" @click="changeActive">
						<i class="fas fa-chevron-right"></i>
					</span>
				</div>
				<div :class="activePage === 'recovery' ? 'visible' : 'hidden'">
					<div class="field is-grouped">
						<router-link to="/addrecovery" tag="button" class="button is-green big-button is-login transition-faster">
							<span class="icon is-small">
                                <i class="fas fa-life-ring"></i>
                            </span>
                            <span> Add Account Recovery </span>
						</router-link>
					</div>
				</div>
			</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { Authenticated, Global } from '../mixins/mixins';

@Component({})
export default class AccountRecovery extends mixins(Global, Authenticated) {
    @Prop()
	activePage!: string;

	@Emit('changeActive')
	changeActive() {
		return;
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
