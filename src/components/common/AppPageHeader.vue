<template>
  <div class="row items-start justify-between q-mb-lg q-col-gutter-md app-page-header">
    <div class="col-12 col-sm-auto min-w-0">
      <div v-if="eyebrow" class="text-overline text-primary text-weight-bold q-mb-xs" style="line-height: 1.1; letter-spacing: 0.08em">
        {{ eyebrow }}
      </div>
      <h1 class="text-h5 text-weight-bolder q-my-none tracking-tight page-title">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-body2 text-muted q-mt-xs q-mb-none page-subtitle">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.actions" class="col-12 col-sm-auto page-header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
}>()
</script>

<style scoped>
.tracking-tight {
  letter-spacing: -0.022em;
}

.page-title {
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  line-height: 1.25;
  word-break: break-word;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 599px) {
  .page-header-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 8px;
    width: 100%;
    margin-top: 4px;
  }

  .page-header-actions :deep(.rounded-btn) {
    width: 100%;
    justify-content: center;
  }
}
</style>

