import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import Cookie from "js-cookie";

Vue.config.productionTip = false;

// Multi-language i18n plugin
import { i18n } from "./plugins/i18n";

const supportedLanguages = ["en", "bs", "ar", "de", "ru", "ja", "zh", "pt"];
const defaultLangugage: any = "en";
const currentLocale = Cookie.get("locale");

if (!currentLocale) {
  const language =
    (navigator.languages && navigator.languages[0]) || // Chrome / Firefox
    navigator.language;

  const lang = language.split("-")[0] || defaultLangugage;

  if (supportedLanguages.includes(lang)) {
    i18n.locale = lang;
    document.querySelector("html")?.setAttribute("lang", lang);
    if (lang === "ar")
      document.querySelector("html")?.setAttribute("dir", "rtl");
    else document.querySelector("html")?.setAttribute("dir", "");
    Cookie.set("locale", lang);
  } else {
    i18n.locale = defaultLangugage;
    document.querySelector("html")?.setAttribute("lang", defaultLangugage);
    if (defaultLangugage === "ar")
      document.querySelector("html")?.setAttribute("dir", "rtl");
    else document.querySelector("html")?.setAttribute("dir", "");
    Cookie.set("locale", defaultLangugage);
  }
} else {
  if (!supportedLanguages.includes(currentLocale)) {
    Cookie.set("locale", defaultLangugage);
    document.querySelector("html")?.setAttribute("lang", defaultLangugage);
    if (defaultLangugage === "ar")
      document.querySelector("html")?.setAttribute("dir", "rtl");
    else document.querySelector("html")?.setAttribute("dir", "");
    i18n.locale = defaultLangugage;
  } else {
    i18n.locale = currentLocale;
    document.querySelector("html")?.setAttribute("lang", currentLocale);
    if (currentLocale === "ar")
      document.querySelector("html")?.setAttribute("dir", "rtl");
    else document.querySelector("html")?.setAttribute("dir", "");
  }
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
