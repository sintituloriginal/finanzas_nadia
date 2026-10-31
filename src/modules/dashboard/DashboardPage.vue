<template>
  <q-page class="page-container">
    <!-- Encabezado ejecutivo -->
    <AppPageHeader
      eyebrow="RESUMEN EJECUTIVO"
      :title="`Panorama Financiero — ${periodTitle}`"
      subtitle="Métricas en tiempo real basadas en tus movimientos confirmados en CLP."
    >
      <template #actions>
        <AppActionButton
          variant="outline"
          icon="account_balance"
          label="Cuentas"
          to="/categorias"
        />
        <AppActionButton
          icon="add"
          label="Nuevo movimiento"
          @click="financeStore.quickTransactionDialogOpen = true"
        />
      </template>
    </AppPageHeader>

    <!-- Nota contable elegante -->
    <div class="fintech-card q-pa-md q-mb-lg row items-center justify-between q-col-gutter-sm">
      <div class="col-12 col-md-auto row items-center no-wrap">
        <div class="note-badge q-mr-md">
          <q-icon name="account_balance_wallet" size="20px" color="primary" />
        </div>
        <div class="text-body2 text-secondary-ink">
          El <strong>Balance Neto del Mes</strong> mide el flujo de {{ periodTitle }} (Ingresos menos Egresos).
          Tu <strong>Saldo Total Disponible en Cuentas</strong> es
          <span class="font-mono text-weight-bolder text-primary">{{ formatCLP(financeStore.totalNetWorth) }}</span>.
        </div>
      </div>
      <div class="col-12 col-md-auto">
        <AppStatusBadge
          :label="`${financeStore.activeAccounts.length} cuentas activas`"
          tone="info"
          icon="check_circle"
        />
      </div>
    </div>

    <!-- SKELETON LOADERS MIENTRAS CARGA -->
    <div v-if="financeStore.loading" class="row q-col-gutter-md q-mb-lg">
      <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-md-3">
        <q-card flat class="fintech-card q-pa-md">
          <q-skeleton type="text" width="50%" class="q-mb-sm" />
          <q-skeleton type="rect" height="32px" class="q-mb-sm" />
          <q-skeleton type="text" width="75%" />
        </q-card>
      </div>
    </div>

    <!-- BLOQUE DE KPIs PRINCIPALES (Balance Neto protagonista + 7 indicadores) -->
    <div v-else class="row q-col-gutter-md q-mb-lg">
      <div
        v-for="kpi in kpiCards"
        :key="kpi.title"
        class="col-12 col-sm-6 col-md-3"
      >
        <AppStatCard
          :title="kpi.title"
          :value="kpi.value"
          :subtitle="kpi.subtitle"
          :icon="kpi.icon"
          :color="kpi.color"
          :value-class="kpi.valueClass"
          :featured="kpi.featured"
        />
      </div>
    </div>

    <!-- ALERTAS DE PRESUPUESTO CERCANO AL LÍMITE O EXCEDIDO -->
    <div v-if="budgetAlerts.length > 0" class="q-mb-lg">
      <AppSectionCard
        title="Alertas de Presupuesto"
        :subtitle="`Categorías con consumo igual o superior al 80% en ${periodTitle}`"
        icon="notifications_active"
      >
        <div class="row q-col-gutter-md">
          <div
            v-for="alert in budgetAlerts"
            :key="alert.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <div class="border-subtle surface-subtle q-pa-md row items-center justify-between no-wrap">
              <div>
                <div class="text-weight-bold text-body2 q-mb-xs">{{ alert.category_name }}</div>
                <div class="text-caption text-muted font-mono">
                  {{ formatCLP(alert.spent_amount) }} / {{ formatCLP(alert.amount) }}
                </div>
              </div>
              <AppStatusBadge
                :label="`${alert.percentage_used.toFixed(0)}%`"
                :tone="alert.status === 'exceeded' ? 'danger' : 'warning'"
              />
            </div>
          </div>
        </div>
      </AppSectionCard>
    </div>

    <!-- GRÁFICOS PRINCIPALES -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Flujo de Caja y Evolución del Balance -->
      <div class="col-12 col-lg-7">
        <AppSectionCard
          title="Flujo de Caja y Evolución del Balance"
          subtitle="Comparativa de Ingresos, Egresos y Balance Neto en los últimos 6 meses"
          icon="timeline"
          full-height
        >
          <v-chart class="echart-box" :option="monthlyTrendOption" autoresize />
        </AppSectionCard>
      </div>

      <!-- Distribución de Gastos por Categoría -->
      <div class="col-12 col-lg-5">
        <AppSectionCard
          title="Distribución de Gastos por Categoría"
          :subtitle="`Desglose porcentual en ${periodTitle}`"
          icon="donut_large"
          full-height
        >
          <AppEmptyState
            v-if="categoryExpenseBreakdown.length === 0"
            icon="donut_large"
            title="Sin egresos en este período"
            description="Cuando registres gastos confirmados verás aquí su distribución por categoría."
          />
          <v-chart v-else class="echart-box" :option="categoryPieOption" autoresize />
        </AppSectionCard>
      </div>
    </div>

    <!-- SEGUNDA FILA: Ejecución Presupuestaria y Metas de Ahorro -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <AppSectionCard
          title="Presupuestos: Consumido vs Asignado"
          subtitle="Control de techo de gasto por categoría"
          icon="pie_chart"
          full-height
        >
          <template #actions>
            <AppActionButton variant="ghost" size="sm" label="Ver todos" to="/presupuestos" />
          </template>

          <AppEmptyState
            v-if="financeStore.budgetSummaries.length === 0"
            icon="pie_chart_outline"
            title="Sin presupuestos configurados"
            description="Define límites mensuales por categoría para monitorear tu margen disponible."
          >
            <template #action>
              <AppActionButton variant="outline" size="sm" label="Configurar presupuestos" to="/presupuestos" />
            </template>
          </AppEmptyState>
          <v-chart v-else class="echart-box-sm" :option="budgetBarOption" autoresize />
        </AppSectionCard>
      </div>

      <div class="col-12 col-md-6">
        <AppSectionCard
          title="Metas de Ahorro Activas"
          subtitle="Progreso acumulado hacia tus objetivos financieros"
          icon="savings"
          full-height
        >
          <template #actions>
            <AppActionButton variant="ghost" size="sm" label="Gestionar metas" to="/ahorros" />
          </template>

          <AppEmptyState
            v-if="financeStore.savingsGoals.length === 0"
            icon="savings"
            title="Sin metas de ahorro"
            description="Crea tu primera meta para separar reservas patrimoniales de tus gastos."
          />
          <div v-else class="q-gutter-y-md">
            <div
              v-for="goal in financeStore.savingsGoals.slice(0, 4)"
              :key="goal.id"
              class="border-subtle q-pa-md"
            >
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="30px"
                    :style="{ backgroundColor: goal.color + '18', color: goal.color }"
                    class="q-mr-sm"
                  >
                    <q-icon :name="goal.icon" size="16px" />
                  </q-avatar>
                  <div>
                    <div class="text-weight-bold text-body2">{{ goal.name }}</div>
                    <div class="text-caption text-muted">
                      {{ ((goal.current_amount / Math.max(1, goal.target_amount)) * 100).toFixed(0) }}% completado
                    </div>
                  </div>
                </div>
                <div class="text-right font-mono">
                  <div class="text-weight-bolder text-body2">{{ formatCLP(goal.current_amount) }}</div>
                  <div class="text-caption text-muted">de {{ formatCLP(goal.target_amount) }}</div>
                </div>
              </div>
              <q-linear-progress
                :value="Math.min(1, goal.current_amount / Math.max(1, goal.target_amount))"
                rounded
                size="8px"
                :style="{ color: goal.color }"
                class="q-mt-xs"
              />
            </div>
          </div>
        </AppSectionCard>
      </div>
    </div>

    <!-- ÚLTIMOS MOVIMIENTOS DEL PERÍODO -->
    <AppSectionCard
      title="Últimos Movimientos del Período"
      :subtitle="`Actividad reciente registrada en ${periodTitle}`"
      icon="receipt_long"
      no-padding
      bordered-header
    >
      <template #actions>
        <AppActionButton
          variant="ghost"
          size="sm"
          label="Ver historial"
          icon="arrow_forward"
          to="/movimientos"
        />
      </template>

      <AppEmptyState
        v-if="recentPeriodTransactions.length === 0"
        icon="receipt_long"
        :title="`Sin movimientos en ${periodTitle}`"
        description="Registra tu primer ingreso, gasto o transferencia para visualizar tu actividad."
      >
        <template #action>
          <AppActionButton
            icon="add"
            label="Registrar movimiento"
            @click="financeStore.quickTransactionDialogOpen = true"
          />
        </template>
      </AppEmptyState>

      <q-list v-else separator>
        <q-item
          v-for="tx in recentPeriodTransactions"
          :key="tx.id"
          class="q-px-lg q-py-md"
        >
          <q-item-section avatar>
            <q-avatar
              size="40px"
              :style="{
                backgroundColor: getTxColor(tx) + '16',
                color: getTxColor(tx)
              }"
            >
              <q-icon :name="getTxIcon(tx)" size="20px" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <div class="row items-center q-gutter-x-sm">
              <span class="text-weight-bold text-body2">{{ tx.description }}</span>
              <AppStatusBadge
                v-if="tx.status === 'pending'"
                label="Pendiente"
                tone="warning"
              />
            </div>
            <q-item-label caption class="text-muted q-mt-xs">
              {{ formatDateCL(tx.transaction_date) }} • {{ getCategoryOrTransferLabel(tx) }} •
              {{ getAccountName(tx.account_id) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div
              class="text-subtitle1 text-weight-bolder font-mono"
              :class="{
                'text-positive': tx.type === 'income',
                'text-negative': tx.type === 'expense',
                'text-primary': tx.type === 'transfer'
              }"
            >
              {{ tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '⇄ ' }}{{ formatCLP(tx.amount) }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </AppSectionCard>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components'
import { useFinanceStore } from '@/stores/finance'
import { isDateInPeriod } from '@/utils/finance'
import {
  formatCLP,
  formatDateCL,
  formatPercentage,
  getMonthName,
  MONTHS_ES
} from '@/utils/format'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppStatCard from '@/components/common/AppStatCard.vue'
import AppSectionCard from '@/components/common/AppSectionCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import type { Transaction } from '@/types/finance'

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const $q = useQuasar()
const financeStore = useFinanceStore()

const periodTitle = computed(() => {
  const { month, year } = financeStore.periodFilter
  return `${getMonthName(month)} ${year}`
})

const kpiCards = computed(() => {
  const m = financeStore.periodMetrics
  const varText =
    m.expenseVariationPercentage === null
      ? 'Sin base en el mes anterior'
      : `${m.expenseVariationPercentage > 0 ? '+' : ''}${formatPercentage(m.expenseVariationPercentage)} vs mes previo`

  return [
    {
      title: 'Balance Neto del Mes',
      value: formatCLP(m.netBalance),
      subtitle: 'Ingresos menos egresos confirmados',
      icon: 'account_balance_wallet',
      color: '#0D9488',
      valueClass: '',
      featured: true
    },
    {
      title: 'Ingresos del Período',
      value: formatCLP(m.income),
      subtitle: m.pendingIncome > 0 ? `+ ${formatCLP(m.pendingIncome)} pendientes` : 'Ingresos confirmados',
      icon: 'north_east',
      color: '#10B981',
      valueClass: 'text-positive',
      featured: false
    },
    {
      title: 'Egresos del Período',
      value: formatCLP(m.expenses),
      subtitle: m.pendingExpenses > 0 ? `+ ${formatCLP(m.pendingExpenses)} pendientes` : 'Gastos reales confirmados',
      icon: 'south_east',
      color: '#EF4444',
      valueClass: 'text-negative',
      featured: false
    },
    {
      title: 'Disponible Estimado',
      value: formatCLP(m.estimatedAvailableBalance),
      subtitle: 'Balance neto menos ahorro del mes',
      icon: 'payments',
      color: '#3B82F6',
      valueClass: m.estimatedAvailableBalance >= 0 ? '' : 'text-negative',
      featured: false
    },
    {
      title: 'Ahorro del Mes',
      value: formatCLP(m.netSavings),
      subtitle: 'Aportes netos a metas (no es gasto)',
      icon: 'savings',
      color: '#0D9488',
      valueClass: 'text-primary',
      featured: false
    },
    {
      title: 'Tasa de Ahorro',
      value: formatPercentage(m.savingsRatePercentage),
      subtitle: 'Porcentaje sobre ingresos del mes',
      icon: 'percent',
      color: '#10B981',
      valueClass: '',
      featured: false
    },
    {
      title: 'Presupuesto Consumido',
      value: formatPercentage(m.budgetConsumedPercentage),
      subtitle: `${formatCLP(m.budgetConsumed)} de ${formatCLP(m.budgetAssigned)}`,
      icon: 'pie_chart',
      color: m.budgetConsumedPercentage > 100 ? '#EF4444' : '#4F46E5',
      valueClass: m.budgetConsumedPercentage > 100 ? 'text-negative' : '',
      featured: false
    },
    {
      title: 'Variación Mensual Gasto',
      value:
        m.expenseVariationPercentage === null
          ? 'N/A'
          : `${m.expenseVariationPercentage > 0 ? '+' : ''}${formatPercentage(m.expenseVariationPercentage)}`,
      subtitle: varText,
      icon: 'timeline',
      color: '#F59E0B',
      valueClass:
        m.expenseVariationPercentage !== null && m.expenseVariationPercentage > 0
          ? 'text-negative'
          : 'text-positive',
      featured: false
    }
  ]
})

const budgetAlerts = computed(() =>
  financeStore.budgetSummaries.filter(
    (b) => b.status === 'warning' || b.status === 'reached' || b.status === 'exceeded'
  )
)

const categoryExpenseBreakdown = computed(() => {
  const map = new Map<string, { name: string; value: number; color: string }>()
  for (const tx of financeStore.transactions) {
    if (
      tx.status !== 'confirmed' ||
      tx.type !== 'expense' ||
      !isDateInPeriod(tx.transaction_date, financeStore.periodFilter)
    ) {
      continue
    }
    const cat = financeStore.categories.find((c) => c.id === tx.category_id)
    const key = cat?.id ?? 'other'
    const current = map.get(key) ?? {
      name: cat?.name ?? 'Otros',
      value: 0,
      color: cat?.color ?? '#64748B'
    }
    current.value += Math.round(Number(tx.amount) || 0)
    map.set(key, current)
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value)
})

const lastSixMonthsSeries = computed(() => {
  const baseMonth = financeStore.periodFilter.month || new Date().getMonth() + 1
  const baseYear = financeStore.periodFilter.year

  const labels: string[] = []
  const incomes: number[] = []
  const expenses: number[] = []
  const balances: number[] = []

  for (let i = 5; i >= 0; i--) {
    let m = baseMonth - i
    let y = baseYear
    while (m <= 0) {
      m += 12
      y -= 1
    }
    const shortName = MONTHS_ES.find((item) => item.value === m)?.short ?? ''
    labels.push(`${shortName} ${String(y).slice(-2)}`)

    let inc = 0
    let exp = 0
    for (const tx of financeStore.transactions) {
      if (tx.status !== 'confirmed') continue
      if (isDateInPeriod(tx.transaction_date, { month: m, year: y })) {
        if (tx.type === 'income') inc += tx.amount
        else if (tx.type === 'expense') exp += tx.amount
      }
    }
    incomes.push(inc)
    expenses.push(exp)
    balances.push(inc - exp)
  }

  return { labels, incomes, expenses, balances }
})

const chartTextColor = computed(() => ($q.dark.isActive ? '#94a3b8' : '#64748b'))
const chartSplitLineColor = computed(() =>
  $q.dark.isActive ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'
)

const monthlyTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: $q.dark.isActive ? '#1e293b' : '#ffffff',
    borderColor: $q.dark.isActive ? '#334155' : '#e2e8f0',
    textStyle: { color: $q.dark.isActive ? '#f8fafc' : '#0f172a' }
  },
  legend: {
    bottom: 0,
    textStyle: { color: chartTextColor.value },
    data: ['Ingresos', 'Egresos', 'Balance Neto']
  },
  grid: {
    top: 16,
    left: 12,
    right: 12,
    bottom: 36,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: lastSixMonthsSeries.value.labels,
    axisLine: { lineStyle: { color: chartSplitLineColor.value } },
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
      barMaxWidth: 22,
      data: lastSixMonthsSeries.value.incomes,
      itemStyle: { color: '#10B981', borderRadius: [6, 6, 0, 0] }
    },
    {
      name: 'Egresos',
      type: 'bar',
      barMaxWidth: 22,
      data: lastSixMonthsSeries.value.expenses,
      itemStyle: { color: '#EF4444', borderRadius: [6, 6, 0, 0] }
    },
    {
      name: 'Balance Neto',
      type: 'line',
      smooth: true,
      symbolSize: 7,
      data: lastSixMonthsSeries.value.balances,
      itemStyle: { color: '#0D9488' },
      lineStyle: { width: 3 }
    }
  ]
}))

const categoryPieOption = computed(() => ({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: 0,
    type: 'scroll',
    textStyle: { color: chartTextColor.value }
  },
  series: [
    {
      name: 'Gastos por Categoría',
      type: 'pie',
      radius: ['46%', '72%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: $q.dark.isActive ? '#111827' : '#ffffff',
        borderWidth: 2
      },
      data: categoryExpenseBreakdown.value.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: item.color }
      }))
    }
  ]
}))

const budgetBarOption = computed(() => {
  const summaries = financeStore.budgetSummaries
  return {
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 0,
      textStyle: { color: chartTextColor.value },
      data: ['Consumido', 'Presupuestado']
    },
    grid: { top: 15, left: 12, right: 12, bottom: 36, containLabel: true },
    xAxis: {
      type: 'category',
      data: summaries.map((s) => s.category_name),
      axisLabel: { color: chartTextColor.value }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: chartSplitLineColor.value } },
      axisLabel: { color: chartTextColor.value }
    },
    series: [
      {
        name: 'Consumido',
        type: 'bar',
        barMaxWidth: 20,
        data: summaries.map((s) => s.spent_amount),
        itemStyle: { color: '#0D9488', borderRadius: [5, 5, 0, 0] }
      },
      {
        name: 'Presupuestado',
        type: 'bar',
        barMaxWidth: 20,
        data: summaries.map((s) => s.amount),
        itemStyle: { color: '#94A3B8', borderRadius: [5, 5, 0, 0] }
      }
    ]
  }
})

const recentPeriodTransactions = computed(() =>
  financeStore.transactions
    .filter((tx) => isDateInPeriod(tx.transaction_date, financeStore.periodFilter))
    .slice(0, 8)
)

function getTxIcon(tx: Transaction): string {
  if (tx.type === 'transfer') return 'swap_horiz'
  const cat = financeStore.categories.find((c) => c.id === tx.category_id)
  return cat?.icon ?? (tx.type === 'income' ? 'north_east' : 'south_east')
}

function getTxColor(tx: Transaction): string {
  if (tx.type === 'transfer') return '#3B82F6'
  const cat = financeStore.categories.find((c) => c.id === tx.category_id)
  return cat?.color ?? (tx.type === 'income' ? '#10B981' : '#EF4444')
}

function getCategoryOrTransferLabel(tx: Transaction): string {
  if (tx.type === 'transfer') return 'Transferencia interna'
  return financeStore.categories.find((c) => c.id === tx.category_id)?.name ?? 'Sin categoría'
}

function getAccountName(accountId: string): string {
  return financeStore.accounts.find((a) => a.id === accountId)?.name ?? 'Cuenta'
}
</script>

<style scoped>
.note-badge {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background-color: var(--brand-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.echart-box {
  height: 310px;
  width: 100%;
}
.echart-box-sm {
  height: 260px;
  width: 100%;
}
</style>
