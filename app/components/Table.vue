<script setup lang="ts">
defineProps<{ fixed?: boolean }>();
</script>

<template>
  <table class="table" :class="{ 'table-fixed': fixed }"><slot /></table>
</template>
