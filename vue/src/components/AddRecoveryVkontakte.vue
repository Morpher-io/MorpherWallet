<template>
  <div class="field">
    <div class="control is-expanded">
      <button
        class="button is-grey big-button outlined-button is-thick facebook-button transition-faster"
        @click="doLogin"
        v-if="!hasRecoveryMethod"
        data-cy="vkontakteButton"
      >
        <span class="icon img">
          <img src="@/assets/img/vk_logo.svg" alt="VKontakte Logo" />
        </span>
        <span>VKontakte</span>
      </button>
    </div>

    <div class="control is-expanded has-text-centered" v-if="hasRecoveryMethod">
      <button class="button big-button is-thick transition-faster vk-button" @click="doDelete">
        <span class="icon img">
          <img src="@/assets/img/vk_logo_white.svg" alt="VKontakte Logo" />
        </span>
        <span class="text">{{ $t('recovery.REVOKE_ACCESS') }}</span>
      </button>
      <div class="recovery-active is-text-small">
        <span class="icon">
          <i class="fas fa-check-circle"></i>
        </span>
        {{
          $t('recovery.RECOVERY_ACTIVE', {
            currentMethod: 'VKontakte'
          })
        }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { sha256 } from './../utils/cryptoFunctions'
import { Authenticated } from '@/mixins/authenticated'
import { Global } from '@/mixins/global'
import { defineComponent } from 'vue'

export default defineComponent({
  mixins: [Global, Authenticated],
  data() {
    return {
      hasRecoveryMethod: false,
      clientId: import.meta.env.VITE_VK_APP_ID,
      recoveryTypeId: 5,
      watchTimer: null as any,
      callbackUrlForPopup:
        location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
    }
  },
  async mounted() {
    this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId)
  },
  async unmounted() {
    if (this.watchTimer) clearInterval(this.watchTimer)
  },
  methods: {
    processMethod(data: any) {
      return data
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
        width = options.width,
        height = options.height,
        left = parseInt((screenX + (outerWidth - width) / 2).toString(), 10),
        top = parseInt((screenY + (outerHeight - height) / 2.5).toString(), 10),
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
              //document.location.reload();
            }, 100)
            const urlParams = new URLSearchParams(win.location.search)
            const user_code = urlParams.get('code')
            const auth_token: any = await this.fetchVKAuthToken({ code: user_code })

            const userID = auth_token.user_id
            const accessToken = auth_token.access_token

            this.showSpinner(this.$t('loader.SAVING_KEYSTORE_RECOVERY'))

            const key = await sha256(this.clientId + userID)

            this.addRecoveryMethod({
              key,
              password: userID,
              recoveryTypeId: this.recoveryTypeId,
              token: accessToken,
              email: '',
              currentRecoveryTypeId: this.store.recoveryTypeId
            })
              .then(async () => {
                if ((window as any).gtag)
                  (window as any).gtag('event', 'add_recovery', {
                    method: 'vk'
                  })
                this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_SUCCESSFULLY'))
                this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId)
                this.processMethod({
                  success: true,
                  method: 'VKontakte',
                  enabled: true,
                  erorr: ''
                })
              })
              .catch((error) => {
                let errorMessage =
                  error.error || error.err || error.message || JSON.stringify(error)
                console.log('addRecoveryMethod', errorMessage)
                this.logSentryError('addRecoveryVK', errorMessage, {
                  key,
                  password: userID,
                  recoveryTypeId: this.recoveryTypeId
                })
                this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_ERROR'))
                this.processMethod({
                  success: false,
                  method: 'VKontakte',
                  enabled: true,
                  erorr: ''
                })
              })
          }
        } catch {
          return
        }
      }, 100)
    },
    async doDelete() {
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

            const auth_token: any = await this.fetchVKAuthToken({ code: user_code })

            const userID = auth_token.user_id
            const accessToken = auth_token.access_token

            this.showSpinner(this.$t('loader.DELETING_KEYSTORE_RECOVERY'))

            const key = await sha256(this.clientId + userID)
            this.resetRecoveryMethod({
              key,
              token: accessToken,
              recoveryTypeId: this.recoveryTypeId.toString()
            })
              .then(async () => {
                this.showSpinnerThenAutohide(this.$t('loader.DELETED_KEYSTORE_SUCCESSFULLY'))
                this.hasRecoveryMethod = false
                this.processMethod({
                  success: true,
                  method: 'VKontakte',
                  enabled: false,
                  erorr: ''
                })
              })
              .catch((error) => {
                let errorMessage =
                  error.error || error.err || error.message || JSON.stringify(error)
                console.log('resetRecoveryMethod', errorMessage)

                this.logSentryError('deleteRecoveryVK', errorMessage, {
                  key,
                  password: userID,
                  recoveryTypeId: this.recoveryTypeId
                })
                this.showSpinnerThenAutohide(this.$t('common.ERROR_FIND_USER'))
                this.processMethod({
                  success: false,
                  method: 'VKontakte',
                  enabled: false,
                  erorr: ''
                })
              })
          }
        } catch (e) {
          return
        }
      }, 100)
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.vk-button {
  background-color: #45668e;
}

.vk-text {
  color: #fff;
}

.vk-icon {
  color: #45668e;
}
</style>
