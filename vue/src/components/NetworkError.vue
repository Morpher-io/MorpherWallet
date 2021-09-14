<template>
	<transition name="fade">
		<div class="overlay" v-if="active">
			<div class="overlay-frame">
				<h3 class="is-size-5 has-text-weight-bold">Network Error</h3>
				<p class="status-text">
					A network error occured. Please check your connection and try again.
				</p>
				<button class="button is-light-green is-small-button has-text-weight-bold transition-faster mt-3" @click="() => hide()">
					Okay
				</button>
			</div>
		</div>
	</transition>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Global } from '../mixins/mixins';

@Component({})
export default class NetworkError extends mixins(Global) {
	@Prop({ default: false })
	active!: boolean;

	hide() {
		this.showNetworkError(false);
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.overlay {
	background: rgba(255, 255, 255, 0.7);
	width: 100%;
	height: 100%;
	position: absolute;
	overflow: none;
	top: 0;
	left: 0;
	text-align: center;
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}
.overlay .overlay-frame {
	background: #fff;
	padding: 20px;
	box-shadow: 0 0 15px 0 rgb(0 0 0 / 10%);
	border-radius: 10px;
	width: 60%;
	text-align: center;
}
.status-text {
	background: none;
	padding: 0;
	margin-top: 5px;
	font-size: inherit;
	font-weight: 300;
}
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
