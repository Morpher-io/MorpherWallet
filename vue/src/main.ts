import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import { i18nPlugin, i18n } from '@/plugins/i18n'
import Cookie from 'js-cookie'
import { useWalletStore } from '@/stores/wallet'
import * as Sentry from '@sentry/vue'
import { checkErrorFilter } from '@/utils/sentry'
import VueGtag from 'vue-gtag'
import Buefy from 'buefy'
import '@/assets/stylesheet/wallet.scss'
import App from '@/App.vue'

const app = createApp(App)
app.use(createPinia())

if (import.meta.env.VITE_MODE === 'production' || import.meta.env.VITE_MODE === 'staging') {
  app.config.performance = false
} else {
  app.config.performance = true
}

app.use(i18nPlugin)
app.use(router)

app.directive('click-outside', {
  mounted(el, binding, vnode) {
    el.clickOutsideEvent = function (event: any) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el)
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
})

const store = useWalletStore()

const supportedLocales: string[] = import.meta.env.VITE_I18N_SUPPORTED_LOCALE
  ? JSON.parse(import.meta.env.VITE_I18N_SUPPORTED_LOCALE)
  : ['en']
const defaultLocale = import.meta.env.VITE_I18N_DEFAULT_LOCALE || 'en'
const currentLocale = Cookie.get('locale')

if (!currentLocale) {
  const language =
    (navigator.languages && navigator.languages[0]) || // Chrome / Firefox
    navigator.language

  const lang = language.split('-')[0] || defaultLocale

  if (supportedLocales.includes(lang)) {
    i18n.locale = lang
    document.querySelector('html')?.setAttribute('lang', lang)
    if (lang === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl')
    else document.querySelector('html')?.setAttribute('dir', '')
    Cookie.set('locale', lang)

    if (store.keystore) {
      store.updateUserPayload({ column: 'app_lang', value: lang })
    }
  } else {
    i18n.locale = defaultLocale
    document.querySelector('html')?.setAttribute('lang', defaultLocale)
    if (defaultLocale === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl')
    else document.querySelector('html')?.setAttribute('dir', '')
    Cookie.set('locale', defaultLocale)

    if (store.keystore) {
      store.updateUserPayload({ column: 'app_lang', value: defaultLocale })
    }
  }
} else {
  if (!supportedLocales.includes(currentLocale)) {
    Cookie.set('locale', defaultLocale)
    document.querySelector('html')?.setAttribute('lang', defaultLocale)
    if (defaultLocale === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl')
    else document.querySelector('html')?.setAttribute('dir', '')
    i18n.locale = defaultLocale
    if (store.keystore) {
      store.updateUserPayload({ column: 'app_lang', value: defaultLocale })
    }
  } else {
    i18n.locale = currentLocale as any
    document.querySelector('html')?.setAttribute('lang', currentLocale)
    if (currentLocale === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl')
    else document.querySelector('html')?.setAttribute('dir', '')
    if (store.keystore) {
      store.updateUserPayload({ column: 'app_lang', value: currentLocale })
    }
  }
}

if (import.meta.env.VITE_SENTRY_ENDPOINT) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_ENDPOINT,
    release: 'morpher-wallet@' + import.meta.env.VITE__RELEASE_VERSION,
    integrations: [Sentry.vueIntegration, Sentry.browserTracingIntegration({ router })],
    beforeSend(event) {
      if (event.exception) {
        const exception = JSON.stringify(event.exception).toLowerCase()

        if (!checkErrorFilter(exception)) {
          //console.log('Error Filtered',exception)
          return null
        }
      }

      return event
    }
  })
}

if (import.meta.env.VITE_GOOGLE_ANALYTICS_API_KEY) {
  app.use(
    VueGtag,
    {
      config: {
        id: import.meta.env.VITE_GOOGLE_ANALYTICS_API_KEY,
        params: {
          anonymizeIp: true,
          allowGoogleSignals: false
        }
      }
    },
    router
  )
}

app.use(Buefy as any, {})

app.mount('#app')
