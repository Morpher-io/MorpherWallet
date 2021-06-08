<template>
	<div id="app">
		<spinner v-bind:active="loading" v-bind:status="spinnerStatusText"></spinner>
		<section :class="iFrameDisplay ? 'main_iframe' : 'main'">
			<div class="header">
				<img src="@/assets/img/logo-nav.png" class="headerImage" />
				<img v-if="iFrameDisplay" class="closeButton" @click="closeWallet" src="@/assets/img/close.svg" />
			</div>
			<transition name="fade" mode="out-in">
				<router-view />
			</transition>
		</section>
	</div>
</template>

<script lang="ts">
import isIframe from './utils/isIframe';
import Vue from 'vue';
import { mapState } from 'vuex';
import Component from 'vue-class-component';
import Spinner from './components/loading-spinner/Spinner.vue';

@Component({
	components: {
		Spinner
	},
	computed: {
		...mapState(['loading', 'spinnerStatusText'])
	}
})
export default class App extends Vue {
	iFrameDisplay = isIframe();
	connection = this.$store.state.connection;

	async closeWallet() {
		if (this.iFrameDisplay) {
			if (this.connection && this.connection !== null) {
				const promise = this.connection.promise;
				this.$store.state.signResponse = 'cancel';
				(await promise).hideWallet();
				(await promise).onClose();

				this.$router.push('/');
			}
		}
	}
}
</script>

<style lang="scss">
@import './assets/stylesheet/wallet.scss';
</style>
