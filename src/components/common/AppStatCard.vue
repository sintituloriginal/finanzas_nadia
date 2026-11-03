<template>
  <q-card
    flat
    class="fintech-card full-height column justify-between"
    :class="[
      featured ? 'fintech-card--hero' : 'fintech-card--interactive'
    ]"
  >
    <q-card-section class="q-pa-md">
      <div class="row items-center justify-between no-wrap q-mb-sm">
        <span
          class="text-caption text-weight-bold text-uppercase"
          :class="featured ? 'text-teal-1' : 'text-muted'"
          style="letter-spacing: 0.05em"
        >
          {{ title }}
        </span>
        <div
          class="stat-icon-box"
          :style="
            featured
              ? { backgroundColor: 'rgba(255, 255, 255, 0.16)', color: '#ffffff' }
              : { backgroundColor: (color || '#0D9488') + '16', color: color || '#0D9488' }
          "
        >
          <q-icon :name="icon" size="19px" />
        </div>
      </div>

      <div
        class="text-weight-bolder font-mono q-my-xs stat-number"
        :class="featured ? 'text-white' : valueClass"
      >
        {{ value }}
      </div>

      <div class="row items-center justify-between q-mt-xs">
        <span
          class="text-caption ellipsis"
          :class="featured ? 'text-teal-1' : 'text-muted'"
        >
          {{ subtitle }}
        </span>
        <slot name="badge" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string
  subtitle?: string
  icon: string
  color?: string
  valueClass?: string
  featured?: boolean
}>()
</script>

<style scoped>
.stat-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-number {
  font-size: clamp(1.2rem, 4.5vw, 1.5rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.02em;
  line-height: 1.25;
}
</style>

