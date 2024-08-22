<template>
  <div class="field">
    <button
      class="button is-grey big-button outlined-button is-thick transition-faster"
      v-if="clientId"
      @click="googleTokenLogin"
      data-cy="googleButton"
    >
      <span class="icon img">
        <img src="@/assets/img/google_logo.svg" alt="Google Logo" />
      </span>
      <span v-if="signIn">{{ $t('auth.SIGN_UP_GOOGLE') }} </span>
      <span v-else-if="unlock">{{ $t('auth.UNLOCK_GOOGLE') }} </span>
      <span v-else-if="update">{{ $t('auth.UPDATE_GOOGLE') }} </span>
      <span v-else-if="recovery">{{ $t('auth.GOOGLE') }} </span>
      <span v-else>{{ $t('auth.LOG_IN_GOOGLE') }} </span>
    </button>
  </div>
</template>

<script lang="ts">
import { sha256 } from '@/utils/cryptoFunctions'
import { Authenticated } from '@/mixins/authenticated'
import { Global } from '@/mixins/global'
import { jwtDecode } from 'jwt-decode'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  components: {},
  mixins: [Global, Authenticated],
  data() {
    return {
      hasRecoveryMethod: false,
      clientId: import.meta.env.VITE_GOOGLE_APP_ID,
      googleLibrarySrc: 'https://accounts.google.com/gsi/client',
      apiLoadIntitited: false,
      recoveryTypeId: 3
    }
  },
  async mounted() {
    await this.loadGApi()
    this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId)
  },
  methods: {
    processMethod(data: any) {
      return data
    },
    googleTokenLogin() {
      ;(window as any).google.accounts.oauth2
        .initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_APP_ID,
          scope: 'email profile',
          callback: (response: any) => {
            if (response.access_token) {
              this.onLogin(response)
            } else {
              this.onError(response)
            }
          }
        })
        .requestAccessToken()
    },
    async loadGApi() {
      return new Promise((resolve) => {
        // To resolve errors in nuxt3
        const isRunningInBrowser = typeof window !== 'undefined'

        if (!this.apiLoadIntitited && isRunningInBrowser) {
          const script = document.createElement('script')
          this.apiLoadIntitited = true
          script.addEventListener('load', () => {
            resolve((window as any).google)
          })
          script.src = this.googleLibrarySrc
          script.async = true
          script.defer = true
          document.head.appendChild(script)
        }
      })
    },
    onError(error: any) {
      let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
      this.logSentryError('addGoogleRecovery', errorMessage, {
        hasRecoveryMethod: this.hasRecoveryMethod,
        clientId: this.clientId,
        recoveryTypeId: this.recoveryTypeId
      })
      let errorText = error.error || error.err || 'Google login Error'

      if (String(errorText.toLowerCase()).includes('script not loaded correctly')) {
        errorText = 'google_script_blocked'
      }

      this.processMethod({
        success: false,
        error: errorText
      })
    },
    async onLogin(googleUser: any) {
      const request = new XMLHttpRequest()

      try {
        request.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo')
        request.setRequestHeader('Authorization', 'Bearer ' + googleUser.access_token)
        request.addEventListener('load', async () => {
          let googlePayload = JSON.parse(request.response)
          const userID = googlePayload.id
          const key = this.clientId + userID
          const keyEnc = await sha256(key)

          const token = googleUser.access_token
          this.processMethod({
            success: true,
            userID,
            key,
            token,
            recoveryTypeId: this.recoveryTypeId,
            email: googlePayload.email
          })
          return
        })
        request.addEventListener('error', () => console.error('XHR error'))

        request.send()
      } catch (error) {
        //Not sure what to do here - or if we want to do anything at all?!
        this.onError(error)
        console.error(`XHR error ${request.status}`)
      }
    }
  },
  props: {
    signIn: {
      default: false,
      type: Boolean as PropType<any>
    },
    unlock: {
      default: false,
      type: Boolean as PropType<any>
    },
    update: {
      default: false,
      type: Boolean as PropType<any>
    },
    recovery: {
      default: false,
      type: Boolean as PropType<any>
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.google-icon {
  color: #fc6404;
}
</style>
