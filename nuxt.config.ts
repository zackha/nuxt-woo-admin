// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite';
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  runtimeConfig: {
    wcUrl: process.env.NUXT_WC_URL,
    wcKey: process.env.NUXT_WC_KEY,
    wcSecret: process.env.NUXT_WC_SECRET,
  },
  app: {
    head: {
      title: 'Nuxt Woo Admin',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  css: ['~/assets/css/main.css'],
});
