<script setup lang="ts">
const { public: pub } = useRuntimeConfig();
const perPage = Number(pub.defaultPerPage || 20);

const route = useRoute();
const router = useRouter();
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
  () => list({ page: page.value, per_page: perPage, search: search.value || undefined, status: status.value === 'any' ? undefined : status.value }),
  { watch: [page, search, status], lazy: true, server: false, default: () => ({ data: [], meta: {} }) }
);

watch([page, search, status], () => {
  router.replace({ query: { page: String(page.value), ...(search.value && { search: search.value }), ...(status.value !== 'any' && { status: status.value }) } });
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
      <input v-model="search" placeholder="Search (order/email)" class="input w-64" />
      <select v-model="status" class="input">
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <span class="hint">per page: {{ perPage }}</span>
    </div>

    <div v-if="error" class="err">{{ (error as any).message }}</div>
    <div v-else-if="pending" class="loading">Loading</div>

    <Card v-else class="overflow-x-auto">
      <Table fixed>
        <colgroup>
          <col style="width: 88px" />
          <col />
          <col style="width: 140px" />
          <col style="width: 140px" />
          <col style="width: 180px" />
        </colgroup>
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
          <tr v-for="o in items" :key="o.id" class="row">
            <td>
              <NuxtLink :to="`/orders/${o.id}`">#{{ o.id }}</NuxtLink>
            </td>
            <td class="min-w-0">
              <span class="truncate block">
                {{ [o.billing?.first_name, o.billing?.last_name].filter(Boolean).join(' ') || '—' }}
                <template v-if="o.billing?.email">· {{ o.billing.email }}</template>
              </span>
            </td>
            <td>{{ o.total }} {{ o.currency }}</td>
            <td>
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
            <td>{{ new Date(o.date_created).toLocaleString() }}</td>
          </tr>
        </tbody>
      </Table>
    </Card>

    <div class="pager">
      <Button variant="ghost" @click="prevPage" :disabled="page === 1">[ Prev ]</Button>
      <div class="hint">Page {{ page }} / {{ meta.totalPages || 1 }} · Total {{ meta.total ?? '—' }}</div>
      <Button variant="ghost" @click="nextPage" :disabled="meta.totalPages && page >= meta.totalPages">[ Next ]</Button>
    </div>
  </section>
</template>
