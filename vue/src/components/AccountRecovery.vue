<template>
	<div class="card">
			<div class="collapse">
				<div class="is-flex is-align-items-center">
					<span class="header" @click="collapsed = !collapsed">
						Trusted Account Recovery
					</span>
					<span :class="{
						'icon collapseIcon header': true,
						'open': !collapsed
					}" @click="collapsed = !collapsed">
						<i class="fas fa-chevron-right"></i>
					</span>
				</div>
				<div :class="collapsed ? 'hidden' : 'visible'">
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

<script>
import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';

@Component({})
export default class AccountRecovery extends mixins(Global, Authenticated) {
    collapsed = true;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
