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
    if (orderRes.value?.data) orderRes.value = { ...orderRes.value, data: { ...orderRes.value.data, status: newStatus.value } };
    await refreshNotes();
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
  } finally {
    addingNote.value = false;
  }
}
</script>

<template>
  <section class="space-y-6">
    <NuxtLink to="/orders" class="link hud-title">BACK</NuxtLink>

    <div v-if="error" class="err">{{ (error as any).message }}</div>
    <div v-else-if="pending" class="loading">Loading</div>

    <div v-else-if="order" class="space-y-4">
      <div class="flex items-center gap-3">
        <h1 class="hud-title">ORDER #{{ order.id }}</h1>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <Card>
          <div class="hud-title mb-2">SUMMARY</div>
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
        </Card>

        <Card>
          <div class="hud-title mb-2">CUSTOMER</div>
          <div class="text-sm space-y-1">
            <div>{{ [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ') || '—' }}</div>
            <div>{{ order.billing?.email || '—' }}</div>
          </div>
        </Card>
      </div>

      <Card>
        <div class="hud-title mb-2">LINE ITEMS</div>
        <div class="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>QTY</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="li in order.line_items || []" :key="li.id" class="row">
                <td>{{ li.name }}</td>
                <td>{{ li.quantity }}</td>
                <td>{{ li.total }}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Card>

      <div class="grid md:grid-cols-2 gap-4">
        <Card class="space-y-2">
          <div class="hud-title">UPDATE STATUS</div>
          <select v-model="newStatus" class="input" :disabled="updatingStatus">
            <option v-for="s in statuses" :key="s" :value="s">{{ s.toUpperCase() }}</option>
          </select>
          <Button variant="strong" :disabled="updatingStatus" @click="handleStatusUpdate">
            <template v-if="updatingStatus">UPDATING…</template>
            <template v-else>UPDATE</template>
          </Button>
        </Card>

        <Card class="space-y-2">
          <div class="hud-title">ADD NOTE</div>
          <textarea v-model="noteText" rows="3" class="input w-full" placeholder="INTERNAL NOTE…" :disabled="addingNote"></textarea>
          <Button variant="ghost" :disabled="addingNote || !noteText.trim()" @click="handleAddNote">
            <template v-if="addingNote">ADDING…</template>
            <template v-else>ADD NOTE</template>
          </Button>
        </Card>
      </div>

      <Card>
        <div class="hud-title mb-2">NOTES</div>
        <ul class="text-sm space-y-2">
          <li v-for="n in notes" :key="n.id" class="border p-2">
            <div class="opacity-60 text-xs">{{ new Date(n.date_created).toLocaleString() }}</div>
            <div>{{ n.note }}</div>
          </li>
        </ul>
      </Card>
    </div>
  </section>
</template>
