<script setup lang="ts">
import { format, formatDistanceToNow } from 'date-fns';
const id = useRoute().params.id as string;
const { getById, getNotes, updateStatus, addNote } = useOrders();

const { data: orderRes, error } = useAsyncData(() => getById(id), { lazy: true, server: false, default: () => ({ data: null }) });
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
    <div v-if="!order" class="loading">Loading</div>
    <div v-else-if="error" class="err">{{ (error as any).message }}</div>
    <div v-else="" class="space-y-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="link hud-title">HOME</NuxtLink>
        <div class="hud-title">/</div>
        <NuxtLink to="/orders" class="link hud-title">ORDERS</NuxtLink>
        <div class="hud-title">/</div>
        <NuxtLink :to="`/orders/${order.id}`" class="link hud-title">ORDER #{{ order.id }}</NuxtLink>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <div class="hud-title mb-3">SUMMARY</div>
          <Card>
            <div class="text-xs space-y-1 p-3">
              <div>
                Status:
                <strong>{{ order.status }}</strong>
              </div>
              <div>
                Total:
                <strong>${{ order.total }}</strong>
              </div>
              <div>Created: {{ format(new Date(order.date_created), "MMMM d, yyyy 'at' h:mm a") }}</div>
            </div>
          </Card>
        </div>

        <div>
          <div class="hud-title mb-3">CUSTOMER</div>
          <Card>
            <div class="text-xs space-y-1 p-3">
              <div class="capitalize">{{ [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ') || '—' }}</div>
              <div>{{ order.billing?.email || '—' }}</div>
              <div>{{ order.billing?.phone || '—' }}</div>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <div class="hud-title mb-3">LINE ITEMS</div>
        <Card>
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
      </div>

      <div>
        <div class="hud-title mb-3">UPDATE STATUS</div>
        <div class="flex gap-3">
          <select v-model="newStatus" class="input" :disabled="updatingStatus">
            <option v-for="s in statuses" :key="s" :value="s">{{ s.toUpperCase() }}</option>
          </select>
          <Button variant="strong" :disabled="updatingStatus" @click="handleStatusUpdate">
            <template v-if="updatingStatus">UPDATING…</template>
            <template v-else>UPDATE</template>
          </Button>
        </div>
      </div>

      <div class="hud-title mb-2">NOTES</div>
      <ul class="text-xs space-y-3">
        <li v-for="n in notes" :key="n.id" class="border bg-black border-white/10 p-3 space-y-2">
          <div class="opacity-30">
            {{ formatDistanceToNow(new Date(n.date_created), { addSuffix: true }) }}
          </div>
          <div v-html="n.note"></div>
        </li>
      </ul>
      <div class="space-y-2">
        <textarea v-model="noteText" rows="3" class="input w-full" placeholder="INTERNAL NOTE…" :disabled="addingNote"></textarea>
        <div class="flex justify-end">
          <Button variant="ghost" :disabled="addingNote || !noteText.trim()" @click="handleAddNote">
            <template v-if="addingNote">ADDING…</template>
            <template v-else>ADD NOTE</template>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
