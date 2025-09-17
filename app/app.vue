<!-- app/app.vue -->
<template>
  <div class="min-h-screen px-4 py-4">
    <div class="container-retro">
      <header class="retro-header">
        <NuxtLink to="/" class="brand">NuxtCommerce Admin</NuxtLink>
        <nav class="flex items-center gap-3 text-sm">
          <NuxtLink to="/orders" class="hover:opacity-100 opacity-80">Orders</NuxtLink>
          <!-- İlerde: <NuxtLink to="/products" class="opacity-80 hover:opacity-100">Products</NuxtLink> -->
        </nav>
      </header>

      <main class="p-4">
        <NuxtPage />
      </main>

      <footer class="footer">© {{ new Date().getFullYear() }} · Nuxtcommerce Admin</footer>
    </div>
  </div>
</template>
