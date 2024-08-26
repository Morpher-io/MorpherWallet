<template>
  <div class="control is-expanded">
    <button
      type="button"
      class="button is-grey big-button outlined-button is-thick transition-faster"
      @click="doLogin"
    >
      <span class="icon img">
        <img src="@/assets/img/vk_logo.svg" alt="VKontakte Logo" />
      </span>
      <span class="text">VKontakte</span>
    </button>
  </div>
</template>
<script lang="ts">
import ChangePassword from './ChangePassword.vue'
import { Global } from '@/mixins/global'
import { sha256 } from '@/utils/cryptoFunctions'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    ChangePassword
  },
  mixins: [Global],
  data() {
    return {
      clientId: import.meta.env.VITE_VK_APP_ID,
      recoveryTypeId: 5,
      watchTimer: null as any,
      callbackUrlForPopup:
        location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
    }
  },
  async mounted() {
    this.executeHiddenRecovery()
  },
  unmounted() {
    if (this.watchTimer) clearInterval(this.watchTimer)
  },
  methods: {
    setPassword(data: any) {
      return data
    },
    executeHiddenRecovery() {
      if (this.store.hiddenLogin && this.store.hiddenLogin.type == 'recovery') {
        let recoveryData = this.store.hiddenLogin.recovery
        if (recoveryData.type == 'vk') {
          this.onLogin(recoveryData.data)
        }
      }
    },
    async onLogin(data: any) {
      console.log('onLogin', data)
      const user_code = data.user_code
      this.showSpinner(this.$t('loader.RECOVERY_LOG_IN'))
      try {
        const auth_token: any = await this.recoveryVKAuthToken({ code: user_code, type: 'app' })

        const userID = auth_token.user_id
        const accessToken = auth_token.access_token

        const key = this.clientId + userID

        const oldPassword = await sha256(userID)

        this.fetchWalletFromRecovery({
          key,
          accessToken,
          password: oldPassword,
          recoveryTypeId: this.recoveryTypeId
        })
          .then(() => {
            this.hideSpinner()
            this.setPassword({
              success: true,
              oldPassword: oldPassword
            })
          })
          .catch((error) => {
            let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
            console.log('fetchWalletFromRecovery error', errorMessage)

            this.logSentryError('recoverWalletVK', errorMessage, {
              accessToken,
              password: userID,
              recoveryTypeId: this.recoveryTypeId
            })
            this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'))
            this.setPassword({
              success: false,
              error: error
            })
          })
      } catch (error: any) {
        let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
        console.log('error', errorMessage)

        this.logSentryError('recoverWalletVK', errorMessage, {})
        this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'))
        this.setPassword({
          success: false,
          error: errorMessage
        })
      }
    },
    vkPopup(options: any) {
      const screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
        screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
        outerWidth =
          typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
        outerHeight =
          typeof window.outerHeight != 'undefined'
            ? window.outerHeight
            : document.body.clientHeight - 22,
        width = Number(options.width),
        height = options.height,
        left = parseInt(String(screenX + (outerWidth - width) / 2), 10),
        top = parseInt(String(screenY + (outerHeight - height) / 2.5), 10),
        features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top
      return window.open(options.url, 'vk_oauth', features)
    },
    async doLogin() {
      const redirectUri = this.callbackUrlForPopup
      const uriRegex = new RegExp(redirectUri)
      const url = `https://oauth.vk.com/authorize?client_id=${import.meta.env.VITE_VK_APP_ID}&display=popup&v=5.131&response_type=code&scope=email&redirect_uri=${redirectUri}`
      const win = this.vkPopup({
        width: 620,
        height: 370,
        url: url
      })

      if (this.watchTimer) clearInterval(this.watchTimer)
      this.watchTimer = setInterval(async () => {
        try {
          if (win && uriRegex.test(win.location.href)) {
            if (this.watchTimer) clearInterval(this.watchTimer)
            setTimeout(() => {
              win.close()
            }, 100)

            const urlParams = new URLSearchParams(win.location.search)
            const user_code = urlParams.get('code')

            this.showSpinner(this.$t('loader.RECOVERY_LOG_IN'))
            try {
              const auth_token: any = await this.recoveryVKAuthToken({
                code: user_code,
                type: 'wallet'
              })

              const userID = auth_token.user_id
              const accessToken = auth_token.access_token

              const key = this.clientId + userID

              const oldPassword = await sha256(userID)

              this.fetchWalletFromRecovery({
                key,
                accessToken,
                password: oldPassword,
                recoveryTypeId: this.recoveryTypeId
              })
                .then(() => {
                  this.hideSpinner()
                  this.setPassword({
                    success: true,
                    oldPassword: oldPassword
                  })
                })
                .catch((error) => {
                  let errorMessage =
                    error.error || error.err || error.message || JSON.stringify(error)
                  console.log('fetchWalletFromRecovery error', errorMessage)

                  this.logSentryError('recoverWalletVK', errorMessage, {
                    accessToken,
                    password: userID,
                    recoveryTypeId: this.recoveryTypeId
                  })
                  this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'))
                  this.setPassword({
                    success: false,
                    error: error
                  })
                })
            } catch (error: any) {
              let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
              console.log('error', errorMessage)

              this.logSentryError('recoverWalletVK', errorMessage, {})
              this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'))
              this.setPassword({
                success: false,
                error: errorMessage
              })
            }
          }
        } catch {
          return
        }
      }, 100)
    },
    onPropertyChanged(value: any) {
      this.executeHiddenRecovery()
    }
  },
  watch: {
    'store.hiddenLogin': [
      {
        handler: 'onPropertyChanged'
      }
    ]
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.vk-icon {
  color: #45668e;
}
</style>
