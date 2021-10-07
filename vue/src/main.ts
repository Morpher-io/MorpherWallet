import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";


import Cookie from "js-cookie";

Vue.config.productionTip = false;

// Multi-language i18n plugin
import { i18n } from "./plugins/i18n";

const supportedLocales: string[] = process.env.VUE_APP_I18N_SUPPORTED_LOCALE ? JSON.parse(process.env.VUE_APP_I18N_SUPPORTED_LOCALE) : ['en'];
const defaultLocale = process.env.VUE_APP_I18N_DEFAULT_LOCALE || 'en';
const currentLocale = Cookie.get('locale');

if (!currentLocale) {
  const language =
    (navigator.languages && navigator.languages[0]) || // Chrome / Firefox
    navigator.language;

  const lang = language.split("-")[0] || defaultLocale;

  if (supportedLocales.includes(lang)) {
    i18n.locale = lang;
    document.querySelector("html")?.setAttribute("lang", lang);
    if (lang === "ar")
      document.querySelector("html")?.setAttribute("dir", "rtl");
    else document.querySelector("html")?.setAttribute("dir", "");
    Cookie.set("locale", lang);
  } else {
    i18n.locale = defaultLocale;
    document.querySelector("html")?.setAttribute("lang", defaultLocale);
    if (defaultLocale === "ar")
      document.querySelector("html")?.setAttribute("dir", "rtl");
    else document.querySelector("html")?.setAttribute("dir", "");
    Cookie.set("locale", defaultLocale);
  }
} else {
  if (!supportedLocales.includes(currentLocale)) {
    Cookie.set("locale", defaultLocale);
    document.querySelector("html")?.setAttribute("lang", defaultLocale);
    if (defaultLocale === "ar")
      document.querySelector("html")?.setAttribute("dir", "rtl");
    else document.querySelector("html")?.setAttribute("dir", "");
    i18n.locale = defaultLocale;
  } else {
    i18n.locale = currentLocale;
    document.querySelector("html")?.setAttribute("lang", currentLocale);
    if (currentLocale === "ar")
      document.querySelector("html")?.setAttribute("dir", "rtl");
    else document.querySelector("html")?.setAttribute("dir", "");
  }
}

if (process.env.VUE_APP_SENTRY_ENDPOINT) {
	Sentry.init({
	Vue,
	dsn: process.env.VUE_APP_SENTRY_ENDPOINT,
	release: 'morpger-wallet@' + process.env.VUE_APP_RELEASE_VERSION,
	integrations: [
	  new Integrations.BrowserTracing({
		routingInstrumentation: Sentry.vueRouterInstrumentation(router),
		tracingOrigins: ["localhost", "morpher.com", /^\//],
	  }),
	],
	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
  });
}

new Vue({
	data: {
		privateState: {}
	},
	router,
	store,
	i18n,
	render: h => h(App)
}).$mount('#app');
