<template>
  <div class="field">
    <div class="control is-expanded" v-if="!hasRecoveryMethod">
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
    <div class="control is-expanded has-text-centered" v-if="hasRecoveryMethod">
      <HFaceBookLogin
        v-slot="fbLogin"
        :app-id="clientId"
        :version="'v18.0'"
        @onSuccess="deleteRecovery"
      >
        <button
          @click="fbLogin.initFBLogin"
          class="button is-grey big-button outlined-button is-thick transition-faster facebook-button"
        >
          <span class="is-flex is-align-items-center" slot="login">
            <span class="icon img">
              <img src="@/assets/img/fb_logo.svg" alt="Facebook Logo" />
            </span>
            <span>{{ $t('recovery.REVOKE_ACCESS') }}</span>
          </span>
        </button>
      </HFaceBookLogin>

      <div class="recovery-active is-text-small">
        <span class="icon">
          <i class="fas fa-check-circle"></i>
        </span>
        {{
          $t('recovery.RECOVERY_ACTIVE', {
            currentMethod: 'Facebook'
          })
        }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { HFaceBookLogin } from '@healerlab/vue3-facebook-login'

import { sha256 } from './../utils/cryptoFunctions'
import { Authenticated } from '@/mixins/authenticated'
import { Global } from '@/mixins/global'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    HFaceBookLogin
  },
  mixins: [Global, Authenticated],
  data() {
    return {
      clientId: import.meta.env.VITE_FACEBOOK_APP_ID,
      recoveryTypeId: 2,
      hasRecoveryMethod: false,
      processing: false
    }
  },
  async mounted() {
    this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId)
  },
  methods: {
    processMethod(data: any) {
      return data
    },
    async onLogin(data: any) {
      this.processing = true

      if (data == undefined) {
        // this.showSpinnerThenAutohide('Aborted Facebook Recovery');
        this.processMethod({
          success: false,
          method: 'Facebook',
          enabled: true,
          erorr: ''
        })
        return
      }

      this.showSpinner(this.$t('loader.SAVING_KEYSTORE_RECOVERY'))
      const userID = data.authResponse.userID
      const key = await sha256(this.clientId + userID)

      const accessToken = data.authResponse.accessToken

      this.addRecoveryMethod({
        key,
        password: userID,
        recoveryTypeId: this.recoveryTypeId,
        token: accessToken,
        email: data.authResponse.email,
        currentRecoveryTypeId: this.store.recoveryTypeId
      })
        .then(async () => {
          if ((window as any).gtag)
            (window as any).gtag('event', 'add_recovery', {
              method: 'fb'
            })

          this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_SUCCESSFULLY'))
          this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId)
          this.processing = false
          this.processMethod({
            success: true,
            method: 'Facebook',
            enabled: true,
            erorr: ''
          })
        })
        .catch((error: any) => {
          let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
          console.log('addRecoveryMethod', errorMessage)
          this.logSentryError('addFacebookRecovery', errorMessage, {
            key,
            password: userID,
            recoveryTypeId: this.recoveryTypeId
          })
          this.showSpinnerThenAutohide(this.$t('loader.SAVED_KEYSTORE_ERROR'))
          this.processing = false
          this.processMethod({
            success: false,
            method: 'Facebook',
            enabled: true,
            erorr: ''
          })
        })
    },
    async deleteRecovery(data: any) {
      this.processing = true
      if (data == undefined) {
        // this.showSpinnerThenAutohide('Aborted Facebook Recovery');
        this.processMethod({
          success: false,
          method: 'Facebook',
          enabled: false,
          erorr: ''
        })
        return
      }

      this.showSpinner(this.$t('loader.DELETING_KEYSTORE_RECOVERY'))
      const userID = data.authResponse.userID
      const key = await sha256(this.clientId + userID)
      const accessToken = data.authResponse.accessToken

      this.resetRecoveryMethod({
        key,
        recoveryTypeId: this.recoveryTypeId.toString(),
        token: accessToken
      })
        .then(async () => {
          this.showSpinnerThenAutohide(this.$t('loader.DELETED_KEYSTORE_SUCCESSFULLY'))
          this.hasRecoveryMethod = false
          this.processing = false
          this.processMethod({
            success: true,
            method: 'Facebook',
            enabled: false,
            erorr: ''
          })
        })
        .catch((error) => {
          let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
          console.log('onError', errorMessage)

          this.logSentryError('deleteFacebookRecovery', errorMessage, {
            data,
            recoveryTypeId: this.recoveryTypeId
          })
          this.showSpinnerThenAutohide(this.$t('common.ERROR_FIND_USER'))
          this.processing = false
          this.processMethod({
            success: false,
            method: 'Facebook',
            enabled: false,
            erorr: ''
          })
        })
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.facebook-button {
  border-radius: 7px !important;
  align-items: center;
}
</style>
