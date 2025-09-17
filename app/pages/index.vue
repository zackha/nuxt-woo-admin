<script setup lang="ts">
const { list: listOrders } = useOrders();
const { list: listProducts } = useProducts();

const ORDERS_LIMIT = 5,
  PRODUCTS_LIMIT = 5;

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
</script>

<template>
  <section class="grid md:grid-cols-2 gap-4">
    <Card>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-base">Orders</h2>
        <NuxtLink to="/orders" class="text-sm link">view all →</NuxtLink>
      </div>
      <div v-if="ordersError" class="err">{{ (ordersError as any).message }}</div>
      <div v-else-if="ordersPending" class="loading">Loading</div>
      <div v-else>
        <Table fixed>
          <colgroup>
            <col style="width: 88px" />
            <col />
            <col style="width: 120px" />
            <col style="width: 120px" />
          </colgroup>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th class="!text-end">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id" class="row">
              <td>
                <NuxtLink :to="`/orders/${o.id}`">#{{ o.id }}</NuxtLink>
              </td>
              <td class="min-w-0">
                <span class="truncate block">{{ [o.billing?.first_name, o.billing?.last_name].filter(Boolean).join(' ') || '—' }}</span>
              </td>
              <td>{{ o.total }} {{ o.currency }}</td>
              <td class="text-end">
                <Badge
                  :tone="
                    ['completed', 'processing'].includes(o.status)
                      ? 'ok'
                      : ['on-hold', 'pending'].includes(o.status)
                      ? 'warn'
                      : ['cancelled', 'refunded', 'failed', 'trash'].includes(o.status)
                      ? 'err'
                      : ''
                  ">
                  {{ o.status }}
                </Badge>
              </td>
            </tr>
            <tr v-if="!orders.length"><td colspan="4" class="empty">No orders found.</td></tr>
          </tbody>
        </Table>
      </div>
    </Card>

    <Card>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-base">Products</h2>
        <NuxtLink to="/products" class="text-sm link">view all →</NuxtLink>
      </div>
      <div v-if="productsError" class="err">{{ (productsError as any).message }}</div>
      <div v-else-if="productsPending" class="loading">Loading</div>
      <div v-else>
        <Table fixed>
          <colgroup>
            <col style="width: 88px" />
            <col />
            <col style="width: 140px" />
            <col style="width: 120px" />
          </colgroup>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Price</th>
              <th class="!text-end">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id" class="row">
              <td>
                <NuxtLink :to="`/products/${p.id}`">#{{ p.id }}</NuxtLink>
              </td>
              <td class="min-w-0">
                <div class="flex items-center gap-3 min-w-0">
                  <img v-if="p.image" :src="p.image.src" :alt="p.image.alt" class="thumb" />
                  <span class="truncate block" :title="p.name">{{ p.name }}</span>
                </div>
              </td>
              <td>{{ priceText(p) }}</td>
              <td class="text-end">
                <Badge :tone="p.status === 'publish' ? 'ok' : ['draft', 'pending'].includes(p.status) ? 'warn' : ''">
                  {{ p.status }}
                </Badge>
              </td>
            </tr>
            <tr v-if="!products.length"><td colspan="4" class="empty">No products found.</td></tr>
          </tbody>
        </Table>
      </div>
    </Card>
  </section>
</template>
