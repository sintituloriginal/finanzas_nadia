<template>
  <q-card flat class="fintech-card q-mb-lg">
    <q-card-section class="q-pa-md">
      <slot />
    </q-card-section>
    <template v-if="$slots.summary">
      <q-separator />
      <q-card-section class="q-py-sm q-px-md surface-subtle">
        <slot name="summary" />
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup lang="ts">
// Contenedor visual unificado para barras de búsqueda, filtros y resúmenes
</script>

