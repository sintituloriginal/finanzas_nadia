<template>
  <q-btn
    :type="type"
    :unelevated="variant === 'primary' || variant === 'danger'"
    :outline="variant === 'outline'"
    :flat="variant === 'ghost'"
    no-caps
    :color="computedColor"
    :icon="icon"
    :label="label"
    :loading="loading"
    :disable="disable"
    :size="size"
    :to="to"
    class="rounded-btn"
    @click="$emit('click', $event)"
  >
    <slot />
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    icon?: string
    variant?: 'primary' | 'outline' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disable?: boolean
    size?: string
    to?: string
  }>(),
  {
    variant: 'primary',
    type: 'button',
    loading: false,
    disable: false
  }
)

defineEmits<{
  (e: 'click', ev: Event): void
}>()

const computedColor = computed(() => {
  if (props.variant === 'danger') return 'negative'
  if (props.variant === 'ghost') return 'grey-7'
  return 'primary'
})
</script>

