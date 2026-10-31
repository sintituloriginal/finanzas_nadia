<template>
  <div class="row items-start justify-between q-mb-lg q-col-gutter-md">
    <div class="col-12 col-sm-auto">
      <div v-if="eyebrow" class="text-overline text-primary text-weight-bold q-mb-xs" style="line-height: 1.1; letter-spacing: 0.08em">
        {{ eyebrow }}
      </div>
      <h1 class="text-h5 text-weight-bolder q-my-none tracking-tight">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-body2 text-muted q-mt-xs q-mb-none">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.actions" class="col-12 col-sm-auto row items-center q-gutter-sm">
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
</style>

