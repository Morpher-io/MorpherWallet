import { defineComponent } from 'vue'
import * as Sentry from '@sentry/vue'
import Spinner from '@/components/loading-spinner/Spinner.vue'
import type {
  TypeFetchUser,
  TypeUnlock2fa,
  TypeUnlockWithPassword,
  TypeChangePassword,
  TypeChangeEmail,
  Type2FAUpdateParams,
  TypeRecoveryParams,
  TypeAddRecoveryParams,
  TypeUpdateUserPayload,
  TypeResetRecovery,
  TypeExportPhraseKeyVariables,
  TypeShowPhraseKeyVariables
} from '../types/global-types'

import isIframe from '@/utils/isIframe'
import { mapActions, mapState } from 'pinia'
import { useWalletStore } from '@/stores/wallet'

export const Global = defineComponent({
  components: {
    Spinner
  },
  computed: {
    ...mapState(useWalletStore, {
      connection: (state) => state.connection,
      status: (state) => state.status,
      twoFaRequired: (state) => state.twoFaRequired,
      store: (state) => state
    })
  },
  data() {
    const router = this.$router

    return {
      router,
      isIframe: isIframe
    }
  },
  methods: {
    roundFormatter(param: any) {
      const price = parseFloat(param)
      const abs = Math.abs(price)
      let round = 0
      if (10000 > abs && abs >= 10) round = 2
      else if (10 > abs && abs >= 1) round = 3
      else if (1 > abs && abs >= 0.1) round = 4
      else if (0.1 > abs && abs >= 0.01) round = 5
      else if (0.01 > abs) round = 6
      return price ? price.toFixed(round) : 0
    },
    formatEthAddress(ethAddress: string) {
      if (!ethAddress) return ''
      if (ethAddress.length <= 11) return ethAddress
      return ethAddress
        ? ethAddress.substr(0, 5) + '...' + ethAddress.substr(ethAddress.length - 5)
        : ''
    },
    checkPassword(
      newValue: string,
      checkErrors: boolean,
      oldChecks: any,
      comparePassword: string,
      checkRepeatOnly = false
    ) {
      let updatedChecks = checkRepeatOnly
        ? oldChecks
        : {
            min: '',
            uppercase: '',
            lowercase: '',
            number: '',
            match: ''
          }

      if (checkErrors) {
        updatedChecks = {
          min: 'fail',
          uppercase: 'fail',
          lowercase: 'fail',
          number: 'fail',
          match: 'fail'
        }
      }

      if (newValue) {
        if (!checkRepeatOnly) {
          if (newValue.length >= 8) {
            updatedChecks.min = 'pass'
          } else if (checkErrors) updatedChecks.min = 'fail'

          if (/[A-Z]/.test(newValue)) {
            updatedChecks.uppercase = 'pass'
          } else if (checkErrors) updatedChecks.uppercase = 'fail'

          if (/[a-z]/.test(newValue)) {
            updatedChecks.lowercase = 'pass'
          } else if (checkErrors) updatedChecks.lowercase = 'fail'

          if (/[0-9]/.test(newValue)) {
            updatedChecks.number = 'pass'
          } else if (checkErrors) updatedChecks.number = 'fail'
        }

        if (comparePassword) {
          if (newValue === comparePassword) {
            updatedChecks.match = 'pass'
          } else updatedChecks.match = 'fail'
        } else {
          if (checkErrors) updatedChecks.match = 'fail'
          else updatedChecks.match = ''
        }
      }

      return updatedChecks
    },
    formatComponentName(vm: any) {
      return 'compoenet'
      // tslint:disable:no-unsafe-any
      // if (vm.$root === vm) {
      // 	return 'root instance';
      // }
      // const name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
      // return (
      // 	(name ? 'component <' + name + '>' : 'anonymous component') + (vm._isVue && vm.$options.__file ? ' at ' + vm.$options.__file : '')
      // );
    },
    filterError(error: string) {
      const filters = [
        'popup_closed_by_user',
        'Keystore not found',
        'EMAIL_2FA_WRONG',
        'Non-Error promise rejection captured with value: Timeout',
        'user_trigger_new_signin_flow'
      ]
      let allow = true

      filters.forEach((filter) => {
        if (
          error.toUpperCase().includes(filter.toUpperCase()) ||
          error.toUpperCase() == 'TRUE' ||
          error.toUpperCase() == 'FALSE'
        ) {
          allow = false
        }
      })

      return allow
    },
    async logSentryError(source: string, errorDescription: string, customContext: any) {
      const vueData: any = { source }
      // Get the component and props data
      vueData.componentName = this.formatComponentName(this)
      if (this.$options.propsData) {
        vueData.propsData = this.$options.propsData
      }

      if (customContext) {
        Sentry.setContext('custom', customContext)
      }

      Sentry.setContext('vue', vueData)

      if (this.filterError(errorDescription)) {
        // Capture the exception
        if (errorDescription && errorDescription.toLowerCase() !== 'error') {
          Sentry.captureException(errorDescription)
        }
      }
    },
    onPropertyChanged(value: any) {
      if (value === null) {
        this.$router.push('/login').catch(() => undefined)
      }
    },
    onPageChanged(value: any) {
      if (value) {
        if (value === 'wallet') this.$router.push('/').catch(() => undefined)
        if (value === 'settings') this.$router.push('/settings').catch(() => undefined)
        if (value === 'register') this.$router.push('/signup').catch(() => undefined)
        if (value === '2fa') this.$router.push('/settings/2FA').catch(() => undefined)
        if (value === 'recovery') this.$router.push('/settings/recovery').catch(() => undefined)
        if (value === 'email') this.$router.push('/settings/email').catch(() => undefined)
        if (value === 'password') this.$router.push('/settings/password').catch(() => undefined)

        this.clearPage()
      }
    },
    ...mapActions(useWalletStore, {
      showSpinnerStore: 'showSpinner',
      showSpinnerThenAutohideStore: 'showSpinnerThenAutohide',
      hideSpinnerStore: 'hideSpinner',
      showNetworkErrorStore: 'showNetworkError',
      fetchUserStore: 'fetchUser',
      unlockWithStoredPasswordStore: 'unlockWithStoredPassword',
      unlockUpdateStore: 'unlockUpdate',
      loadEncryptedSeedStore: 'loadEncryptedSeed',
      loadPasswordStore: 'loadPassword',
      unlock2FAStore: 'unlock2FA',
      createWalletStore: 'createWallet',
      unlockWithPasswordStore: 'unlockWithPassword',
      resetRecoveryMethodStore: 'resetRecoveryMethod',
      // exportSeedStore: 'exportSeed',
      exportKeystoreStore: 'exportKeystore',
      showPrivateKeyStore: 'showPrivateKey',
      showPrivateKeyBackgroundStore: 'showPrivateKeyBackground',
      showSeedPhraseStore: 'showSeedPhrase',
      showSeedPhraseBackgroundStore: 'showSeedPhraseBackground',
      exportSeedPhraseStore: 'exportSeedPhrase',
      deleteWalletAccountStore: 'deleteWalletAccount',
      clearPrivateKeyStore: 'clearPrivateKey',
      clearSeedPhraseStore: 'clearSeedPhrase',
      clearPageStore: 'clearPage',
      logoutWalletStore: 'logoutWallet',
      fetchWalletFromRecoveryStore: 'fetchWalletFromRecovery',
      recoveryVKAuthTokenStore: 'recoveryVKAuthToken'
    }),

    showSpinner(message: string): void {
      return this.showSpinnerStore(message)
    },
    showSpinnerThenAutohide(message: string): void {
      return this.showSpinnerThenAutohideStore(message)
    },
    hideSpinner(): void {
      return this.hideSpinnerStore()
    },
    showNetworkError(isNetworkError: boolean): void {
      return this.showNetworkErrorStore(isNetworkError)
    },
    fetchUser(params: TypeFetchUser): Promise<unknown> {
      return this.fetchUserStore(params)
    },
    unlockWithStoredPassword(recaptchaToken: string): Promise<unknown> {
      return this.unlockWithStoredPasswordStore(recaptchaToken)
    },
    unlockUpdate(): void {
      return this.unlockUpdateStore()
    },
    loadEncryptedSeed(): Promise<unknown> {
      return this.loadEncryptedSeedStore()
    },
    loadPassword(): Promise<unknown> {
      return this.loadPasswordStore()
    },
    unlock2FA(params: TypeUnlock2fa): Promise<unknown> {
      return this.unlock2FAStore(params)
    },
    createWallet(params: TypeFetchUser): Promise<unknown> {
      return this.createWalletStore(params)
    },
    unlockWithPassword(params: TypeUnlockWithPassword): Promise<unknown> {
      return this.unlockWithPasswordStore(params)
    },
    resetRecoveryMethod(params: TypeResetRecovery): Promise<unknown> {
      return this.resetRecoveryMethodStore(params)
    },
    exportSeed(params: TypeExportPhraseKeyVariables): void {
      console.log('exportSeed does not exist!')
      //return this.exportSeedStore(params);
    },
    exportKeystore(params: TypeExportPhraseKeyVariables): Promise<unknown> {
      return this.exportKeystoreStore(params)
    },
    showPrivateKey(params: TypeShowPhraseKeyVariables): void {
      return this.showPrivateKeyStore(params)
    },
    showPrivateKeyBackground(params: TypeShowPhraseKeyVariables): string | null {
      return this.showPrivateKeyBackgroundStore(params)
    },
    showSeedPhrase(params: TypeShowPhraseKeyVariables): void {
      return this.showSeedPhraseStore(params)
    },
    showSeedPhraseBackground(params: TypeShowPhraseKeyVariables): Promise<unknown> {
      return this.showSeedPhraseBackgroundStore(params)
    },
    exportSeedPhrase(params: TypeExportPhraseKeyVariables): void {
      return this.exportSeedPhraseStore(params)
    },
    deleteWalletAccount(params: TypeShowPhraseKeyVariables): Promise<unknown> {
      return this.deleteWalletAccountStore(params)
    },
    clearPrivateKey(): void {
      return this.clearPrivateKeyStore()
    },
    clearSeedPhrase(): void {
      return this.clearSeedPhraseStore()
    },
    clearPage(): void {
      return this.clearPageStore()
    },
    logoutWallet(): Promise<void> {
      return this.logoutWalletStore()
    },
    fetchWalletFromRecovery(params: TypeRecoveryParams): Promise<unknown> {
      return this.fetchWalletFromRecoveryStore(params)
    },
    recoveryVKAuthToken(params: any): Promise<unknown> {
      return this.recoveryVKAuthTokenStore(params)
    }
  },
  watch: {
    'store.keystore': [
      {
        handler: 'onPropertyChanged'
      }
    ],
    'store.openPage': [
      {
        handler: 'onPageChanged'
      }
    ]
  }
})
