<template>
  <header class="retro-header">
    <NuxtLink to="/" class="brand">NuxtCommerce Admin</NuxtLink>
    <nav class="flex items-center gap-3 text-sm">
      <NuxtLink to="/orders" class="link" active-class="!opacity-100 underline">Orders</NuxtLink>
      <NuxtLink to="/products" class="link" active-class="!opacity-100 underline">Products</NuxtLink>
    </nav>
  </header>
</template>
