import { defineStore } from 'pinia'

import { cryptoDecrypt, sha256 } from '@/utils/cryptoFunctions'
import { hdKeyToAccount, privateKeyToAccount } from 'viem/accounts'
import {
  getEncryptedSeedFromMail,
  verifyAuthenticatorCode,
  verifyEmailCode,
  saveWalletEmailPassword,
  getPayload,
  getKeystoreFromEncryptedSeed,
  changePasswordEncryptedSeed,
  getBackendEndpoint,
  getNonce,
  recoverSeedSocialRecovery,
  verifyEmailConfirmationCode
} from '@/utils/backupRestore'
import { downloadEncryptedKeystore, getAccountsFromKeystore, sortObject } from '@/utils/utils'
import { getKeystore } from '@/utils/keystore'
import { getSessionStore, saveSessionStore, removeSessionStore } from '@/utils/sessionStore'
import * as Sentry from '@sentry/vue'
import { hashTypedData, parseSignature, toHex } from 'viem'

import type {
  Type2FARequired,
  TypeSeedFoundData,
  TypeSeedCreatedData,
  TypeFetchUser,
  TypeUnlock2fa,
  TypeUserFoundData,
  TypeUnlockWithPassword,
  MorpherWalletConfig,
  TypeChangePassword,
  TypeEncryptedSeed,
  TypeKeystoreUnlocked,
  TypeRequestParams,
  TypeChangeEmail,
  Type2FAUpdateParams,
  TypeRecoveryParams,
  TypeAddRecoveryParams,
  TypeResetRecovery,
  TypeUpdatePrivateKey,
  TypeUpdateSeedPhrase,
  TypeShowPhraseKeyVariables,
  TypeExportPhraseKeyVariables,
  TypeUpdateRecovery,
  TypeUpdateUserPayload,
  TypePayloadData
} from '../types/global-types'

import isIframe from '@/utils/isIframe'
import { connectToParent } from 'penpal'
import type { HDAccount } from 'viem'
import type { CallSender, Connection } from 'penpal/lib/types'
import router from '@/router'
import download from 'downloadjs'

import { i18n } from '../plugins/i18n'
import Cookie from 'js-cookie'

export interface WalletState {
  loading: boolean
  isNetworkError: boolean
  status: string
  spinnerStatusText: string
  message: string
  email: string
  loginEmail: string
  fetch_key: string

  iconSeed: number | null
  hashedPassword: string
  encryptedSeed: TypeEncryptedSeed
  encryptedWallet: string
  keystore: HDAccount | null
  accounts: Array<string>
  token: string
  recoveryTypeId: number
  twoFaRequired: Type2FARequired
  connection: Connection<CallSender> | null
  transactionDetails: any
  messageDetails: any
  openPage: string
  loginComplete: boolean
  recoveryMethods: Array<any>
  recoveryLoaded: boolean
  seedExported: boolean
  keystoreExported: boolean
  seedPhrase: string
  privateKey: string
  privateKeyKeystore: string
  signMessage: any
  signResponse: any
  ethBalance: string
  unlocking: boolean
  redirectPath: string
  loginRetryCount: number
  ipCountry: string
  app_lang: string
  unlocked: boolean
  hiddenLogin: any
}

export const useWalletStore = defineStore('wallet', {
  state: () => {
    const email = localStorage.getItem('email') || ''
    const iconSeed = parseInt(localStorage.getItem('iconSeed') || '') || null
    const recoveryTypeId = Number(localStorage.getItem('recoveryTypeId') || '1')
    const hashedPassword = ''

    Sentry.setUser({ id: '', email: email })

    const initialState: WalletState = {
      loading: false,
      isNetworkError: false,
      status: '',
      spinnerStatusText: '',
      message: '',
      email,
      loginEmail: '',
      iconSeed,
      hashedPassword,
      encryptedSeed: {},
      encryptedWallet: '',
      keystore: null,
      accounts: [],
      twoFaRequired: {
        email: false,
        authenticator: false,
        authenticatorConfirmed: false,
        needConfirmation: false
      },
      fetch_key: '',
      token: '',
      recoveryTypeId: recoveryTypeId,
      connection: null,
      transactionDetails: {},
      messageDetails: null,
      openPage: '',
      loginComplete: false,
      recoveryMethods: [],
      recoveryLoaded: false,
      seedExported: false,
      keystoreExported: false,
      seedPhrase: '',
      privateKey: '',
      privateKeyKeystore: '',
      signMessage: null,
      signResponse: null,
      ethBalance: '0',
      unlocking: true,
      redirectPath: '',
      loginRetryCount: 0,
      ipCountry: '',
      app_lang: '',
      unlocked: false,
      hiddenLogin: undefined
    }

    return initialState
  },

  actions: {
    hiddenLoginAction(loginData: any) {
      this.hiddenLogin = loginData
    },
    setConnection(conn: Connection<CallSender>) {
      this.connection = conn
    },
    authRequested() {
      this.status = 'loading'
    },
    setLoading(statusMessage: string) {
      if (statusMessage != '') {
        this.loading = true
        this.spinnerStatusText = statusMessage
      } else {
        this.spinnerStatusText = ''
        this.loading = false
      }
    },
    updateNetworkError(isNetworkError: boolean) {
      this.isNetworkError = isNetworkError
    },
    setRedirect(path: string) {
      this.redirectPath = path
    },
    delayedSpinnerMessage(statusMessage: string) {
      this.loading = true
      this.spinnerStatusText = statusMessage
      setTimeout(() => {
        this.loading = false
      }, 2000)
    },
    appLangUpdated(app_lang: string) {
      this.app_lang = app_lang
    },
    seedFound(seedFoundData: TypeSeedFoundData) {
      this.status = 'success'
      this.encryptedSeed = seedFoundData.encryptedSeed
      this.recoveryTypeId = seedFoundData.recoveryTypeId || this.recoveryTypeId
      sessionStorage.setItem('encryptedSeed', JSON.stringify(seedFoundData.encryptedSeed))
      localStorage.setItem('recoveryTypeId', String(this.recoveryTypeId))
      localStorage.setItem('login', 'true')
    },
    recoveryMethodsFound(recoveryMethodsData: Array<any>) {
      this.recoveryMethods = recoveryMethodsData
      this.recoveryLoaded = true
    },
    updateUnlocking(payload: boolean) {
      this.unlocking = payload
    },
    setUnlocked(unlock: boolean) {
      this.unlocked = unlock
      if (unlock) {
        setTimeout(() => {
          this.unlocked = false
        }, 600000)
      }
    },
    updatePayload(payload: TypePayloadData) {
      this.twoFaRequired.email = payload.email
      this.twoFaRequired.authenticator = payload.authenticator
      this.twoFaRequired.authenticatorConfirmed = payload.authenticatorConfirmed || false
      this.twoFaRequired.needConfirmation = payload.needConfirmation || false
      this.app_lang = payload.app_lang || ''
    },
    setIpCountry(ipCountry: string) {
      this.ipCountry = ipCountry || ''
    },
    async userFound(userData: TypeUserFoundData) {
      this.email = userData.email
      this.hashedPassword = userData.hashedPassword
      this.email = userData.email
      this.token = userData.token
      this.recoveryTypeId = userData.recoveryTypeId
      this.fetch_key = userData.fetch_key

      if (userData.loginEmail) {
        this.loginEmail = userData.loginEmail
      }

      Sentry.setUser({
        id: this.accounts && this.accounts.length > 0 ? this.accounts[0] : '',
        email: this.email
      })

      window.localStorage.setItem('email', userData.email)
      window.sessionStorage.setItem('fetch_key', await sha256(userData.fetch_key))
      saveSessionStore('password', userData.hashedPassword)
    },
    seedCreated(seedCreatedData: TypeSeedCreatedData) {
      this.status = 'created'
      this.email = seedCreatedData.email
      this.encryptedSeed = seedCreatedData.encryptedSeed
      this.hashedPassword = seedCreatedData.hashedPassword
      this.recoveryTypeId = seedCreatedData.recoveryTypeId || this.recoveryTypeId
      localStorage.setItem('email', seedCreatedData.email)
      sessionStorage.setItem('encryptedSeed', JSON.stringify(seedCreatedData.encryptedSeed))
      localStorage.setItem('recoveryTypeId', String(this.recoveryTypeId))
      localStorage.setItem('login', 'true')
      saveSessionStore('password', seedCreatedData.hashedPassword)
      Sentry.setUser({
        id: this.accounts && this.accounts.length > 0 ? this.accounts[0] : '',
        email: this.email
      })
    },
    setPage(page: string) {
      this.openPage = page
    },
    authError(message: string) {
      ;(this.status = 'error'), (this.message = message)
      this.email = ''
      this.hashedPassword = ''
      this.unlocked = false
      this.loginEmail = ''

      sessionStorage.removeItem('encryptedSeed')
      localStorage.removeItem('login')
      const email = localStorage.getItem('email')
      if (email) localStorage.setItem('lastEmail', email)

      localStorage.removeItem('recoveryTypeId')
      localStorage.removeItem('email')
      localStorage.removeItem('iconSeed')
      removeSessionStore('password')
      removeSessionStore('fetch_key')
      removeSessionStore('encryptedSeed')
      this.loginRetryCount = 0
      if (router.currentRoute.value.name !== 'Signup') {
        router.push('/login').catch(() => undefined)
      }
      Sentry.setUser({ id: '', email: '' })
    },
    logout() {
      this.email = ''
      this.hashedPassword = ''
      this.encryptedSeed = {}
      this.keystore = null
      this.loginEmail = ''

      this.status = ''
      this.token = ''
      this.unlocked = false
      const email = localStorage.getItem('email')
      if (email) localStorage.setItem('lastEmail', email)

      localStorage.removeItem('email')
      localStorage.removeItem('iconSeed')
      removeSessionStore('password')
      removeSessionStore('fetch_key')
      removeSessionStore('encryptedSeed')
      localStorage.removeItem('recoveryTypeId')
      sessionStorage.removeItem('encryptedSeed')
      localStorage.removeItem('login')
      Sentry.setUser({ id: '', email: '' })
    },
    clearUser() {
      this.email = ''
      this.hashedPassword = ''
      this.encryptedSeed = {}
      this.keystore = null

      this.unlocked = false
      this.status = ''
      this.token = ''
      Sentry.setUser({ id: '', email: '' })
    },
    keystoreUnlocked(payload: TypeKeystoreUnlocked) {
      this.keystore = payload.keystore
      this.accounts = payload.accounts
      this.hashedPassword = payload.hashedPassword

      if (payload.accounts && payload.accounts[0])
        Sentry.setUser({ id: payload.accounts[0], email: this.email })

      window.localStorage.setItem(
        'iconSeed',
        parseInt(payload.accounts[0].slice(2, 10), 16).toString()
      )
      saveSessionStore('password', payload.hashedPassword)

      const currentLocale = Cookie.get('locale')
      if (currentLocale) {
        this.updateUserPayload({ column: 'app_lang', value: currentLocale })
      }
    },
    setSeedExported() {
      this.seedExported = true
    },
    setKeystoreExported() {
      this.keystoreExported = true
    },
    updatePrivateKey(payload: TypeUpdatePrivateKey) {
      this.privateKey = payload.privateKey
    },
    updateSeedPhrase(payload: TypeUpdateSeedPhrase) {
      this.seedPhrase = payload.seedPhrase
    },
    updateEmail(payload: string) {
      this.email = payload
    },
    reset() {
      this.$reset()
    },
    showSpinner(message: string) {
      this.setLoading(message)
    },
    hideSpinner() {
      this.setLoading('')
    },
    showSpinnerThenAutohide(message: string) {
      this.delayedSpinnerMessage(message)
    },
    showNetworkError(isNetworkError: boolean) {
      this.updateNetworkError(isNetworkError)
    },
    async loadEncryptedSeed() {
      let encryptedSeed: TypeEncryptedSeed = {}
      const sessionEncryptedSeed = await getSessionStore('encryptedSeed')
      const recoveryTypeId = Number((await localStorage.getItem('recoveryTypeId')) || 1)
      if (sessionEncryptedSeed) {
        try {
          encryptedSeed = JSON.parse(String(sessionEncryptedSeed))
          if (encryptedSeed && encryptedSeed.ciphertext) {
            const seedFount = { encryptedSeed, recoveryTypeId } as TypeSeedFoundData
            await this.seedFound(seedFount)
          }
        } catch {
          encryptedSeed = {}
        }
      }
    },
    /**
     * Fetch the user data from the database and attempt to unlock the wallet using the mail encrypted seed
     */
    async fetchUser(params: TypeFetchUser) {
      this.updateUnlocking(true)
      const fetch_key: string = params.fetch_key
      const email: string = params.email
      const password: string = params.password
      const recaptchaToken: string = params.recaptchaToken
      const token: string = params.token
      const recoveryTypeId: number = params.recoveryTypeId

      this.logout()
      return new Promise((resolve, reject) => {
        this.authRequested()
        sha256(password)
          .then((hashedPassword) => {
            getPayload(fetch_key || email, recaptchaToken)
              .then((payload) => {
                this.loginRetryCount = 0
                this.setIpCountry(payload?.ip_country || '')
                this.userFound({
                  email: payload.user_email || email,
                  loginEmail: email,
                  hashedPassword,
                  token: params.token,
                  recoveryTypeId: params.recoveryTypeId,
                  fetch_key
                })

                this.updatePayload(payload as TypePayloadData)

                if (!payload.email && !payload.authenticator && !payload.needConfirmation) {
                  getEncryptedSeedFromMail(
                    fetch_key || email,
                    email,
                    '',
                    '',
                    recaptchaToken,
                    token,
                    recoveryTypeId
                  )
                    .then((encryptedSeed) => {
                      this.updateUnlocking(false)
                      this.seedFound({ encryptedSeed, recoveryTypeId } as TypeSeedFoundData)
                      resolve(true)
                    })
                    .catch((e) => {
                      this.updateUnlocking(false)
                      reject(e)
                    })
                } else {
                  this.updateUnlocking(false)
                  resolve(true)
                }
              })
              .catch((err) => {
                this.updateUnlocking(false)

                if (err.error !== 'RECAPTCHA_REQUIRED')
                  this.authError("The user wasn't found: Signup first!")
                reject(err)
              })
          })
          .catch(() => {
            this.updateUnlocking(false)
            reject(new Error('error'))
          })
      })
    },
    fetchWalletFromRecovery(params: TypeRecoveryParams) {
      this.updateUnlocking(true)
      return new Promise((resolve, reject) => {
        sha256(params.key).then((hashedKey) => {
          recoverSeedSocialRecovery(
            hashedKey,
            params.accessToken,
            this.email,
            params.recoveryTypeId
          )
            .then((encryptedSeed) => {
              this.seedFound({
                encryptedSeed: encryptedSeed as TypeEncryptedSeed,
                recoveryTypeId: params.recoveryTypeId
              } as TypeSeedFoundData)
              getKeystoreFromEncryptedSeed(this.encryptedSeed, params.password)
                .then((keystore: HDAccount) => {
                  this.loginRetryCount = 0
                  const accounts = getAccountsFromKeystore(keystore)
                  //not setting any password here, this is simply for the password change mechanism
                  this.keystoreUnlocked({ keystore, accounts, hashedPassword: '' })
                  this.updateUnlocking(false)
                  resolve(true)
                })
                .catch((err) => {
                  this.loginRetryCount += 1
                  if (this.loginRetryCount >= 3 && err.error !== 'RECAPTCHA_REQUIRED')
                    this.authError('Cannot unlock the Keystore, wrong ID')
                  this.updateUnlocking(false)
                  reject(false)
                })
            })
            .catch(() => {
              this.updateUnlocking(false)
              reject(false)
            })
        })
      })
    },
    addRecoveryMethod(params: TypeAddRecoveryParams) {
      return new Promise(async (resolve, reject) => {
        sha256(params.password).then(async (hashedPassword) => {
          const encryptedSeed = await changePasswordEncryptedSeed(
            this.encryptedSeed,
            this.hashedPassword,
            hashedPassword
          )
          this.sendSignedRequest({
            body: {
              encryptedSeed,
              recoveryTypeId: params.recoveryTypeId,
              key: params.key,
              email: params.email,
              access_token: params.token,
              currentRecoveryTypeId: params.currentRecoveryTypeId
            },
            method: 'POST',
            url: getBackendEndpoint() + '/v1/auth/addRecoveryMethod'
          })
            .then(() => {
              this.updateRecoveryMethods({
                dbUpdate: true,
                recoveryTypeId: this.recoveryTypeId.toString()
              }).then(async () => {
                try {
                  if (this.connection && this.connection !== null) {
                    const connection: any = await this.connection.promise

                    let type
                    if (params.recoveryTypeId == 2) {
                      type = 'fb'
                    }
                    if (params.recoveryTypeId == 3) {
                      type = 'google'
                    }

                    if (params.recoveryTypeId == 5) {
                      type = 'vk'
                    }

                    if (type) {
                      connection.onRecoveryUpdate(type, true)
                    }
                  }
                } catch {
                  console.error('Error calling onRecoveryUpdate callback')
                }
                resolve(true)
              })
            })
            .catch(reject)
        })
      })
    },
    fetchVKAuthToken(params: any) {
      return new Promise(async (resolve, reject) => {
        this.sendSignedRequest({
          body: {
            code: params.code
          },
          method: 'POST',
          url: getBackendEndpoint() + '/v1/auth/fetchVKAuthToken'
        })
          .then((response) => {
            resolve(response)
          })
          .catch(reject)
      })
    },
    recoveryVKAuthToken(params: any) {
      return new Promise(async (resolve, reject) => {
        const options: RequestInit = {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: params.code,
            type: params.type
          }),
          mode: 'cors',
          cache: 'default'
        }

        fetch(getBackendEndpoint() + '/v1/recoveryVKAuthToken', options)
          .then(async (response) => {
            if (!response.ok) {
              reject((await response.json()).error)
            }
            resolve(await response.json())
          })
          .catch(reject)
      })
    },

    hasRecovery(id: number) {
      return (
        this.recoveryMethods
          .map((obj) => {
            return obj.id
          })
          .indexOf(id) !== -1
      )
    },
    /**
     * Fetch the user data from the database and attempt to unlock the wallet using the mail encrypted seed
     */
    createWallet(params: TypeFetchUser) {
      return new Promise((resolve, reject) => {
        sha256(params.password).then((hashedPassword) => {
          getPayload(params.fetch_key || params.email, params.recaptchaToken)
            .then(() => {
              return reject('USER_ALREADY_EXISTS')
            })
            .catch(async (error) => {
              if (error.error && error.error === 'RECAPTCHA_REQUIRED') {
                return reject(error)
              }
              this.authRequested()
              this.setLoading('Creating new Keystore...')
              /**
               * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
               */
              const createdKeystoreObj = await getKeystore(hashedPassword, {}, 1)

              const accounts = getAccountsFromKeystore(createdKeystoreObj.keystore)

              saveWalletEmailPassword(
                params.email,
                createdKeystoreObj.encryptedSeed,
                accounts[0],
                params.recaptchaToken,
                params.recoveryTypeId,
                params.token,
                params.fetch_key
              )
                .then(() => {
                  this.clearUser()
                  this.fetchUser({
                    fetch_key: params.fetch_key,
                    email: params.email,
                    password: params.password,
                    recaptchaToken: params.recaptchaToken,
                    recoveryTypeId: params.recoveryTypeId,
                    token: params.token
                  })
                    .then(resolve)
                    .catch((e) => {
                      reject(e)
                      this.delayedSpinnerMessage('Unknown Error occurred during saving.')
                      reject(e)
                    })
                })
                .catch((e) => {
                  return reject(e)
                })
            })
        })
      })
    },
    async loginWallet(recaptchaToken: string) {
      if (!this.email && !this.hashedPassword) {
        const email = localStorage.getItem('email') || ''
        const iconSeed = parseInt(localStorage.getItem('iconSeed') || '') || 0
        const hashedPassword = await getSessionStore('password')

        let encryptedSeed: TypeEncryptedSeed = {}
        const sessionEncryptedSeed = await getSessionStore('encryptedSeed')
        const recoveryTypeId = Number((await localStorage.getItem('recoveryTypeId')) || 1)
        if (sessionEncryptedSeed) {
          try {
            encryptedSeed = JSON.parse(String(sessionEncryptedSeed))
          } catch {
            encryptedSeed = {}
          }
        }
        this.email = email
        this.iconSeed = iconSeed
        this.hashedPassword = hashedPassword
        this.encryptedSeed = encryptedSeed
        this.recoveryTypeId = recoveryTypeId

        Sentry.setUser({
          id: this.accounts && this.accounts.length > 0 ? this.accounts[0] : '',
          email: this.email
        })
      }

      this.unlockWithStoredPassword(recaptchaToken)
        .then((result) => {
          if (result) {
            router.push('/').catch(() => undefined)
          }
        })
        .catch((error) => {
          if (error !== true && error !== false) {
            // console.log('Error in unlock', error);
          }
        })
    },
    async logoutWallet() {
      await this.logout()
      if (router.currentRoute.value.path !== '/login') router.push('/login').catch(() => undefined)
    },
    clearPage() {
      this.setPage('')
    },
    /**
     * Unlock wallet using 2fa codes
     */
    unlock2FA(params: TypeUnlock2fa) {
      return new Promise(async (resolve, reject) => {
        let emailCorrect = false
        let authenticatorCorrect = false
        let userConfirmed = false

        if (this.twoFaRequired.email == true) {
          const result = await verifyEmailCode(this.email, params.email2FA)

          if (result.success) {
            this.loginRetryCount = 0
            emailCorrect = true
          } else {
            this.loginRetryCount += 1
            if (this.loginRetryCount >= 3) this.authError('2FA Email code not correct')
            reject(result.error)
            return
          }
        } else {
          emailCorrect = true
        }

        if (this.twoFaRequired.authenticator == true) {
          const result = await verifyAuthenticatorCode(this.email, params.authenticator2FA)

          if (result.success) {
            authenticatorCorrect = true
            this.loginRetryCount = 0
          } else {
            this.loginRetryCount += 1
            if (this.loginRetryCount >= 3) this.authError('2FA Authenticator code not correct')
            reject(result.error)
            return
          }
        } else {
          authenticatorCorrect = true
        }

        if (this.twoFaRequired.needConfirmation == true) {
          const result = await verifyEmailConfirmationCode(this.email, params.email2FA)
          if (result.success) {
            userConfirmed = true
            this.loginRetryCount = 0
          } else {
            this.loginRetryCount += 1
            if (this.loginRetryCount >= 3) this.authError('Confirmation Email code not correct')
            reject(result.error)
            return
          }
        } else {
          userConfirmed = true
        }

        if (emailCorrect && authenticatorCorrect && userConfirmed) {
          getEncryptedSeedFromMail(
            this.fetch_key || this.email,
            this.loginEmail || this.email,
            params.email2FA,
            params.authenticator2FA,
            params.recaptchaToken,
            this.token,
            this.recoveryTypeId
          )
            .then((encryptedSeed) => {
              //const encryptedSeed = this.encryptedSeed; //normally that would need decrypting using 2fa codes
              //this.updatePayload( { email: false, authenticator: false });
              this.seedFound({
                encryptedSeed,
                recoveryTypeId: this.recoveryTypeId
              } as TypeSeedFoundData)
              if (this.hashedPassword) {
                this.unlockWithStoredPassword(params.recaptchaToken)
                  .then(() => resolve('/'))
                  .catch((err) => {
                    const email = this.email
                    this.logout()
                    this.email = email
                    reject('invalid password')
                  })
              } else {
                //unlock page
                resolve('/unlock')
              }
            })
            .catch((err) => {
              if (err.toString() === 'seed not found') {
                this.authError('2FA Authentication code not correct')
                reject('2FA Authentication not correct')
              } else {
                reject(err)
              }
            })
        } else {
          reject()
        }
      })
    },
    /**
     * Unlock wallet using the password stored in local state
     */
    async unlockWithStoredPassword(recaptchaToken: string) {
      this.updateUnlocking(true)

      const fetch_key = window.sessionStorage.getItem('fetch_key') || ''

      if (!this.encryptedSeed || !this.encryptedSeed.ciphertext) {
        await this.loadEncryptedSeed()
      }

      if (!this.hashedPassword) {
        await this.loadPassword()
      }
      return new Promise((resolve, reject) => {
        if (this.hashedPassword && this.encryptedSeed.ciphertext !== undefined) {
          this.unlockWithPassword({ password: this.hashedPassword, recaptchaToken, fetch_key })
            .then(() => {
              this.updateUnlocking(false)
              resolve(true)
            })
            .catch((e) => {
              this.updateUnlocking(false)
              reject(e)
            })
        } else {
          this.updateUnlocking(false)
          reject(new Error())
        }
      })
    },
    unlockUpdate() {
      this.updateUnlocking(false)
    },
    /**
     * Unlock wallet using the password entered on the logon form
     */
    unlockWithPassword(params: TypeUnlockWithPassword) {
      this.updateUnlocking(true)
      return new Promise((resolve, reject) => {
        getKeystoreFromEncryptedSeed(this.encryptedSeed, params.password)
          .then((keystore: HDAccount) => {
            const accounts = getAccountsFromKeystore(keystore)
            this.loginRetryCount = 0

            this.keystoreUnlocked({ keystore, accounts, hashedPassword: params.password })
            getPayload(this.fetch_key || this.email, params.recaptchaToken, params.fetch_key)
              .then((payload) => {
                this.setIpCountry(payload.ip_country || '')
                this.updatePayload(payload)
                this.updateRecoveryMethods({
                  dbUpdate: true,
                  recoveryTypeId: this.recoveryTypeId.toString()
                }).then(() => {
                  resolve(true)
                })
              })
              .catch((e) => {
                reject(e)
              })
            this.updateUnlocking(false)
          })
          .catch((err) => {
            this.updateUnlocking(false)
            this.loginRetryCount += 1
            if (this.loginRetryCount >= 3) this.authError("The user wasn't found: Signup first!")
            reject(err)
          })
      })
    },
    updateRecoveryMethods(params: TypeUpdateRecovery) {
      return new Promise((resolve, reject) => {
        this.sendSignedRequest({
          body: { recovery_type: params.recoveryTypeId },
          method: 'POST',
          url: getBackendEndpoint() + '/v1/auth/getRecoveryMethods'
        })
          .then((methods) => {
            this.recoveryMethodsFound(methods as any[])
            resolve(true)
          })
          .catch(reject)
      })
    },
    updateUserPayload(params: TypeUpdateUserPayload) {
      return new Promise((resolve, reject) => {
        // only update the app language if it has changed
        if (params.column !== 'app_lang') {
          return resolve(true)
        }

        if (!this.app_lang || this.app_lang == '') {
          return resolve(true)
        }
        if (
          !this.email ||
          !this.accounts ||
          this.accounts.length < 1 ||
          !this.accounts[0] ||
          !params.value
        ) {
          return resolve(true)
        }
        if (params.value.toLowerCase() == this.app_lang.toLowerCase()) {
          return resolve(true)
        }

        this.appLangUpdated(params.value)

        setTimeout(() => {
          this.sendSignedRequest({
            body: { column: params.column, value: params.value },
            method: 'POST',
            url: getBackendEndpoint() + '/v1/auth/updateUserPayload'
          })
            .then(() => {
              return resolve(true)
            })
            .catch(reject)
        }, 2000)
      })
    },
    changePassword(params: TypeChangePassword) {
      return new Promise(async (resolve, reject) => {
        try {
          if (this.keystore !== undefined && this.keystore !== null) {
            const newEncryptedSeed = await changePasswordEncryptedSeed(
              this.encryptedSeed,
              params.oldPassword,
              params.newPassword
            )
            const key = await sha256(this.email.toLowerCase())
            const body = {
              oldKey: key,
              newKey: key,
              oldEmail: this.email,
              newEmail: this.email,
              encryptedSeed: newEncryptedSeed
            }
            await this.sendSignedRequest({
              body,
              method: 'POST',
              url: getBackendEndpoint() + '/v1/auth/updatePassword'
            })
            this.seedFound({
              encryptedSeed: newEncryptedSeed,
              recoveryTypeId: this.recoveryTypeId
            } as TypeSeedFoundData)
            this.userFound({
              email: this.email,
              hashedPassword: params.newPassword,
              recoveryTypeId: this.recoveryTypeId,
              fetch_key: this.fetch_key,
              token: this.token
            })
            resolve(true)
          }
        } catch (e) {
          //console.error(e);
          reject(e)
        }
      })
    },
    changeEmail(params: TypeChangeEmail) {
      return new Promise(async (resolve, reject) => {
        try {
          if (this.keystore !== undefined && this.keystore !== null) {
            if (
              params.password == this.hashedPassword ||
              this.recoveryTypeId == 3 ||
              this.recoveryTypeId == 6
            ) {
              //twoFA wasn't sent yet, send it with the first request to the new email address
              const body = {
                oldEmail: this.email,
                newEmail: params.newEmail,
                email2faVerification: params.twoFa || undefined
              }
              this.sendSignedRequest({
                body,
                method: 'POST',
                url: getBackendEndpoint() + '/v1/auth/updateEmail'
              })
                .then(resolve)
                .catch(reject)
            } else {
              reject('Password is not correct!')
            }
          }
        } catch (e) {
          //console.error(e);
          reject(e)
        }
      })
    },
    generateQRCode() {
      return new Promise((resolve, reject) => {
        this.sendSignedRequest({
          body: {},
          method: 'POST',
          url: getBackendEndpoint() + '/v1/auth/generateAuthenticatorQR'
        })
          .then(resolve)
          .catch(reject)
      })
    },
    change2FAMethods(params: Type2FAUpdateParams) {
      return new Promise((resolve, reject) => {
        this.sendSignedRequest({
          body: params,
          method: 'POST',
          url: getBackendEndpoint() + '/v1/auth/change2FAMethods'
        })
          .then(async (response: any) => {
            let codeSent = false

            if (response && response.data && response.data == '2FA_CODE_SENT') {
              codeSent = true
            }
            if (!codeSent) {
              try {
                if (this.connection && this.connection !== null) {
                  const connection: any = await this.connection.promise

                  connection.on2FAUpdate('email', params.email)
                  connection.on2FAUpdate('authenticator', params.authenticator)
                }
              } catch {
                console.error('Error calling on2FAUpdate callback')
              }

              this.updatePayload(params as TypePayloadData)
            }
            resolve(response)
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    sendSignedRequest(params: TypeRequestParams) {
      return new Promise(async (resolve, reject) => {
        try {
          const body = params.body
          let key = await getSessionStore('fetch_key')
          if (!key) {
            key = await sha256(this.fetch_key || this.email.toLowerCase())
          }
          body.nonce = (await getNonce(key)).nonce
          const signMessage = JSON.stringify(sortObject(body))
          if (this.keystore != null) {
            const signature = await this.keystore.signMessage({ message: signMessage })

            const parse: any = parseSignature(signature)
            if (parse.v) {
              parse.v = parse.v.toString()
            }

            const options: RequestInit = {
              method: params.method,
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Signature: JSON.stringify(parse),
                key: key,
                recoveryTypeId: String(this.recoveryTypeId || 1)
              },
              body: JSON.stringify(body),
              mode: 'cors',
              cache: 'default'
            }

            try {
              const response = await fetch(params.url, options)
              if (!response.ok) {
                reject((await response.json()).error)
              }
              resolve(await response.json())
            } catch (e) {
              reject(e)
            }
          } else {
            reject('Keystore not found, aborting')
          }
        } catch (e) {
          reject(e)
        }
      })
    },
    resetRecoveryMethod(params: TypeResetRecovery) {
      return new Promise((resolve, reject) => {
        this.sendSignedRequest({
          body: { key: params.key, recoveryTypeId: params.recoveryTypeId, token: params.token },
          method: 'POST',
          url: getBackendEndpoint() + '/v1/auth/resetRecovery'
        })
          .then(() => {
            this.updateRecoveryMethods({
              dbUpdate: true,
              recoveryTypeId: this.recoveryTypeId.toString()
            }).then(async () => {
              try {
                if (this.connection && this.connection !== null) {
                  const connection: any = await this.connection.promise

                  let type
                  if (params.recoveryTypeId == '2') {
                    type = 'fb'
                  }
                  if (params.recoveryTypeId == '3') {
                    type = 'google'
                  }

                  if (params.recoveryTypeId == '5') {
                    type = 'vk'
                  }

                  if (type) {
                    connection.onRecoveryUpdate(type, false)
                  }
                }
              } catch {
                console.error('Error calling onRecoveryUpdate callback')
              }
              resolve(true)
            })
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    showPrivateKey(params: TypeShowPhraseKeyVariables) {
      const storedPassword = this.hashedPassword

      if (this.keystore !== null) {
        const hdkey = this.keystore.getHdKey()

        let privateKey = ''
        if (hdkey.privateKey) {
          privateKey = toHex(hdkey.privateKey)
        }
        this.delayedSpinnerMessage(i18n.t('export.PRIVATE_KEY_SUCCESSFUL'))
        this.updatePrivateKey({ privateKey })
      }
    },
    showPrivateKeyBackground(params: TypeShowPhraseKeyVariables) {
      const storedPassword = this.hashedPassword

      if (this.keystore !== null) {
        const hdkey = this.keystore.getHdKey()

        let privateKey = ''
        if (hdkey.privateKey) {
          privateKey = toHex(hdkey.privateKey)
        }
        return privateKey
      }

      return null
    },
    async exportKeystore(params: TypeExportPhraseKeyVariables) {
      const storedPassword = await sha256(params.password)
      if (storedPassword == this.hashedPassword) {
        if (this.keystore !== null) {
          const hdkey = this.keystore.getHdKey()

          let privateKey = ''
          if (hdkey.privateKey) {
            privateKey = toHex(hdkey.privateKey)
          }

          const base64ToUInt8Array = (b64: string) =>
            Uint8Array.from(window.atob(b64), (c) => c.charCodeAt(0))

          const textToUInt8Array = (s: string) => new TextEncoder().encode(s)
          const UInt8ArrayToString = (u8: number[]) => String.fromCharCode.apply(null, u8)
          const convert = (Uint8Arr: Uint8Array) => {
            const return_data: number[] = []

            Uint8Arr.forEach((uint8) => {
              return_data.push(uint8)
            })

            return return_data
          }
          const UInt8ArrayToBase64 = (u8: Uint8Array) =>
            window.btoa(UInt8ArrayToString(convert(u8)))

          const key = await crypto.subtle.importKey(
            'raw',
            base64ToUInt8Array(params.password),
            {
              name: 'AES-CTR'
            },
            false,
            ['encrypt', 'decrypt']
          )

          const iv = window.crypto.getRandomValues(new Uint8Array(16))

          const ciphertext = new Uint8Array(
            await crypto.subtle.encrypt(
              {
                name: 'AES-CTR',
                counter: iv,
                length: 128
              },
              key,
              textToUInt8Array(privateKey)
            )
          )

          const data = {
            iv: UInt8ArrayToBase64(iv),
            ciphertext: UInt8ArrayToBase64(ciphertext)
          }

          console.log('export data', data)

          downloadEncryptedKeystore(data, params.account)
          this.delayedSpinnerMessage(i18n.t('export.KEYSTORE_SUCCESSFUL'))
          this.setKeystoreExported()
        }
      } else {
        this.delayedSpinnerMessage('Wrong password for Seed Phrase')
      }
    },
    showSeedPhrase(params: TypeShowPhraseKeyVariables) {
      const storedPassword = this.hashedPassword

      if (this.keystore !== null) {
        const seed = this.encryptedSeed
        if (seed.ciphertext !== undefined && seed.iv !== undefined && seed.salt !== undefined) {
          cryptoDecrypt(storedPassword, seed.ciphertext, seed.iv, seed.salt).then((mnemonic) => {
            this.delayedSpinnerMessage(i18n.t('export.SEED_PHRASE_SUCCESSFUL'))
            this.updateSeedPhrase({ seedPhrase: mnemonic })
          })
        } else {
          this.delayedSpinnerMessage('Wrong seed given')
        }
      }
    },
    async showSeedPhraseBackground(params: TypeShowPhraseKeyVariables) {
      const storedPassword = this.hashedPassword

      if (this.keystore !== null) {
        const seed = this.encryptedSeed
        if (seed.ciphertext !== undefined && seed.iv !== undefined && seed.salt !== undefined) {
          const mnemonic = cryptoDecrypt(storedPassword, seed.ciphertext, seed.iv, seed.salt)

          return mnemonic
        }
      }

      return null
    },
    exportSeedPhrase(params: TypeExportPhraseKeyVariables) {
      const storedPassword = this.hashedPassword

      if (storedPassword === params.password) {
        if (this.keystore !== null) {
          const seed = this.encryptedSeed
          if (seed.ciphertext !== undefined && seed.iv !== undefined && seed.salt !== undefined) {
            cryptoDecrypt(params.password, seed.ciphertext, seed.iv, seed.salt).then((mnemonic) => {
              const now = new Date()
              download(mnemonic, 'seed' + '--' + now.toISOString() + '--' + params.account)
              this.delayedSpinnerMessage('Seed Phrase exported successfully')
              this.setSeedExported()
            })
          } else {
            this.delayedSpinnerMessage('Wrong seed given')
          }
        }
      } else {
        this.delayedSpinnerMessage('Wrong password for Seed Phrase')
      }
    },
    clearPrivateKey() {
      this.updatePrivateKey({ privateKey: '' })
    },
    clearSeedPhrase() {
      this.updateSeedPhrase({ seedPhrase: '' })
    },
    async loadPassword() {
      const password = await getSessionStore('password')
      if (password) {
        this.hashedPassword = password
      }
    },
    deleteWalletAccount(params: TypeShowPhraseKeyVariables) {
      return new Promise(async (resolve, reject) => {
        this.sendSignedRequest({
          body: {
            email: this.email.toLowerCase()
          },
          method: 'POST',
          url: getBackendEndpoint() + '/v1/auth/deleteAccount'
        })
          .then(() => {
            this.logoutWallet().then(() => {
              resolve(true)
            })
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    setUsersEmail(email: string) {
      this.updateEmail(email)
    }
  },
  getters: {
    isLoggedIn: (state) => {
      return state.keystore !== undefined && state.keystore !== null
    },
    twoFaRequiredGet: (state) => {
      return (
        (state.twoFaRequired.email ||
          state.twoFaRequired.authenticator ||
          state.twoFaRequired.needConfirmation) &&
        state.encryptedSeed.ciphertext === undefined
      )
    },
    authStatus: (state) => state.status,
    walletEmail: (state) => state.email,

    hasEncryptedKeystore: (state) => state.encryptedSeed.ciphertext !== undefined,
    hasHiddenLogin: (state) => state.hiddenLogin
  }
})
