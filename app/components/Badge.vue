<script setup lang="ts">
const props = defineProps<{ tone?: 'ok' | 'warn' | 'err' | '' }>();
const tone = computed(() => (props.tone ? `badge--${props.tone}` : ''));
</script>

<template>
  <span class="badge" :class="tone">
    <span class="badge-dot"></span>
    <slot />
  </span>
</template>
