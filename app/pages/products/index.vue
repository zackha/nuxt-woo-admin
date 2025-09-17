<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const perPage = Number(process.env.NUXT_DEFAULT_PER_PAGE || config.defaultPerPage || 20);

const page = ref(Number(route.query.page || 1));
const search = ref(String(route.query.search || ''));
const status = ref(String(route.query.status || 'any'));

const statuses = [
  { value: 'any', label: 'All' },
  { value: 'publish', label: 'Publish' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'private', label: 'Private' },
];

const { list } = useProducts();

const { data, pending, error } = useAsyncData(
  () =>
    list({
      page: page.value,
      per_page: perPage,
      search: search.value || undefined,
      status: status.value === 'any' ? undefined : status.value,
    }),
  { watch: [page, search, status], lazy: true, server: false, default: () => ({ data: [], meta: {} }) }
);

watch([page, search, status], () => {
  router.replace({
    query: {
      page: String(page.value),
      search: search.value || undefined,
      status: status.value !== 'any' ? status.value : undefined,
    },
  });
});

const items = computed(() => data.value?.data || []);
const meta = computed(() => data.value?.meta || {});

function nextPage() {
  if (!meta.value.totalPages) return;
  if (page.value < meta.value.totalPages) page.value += 1;
}
function prevPage() {
  if (page.value > 1) page.value -= 1;
}

function statusBadge(s: string) {
  if (s === 'publish') return 'badge badge--ok';
  if (s === 'draft' || s === 'pending') return 'badge badge--warn';
  if (s === 'private') return 'badge';
  return 'badge';
}
function priceText(p: any) {
  if (p.sale_price && p.sale_price !== '0') return `${p.sale_price} (sale)`;
  return p.price || p.regular_price || '—';
}
function stockText(p: any) {
  if (p.stock_status === 'instock') return p.manage_stock && p.stock_quantity != null ? `in stock · ${p.stock_quantity}` : 'in stock';
  if (p.stock_status === 'onbackorder') return 'on backorder';
  return 'out of stock';
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <input v-model="search" placeholder="Search (name/sku)" class="input w-64" />
      <select v-model="status" class="input">
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <span class="text-xs opacity-70">per page: {{ perPage }}</span>
    </div>

    <div v-if="error" class="text-sm" style="color: var(--danger)">{{ (error as any).message }}</div>
    <div v-else-if="pending" class="loading">Loading</div>

    <div v-else class="card overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th class="px-3">Item</th>
            <th class="px-3">Price</th>
            <th class="px-3">Stock</th>
            <th class="px-3">Status</th>
            <th class="pl-3 !text-end">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id" class="border-b" :style="{ borderColor: 'var(--line)' }">
            <td class="py-2">
              <NuxtLink :to="`/products/${p.id}`">#{{ p.id }}</NuxtLink>
            </td>
            <td class="py-2 flex items-center gap-3 px-3">
              <img v-if="p.image" :src="p.image.src" :alt="p.image.alt" class="border" style="width: 40px; height: 40px; object-fit: cover; border-color: var(--line)" />
              <span class="truncate max-w-52 block">{{ p.name }}</span>
            </td>
            <td class="py-2 px-3">{{ priceText(p) }}</td>
            <td class="py-2 px-3">
              <span class="badge">
                <span class="badge-dot"></span>
                {{ stockText(p) }}
              </span>
            </td>
            <td class="py-2 px-3">
              <span :class="statusBadge(p.status)">
                <span class="badge-dot"></span>
                {{ p.status }}
              </span>
            </td>
            <td class="py-2 pl-3 text-end">{{ new Date(p.date_created).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between">
      <button @click="prevPage" :disabled="page === 1" class="btn btn-ghost">[ Prev ]</button>
      <div class="text-xs opacity-70">Page {{ page }} / {{ meta.totalPages || 1 }} · Total {{ meta.total ?? '—' }}</div>
      <button @click="nextPage" :disabled="meta.totalPages && page >= meta.totalPages" class="btn btn-ghost">[ Next ]</button>
    </div>
  </section>
</template>
