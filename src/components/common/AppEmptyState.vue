<template>
  <div class="empty-state column items-center justify-center text-center q-pa-xl">
    <div class="empty-icon-circle q-mb-md">
      <q-icon :name="icon" size="30px" color="primary" />
    </div>
    <div class="text-subtitle1 text-weight-bold q-mb-xs">
      {{ title }}
    </div>
    <p v-if="description" class="text-body2 text-muted q-mb-md" style="max-width: 400px">
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title: string
    description?: string
  }>(),
  {
    icon: 'inbox'
  }
)
</script>

<style scoped>
.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: var(--brand-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

