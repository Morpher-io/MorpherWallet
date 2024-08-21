# morpherwallet

Morpher wallet frontend - 
Project Libraries: 
    Vue 3 in Vite
    pinia store
    Viem
    buefy / bulma
    vue-gtag - for handlin google gtag integration
    vue-i18n - for multi language support
    vue3-jazzicon - jazzicon generation
    

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project setup
```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run serve
```


### Type-Check, Compile and Minify for Production

```sh
npm run build
```


### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
