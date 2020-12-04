import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Wallet from '../views/Wallet.vue';
import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue';
import TwoFA from '../views/TwoFA.vue';
import store from '../store/index';
import Settings from '../views/Settings.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
	{
		path: '/login',
		name: 'Login',
		component: Login
	},
	{
		path: '/signup',
		name: 'Signup',
		component: Signup
	},
	{
		path: '/settings/:setting',
		name: 'Settings',
		component: Settings,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: '/2fa',
		name: 'TwoFA',
		component: TwoFA
	},

	{
		path: '/',
		name: 'Wallet',
		component: Wallet,
		meta: {
			requiresAuth: true
		}
	}
];

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
});

router.beforeEach((to, from, next) => {
	if (to.matched.some(record => record.meta.requiresAuth)) {
		if (store.getters.twoFaRequired) {
			next('/2fa');
			return;
		}
		if (store.getters.isLoggedIn) {
			next();
			return;
		}
		next('/login');
	} else {
		next();
	}
});

export default router;
