<template>
  <div
    class="period-selector-container"
    :class="{ 'period-selector--mobile': isMobile }"
  >
    <q-select
      v-model="selectedMonth"
      :options="monthOptions"
      emit-value
      map-options
      dense
      outlined
      options-dense
      bg-color="transparent"
      class="period-select-field month-select"
      aria-label="Seleccionar mes"
    >
      <template #prepend>
        <q-icon name="calendar_month" size="17px" color="primary" class="gt-xs" />
      </template>
    </q-select>

    <q-select
      v-model="selectedYear"
      :options="yearOptions"
      dense
      outlined
      options-dense
      bg-color="transparent"
      class="period-select-field year-select"
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
    isMobile?: boolean
  }>(),
  {
    allowFullYear: true,
    isMobile: false
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
.period-selector-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  box-sizing: border-box;
}

/* Modo Desktop */
.period-selector-container:not(.period-selector--mobile) {
  flex-wrap: nowrap;
}

.period-selector-container:not(.period-selector--mobile) .month-select {
  width: 170px;
  min-width: 0;
}

.period-selector-container:not(.period-selector--mobile) .year-select {
  width: 102px;
  min-width: 0;
}

/* Modo Móvil explícito o pantalla < 768px */
.period-selector--mobile {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
  gap: 8px !important;
  width: 100% !important;
}

.period-selector--mobile .period-select-field {
  width: 100% !important;
  min-width: 0 !important;
}

:deep(.q-field--dense .q-field__control) {
  height: 38px;
  min-height: 38px;
  border-radius: 9px;
  padding: 0 10px;
}

:deep(.q-field--dense .q-field__native) {
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.q-field__marginal) {
  height: 38px;
}
</style>

