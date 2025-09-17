<script setup lang="ts">
const id = useRoute().params.id as string;
const { getById, getNotes, updateStatus, addNote } = useOrders();

const { data: orderRes, pending, error } = useAsyncData(() => getById(id), { lazy: true, server: false, default: () => ({ data: null }) });
const order = computed(() => orderRes.value?.data);

const { data: notesRes, refresh: refreshNotes } = useAsyncData(() => getNotes(id), { lazy: true, server: false, default: () => ({ data: [] }) });
const notes = computed(() => notesRes.value?.data || []);

const statuses = ['pending', 'processing', 'completed', 'on-hold', 'cancelled', 'refunded', 'failed'];
const newStatus = ref('processing');
watch(order, o => {
  if (o?.status) newStatus.value = o.status;
});
const noteText = ref('');
const updatingStatus = ref(false);
const addingNote = ref(false);

async function handleStatusUpdate() {
  if (!order.value) return;
  try {
    updatingStatus.value = true;
    await updateStatus(id, newStatus.value);
    if (orderRes.value?.data) {
      orderRes.value = { ...orderRes.value, data: { ...orderRes.value.data, status: newStatus.value } };
    }
    await refreshNotes();
  } catch (e: any) {
    alert(e?.message || 'Failed to update status');
  } finally {
    updatingStatus.value = false;
  }
}

async function handleAddNote() {
  const v = noteText.value.trim();
  if (!v) return;
  try {
    addingNote.value = true;
    await addNote(id, v);
    noteText.value = '';
    await refreshNotes();
  } catch (e: any) {
    alert(e?.message || 'Failed to add note');
  } finally {
    addingNote.value = false;
  }
}
</script>

<template>
  <section class="space-y-3">
    <div v-if="error" class="err">{{ (error as any).message }}</div>
    <div v-else-if="pending" class="loading">Loading</div>

    <div v-else-if="order" class="space-y-4">
      <div class="flex items-center gap-2">
        <NuxtLink to="/orders">← Back</NuxtLink>
        <h1 class="text-lg">Order #{{ order.id }}</h1>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="card text-sm space-y-1">
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

        <div class="card text-sm space-y-1">
          <h2 class="mb-1">Customer</h2>
          <div>{{ [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ') || '—' }}</div>
          <div>{{ order.billing?.email || '—' }}</div>
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
              <tr v-for="li in order.line_items || []" :key="li.id" class="row">
                <td>{{ li.name }}</td>
                <td>{{ li.quantity }}</td>
                <td>{{ li.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="card space-y-2">
          <h2>Update Status</h2>
          <select v-model="newStatus" class="input" :disabled="updatingStatus">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <button @click="handleStatusUpdate" class="btn btn-strong" :disabled="updatingStatus">
            <template v-if="updatingStatus">[ Updating… ]</template>
            <template v-else>[ Update ]</template>
          </button>
        </div>
        <div class="card space-y-2">
          <h2>Add Note</h2>
          <textarea v-model="noteText" rows="3" class="input w-full" placeholder="Internal note…" :disabled="addingNote"></textarea>
          <button @click="handleAddNote" class="btn btn-ghost" :disabled="addingNote || !noteText.trim()">
            <template v-if="addingNote">[ Adding… ]</template>
            <template v-else>[ Add Note ]</template>
          </button>
        </div>
      </div>

      <div class="card">
        <h2 class="mb-2">Notes</h2>
        <ul class="text-sm space-y-2">
          <li v-for="n in notes" :key="n.id" class="note">
            <div class="note-date">{{ new Date(n.date_created).toLocaleString() }}</div>
            <div>{{ n.note }}</div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
