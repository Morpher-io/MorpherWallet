import { createRouter, createWebHistory } from 'vue-router'
import Wallet from '../views/Wallet.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import TwoFA from '../views/TwoFA.vue'
import Settings from '../views/Settings.vue'
import Unlock from '../views/Unlock.vue'
import SignTx from '../views/SignTx.vue'
import SignMsg from '../views/SignMsg.vue'
import Recovery from '../views/Recovery.vue'
import EmailSettings from '../views/EmailSettings.vue'
import PasswordSettings from '../views/PasswordSettings.vue'
import TwoFactorSettings from '../views/TwoFactorSettings.vue'
import KeysSettings from '../views/KeysSettings.vue'
import RecoverySettings from '../views/RecoverySettings.vue'
import DeleteSettings from '../views/DeleteSettings.vue'
import { useWalletStore } from '@/stores/wallet'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: '/settings/email',
      name: 'EmailSettings',
      component: EmailSettings,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/settings/password',
      name: 'PasswordSettings',
      component: PasswordSettings,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/settings/2fa',
      name: 'TwoFactorSettings',
      component: TwoFactorSettings,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/settings/keys',
      name: 'KeysSettings',
      component: KeysSettings,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/settings/recovery',
      name: 'RecoverySettings',
      component: RecoverySettings,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/settings/delete',
      name: 'DeleteSettings',
      component: DeleteSettings,
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
  ]
})

router.beforeEach(async (to, from, next) => {
  const store = useWalletStore()
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (to.query && to.query.code) {
      next()
      return
    }
    if (store.isLoggedIn) {
      if (store.redirectPath) {
        const path = store.redirectPath
        store.setRedirect('')
        next(path)
      } else {
        next()
      }

      return
    }
    if (to.path && to.path !== '/') {
      store.setRedirect(to.path)
    }

    if (store.twoFaRequired) {
      next('/2fa')
      return
    }

    await store.loadEncryptedSeed()
    if (store.email) {
      next('/unlock')
      return
    }
    next('/login')
  } else if (to.matched.some((record) => record.meta.requires2fa)) {
    if (store.twoFaRequired) {
      next()
      return
    }
    if (store.isLoggedIn) {
      next('/')
      return
    }

    next('/login')
  } else {
    next()
  }
})

export default router
