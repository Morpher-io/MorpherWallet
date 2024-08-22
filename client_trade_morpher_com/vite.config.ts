import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    disabled: false  
  },
  build: {
    rollupOptions: {
      // https://gist.github.com/darkoatanasovski/ed7ea7f4d7d2f174d2ebbd3540879fec
    },
    commonjsOptions: {
      transformMixedEsModules: true, // https://github.com/chnejohnson/vue-dapp/issues/20
    },
  }
})
