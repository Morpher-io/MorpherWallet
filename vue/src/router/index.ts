import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Wallet from '../views/Wallet.vue';
import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue';
import TwoFA from '../views/TwoFA.vue';
import store from '../store/index';
import Settings from '../views/Settings.vue';
import Unlock from '../views/Unlock.vue';
import SignTx from '../views/SignTx.vue';
import SignMsg from '../views/SignMsg.vue';
import Recovery from '../views/Recovery.vue';
import RecoveryAdd from '../views/RecoveryAdd.vue';

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
		path: '/settings',
		name: 'Settings',
		component: Settings,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: '/addrecovery',
		name: 'AddRecovery',
		component: RecoveryAdd,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: '/recovery',
		name: 'Recovery',
		component: Recovery
	},
	{
		path: '/2fa',
		name: 'TwoFA',
		component: TwoFA,
		meta: {
			requires2fa: true
		}
	},
	{
		path: '/unlock',
		name: 'Unlock',
		component: Unlock
	},
	{
		path: '/signtx',
		name: 'SignTx',
		component: SignTx,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: '/signmsg',
		name: 'SignMsg',
		component: SignMsg,
		meta: {
			requiresAuth: true
		}
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
		if (store.getters.hasEncryptedKeystore) {
			next('/unlock');
			return;
		}
		next('/login');
	} else if (to.matched.some(record => record.meta.requires2fa)) {
		console.log(store.getters.twoFaRequired);
		if (store.getters.twoFaRequired) {
			next();
			return;
		}
		if (store.getters.isLoggedIn) {
			next('/');
			return;
		}

		next('/login');
	} else {
		next();
	}
});

export default router;
