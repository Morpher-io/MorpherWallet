<template>
	<div id="app">
		<section
			:class="{
				main_iframe: iFrameDisplay,
				main: !iFrameDisplay,
				'dev-border': isDev
			}"
		>
			<spinner v-bind:active="loading" v-bind:status="spinnerStatusText"></spinner>
			<NetworkError :active="isNetworkError && !loading" />
			<div class="header">
				<img src="@/assets/img/wallet_logo.svg" class="headerImage" />
				<span class="icon closeButton" v-if="iFrameDisplay" @click="closeWallet">
					<i class="fa fa-times" />
				</span>
			</div>
			<transition name="fade" mode="out-in">
				<router-view />
			</transition>
			<div class="footer is-text-small">
				<span class="icon is-small">
					<i class="fas fa-lock"></i>
				</span>
				<span>{{ $t('common.SECURED_WALLET') }}</span>
			</div>
		</section>
		<Footer v-if="!iFrameDisplay" />
	</div>
</template>

<script lang="ts">
import isIframe from './utils/isIframe';
import Vue from 'vue';
import { mapState } from 'vuex';
import Component from 'vue-class-component';
import Spinner from './components/loading-spinner/Spinner.vue';
import NetworkError from './components/NetworkError.vue';
import Footer from './components/Footer.vue';

@Component({
	components: {
		Spinner,
		NetworkError,
		Footer,
	},
	computed: {
		...mapState({
			loading: (state: any) => state.loading,
			isNetworkError: (state: any) => state.isNetworkError,
			spinnerStatusText: (state: any) => state.spinnerStatusText,
			unlocking: (state: any) => state.unlocking
		})
	}
})
export default class App extends Vue {
	iFrameDisplay = isIframe();
	connection = this.$store.state.connection;
	isDev = process.env.NODE_ENV !== 'production';

	async closeWallet() {
		if (this.iFrameDisplay) {
			if (this.connection && this.connection !== null) {
				const promise = this.connection.promise;
				this.$store.state.signResponse = 'cancel';
				(await promise).hideWallet();
				(await promise).onClose();

				if (this.$store.getters.isLoggedIn) {
					if (this.$router.currentRoute.path !== '/') this.$router.push('/');
				} else {
					if (this.$router.currentRoute.path !== '/login') this.$router.push('/login');
				}
			}
		}
	}
}
</script>

<style lang="scss">
@import '@/assets/stylesheet/wallet.scss';
</style>
