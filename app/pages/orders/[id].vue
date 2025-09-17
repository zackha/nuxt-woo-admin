<!-- app/pages/orders/[id].vue -->
<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const { getById, getNotes, updateStatus, addNote } = useOrders();

const { data: orderRes, pending, error, refresh } = useAsyncData(() => getById(id), { lazy: true, server: false, default: () => ({ data: null }) });
const order = computed(() => orderRes.value?.data);

const { data: notesRes, refresh: refreshNotes } = useAsyncData(() => getNotes(id), { lazy: true, server: false, default: () => ({ data: [] }) });
const notes = computed(() => notesRes.value?.data || []);

const statuses = ['pending', 'processing', 'completed', 'on-hold', 'cancelled', 'refunded', 'failed'];
const newStatus = ref('processing');
watch(order, o => {
  if (o?.status) newStatus.value = o.status;
});

const noteText = ref('');

async function handleStatusUpdate() {
  try {
    await updateStatus(id, newStatus.value);
    await refresh();
  } catch (e: any) {
    alert(e?.message || 'Failed to update status');
  }
}
async function handleAddNote() {
  if (!noteText.value.trim()) return;
  try {
    await addNote(id, noteText.value.trim());
    noteText.value = '';
    await refreshNotes();
  } catch (e: any) {
    alert(e?.message || 'Failed to add note');
  }
}
</script>

<template>
  <section class="space-y-6">
    <div><NuxtLink to="/orders">← Back</NuxtLink></div>

    <div v-if="error" class="text-sm" style="color: var(--danger)">{{ (error as any).message }}</div>
    <div v-else-if="pending" class="loading">Loading</div>

    <div v-else-if="order" class="space-y-4">
      <h1 class="text-lg">Order #{{ order.id }}</h1>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="card">
          <h2 class="mb-2">Summary</h2>
          <div class="text-sm space-y-1">
            <div>
              Status:
              <strong>{{ order.status }}</strong>
            </div>
            <div>
              Total:
              <strong>{{ order.total }} {{ order.currency }}</strong>
            </div>
            <div>Created: {{ new Date(order.date_created).toLocaleString() }}</div>
          </div>
        </div>

        <div class="card">
          <h2 class="mb-2">Customer</h2>
          <div class="text-sm space-y-1">
            <div>{{ [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ') || '—' }}</div>
            <div>{{ order.billing?.email || '—' }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="mb-2">Line Items</h2>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="li in order.line_items || []" :key="li.id" class="border-b" :style="{ borderColor: 'var(--line)' }">
                <td class="py-2">{{ li.name }}</td>
                <td class="py-2">{{ li.quantity }}</td>
                <td class="py-2">{{ li.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="card space-y-2">
          <h2>Update Status</h2>
          <select v-model="newStatus" class="input mr-2">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <button @click="handleStatusUpdate" class="btn btn-strong">[ Update ]</button>
        </div>

        <div class="card space-y-2">
          <h2>Add Note</h2>
          <textarea v-model="noteText" rows="3" class="input w-full" placeholder="Internal note…"></textarea>
          <button @click="handleAddNote" class="btn btn-ghost">[ Add Note ]</button>
        </div>
      </div>

      <div class="card">
        <h2 class="mb-2">Notes</h2>
        <ul class="text-sm space-y-2">
          <li v-for="n in notes" :key="n.id" class="border rounded p-2" :style="{ borderColor: 'var(--line)' }">
            <div class="opacity-60 text-xs">{{ new Date(n.date_created).toLocaleString() }}</div>
            <div>{{ n.note }}</div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
