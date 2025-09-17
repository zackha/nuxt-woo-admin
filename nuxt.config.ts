// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,

  runtimeConfig: {
    wcUrl: process.env.NUXT_WC_URL || '',
    wcKey: process.env.NUXT_WC_KEY || '',
    wcSecret: process.env.NUXT_WC_SECRET || '',
    defaultPerPage: process.env.NUXT_DEFAULT_PER_PAGE || '20',
  },

  app: {
    head: {
      title: 'Nuxt Woo Admin',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },

  routeRules: {
    // Woo listeleri kısa süreli cache edilebilir (opsiyonel, yazma olmayan istekler için)
    '/api/woo/wc/v3/orders': { swr: 15 },
  },
});
