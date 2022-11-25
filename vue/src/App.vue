<template>
	<div id="app">
		<div v-if="!iFrameDisplay" class="image-blur"></div>
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
				<div>
					<span class="icon is-small">
						<i class="fas fa-lock"></i>
					</span>
					<span>{{ $t('common.SECURED_WALLET') }}</span>
				</div>
				<a href="https://www.morpher.com/privacy" target="_blank">{{ $t('common.PRIVACY_POLICY') }}</a>
			</div>
		</section>
		<Footer v-if="!iFrameDisplay" :NFTBackground="NFTBackground" />
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

import { BackgroundNFT, getRandomNFTBackground } from '../src/utils/backgroundNFT';

@Component({
	components: {
		Spinner,
		NetworkError,
		Footer
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

	NFTBackground: BackgroundNFT | null = null;

	async closeWallet() {
		if (this.iFrameDisplay) {
			if (this.connection && this.connection !== null) {
				const connection:any = await this.connection.promise;
				this.$store.state.signResponse = 'cancel';
				connection.hideWallet();
				connection.onClose();

				if (this.$store.getters.isLoggedIn) {
					if (this.$router.currentRoute.path !== '/') this.$router.push('/').catch(() => undefined);
				} else {
					if (this.$router.currentRoute.path !== '/login') this.$router.push('/login').catch(() => undefined);
				}
			}
		}
	}

	mounted() {
		if (!this.iFrameDisplay) {
			this.NFTBackground = getRandomNFTBackground();

			window.document.body.style.backgroundImage = 'url(' + require('./assets/img/nft_backgrounds/' + this.NFTBackground.image) + ')';
		}
	}
}
</script>

<style lang="scss">
@import '@/assets/stylesheet/wallet.scss';
</style>
