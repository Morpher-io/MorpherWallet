<template>
  <div class="control is-expanded" v-if="clientId">
    <LoginGoogle @processMethod="processMethod"></LoginGoogle>
  </div>
</template>

<script lang="ts">
import LoginGoogle from '@/components/LoginGoogleV2.vue'

import ChangePassword from './ChangePassword.vue'
import { Global } from '@/mixins/global'
import { sha256 } from '@/utils/cryptoFunctions'
import { getDictionaryValue } from '@/utils/dictionary'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    LoginGoogle,
    ChangePassword
  },
  mixins: [Global],
  data() {
    return {
      clientId: import.meta.env.VITE_GOOGLE_APP_ID,
      recoveryTypeId: 3,
      logonError: ''
    }
  },
  async mounted() {
    this.executeHiddenRecovery()
  },
  methods: {
    setPassword(data: any) {
      return data
    },
    onError(error: any) {
      let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
      console.log('onError', errorMessage)

      this.logSentryError('recoverWalletGoogle', errorMessage, { clientId: this.clientId })
      let errorText = error.error || error.err || 'Google login Error'

      if (String(errorText.toLowerCase()).includes('script not loaded correctly')) {
        errorText = 'google_script_blocked'
      }

      this.setPassword({
        success: false,
        error: errorText
      })
    },
    executeHiddenRecovery() {
      if (this.store.hiddenLogin && this.store.hiddenLogin.type == 'recovery') {
        let recoveryData = this.store.hiddenLogin.recovery
        if (recoveryData.type == 'google') {
          this.processMethod(recoveryData.data)
        }
      }
    },
    processMethod(data: any) {
      this.logonError = ''

      if (data.success) {
        this.onLogin(data)
      } else {
        if (data.error === 'popup_closed_by_user') {
          this.logonError = getDictionaryValue('GOOGLE_COOKIES_BLOCKED')
        } else if (data.error === 'google_script_blocked') {
          this.logonError = getDictionaryValue('GOOGLE_SCRIPT_BLOCKED')
        } else {
          this.logonError = data.method + ': ' + getDictionaryValue(data.error)
        }
      }
    },
    async onLogin(googleUser: any) {
      this.showSpinner(this.$t('loader.RECOVERY_LOG_IN'))
      try {
        const userID = googleUser.userID

        const accessToken = googleUser.token

        const key = googleUser.key

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
            console.log('onLogin error', errorMessage)

            this.logSentryError('recoverWalletGoogle', errorMessage, { userID })
            this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'))
            this.setPassword({
              success: false,
              error: this.$t('loader.NO_RECOVERY_FOUND')
            })
          })
      } catch (error: any) {
        let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
        console.log('onLogin error', errorMessage)

        this.logSentryError('recoverWalletGoogle', errorMessage, { googleUser })
        this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'))
        this.setPassword({
          success: false,
          error: this.$t('loader.NO_RECOVERY_FOUND')
        })
      }
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
.google-icon {
  color: #fc6404;
}
</style>
