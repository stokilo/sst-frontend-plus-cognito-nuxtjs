import constants from './constants'
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

console.info('---- nuxt-js isDevMode: ' + constants.isDevMode)
console.info('---- nuxt-js BASE_URL: ' + constants.BASE_URL)
console.info('---- nuxt-js API_URL: ' + constants.API_URL)

export default {
  ssr: false,
  target: 'static',
  router: {
    base: '/',
    mode: 'history',
    prefetchLinks: false
  },
  /*
  ** Headers of the page
  */
  head: {
    htmlAttrs: {
      lang: 'en'
    },
    titleTemplate: 'Real estate',
    title: 'Real estate portal',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no' },
      { hid: 'description', name: 'description', content: 'Cloud spider real estate search engine' },
      { hid: 'keywords', name: 'keywords', content: 'Cloud spider' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    bodyAttrs: {
      class: ''
    }
  },
  /*
  ** Customize the progress-bar color
  */
  loadingIndicator: {
    name: 'pulse',
    color: '#3B8070',
    background: 'white'
  },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/amplify.ts', mode: 'client' }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build',
    '@aceforth/nuxt-optimized-images'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],
  robots: [
    { UserAgent: '*', Disallow: '/api' },
    { UserAgent: '*', Disallow: '/login' },
    { UserAgent: '*', Disallow: '/signup' },
    { UserAgent: '*', Disallow: '/logout' },
    { UserAgent: '*', Disallow: '/app' },
    { Sitemap: `${constants.BASE_URL}/sitemap.xml` }
  ],
  sitemap: {
    hostname: constants.BASE_URL,
    gzip: true,
    exclude: [
      '/api',
      '/api/**',
      '/login',
      '/signup',
      '/logout',
      '/app',
      '/app/**'
    ]
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseURL: constants.API_URL
  },
  proxy: {
    '/api': constants.API_URL
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      config.output.publicPath = './_nuxt/'

      if (!config.resolve) {
        config.resolve = {}
      }
      if (!config.resolve.plugins) {
        config.resolve.plugins = []
      }
      config.resolve.plugins.push(new TsconfigPathsPlugin({ configFile: './tsconfig.json' }))
    },
    analyze: false,
    babel: {
      compact: true
    },
    parallel: true,
    cache: true,
    hardSource: constants.isDevMode,
    transpile: ['vue-debounce-decorator']
  },

  components: false,

  optimizedImages: {
    optimizeImages: true,
    optimizeImagesInDev: false
  },
  env: {
    isDevMode: constants.isDevMode,
    API_URL: constants.API_URL
  }

}
