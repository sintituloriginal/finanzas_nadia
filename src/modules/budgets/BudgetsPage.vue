<template>
  <q-page class="page-container">
    <AppPageHeader
      eyebrow="PLANIFICACIÓN DE GASTOS"
      :title="`Presupuestos Mensuales — ${periodLabel}`"
      subtitle="Monitorea tus límites de consumo por categoría con alertas automáticas."
    >
      <template #actions>
        <AppActionButton
          variant="outline"
          icon="content_copy"
          label="Copiar al mes siguiente"
          @click="handleCopyNextMonth"
        />
        <AppActionButton
          icon="add"
          label="Asignar presupuesto"
          @click="openBudgetDialog()"
        />
      </template>
    </AppPageHeader>

    <!-- KPIs de Resumen Presupuestario -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <AppStatCard
          title="Total Presupuestado"
          :value="formatCLP(financeStore.periodMetrics.budgetAssigned)"
          subtitle="Techo mensual planificado"
          icon="account_balance_wallet"
          color="#0D9488"
        />
      </div>
      <div class="col-12 col-sm-4">
        <AppStatCard
          title="Gasto Real Imputable"
          :value="formatCLP(financeStore.periodMetrics.budgetConsumed)"
          :subtitle="`${financeStore.periodMetrics.budgetConsumedPercentage.toFixed(1)}% del presupuesto total`"
          icon="south_east"
          color="#EF4444"
          value-class="text-negative"
        />
      </div>
      <div class="col-12 col-sm-4">
        <AppStatCard
          title="Margen Disponible"
          :value="formatCLP(financeStore.periodMetrics.budgetAssigned - financeStore.periodMetrics.budgetConsumed)"
          subtitle="Presupuesto asignado menos ejecutado"
          icon="pie_chart"
          color="#10B981"
          :value-class="
            financeStore.periodMetrics.budgetAssigned - financeStore.periodMetrics.budgetConsumed >= 0
              ? 'text-positive'
              : 'text-negative'
          "
        />
      </div>
    </div>

    <!-- Tarjetas de presupuesto por categoría -->
    <q-card v-if="financeStore.budgetSummaries.length === 0" flat class="fintech-card">
      <AppEmptyState
        icon="pie_chart"
        :title="`Sin presupuestos definidos para ${periodLabel}`"
        description="Asigna límites mensuales a tus categorías de gasto (ej: Alimentación $250.000, Transporte $120.000) para activar el semáforo de control."
      >
        <template #action>
          <AppActionButton icon="add" label="Crear primer presupuesto" @click="openBudgetDialog()" />
        </template>
      </AppEmptyState>
    </q-card>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="b in financeStore.budgetSummaries"
        :key="b.id"
        class="col-12 col-md-6"
      >
        <q-card flat class="fintech-card fintech-card--interactive full-height">
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="42px"
                  :style="{ backgroundColor: b.category_color + '18', color: b.category_color }"
                  class="q-mr-md"
                >
                  <q-icon :name="b.category_icon" size="22px" />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-bolder">{{ b.category_name }}</div>
                  <AppStatusBadge
                    :label="statusMeta(b.status).label"
                    :tone="statusMeta(b.status).tone"
                  />
                </div>
              </div>

              <div class="row items-center q-gutter-xs">
                <q-btn flat round dense size="sm" icon="edit" color="primary" @click="openBudgetDialog(b)">
                  <q-tooltip>Editar monto</q-tooltip>
                </q-btn>
                <q-btn flat round dense size="sm" icon="delete_outline" color="negative" @click="handleDelete(b)">
                  <q-tooltip>Eliminar presupuesto</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- Bloques de métricas del presupuesto -->
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-4">
                <div class="surface-subtle q-pa-sm">
                  <div class="text-caption text-muted">Presupuestado</div>
                  <div class="text-weight-bold font-mono text-body2">{{ formatCLP(b.amount) }}</div>
                </div>
              </div>
              <div class="col-4">
                <div class="surface-subtle q-pa-sm">
                  <div class="text-caption text-muted">Gastado</div>
                  <div class="text-weight-bold font-mono text-body2 text-negative">
                    {{ formatCLP(b.spent_amount) }}
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div class="surface-subtle q-pa-sm">
                  <div class="text-caption text-muted">
                    {{ b.available_amount >= 0 ? 'Disponible' : 'Excedido' }}
                  </div>
                  <div
                    class="text-weight-bold font-mono text-body2"
                    :class="b.available_amount >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ formatCLP(Math.abs(b.available_amount)) }}
                  </div>
                </div>
              </div>
            </div>

            <q-linear-progress
              :value="Math.min(1, b.percentage_used / 100)"
              rounded
              size="10px"
              :color="statusMeta(b.status).quasarColor"
              class="q-mb-xs"
            />

            <div class="row justify-between items-center text-caption text-muted q-mt-xs">
              <span>Progreso de ejecución mensual</span>
              <span class="font-mono text-weight-bold text-secondary-ink">
                {{ b.percentage_used.toFixed(1) }}% utilizado
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Modal Crear / Editar Presupuesto -->
    <q-dialog v-model="dialogOpen">
      <AppFormCard
        :title="editingId ? 'Editar presupuesto mensual' : 'Asignar presupuesto mensual'"
        :subtitle="`Período activo: ${periodLabel}`"
        icon="pie_chart"
      >
        <q-form @submit.prevent="saveForm" class="q-gutter-y-sm">
          <div>
            <label class="field-label">Categoría de gasto *</label>
            <q-select
              v-model="form.category_id"
              :options="financeStore.expenseCategories"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              outlined
              dense
              options-dense
              :rules="[(val) => Boolean(val) || 'Selecciona una categoría']"
            />
          </div>
          <div>
            <label class="field-label">Monto presupuestado mensual (CLP) *</label>
            <AppCurrencyInput
              v-model="form.amount"
              :rules="[(val) => Number(val) > 0 || 'Ingresa un monto mayor a $0']"
            />
          </div>
          <div class="modal-footer q-pt-xs">
            <AppActionButton
              variant="ghost"
              label="Cancelar"
              v-close-popup
              class="modal-btn modal-btn-cancel"
            />
            <AppActionButton
              type="submit"
              icon="check"
              label="Guardar presupuesto"
              class="modal-btn modal-btn-save"
            />
          </div>
        </q-form>
      </AppFormCard>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '@/stores/finance'
import { formatCLP, getMonthName } from '@/utils/format'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppStatCard from '@/components/common/AppStatCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppFormCard from '@/components/common/AppFormCard.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import AppCurrencyInput from '@/components/common/AppCurrencyInput.vue'
import type { BudgetStatus, BudgetSummary } from '@/types/finance'

const $q = useQuasar()
const financeStore = useFinanceStore()

const dialogOpen = ref(false)
const editingId = ref<string | undefined>(undefined)
const form = reactive({
  category_id: '',
  amount: 150000
})

const activeMonth = computed(() =>
  financeStore.periodFilter.month === 0 ? new Date().getMonth() + 1 : financeStore.periodFilter.month
)

const periodLabel = computed(
  () => `${getMonthName(activeMonth.value)} ${financeStore.periodFilter.year}`
)

function statusMeta(status: BudgetStatus): {
  label: string
  tone: 'success' | 'warning' | 'danger' | 'info'
  quasarColor: string
} {
  switch (status) {
    case 'normal':
      return { label: 'Normal (< 80%)', tone: 'success', quasarColor: 'positive' }
    case 'warning':
      return { label: 'Advertencia (80% - 99%)', tone: 'warning', quasarColor: 'warning' }
    case 'reached':
      return { label: 'Alcanzado (100%)', tone: 'warning', quasarColor: 'deep-orange' }
    case 'exceeded':
      return { label: 'Excedido (> 100%)', tone: 'danger', quasarColor: 'negative' }
  }
}

function openBudgetDialog(item?: BudgetSummary) {
  if (item) {
    editingId.value = item.id
    form.category_id = item.category_id
    form.amount = item.amount
  } else {
    editingId.value = undefined
    form.category_id = financeStore.expenseCategories[0]?.id ?? ''
    form.amount = 150000
  }
  dialogOpen.value = true
}

async function saveForm() {
  try {
    await financeStore.saveBudget({
      id: editingId.value,
      category_id: form.category_id,
      month: activeMonth.value,
      year: financeStore.periodFilter.year,
      amount: form.amount
    })
    dialogOpen.value = false
    $q.notify({ type: 'positive', message: 'Presupuesto guardado correctamente' })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al guardar presupuesto'
    })
  }
}

function handleDelete(item: BudgetSummary) {
  $q.dialog({
    title: 'Eliminar presupuesto',
    message: `¿Eliminar el presupuesto de "${item.category_name}"?`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, noCaps: true }
  }).onOk(async () => {
    await financeStore.deleteBudget(item.id)
    $q.notify({ type: 'positive', message: 'Presupuesto eliminado' })
  })
}

async function handleCopyNextMonth() {
  const count = await financeStore.copyBudgetsToNextMonth(
    activeMonth.value,
    financeStore.periodFilter.year
  )
  $q.notify({
    type: count > 0 ? 'positive' : 'info',
    message:
      count > 0
        ? `Se copiaron ${count} presupuesto(s) al mes siguiente.`
        : 'Todos los presupuestos ya existen en el mes siguiente.'
  })
}
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}

:deep(.modal-btn) {
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 10px !important;
  font-size: 0.86rem !important;
  font-weight: 600 !important;
}

:deep(.modal-btn .q-icon) {
  font-size: 16px !important;
  margin-right: 4px !important;
}

:deep(.modal-btn-cancel) {
  padding: 0 12px !important;
  color: var(--text-secondary) !important;
}

:deep(.modal-btn-save) {
  padding: 0 16px !important;
}

@media (max-width: 380px) {
  .modal-footer {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 8px;
  }
}
</style>