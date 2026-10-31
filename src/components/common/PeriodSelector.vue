<template>
  <div class="row items-center q-gutter-sm no-wrap">
    <q-select
      v-model="selectedMonth"
      :options="monthOptions"
      emit-value
      map-options
      dense
      outlined
      options-dense
      bg-color="transparent"
      class="period-select"
      aria-label="Seleccionar mes"
    >
      <template #prepend>
        <q-icon name="calendar_month" size="18px" color="primary" />
      </template>
    </q-select>

    <q-select
      v-model="selectedYear"
      :options="yearOptions"
      dense
      outlined
      options-dense
      bg-color="transparent"
      class="year-select"
      aria-label="Seleccionar año"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import { MONTHS_ES } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    allowFullYear?: boolean
  }>(),
  {
    allowFullYear: true
  }
)

const financeStore = useFinanceStore()

const monthOptions = computed(() => {
  const base = MONTHS_ES.map((m) => ({ label: m.label, value: m.value }))
  if (props.allowFullYear) {
    return [{ label: 'Todo el año', value: 0 }, ...base]
  }
  return base
})

const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const list: number[] = []
  for (let y = currentYear + 1; y >= currentYear - 4; y--) {
    list.push(y)
  }
  return list
})

const selectedMonth = computed({
  get: () => financeStore.periodFilter.month,
  set: (val: number) => {
    financeStore.periodFilter.month = val
    financeStore.periodFilter.startDate = null
    financeStore.periodFilter.endDate = null
  }
})

const selectedYear = computed({
  get: () => financeStore.periodFilter.year,
  set: (val: number) => {
    financeStore.periodFilter.year = val
    financeStore.periodFilter.startDate = null
    financeStore.periodFilter.endDate = null
  }
})
</script>

<style scoped>
.period-select {
  min-width: 155px;
}
.year-select {
  min-width: 96px;
}
</style>

