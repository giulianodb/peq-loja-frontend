import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
  ],

  runtimeConfig: {
    public: {
      apiBase: 'http://192.168.2.16:8080',
      mercadoPagoPublicKey: 'APP_USR-beba92f0-4530-4f47-bdc9-55b6c0f6ec2b',
    },
  },

  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false as any,
        },
      },
      ripple: true,
    },
  },

  googleFonts: {
    families: {
      'Playfair Display': [400, 700],
      'Quicksand': [400, 500, 600, 700],
    },
    display: 'swap',
    download: true,
    inject: true,
  },

  app: {
    head: {
      title: 'Pequenas Trilhas — Materiais Educativos',
      meta: [
        { name: 'description', content: 'Materiais educativos digitais para famílias e educadores' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preload', as: 'image', href: '/images/logo-coral.webp', type: 'image/webp' },
        { rel: 'preload', as: 'font', href: '/primeicons/fonts/primeicons.woff2', type: 'font/woff2', crossorigin: '' },
        { rel: 'preconnect', href: 'https://sdk.mercadopago.com' },
        { rel: 'preconnect', href: 'https://secure.mlstatic.com' },
      ],
    },
  },
})
