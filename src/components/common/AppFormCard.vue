<template>
  <q-card class="form-modal-card" flat>
    <q-card-section class="row items-center justify-between q-px-lg q-py-md">
      <div class="row items-center no-wrap">
        <div v-if="icon" class="modal-icon-box q-mr-md">
          <q-icon :name="icon" size="20px" color="primary" />
        </div>
        <div>
          <div class="text-subtitle1 text-weight-bolder">{{ title }}</div>
          <div v-if="subtitle" class="text-caption text-muted">{{ subtitle }}</div>
        </div>
      </div>
      <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" />
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pa-lg">
      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  icon?: string
}>()
</script>

<style scoped>
.form-modal-card {
  width: 100%;
  max-width: 520px;
  background-color: var(--bg-surface);
}
.modal-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: var(--brand-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

