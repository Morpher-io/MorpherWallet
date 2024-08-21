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
          <i class="fa fa-times"></i>
        </span>
      </div>

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <div class="footer is-text-small">
        <div>
          <span class="icon is-small">
            <i class="fas fa-lock"></i>
          </span>
          <span>{{ $t('common.SECURED_WALLET') }}</span>
        </div>
        <a href="https://www.morpher.com/privacy" target="_blank">{{
          $t('common.PRIVACY_POLICY')
        }}</a>
      </div>
    </section>
    <Footer v-if="!iFrameDisplay" :NFTBackground="NFTBackground" />
  </div>
</template>

<script lang="ts">
import isIframe from '@/utils/isIframe'
import Vue, { defineComponent } from 'vue'
import Spinner from '@/components/loading-spinner/Spinner.vue'
import NetworkError from '@/components/NetworkError.vue'
import Footer from '@/components/Footer.vue'
import { RouterLink, RouterView } from 'vue-router'

import { getRandomNFTBackground } from '@/utils/backgroundNFT'
import type { BackgroundNFT } from '@/utils/backgroundNFT'
import { mapState } from 'pinia'
import { useWalletStore } from '@/stores/wallet'

export default defineComponent({
  components: {
    Spinner,
    NetworkError,
    Footer,
    RouterView
  },
  computed: {
    ...mapState(useWalletStore, {
      loading: (state) => state.loading,
      isNetworkError: (state) => state.isNetworkError,
      spinnerStatusText: (state) => state.spinnerStatusText,
      unlocking: (state) => state.unlocking,
      connection: (state) => state.connection,
      signResponse: (state) => state.signResponse,
      isLoggedIn: (state) => state.isLoggedIn
    })
  },
  data() {
    return {
      iFrameDisplay: isIframe(),
      isDev: import.meta.env.NODE_ENV !== 'production',
      NFTBackground: null as BackgroundNFT | null
    }
  },
  mounted() {
    if (!this.iFrameDisplay) {
      this.NFTBackground = getRandomNFTBackground()

      window.document.body.style.backgroundImage =
        '/assets/img/nft_backgrounds/' + this.NFTBackground.image
    }
  },
  methods: {
    async closeWallet() {
      if (this.iFrameDisplay) {
        if (this.connection && this.connection !== null) {
          const connection: any = await this.connection.promise
          this.signResponse = 'cancel'
          connection.hideWallet()
          connection.onClose()

          if (this.isLoggedIn) {
            if (
              this.$router.currentRoute.value.path !== '/' &&
              this.$router.currentRoute.value.path !== '/recovery'
            )
              this.$router.push('/').catch(() => undefined)
          } else {
            if (this.$router.currentRoute.value.path !== '/login')
              this.$router.push('/login').catch(() => undefined)
          }
        }
      }
    }
  }
})
</script>
