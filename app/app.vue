<template>
  <div class="min-h-screen px-4 py-4">
    <div class="container-retro">
      <AppHeader />
      <main class="p-4"><NuxtPage /></main>
      <footer class="footer">© {{ new Date().getFullYear() }} · NuxtCommerce Admin</footer>
    </div>
  </div>
</template>
