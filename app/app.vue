<template>
  <div class="min-h-screen p-4">
    <div class="container-retro">
      <AppHeader />
      <main class="p-4"><NuxtPage /></main>
    </div>
    <footer class="footer">
      © {{ new Date().getFullYear() }} ·
      <a href="https://github.com/zackha/nuxtcommerce-admin" class="link" target="_blank" rel="noopener">NuxtCommerce Admin</a>
    </footer>
  </div>
</template>
