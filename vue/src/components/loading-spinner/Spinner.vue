<template>
	<transition name="fade">
		<div class="overlay" v-if="isActive">
			<div class="overlay-frame">
				<dots></dots>
				<p class="status-text" data-cy="spinner-status">{{ status }}</p>
			</div>
		</div>
	</transition>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';

import Dots from './Dots.vue';

// Define the props by using Vue's canonical way.
@Component({
	components: {
		Dots
	}
})
export default class Spinner extends Vue {
	@Prop({ default: false })
	active!: boolean;

	@Prop({ default: '' })
	status!: string;

	isActive = this.active || false;

	@Watch('active')
	onPropertyChanged(value: boolean) {
		this.isActive = value;
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
