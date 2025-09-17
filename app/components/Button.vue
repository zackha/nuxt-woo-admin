<script setup lang="ts">
const props = withDefaults(defineProps<{ variant?: 'ghost' | 'strong' | 'danger' | 'default'; disabled?: boolean }>(), {
  variant: 'default',
  disabled: false,
});
const klass = computed(() => ({
  btn: true,
  'btn-ghost': props.variant === 'ghost',
  'btn-strong': props.variant === 'strong',
  'btn-danger': props.variant === 'danger',
}));
</script>

<template>
  <button :class="klass" :disabled="disabled"><slot /></button>
</template>
