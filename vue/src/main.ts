import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";


Vue.config.productionTip = false;

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
	render: h => h(App)
}).$mount('#app');
