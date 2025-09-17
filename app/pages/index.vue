<!-- app/pages/index.vue -->
<script setup lang="ts">
const { list: listOrders } = useOrders();
const { list: listProducts } = useProducts();

const ORDERS_LIMIT = 5;
const PRODUCTS_LIMIT = 5;

// Bloklamasın: awaitsız + lazy + server:false
const {
  data: ordersRes,
  pending: ordersPending,
  error: ordersError,
} = useAsyncData('home-orders', () => listOrders({ page: 1, per_page: ORDERS_LIMIT }), { lazy: true, server: false, default: () => ({ data: [], meta: {} }) });
const {
  data: productsRes,
  pending: productsPending,
  error: productsError,
} = useAsyncData('home-products', () => listProducts({ page: 1, per_page: PRODUCTS_LIMIT }), { lazy: true, server: false, default: () => ({ data: [], meta: {} }) });

const orders = computed(() => ordersRes.value?.data || []);
const products = computed(() => productsRes.value?.data || []);

function orderStatusClass(s: string) {
  if (['completed', 'processing'].includes(s)) return 'badge badge--ok';
  if (['on-hold', 'pending'].includes(s)) return 'badge badge--warn';
  if (['cancelled', 'refunded', 'failed', 'trash'].includes(s)) return 'badge badge--err';
  return 'badge';
}
function productStatusBadge(s: string) {
  if (s === 'publish') return 'badge badge--ok';
  if (s === 'draft' || s === 'pending') return 'badge badge--warn';
  return 'badge';
}
function priceText(p: any) {
  if (!p) return '—';
  if (p.sale_price && p.sale_price !== '0') return `${p.sale_price} (sale)`;
  return p.price || p.regular_price || '—';
}
function stockText(p: any) {
  if (!p) return '—';
  if (p.stock_status === 'instock') {
    return p.manage_stock && p.stock_quantity != null ? `in stock · ${p.stock_quantity}` : 'in stock';
  }
  if (p.stock_status === 'onbackorder') return 'on backorder';
  return 'out of stock';
}
</script>

<template>
  <section class="space-y-6">
    <div class="grid md:grid-cols-2 gap-4">
      <!-- Recent Orders -->
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-base">Orders</h2>
          <NuxtLink to="/orders" class="text-sm">view all →</NuxtLink>
        </div>

        <div v-if="ordersError" class="text-sm" style="color: var(--danger)">{{ (ordersError as any).message }}</div>
        <div v-else-if="ordersPending" class="loading">Loading</div>

        <div v-else>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th class="!text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in orders" :key="o.id" class="border-b" :style="{ borderColor: 'var(--line)' }">
                <td class="py-2">
                  <NuxtLink :to="`/orders/${o.id}`">#{{ o.id }}</NuxtLink>
                </td>
                <td class="py-2">
                  {{ [o.billing?.first_name, o.billing?.last_name].filter(Boolean).join(' ') || '—' }}
                </td>
                <td class="py-2">{{ o.total }} {{ o.currency }}</td>
                <td class="py-2 text-end">
                  <span :class="orderStatusClass(o.status)">
                    <span class="badge-dot"></span>
                    {{ o.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="!orders.length">
                <td colspan="4" class="py-3 opacity-60 text-sm">No orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Products -->
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-base">Products</h2>
          <NuxtLink to="/products" class="text-sm">view all →</NuxtLink>
        </div>

        <div v-if="productsError" class="text-sm" style="color: var(--danger)">{{ (productsError as any).message }}</div>
        <div v-else-if="productsPending" class="loading">Loading</div>

        <div v-else>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th class="px-3">Item</th>
                <th class="px-3">Price</th>
                <th class="!text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" class="border-b" :style="{ borderColor: 'var(--line)' }">
                <td class="py-2">
                  <NuxtLink :to="`/products/${product.id}`">#{{ product.id }}</NuxtLink>
                </td>
                <td class="py-2 px-3">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="product.image"
                      :src="product.image.src"
                      :alt="product.image.alt"
                      class="border object-cover"
                      style="width: 28px; height: 28px; border-color: var(--line)" />
                    <span class="truncate max-w-[120px] block" :title="product.name" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                      {{ product.name }}
                    </span>
                  </div>
                </td>
                <td class="py-2 px-3">{{ priceText(product) }}</td>
                <td class="py-2 text-end">
                  <span :class="productStatusBadge(product.status)">
                    <span class="badge-dot"></span>
                    {{ product.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="!products.length">
                <td colspan="4" class="py-3 opacity-60 text-sm text-center">No products found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
