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
  TypeShowPhraseKeyVariables,
  TypeUpdateRecovery
} from '../types/global-types'

import isIframe from '@/utils/isIframe'
import { mapActions, mapState } from 'pinia'
import { useWalletStore } from '@/stores/wallet'

export const Authenticated = defineComponent({
  computed: {
    ...mapState(useWalletStore, {
      ipCountry: (state) => state.ipCountry,
      walletEmail: (state) => state.email,
      keystore: (state) => state.keystore,
      accounts: (state) => state.accounts
    })
  },
  watch: {},
  methods: {
    ...mapActions(useWalletStore, {
      changePasswordStore: 'changePassword',
      changeEmailStore: 'changeEmail',
      generateQRCodeStore: 'generateQRCode',
      change2FAMethodsStore: 'change2FAMethods',
      addRecoveryMethodStore: 'addRecoveryMethod',
      hasRecoveryStore: 'hasRecovery',
      setUsersEmailStore: 'setUsersEmail',
      updateRecoveryMethodsStore: 'updateRecoveryMethods',
      unlockedStore: 'setUnlocked',
      updateUserPayloadStore: 'updateUserPayload',
      fetchVKAuthTokenStore: 'fetchVKAuthToken'
    }),
    changePassword(params: TypeChangePassword): Promise<unknown> {
      return this.changePasswordStore(params)
    },
    changeEmail(params: TypeChangeEmail): Promise<unknown> {
      return this.changeEmailStore(params)
    },
    generateQRCode(): Promise<unknown> {
      return this.generateQRCodeStore()
    },
    change2FAMethods(params: Type2FAUpdateParams): Promise<unknown> {
      return this.change2FAMethodsStore(params)
    },
    addRecoveryMethod(params: TypeAddRecoveryParams): Promise<unknown> {
      return this.addRecoveryMethodStore(params)
    },
    hasRecovery(id: number): boolean {
      return this.hasRecoveryStore(id)
    },
    setUsersEmail(email: string): void {
      return this.setUsersEmailStore(email)
    },
    updateRecoveryMethods(params: TypeUpdateRecovery): Promise<unknown> {
      return this.updateRecoveryMethodsStore(params)
    },
    unlocked(): void {
      return this.unlockedStore(true)
    },
    updateUserPayload(params: TypeUpdateUserPayload): Promise<unknown> {
      return this.updateUserPayloadStore(params)
    },
    fetchVKAuthToken(params: any): Promise<unknown> {
      return this.fetchVKAuthTokenStore(params)
    }
  }
})
