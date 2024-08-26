import { useWalletStore } from '@/stores/wallet'
import { mapState } from 'pinia'
import { defineComponent } from 'vue'
import vueRecaptcha from 'vue3-recaptcha2'

export default defineComponent({
  components: {
    'vue-recaptcha': vueRecaptcha
  },
  computed: {
    ...mapState(useWalletStore, {
      connection: (state) => state.connection,
      status: (state) => state.status,
      twoFaRequired: (state) => state.twoFaRequired
    })
  },
  data() {
    const racaptchaCallback: any = null

    return {
      recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA,
      recaptchaToken: '',
      recaptchaMessage: '',
      recaptchaLoaded: false,
      recaptchaExecuting: false,
      racaptchaCallback
    }
  },
  methods: {
    onCaptchaVerified(data: any) {
      localStorage.setItem('recaptcha_date', Date.now().toString())
      this.recaptchaToken = data
      this.racaptchaCallback()
    },
    onCaptchaError(data: any) {},
    onCaptchaExpired(data: any) {},
    onCaptchaLoaded() {
      this.recaptchaLoaded = true
    },
    executeRecaptcha(callback: any) {
      this.racaptchaCallback = callback
      if (this.recaptchaSiteKey == 'DISABLED') {
        this.recaptchaToken = 'disabled'
        this.racaptchaCallback()
        return
      }
      this.recaptchaExecuting = true
      if (this.recaptchaLoaded) {
        if (this.$refs.recaptcha) {
          const recapObj: any = this.$refs.recaptcha
          recapObj.execute()
        }
      } else {
        setTimeout(() => {
          this.executeRecaptcha(this.racaptchaCallback)
        }, 500)
      }
    }
  }
})
