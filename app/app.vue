<template>
  <div class="min-h-screen px-4 py-4">
    <div class="container-retro">
      <header class="retro-header">
        <NuxtLink to="/" class="brand">NuxtCommerce Admin</NuxtLink>
        <nav class="flex items-center gap-3 text-sm">
          <NuxtLink to="/orders" class="link">Orders</NuxtLink>
          <NuxtLink to="/products" class="link">Products</NuxtLink>
        </nav>
      </header>
      <main class="p-4"><NuxtPage /></main>
      <footer class="footer">© {{ new Date().getFullYear() }} · Minimal Admin</footer>
    </div>
  </div>
</template>
