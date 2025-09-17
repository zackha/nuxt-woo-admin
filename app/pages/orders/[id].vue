<!-- app/pages/orders/[id].vue -->
<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const { getById, getNotes, updateStatus, addNote } = useOrders();

const { data: orderRes, pending, error, refresh } = await useAsyncData(() => getById(id));
const order = computed(() => orderRes.value?.data);

const { data: notesRes, refresh: refreshNotes } = await useAsyncData(() => getNotes(id));
const notes = computed(() => notesRes.value?.data || []);

const statuses = ['pending', 'processing', 'completed', 'on-hold', 'cancelled', 'refunded', 'failed'];
const newStatus = ref(order.value?.status || 'processing');
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
  <div class="space-y-6">
    <div>
      <NuxtLink to="/orders" class="underline">← Back to Orders</NuxtLink>
    </div>

    <div v-if="error" class="text-red-600 text-sm">{{ (error as any).message }}</div>
    <div v-else-if="pending">Loading…</div>

    <div v-else-if="order" class="space-y-4">
      <h1 class="text-lg font-semibold">Order #{{ order.id }}</h1>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="border rounded p-3">
          <h2 class="font-semibold mb-2">Summary</h2>
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

        <div class="border rounded p-3">
          <h2 class="font-semibold mb-2">Customer</h2>
          <div class="text-sm space-y-1">
            <div>{{ [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ') || '—' }}</div>
            <div>{{ order.billing?.email || '—' }}</div>
          </div>
        </div>
      </div>

      <div class="border rounded p-3">
        <h2 class="font-semibold mb-2">Line Items</h2>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Name</th>
              <th class="text-left py-2">Qty</th>
              <th class="text-left py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="li in order.line_items || []" :key="li.id" class="border-b">
              <td class="py-2">{{ li.name }}</td>
              <td class="py-2">{{ li.quantity }}</td>
              <td class="py-2">{{ li.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="border rounded p-3 space-y-2">
          <h2 class="font-semibold">Update Status</h2>
          <select v-model="newStatus" class="border px-3 py-2 text-sm rounded mr-2">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <button @click="handleStatusUpdate" class="border px-3 py-2 text-sm rounded">Update</button>
        </div>

        <div class="border rounded p-3 space-y-2">
          <h2 class="font-semibold">Add Note</h2>
          <textarea v-model="noteText" rows="3" class="border w-full px-3 py-2 text-sm rounded" placeholder="Internal note…" />
          <button @click="handleAddNote" class="border px-3 py-2 text-sm rounded">Add Note</button>
        </div>
      </div>

      <div class="border rounded p-3">
        <h2 class="font-semibold mb-2">Notes</h2>
        <ul class="text-sm space-y-2">
          <li v-for="n in notes" :key="n.id" class="border rounded p-2">
            <div class="opacity-60 text-xs">{{ new Date(n.date_created).toLocaleString() }}</div>
            <div>{{ n.note }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
