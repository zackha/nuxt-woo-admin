<!-- app/pages/orders/index.vue -->
<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const perPage = 20;

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
  {
    watch: [page, search, status],
    lazy: true,
    server: false,
    default: () => ({ data: [], meta: {} }),
  }
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
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <input v-model="search" placeholder="Search (order/email)" class="input w-60" />
      <select v-model="status" class="input">
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <span class="text-xs opacity-70">Per page: {{ perPage }}</span>
    </div>

    <div v-if="error" class="text-red-600 text-sm">{{ (error as any).message }}</div>

    <div v-if="pending" class="text-sm opacity-70">Loading…</div>

    <table v-else class="w-full text-sm border-collapse">
      <thead>
        <tr class="border-b">
          <th class="table-th">ID</th>
          <th class="table-th">Customer</th>
          <th class="table-th">Total</th>
          <th class="table-th">Status</th>
          <th class="table-th">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in items" :key="o.id" class="border-b">
          <td class="table-td">
            <NuxtLink :to="`/orders/${o.id}`" class="underline">#{{ o.id }}</NuxtLink>
          </td>
          <td class="table-td">
            {{ [o.billing?.first_name, o.billing?.last_name].filter(Boolean).join(' ') || '—' }}
            <span v-if="o.billing?.email" class="opacity-60">· {{ o.billing.email }}</span>
          </td>
          <td class="table-td">{{ o.total }} {{ o.currency }}</td>
          <td class="table-td">
            <span class="badge">
              {{ o.status }}
            </span>
          </td>
          <td class="table-td">
            {{ new Date(o.date_created).toLocaleString() }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex items-center justify-between pt-2">
      <button @click="prevPage" :disabled="page === 1" class="btn">Prev</button>
      <div class="text-xs opacity-70">Page {{ page }} / {{ meta.totalPages || 1 }} · Total {{ meta.total ?? '—' }}</div>
      <button @click="nextPage" :disabled="meta.totalPages && page >= meta.totalPages" class="btn">Next</button>
    </div>
  </div>
</template>
