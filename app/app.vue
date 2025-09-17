<template>
  <div class="min-h-screen p-4">
    <div class="container-retro">
      <AppHeader />
      <main class="p-4"><NuxtPage /></main>
    </div>
    <footer class="footer">© {{ new Date().getFullYear() }} · NuxtCommerce Admin</footer>
  </div>
</template>
