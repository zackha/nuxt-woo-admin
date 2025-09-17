<script setup lang="ts">
const id = useRoute().params.id as string;
const { getById } = useProducts();

const { data: res, pending, error } = useAsyncData(() => getById(id), { lazy: true, server: false, default: () => ({ data: null }) });
const product = computed(() => res.value?.data);

const priceBlock = (p: any) => (!p ? '' : p.sale_price && p.sale_price !== '0' ? `${p.sale_price} (sale) · ~${p.regular_price}~` : p.price || p.regular_price || '—');
</script>

<template>
  <section class="space-y-6">
    <div><NuxtLink to="/products">← Back</NuxtLink></div>

    <div v-if="error" class="err">{{ (error as any).message }}</div>
    <div v-else-if="pending" class="loading">Loading</div>

    <div v-else-if="product" class="space-y-4">
      <h1 class="text-lg">{{ product.name }}</h1>

      <div class="card">
        <div class="flex gap-3 overflow-x-auto">
          <img v-for="img in product.images" :key="img.id" :src="img.src" :alt="img.alt" class="thumb-xl" />
          <div v-if="!product.images?.length" class="empty">No image</div>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="card text-sm space-y-1">
          <div>
            Status:
            <span :class="productBadge(product.status)">
              <span class="badge-dot"></span>
              {{ product.status }}
            </span>
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
                in stock
                <template v-if="product.manage_stock && product.stock_quantity != null">· {{ product.stock_quantity }}</template>
              </template>
              <template v-else-if="product.stock_status === 'onbackorder'">on backorder</template>
              <template v-else>out of stock</template>
            </span>
          </div>
          <div>Created: {{ new Date(product.date_created).toLocaleString() }}</div>
        </div>

        <div class="card">
          <h2 class="mb-2">Description</h2>
          <p class="text-sm whitespace-pre-line">{{ product.description || '—' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
