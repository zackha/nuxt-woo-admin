<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns';
const { public: pub } = useRuntimeConfig();
const perPage = Number(pub.defaultPerPage || 20);

const route = useRoute();
const router = useRouter();
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
  () => list({ page: page.value, per_page: perPage, search: search.value || undefined, status: status.value === 'any' ? undefined : status.value }),
  { watch: [page, search, status], lazy: true, server: false, default: () => ({ data: [], meta: {} }) }
);

watch([page, search, status], () => {
  router.replace({
    query: {
      page: String(page.value),
      ...(search.value && { search: search.value }),
      ...(status.value !== 'any' && { status: status.value }),
    },
  });
});

const items = computed(() => data.value?.data || []);
const meta = computed(() => data.value?.meta || {});
const nextPage = () => {
  if (meta.value.totalPages && page.value < meta.value.totalPages) page.value += 1;
};
const prevPage = () => {
  if (page.value > 1) page.value -= 1;
};
</script>

<template>
  <section class="space-y-4">
    <div class="controls">
      <input v-model="search" placeholder="Search (name/sku)" class="input w-64" />
      <select v-model="status" class="input">
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <span class="hint">per page: {{ perPage }}</span>
    </div>

    <div v-if="error" class="err">{{ (error as any).message }}</div>
    <div v-else-if="pending" class="loading">Loading</div>

    <div v-else class="card overflow-x-auto">
      <table class="table table-fixed">
        <colgroup>
          <col style="width: 66px" />
          <col style="min-width: 52px" />
          <col style="width: 90px" />
          <col style="width: 120px" />
          <col style="width: 120px" />
          <col style="width: 136px" />
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>Item</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th class="!text-end">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id" class="row">
            <td>
              <NuxtLink :to="`/products/${p.id}`">#{{ p.id }}</NuxtLink>
            </td>
            <td class="min-w-0">
              <div class="flex items-center gap-3 min-w-0">
                <img v-if="p.image" :src="p.image.src" :alt="p.image.alt" class="thumb-lg" />
                <span class="truncate block" :title="p.name">{{ p.name }}</span>
              </div>
            </td>
            <td>{{ priceText(p) }}</td>
            <td>
              <span class="badge">
                <span class="badge-dot"></span>
                {{ stockText(p) }}
              </span>
            </td>
            <td>
              <span :class="productBadge(p.status)">
                <span class="badge-dot"></span>
                {{ p.status }}
              </span>
            </td>
            <td class="text-end">{{ formatDistanceToNow(new Date(p.date_created)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager">
      <button @click="prevPage" :disabled="page === 1" class="btn btn-ghost">[ Prev ]</button>
      <div class="hint">Page {{ page }} / {{ meta.totalPages || 1 }} · Total {{ meta.total ?? '—' }}</div>
      <button @click="nextPage" :disabled="meta.totalPages && page >= meta.totalPages" class="btn btn-ghost">[ Next ]</button>
    </div>
  </section>
</template>
