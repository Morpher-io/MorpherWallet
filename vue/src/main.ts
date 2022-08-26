import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import * as Sentry from '@sentry/vue';
import * as Integrations from '@sentry/integrations';
import VueGtag from 'vue-gtag';
import Cookie from 'js-cookie';
import { checkErrorFilter } from './utils/sentry';
import Buefy from 'buefy';
import VueAppleLogin from 'vue-apple-login';


Vue.config.productionTip = false;

// Multi-language i18n plugin
import { i18n } from './plugins/i18n';

const supportedLocales: string[] = process.env.VUE_APP_I18N_SUPPORTED_LOCALE
	? JSON.parse(process.env.VUE_APP_I18N_SUPPORTED_LOCALE)
	: ['en'];
const defaultLocale = process.env.VUE_APP_I18N_DEFAULT_LOCALE || 'en';
const currentLocale = Cookie.get('locale');

if (!currentLocale) {
	const language =
		(navigator.languages && navigator.languages[0]) || // Chrome / Firefox
		navigator.language;

	const lang = language.split('-')[0] || defaultLocale;

	if (supportedLocales.includes(lang)) {
		i18n.locale = lang;
		document.querySelector('html')?.setAttribute('lang', lang);
		if (lang === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl');
		else document.querySelector('html')?.setAttribute('dir', '');
		Cookie.set('locale', lang);

		if (store.state.keystore) {
			store.dispatch('updateUserPayload', { column: 'app_lang', value: lang });
		}
	} else {
		i18n.locale = defaultLocale;
		document.querySelector('html')?.setAttribute('lang', defaultLocale);
		if (defaultLocale === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl');
		else document.querySelector('html')?.setAttribute('dir', '');
		Cookie.set('locale', defaultLocale);

		if (store.state.keystore) {
			store.dispatch('updateUserPayload', { column: 'app_lang', value: defaultLocale });
		}
	}
} else {
	if (!supportedLocales.includes(currentLocale)) {
		Cookie.set('locale', defaultLocale);
		document.querySelector('html')?.setAttribute('lang', defaultLocale);
		if (defaultLocale === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl');
		else document.querySelector('html')?.setAttribute('dir', '');
		i18n.locale = defaultLocale;
		if (store.state.keystore) {
			store.dispatch('updateUserPayload', { column: 'app_lang', value: defaultLocale });
		}
	} else {
		i18n.locale = currentLocale;
		document.querySelector('html')?.setAttribute('lang', currentLocale);
		if (currentLocale === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl');
		else document.querySelector('html')?.setAttribute('dir', '');
		if (store.state.keystore) {
			store.dispatch('updateUserPayload', { column: 'app_lang', value: currentLocale });
		}
	}
}

if (process.env.VUE_APP_SENTRY_ENDPOINT) {
	Sentry.init({
		Vue,
		dsn: process.env.VUE_APP_SENTRY_ENDPOINT,
		release: 'morpher-wallet@' + process.env.VUE_APP_RELEASE_VERSION,
		integrations: [new Integrations.Vue({ Vue, attachProps: true })],
		beforeSend(event) {
			if (event.exception) {
				const exception = JSON.stringify(event.exception).toLowerCase();

				if (!checkErrorFilter(exception)) {
					//console.log('Error Filtered',exception)
					return null;
				}
			}

			return event;
		}
	});
}

Vue.use(VueAppleLogin, {
	clientId: process.env.VUE_APP__APPLE_CLIENT_ID,
	scope: 'name email',
	redirectURI: 'https://wallet-dev.morpher.com',
	state: Date.now().toString(),
	usePopup: true,
  });

Vue.use(
	VueGtag,
	{
		config: {
			id: process.env.VUE_APP_GOOGLE_ANALYTICS_API_KEY
		},
		params: {
			anonymizeIp: true,
			allowGoogleSignals: false
		},
		set: [
			{
				field: 'anonymize_ip',
				value: true
			},
			{
				field: 'allow_google_signals',
				value: false
			}
		]
	},
	router
);

// Click outside directive
Vue.directive('click-outside', {
	bind: (el: any, binding: any, vnode: any) => {
		el.clickOutsideEvent = (event: any) => {
			if (!(el === event.target || el.contains(event.target))) {
				vnode.context[binding.expression](event);
			}
		};
		document.body.addEventListener('click', el.clickOutsideEvent);
	},
	unbind: (el: any) => {
		document.body.removeEventListener('click', el.clickOutsideEvent);
	}
});

Vue.use(Buefy);

new Vue({
	data: {
		privateState: {}
	},
	router,
	store,
	i18n,
	render: (h) => h(App)
}).$mount('#app');
