<template>
  <q-page class="page-container">
    <AppPageHeader
      eyebrow="INTELIGENCIA FINANCIERA"
      title="Reportes y Estadísticas"
      subtitle="Análisis comparativo anual, ranking de impacto por categoría y exportación CSV (Excel Chile)."
    >
      <template #actions>
        <AppActionButton
          icon="download"
          label="Exportar CSV (Excel Chile)"
          @click="exportFilteredCSV"
        />
      </template>
    </AppPageHeader>

    <!-- Barra de filtro por rango de fechas personalizado -->
    <AppFilterBar>
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-sm-4">
          <q-input
            v-model="customStart"
            type="date"
            dense
            outlined
            label="Desde (rango personalizado opcional)"
          />
        </div>
        <div class="col-12 col-sm-4">
          <q-input
            v-model="customEnd"
            type="date"
            dense
            outlined
            label="Hasta (rango personalizado opcional)"
          />
        </div>
        <div class="col-12 col-sm-4 row q-gutter-sm">
          <AppActionButton
            label="Aplicar rango"
            icon="filter_alt"
            @click="applyCustomRange"
          />
          <AppActionButton
            variant="ghost"
            label="Limpiar"
            @click="clearCustomRange"
          />
        </div>
      </div>
    </AppFilterBar>

    <!-- Indicadores Analíticos del Año -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          :title="`Gasto Promedio (${financeStore.periodFilter.year})`"
          :value="formatCLP(annualStats.averageMonthlyExpense)"
          subtitle="Promedio en meses con actividad"
          icon="analytics"
          color="#0D9488"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          :title="`Mes Mayor Gasto (${financeStore.periodFilter.year})`"
          :value="annualStats.highestExpenseMonthName"
          :subtitle="`Total: ${formatCLP(annualStats.highestExpenseAmount)}`"
          icon="local_fire_department"
          color="#EF4444"
          value-class="text-negative"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="Mayor Impacto Período"
          :value="topCategories[0]?.name || 'Sin datos'"
          :subtitle="`${formatCLP(topCategories[0]?.amount || 0)} acumulados`"
          icon="category"
          color="#F59E0B"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="Tasa de Ahorro Período"
          :value="formatPercentage(financeStore.periodMetrics.savingsRatePercentage)"
          :subtitle="`Ahorro neto: ${formatCLP(financeStore.periodMetrics.netSavings)}`"
          icon="savings"
          color="#10B981"
          value-class="text-primary"
        />
      </div>
    </div>

    <!-- Gráfico Anual Comparativo de 12 Meses y Ranking -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-8">
        <AppSectionCard
          :title="`Evolución Anual ${financeStore.periodFilter.year}: Ingresos, Egresos y Balance`"
          subtitle="Comparativa mes a mes en CLP confirmados"
          icon="bar_chart"
          full-height
        >
          <v-chart class="echart-lg" :option="annualChartOption" autoresize />
        </AppSectionCard>
      </div>

      <div class="col-12 col-lg-4">
        <AppSectionCard
          title="Categorías de Mayor Impacto"
          subtitle="Participación sobre el gasto total del período"
          icon="leaderboard"
          full-height
        >
          <AppEmptyState
            v-if="topCategories.length === 0"
            icon="leaderboard"
            title="Sin egresos en el período"
            description="No hay gastos confirmados para calcular el ranking de impacto."
          />
          <div v-else class="q-gutter-y-md">
            <div
              v-for="(cat, idx) in topCategories"
              :key="cat.id"
              class="border-subtle q-pa-md"
            >
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center no-wrap">
                  <AppStatusBadge :label="`#${idx + 1}`" tone="info" class="q-mr-sm" />
                  <span class="text-weight-bold text-body2">{{ cat.name }}</span>
                </div>
                <span class="font-mono text-weight-bolder text-body2">
                  {{ formatCLP(cat.amount) }}
                </span>
              </div>
              <q-linear-progress
                :value="Math.min(1, cat.share / 100)"
                rounded
                size="6px"
                color="primary"
                class="q-my-xs"
              />
              <div class="text-right text-caption text-muted">
                {{ cat.share.toFixed(1) }}% del gasto del período
              </div>
            </div>
          </div>
        </AppSectionCard>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { useFinanceStore } from '@/stores/finance'
import { generateTransactionsCSV, isDateInPeriod } from '@/utils/finance'
import {
  formatCLP,
  formatPercentage,
  MONTHS_ES,
  parseYearMonth
} from '@/utils/format'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppFilterBar from '@/components/common/AppFilterBar.vue'
import AppStatCard from '@/components/common/AppStatCard.vue'
import AppSectionCard from '@/components/common/AppSectionCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

const $q = useQuasar()
const financeStore = useFinanceStore()

const customStart = ref(financeStore.periodFilter.startDate ?? '')
const customEnd = ref(financeStore.periodFilter.endDate ?? '')

function applyCustomRange() {
  if (!customStart.value || !customEnd.value) {
    $q.notify({ type: 'warning', message: 'Selecciona fecha inicial y final' })
    return
  }
  financeStore.periodFilter.startDate = customStart.value
  financeStore.periodFilter.endDate = customEnd.value
  $q.notify({ type: 'positive', message: 'Filtro de rango personalizado aplicado' })
}

function clearCustomRange() {
  customStart.value = ''
  customEnd.value = ''
  financeStore.periodFilter.startDate = null
  financeStore.periodFilter.endDate = null
}

const annualMonthlyBreakdown = computed(() => {
  const year = financeStore.periodFilter.year
  const incomes = new Array(12).fill(0)
  const expenses = new Array(12).fill(0)

  for (const tx of financeStore.transactions) {
    if (tx.status !== 'confirmed') continue
    const parsed = parseYearMonth(tx.transaction_date)
    if (parsed.year !== year) continue
    const idx = parsed.month - 1
    if (idx < 0 || idx > 11) continue
    if (tx.type === 'income') incomes[idx] += tx.amount
    else if (tx.type === 'expense') expenses[idx] += tx.amount
  }

  const balances = incomes.map((inc, i) => inc - expenses[i])
  return { incomes, expenses, balances }
})

const annualStats = computed(() => {
  const { expenses } = annualMonthlyBreakdown.value
  const activeMonths = expenses.filter((v) => v > 0)
  const totalYearExpense = expenses.reduce((a, b) => a + b, 0)
  const averageMonthlyExpense =
    activeMonths.length > 0 ? Math.round(totalYearExpense / activeMonths.length) : 0

  let maxIdx = -1
  let maxVal = 0
  expenses.forEach((val, idx) => {
    if (val > maxVal) {
      maxVal = val
      maxIdx = idx
    }
  })

  return {
    averageMonthlyExpense,
    highestExpenseMonthName:
      maxIdx >= 0 ? (MONTHS_ES[maxIdx]?.label ?? 'Sin datos') : 'Sin gastos',
    highestExpenseAmount: maxVal
  }
})

const topCategories = computed(() => {
  const map = new Map<string, { id: string; name: string; amount: number }>()
  let totalExpense = 0

  for (const tx of financeStore.transactions) {
    if (
      tx.status !== 'confirmed' ||
      tx.type !== 'expense' ||
      !isDateInPeriod(tx.transaction_date, financeStore.periodFilter)
    ) {
      continue
    }
    const cat = financeStore.categories.find((c) => c.id === tx.category_id)
    const id = cat?.id ?? 'other'
    const name = cat?.name ?? 'Otros'
    const current = map.get(id) ?? { id, name, amount: 0 }
    current.amount += tx.amount
    totalExpense += tx.amount
    map.set(id, current)
  }

  return Array.from(map.values())
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      share: totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0
    }))
})

const chartTextColor = computed(() => ($q.dark.isActive ? '#94a3b8' : '#64748b'))
const chartSplitLineColor = computed(() =>
  $q.dark.isActive ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'
)

const annualChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: $q.dark.isActive ? '#1e293b' : '#ffffff',
    borderColor: $q.dark.isActive ? '#334155' : '#e2e8f0',
    textStyle: { color: $q.dark.isActive ? '#f8fafc' : '#0f172a' }
  },
  legend: {
    bottom: 0,
    textStyle: { color: chartTextColor.value },
    data: ['Ingresos', 'Egresos', 'Balance Mensual']
  },
  grid: { top: 20, left: 12, right: 12, bottom: 38, containLabel: true },
  xAxis: {
    type: 'category',
    data: MONTHS_ES.map((m) => m.short),
    axisLabel: { color: chartTextColor.value }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: chartSplitLineColor.value } },
    axisLabel: { color: chartTextColor.value }
  },
  series: [
    {
      name: 'Ingresos',
      type: 'bar',
      barMaxWidth: 18,
      data: annualMonthlyBreakdown.value.incomes,
      itemStyle: { color: '#10B981', borderRadius: [5, 5, 0, 0] }
    },
    {
      name: 'Egresos',
      type: 'bar',
      barMaxWidth: 18,
      data: annualMonthlyBreakdown.value.expenses,
      itemStyle: { color: '#EF4444', borderRadius: [5, 5, 0, 0] }
    },
    {
      name: 'Balance Mensual',
      type: 'line',
      smooth: true,
      symbolSize: 7,
      data: annualMonthlyBreakdown.value.balances,
      itemStyle: { color: '#0D9488' },
      lineStyle: { width: 3 }
    }
  ]
}))

function exportFilteredCSV() {
  const list = financeStore.transactions.filter((tx) =>
    isDateInPeriod(tx.transaction_date, financeStore.periodFilter)
  )
  const csvContent = generateTransactionsCSV(
    list,
    financeStore.categories,
    financeStore.accounts
  )
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute(
    'download',
    `mi-presupuesto-${financeStore.periodFilter.year}-${String(financeStore.periodFilter.month).padStart(2, '0')}.csv`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: `Se exportaron ${list.length} movimiento(s) en formato CSV compatible con Excel.`
  })
}
</script>

<style scoped>
.echart-lg {
  height: 360px;
  width: 100%;
}
</style>
