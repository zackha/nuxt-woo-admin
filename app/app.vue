<template>
  <div class="min-h-screen flex flex-col">
    <header class="px-4 py-3 border-b text-sm font-semibold flex items-center gap-4">
      <NuxtLink to="/orders" class="opacity-80 hover:opacity-100 transition-opacity">Orders</NuxtLink>
    </header>
    <main class="p-4">
      <NuxtPage />
    </main>
  </div>
</template>
