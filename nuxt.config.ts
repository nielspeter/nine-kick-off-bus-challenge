// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxtjs/tailwindcss',
    // '@sidebase/nuxt-auth', // Temporarily disabled to fix session issue
    '@pinia/nuxt'
  ],

  typescript: {
    strict: false,
    typeCheck: false
  },


  nitro: {
    experimental: {
      websocket: true
    },
    plugins: ['~/server/plugins/database.ts']
  },

  // auth: {
  //   baseURL: process.env.AUTH_ORIGIN || 'http://localhost:3000',
  //   provider: {
  //     type: 'authjs'
  //   },
  //   sessionRefresh: {
  //     enablePeriodically: false,
  //     enableOnWindowFocus: true
  //   },
  //   globalAppMiddleware: {
  //     isEnabled: false,
  //     allow404WithoutAuth: true,
  //     addDefaultCallbackUrl: true
  //   }
  // },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    claudeApiKey: process.env.CLAUDE_API_KEY,
    authSecret: process.env.AUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    public: {
      authUrl: process.env.AUTH_ORIGIN || 'http://localhost:3000',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  }
})