import { createI18n } from 'vue-i18n'

import messages from '../lang'

export const i18nPlugin = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  silentTranslationWarn: true,
  messages
})

export const i18n = i18nPlugin.global

const loadedLanguages = ['en'] // our default language that is preloaded

function setI18nLanguage(lang: string) {
  i18n.locale = lang as any
  // axios.defaults.headers.common['Accept-Language'] = lang;

  const html = document.querySelector('html')
  if (html) {
    html.setAttribute('lang', lang)
  }

  return lang
}

export function loadLanguageAsync(lang: string): any {
  if (i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang)) {
      // return import(/* webpackChunkName: "lang-[request]" */ `@/lang/locales/${lang}`).then((msgs) => {
      // 	i18n.setLocaleMessage(lang, msgs.default);
      loadedLanguages.push(lang)
      return setI18nLanguage(lang)
      //});
    }
    return Promise.resolve(setI18nLanguage(lang))
  }
  return Promise.resolve(lang)
}
