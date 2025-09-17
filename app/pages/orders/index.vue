<!-- app/pages/orders/index.vue -->
<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const perPage = 5;

const page = ref(Number(route.query.page || 1));
const search = ref(String(route.query.search || ''));
const status = ref(String(route.query.status || 'any'));

const statuses = [
  { value: 'any', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On hold' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
  { value: 'trash', label: 'Trash' },
];

const { list } = useOrders();

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

function statusClass(s: string) {
  if (['completed', 'processing'].includes(s)) return 'badge badge--ok';
  if (['on-hold', 'pending'].includes(s)) return 'badge badge--warn';
  if (['cancelled', 'refunded', 'failed', 'trash'].includes(s)) return 'badge badge--err';
  return 'badge';
}
</script>

<template>
  <section class="space-y-4">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-2">
      <input v-model="search" placeholder="Search (order/email)" class="input w-64" />
      <select v-model="status" class="input">
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <span class="text-xs opacity-70">per page: {{ perPage }}</span>
    </div>

    <!-- Errors / Loading -->
    <div v-if="error" class="text-sm" style="color: var(--danger)">{{ (error as any).message }}</div>
    <div v-else-if="pending" class="loading">Loading</div>

    <!-- Table -->
    <div v-else class="card overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in items" :key="o.id" class="border-b" :style="{ borderColor: 'var(--line)' }">
            <td class="py-2">
              <NuxtLink :to="`/orders/${o.id}`">#{{ o.id }}</NuxtLink>
            </td>
            <td class="py-2">
              {{ [o.billing?.first_name, o.billing?.last_name].filter(Boolean).join(' ') || '—' }}
              <span v-if="o.billing?.email" class="opacity-60">· {{ o.billing.email }}</span>
            </td>
            <td class="py-2">{{ o.total }} {{ o.currency }}</td>
            <td class="py-2">
              <span :class="statusClass(o.status)">
                <span class="badge-dot"></span>
                {{ o.status }}
              </span>
            </td>
            <td class="py-2">{{ new Date(o.date_created).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <button @click="prevPage" :disabled="page === 1" class="btn btn-ghost">[ Prev ]</button>
      <div class="text-xs opacity-70">Page {{ page }} / {{ meta.totalPages || 1 }} · Total {{ meta.total ?? '—' }}</div>
      <button @click="nextPage" :disabled="meta.totalPages && page >= meta.totalPages" class="btn btn-ghost">[ Next ]</button>
    </div>
  </section>
</template>
