<template>
  <div class="field">
    <!-- <div id="appleid-signin" data-color="black" data-border="true" data-type="sign in"></div> -->
    <div class="control is-expanded">
      <button
        class="button is-grey big-button outlined-button is-thick facebook-button transition-faster"
        @click="doLogin"
        data-cy="vkontakteButton"
      >
        <span class="icon img">
          <img src="@/assets/img/apple_logo.svg" alt="Apple Logo" />
        </span>
        <span v-if="signIn">{{ $t('auth.SIGN_UP_APPLE') }} </span>
        <span v-else-if="unlock">{{ $t('auth.UNLOCK_APPLE') }} </span>
        <span v-else-if="update">{{ $t('auth.UPDATE_APPLE') }} </span>
        <span v-else-if="recover">{{ $t('auth.APPLE') }} </span>
        <span v-else>{{ $t('auth.LOG_IN_APPLE') }} </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Authenticated } from '@/mixins/authenticated'
import { Global } from '@/mixins/global'
import { v4 as uuid } from 'uuid'
import { jwtDecode } from 'jwt-decode'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

const rawNonce = uuid()
const state = uuid()

export default defineComponent({
  components: {},
  mixins: [Global, Authenticated],
  data() {
    return {
      hasRecoveryMethod: false,
      clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
      recoveryTypeId: 6
    }
  },
  async mounted() {
    try {
      await (window as any).AppleID.auth.init({
        clientId: this.clientId,
        scope: 'email',
        redirectURI: location.protocol + '//' + location.hostname,
        state: state,
        nonce: rawNonce,
        usePopup: true
      })

      this.hasRecoveryMethod = await this.hasRecovery(this.recoveryTypeId)
    } catch (err) {
      console.log('init error', err)
    }
  },
  methods: {
    processMethod(data: any) {
      return data
    },
    async doLogin() {
      try {
        ;(window as any).AppleID.auth
          .signIn()
          .then((userData: any) => {
            this.onLogin(userData)
          })
          .catch((err: any) => {
            this.onError(err)
          })
      } catch (err) {
        this.onError(err)
      }
    },
    onError(error: any) {
      if (
        error &&
        error.detail &&
        error.detail.error &&
        error.detail.error == 'popup_closed_by_user'
      ) {
        return
      }
      let errorMessage = error.error || error.err || error.message || JSON.stringify(error)
      if (error && error.detail && error.detail.error && error.detail.error) {
        errorMessage = error.detail.error
      }
      if (
        errorMessage == 'popup_closed_by_user' ||
        errorMessage == 'user_trigger_new_signin_flow'
      ) {
        return
      }

      this.logSentryError('addAppleRecovery', errorMessage, {
        hasRecoveryMethod: this.hasRecoveryMethod,
        clientId: this.clientId,
        recoveryTypeId: this.recoveryTypeId
      })
      let errorText = error.error || error.err || 'Apple login Error'

      if (String(errorText.toLowerCase()).includes('script not loaded correctly')) {
        errorText = 'apple_script_blocked'
      }

      this.processMethod({
        success: false,
        error: errorText
      })
    },
    async onLogin(appleUser: any) {
      if (appleUser.authorization) appleUser = appleUser.authorization

      const authorizationCode = appleUser.code || appleUser.authorizationCode
      const identityToken = appleUser.id_token || appleUser.identityToken
      const nonce = appleUser.nonce

      const decoded = jwtDecode(identityToken)

      const userID = decoded.sub
      const email = '' //decoded.email;
      console.log('decoded', decoded)
      const key = this.clientId + userID

      this.processMethod({
        success: true,
        userID,
        key,
        token: JSON.stringify({ identityToken, authorizationCode, nonce }),
        recoveryTypeId: this.recoveryTypeId,
        email: email
      })

      return
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
    recover: {
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
