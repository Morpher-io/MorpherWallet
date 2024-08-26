<template>
  <div class="control is-expanded">
    <HFaceBookLogin v-slot="fbLogin" :app-id="clientId" :version="'v18.0'" @onSuccess="onLogin">
      <button
        @click="fbLogin.initFBLogin"
        class="button is-grey big-button outlined-button is-thick transition-faster facebook-button"
      >
        <span class="is-flex is-align-items-center" slot="login">
          <span class="icon img">
            <img src="@/assets/img/fb_logo.svg" alt="Facebook Logo" />
          </span>
          <span>Facebook</span>
        </span>
      </button>
    </HFaceBookLogin>
  </div>
</template>

<script lang="ts">
import { HFaceBookLogin } from '@healerlab/vue3-facebook-login'
import ChangePassword from './ChangePassword.vue'
import { Global } from '@/mixins/global'
import { sha256 } from '@/utils/cryptoFunctions'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    HFaceBookLogin,
    ChangePassword
  },
  mixins: [Global],
  data() {
    return {
      isLogined: false,

      clientId: import.meta.env.VITE_FACEBOOK_APP_ID,
      recoveryTypeId: 2,
      recoveryError: ''
    }
  },
  async mounted() {
    this.executeHiddenRecovery()
  },
  methods: {
    setPassword(data: any) {
      return data
    },
    executeHiddenRecovery() {
      if (this.store.hiddenLogin && this.store.hiddenLogin.type == 'recovery') {
        let recoveryData = this.store.hiddenLogin.recovery
        if (recoveryData.type == 'facebook') {
          this.onLogin(recoveryData.data)
        }
      }
    },
    async onLogin(data: any) {
      this.showSpinner(this.$t('loader.RECOVERY_LOG_IN'))
      try {
        const userID = data.authResponse.userID
        const accessToken = data.authResponse.accessToken

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
            console.log('onError', errorMessage)

            this.logSentryError('facebookRecovery', errorMessage, { userID })

            this.showSpinnerThenAutohide(this.$t('loader.NO_RECOVERY_FOUND'))
            this.recoveryError = error
            this.setPassword({
              success: false,
              oldPassword: null,
              error: error
            })
          })
      } catch (e: any) {
        let errorMessage = e.error || e.err || e.message || JSON.stringify(e)
        console.log('onError', errorMessage)

        this.logSentryError('facebookRecovery', errorMessage, data)
        this.showSpinnerThenAutohide(this.$t('loader.NO_ACCOUNT_FOUND'))
        this.recoveryError = this.$t('loader.NO_ACCOUNT_FOUND')
        this.setPassword({
          success: false,
          oldPassword: null,
          error: this.$t('loader.NO_ACCOUNT_FOUND')
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
.facebook-button {
  border-radius: 7px !important;
}
</style>
