<template>
  <q-card flat class="fintech-card" :class="{ 'full-height': fullHeight }">
    <q-card-section
      v-if="title || $slots.header || $slots.actions"
      class="row items-center justify-between q-px-lg q-pt-lg q-pb-sm"
    >
      <div class="col">
        <div class="row items-center q-gutter-x-sm">
          <div v-if="icon" class="section-icon">
            <q-icon :name="icon" size="18px" color="primary" />
          </div>
          <div>
            <div class="text-subtitle1 text-weight-bold leading-tight">
              {{ title }}
            </div>
            <div v-if="subtitle" class="text-caption text-muted">
              {{ subtitle }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="$slots.actions" class="col-auto row items-center q-gutter-xs">
        <slot name="actions" />
      </div>
    </q-card-section>

    <q-separator v-if="borderedHeader && (title || $slots.actions)" class="q-mt-xs" />

    <q-card-section :class="noPadding ? 'q-pa-none' : 'q-pa-lg'">
      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    icon?: string
    fullHeight?: boolean
    noPadding?: boolean
    borderedHeader?: boolean
  }>(),
  {
    fullHeight: false,
    noPadding: false,
    borderedHeader: false
  }
)
</script>

<style scoped>
.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background-color: var(--brand-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

