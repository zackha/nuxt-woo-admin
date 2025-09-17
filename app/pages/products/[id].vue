<script setup lang="ts">
const id = useRoute().params.id as string;
const { getById } = useProducts();

const { data: res, pending, error } = useAsyncData(() => getById(id), { lazy: true, server: false, default: () => ({ data: null }) });
const product = computed(() => res.value?.data);

const priceBlock = (p: any) => (!p ? '' : p.sale_price && p.sale_price !== '0' ? `${p.sale_price} (SALE) · ~${p.regular_price}~` : p.price || p.regular_price || '—');
</script>

<template>
  <section class="space-y-6">
    <div><NuxtLink to="/products" class="link hud-title">BACK</NuxtLink></div>

    <div v-if="error" class="err">{{ (error as any).message }}</div>
    <div v-else-if="pending" class="loading">Loading</div>

    <div v-else-if="product" class="space-y-4">
      <h1 class="hud-title">PRODUCT #{{ product.id }}</h1>

      <Card>
        <div class="flex gap-3 overflow-x-auto">
          <img v-for="img in product.images" :key="img.id" :src="img.src" :alt="img.alt" class="thumb-xl" />
          <div v-if="!product.images?.length" class="empty">NO IMAGE</div>
        </div>
      </Card>

      <div class="grid md:grid-cols-2 gap-4">
        <Card>
          <div class="hud-title mb-2">BASICS</div>
          <div class="text-sm space-y-1">
            <div>
              Status:
              <strong>{{ product.status }}</strong>
            </div>
            <div>
              Price:
              <strong>{{ priceBlock(product) }}</strong>
            </div>
            <div>
              Stock:
              <span class="badge">
                <span class="badge-dot"></span>
                <template v-if="product.stock_status === 'instock'">
                  IN STOCK
                  <template v-if="product.manage_stock && product.stock_quantity != null">· {{ product.stock_quantity }}</template>
                </template>
                <template v-else-if="product.stock_status === 'onbackorder'">ON BACKORDER</template>
                <template v-else>OUT OF STOCK</template>
              </span>
            </div>
            <div>Created: {{ new Date(product.date_created).toLocaleString() }}</div>
          </div>
        </Card>

        <Card>
          <div class="hud-title mb-2">DESCRIPTION</div>
          <p class="text-sm whitespace-pre-line">{{ product.description || '—' }}</p>
        </Card>
      </div>
    </div>
  </section>
</template>
