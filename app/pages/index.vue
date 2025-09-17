<script setup lang="ts">
const { list: listOrders } = useOrders();
const { list: listProducts } = useProducts();

const ORDERS_LIMIT = 5,
  PRODUCTS_LIMIT = 5;

const { data: ordersRes, error: ordersError } = useAsyncData('home-orders', () => listOrders({ page: 1, per_page: ORDERS_LIMIT }), {
  lazy: true,
  server: false,
  default: () => ({ data: [], meta: {} }),
});

const { data: productsRes, error: productsError } = useAsyncData('home-products', () => listProducts({ page: 1, per_page: PRODUCTS_LIMIT }), {
  lazy: true,
  server: false,
  default: () => ({ data: [], meta: {} }),
});

const orders = computed(() => ordersRes.value?.data || []);
const products = computed(() => productsRes.value?.data || []);
</script>

<template>
  <section class="grid md:grid-cols-2 gap-4">
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="hud-title">ORDERS</h2>
        <NuxtLink to="/orders" class="link hud-title">VIEW ALL</NuxtLink>
      </div>
      <Card>
        <div v-if="!orders.length" class="h-64 w-auto bg-white/5 animate-pulse"></div>
        <div v-else-if="ordersError" class="err">{{ (ordersError as any).message }}</div>
        <div v-else>
          <Table fixed>
            <colgroup>
              <col style="width: 68px" />
              <col />
              <col style="width: 76px" />
              <col style="width: 130px" />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>CUSTOMER</th>
                <th>TOTAL</th>
                <th class="!text-end">STATUS</th>
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
                <td>${{ o.total }}</td>
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
              <tr v-if="!orders.length"><td colspan="4" class="empty">NO DATA</td></tr>
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="hud-title">PRODUCTS</h2>
        <NuxtLink to="/products" class="link hud-title">VIEW ALL</NuxtLink>
      </div>
      <Card>
        <div v-if="!products.length" class="h-64 w-auto bg-white/5 animate-pulse"></div>
        <div v-else-if="productsError" class="err">{{ (productsError as any).message }}</div>
        <div v-else>
          <Table fixed>
            <colgroup>
              <col style="width: 58px" />
              <col />
              <col style="width: 66px" />
              <col style="width: 110px" />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>ITEM</th>
                <th>PRICE</th>
                <th class="!text-end">STATUS</th>
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
              <tr v-if="!products.length"><td colspan="4" class="empty">NO DATA</td></tr>
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  </section>
</template>
