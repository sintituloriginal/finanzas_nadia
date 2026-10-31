<template>
  <q-page class="page-container">
    <AppPageHeader
      eyebrow="CRECIMIENTO PATRIMONIAL"
      title="Metas de Ahorro"
      subtitle="Tus aportes construyen reservas financieras y no se contabilizan como gastos de consumo."
    >
      <template #actions>
        <AppActionButton
          icon="add"
          label="Nueva meta de ahorro"
          @click="openGoalDialog()"
        />
      </template>
    </AppPageHeader>

    <!-- Tarjetas de metas de ahorro -->
    <q-card v-if="goalsWithProjection.length === 0" flat class="fintech-card q-mb-xl">
      <AppEmptyState
        icon="savings"
        title="Aún no tienes metas de ahorro"
        description="Define tu primer objetivo (Fondo de emergencia, viaje, instrumento musical) y monitorea tu ritmo mensual."
      >
        <template #action>
          <AppActionButton icon="add" label="Crear primera meta" @click="openGoalDialog()" />
        </template>
      </AppEmptyState>
    </q-card>

    <div v-else class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="goal in goalsWithProjection"
        :key="goal.id"
        class="col-12 col-md-4"
      >
        <q-card flat class="fintech-card fintech-card--interactive full-height column justify-between">
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between q-mb-md">
              <q-avatar
                size="42px"
                :style="{ backgroundColor: goal.color + '18', color: goal.color }"
              >
                <q-icon :name="goal.icon" size="22px" />
              </q-avatar>
              <div class="row items-center q-gutter-xs">
                <AppStatusBadge
                  :label="goal.status === 'completed' ? 'Completada' : 'En curso'"
                  :tone="goal.status === 'completed' ? 'success' : 'info'"
                />
                <q-btn flat round dense size="sm" icon="edit" class="text-muted" @click="openGoalDialog(goal)" />
                <q-btn flat round dense size="sm" icon="delete_outline" color="negative" @click="confirmDeleteGoal(goal)" />
              </div>
            </div>

            <div class="text-subtitle1 text-weight-bolder">{{ goal.name }}</div>
            <div class="text-caption text-muted q-mb-md">
              {{ goal.description || 'Meta de ahorro personal' }}
            </div>

            <div class="surface-subtle q-pa-md q-mb-md">
              <div class="row justify-between items-baseline q-mb-xs font-mono">
                <span class="text-h5 text-weight-bolder text-primary">
                  {{ formatCLP(goal.current_amount) }}
                </span>
                <span class="text-caption text-muted">
                  de {{ formatCLP(goal.target_amount) }}
                </span>
              </div>

              <q-linear-progress
                :value="Math.min(1, goal.percentage / 100)"
                rounded
                size="10px"
                :style="{ color: goal.color }"
                class="q-my-sm"
              />

              <div class="row justify-between text-caption">
                <span class="text-weight-bold">{{ goal.percentage.toFixed(1) }}% completado</span>
                <span class="font-mono text-muted">Faltan {{ formatCLP(goal.projection.remainingAmount) }}</span>
              </div>
            </div>

            <div class="row items-center justify-between text-caption text-muted q-mb-xs" v-if="goal.target_date">
              <span>Fecha objetivo:</span>
              <span class="font-mono text-weight-semibold">{{ formatDateCL(goal.target_date) }}</span>
            </div>

            <div class="border-subtle q-pa-sm text-caption">
              <div v-if="goal.projection.estimatedMonths === 0" class="text-positive text-weight-bold row items-center">
                <q-icon name="verified" size="16px" class="q-mr-xs" />
                ¡Objetivo alcanzado al 100%!
              </div>
              <div v-else-if="goal.projection.estimatedMonths !== null" class="text-secondary-ink">
                Ritmo promedio ({{ formatCLP(goal.projection.averageMonthlyNet) }}/mes):
                <strong>~{{ goal.projection.estimatedMonths }} mes(es)</strong> para la meta.
              </div>
              <div v-else class="text-muted">
                Registra aportes para proyectar la fecha estimada de término.
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-px-lg q-pb-lg q-pt-none row q-gutter-sm">
            <AppActionButton
              icon="add_circle"
              label="Registrar aporte"
              size="sm"
              class="col"
              @click="openContributionDialog(goal, 'deposit')"
            />
            <AppActionButton
              variant="outline"
              icon="remove_circle_outline"
              label="Retiro"
              size="sm"
              @click="openContributionDialog(goal, 'withdrawal')"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Historial de Aportes y Retiros -->
    <AppSectionCard
      title="Historial de Aportes y Retiros"
      subtitle="Movimientos de ahorro con trazabilidad hacia tus cuentas financieras"
      icon="history"
      no-padding
      bordered-header
    >
      <AppEmptyState
        v-if="financeStore.savingsContributions.length === 0"
        icon="history"
        title="Sin aportes registrados"
        description="Aquí aparecerán todos tus aportes y retiros históricos."
      />
      <q-list v-else separator>
        <q-item
          v-for="c in financeStore.savingsContributions"
          :key="c.id"
          class="q-px-lg q-py-md"
        >
          <q-item-section avatar>
            <q-avatar
              size="38px"
              :style="{
                backgroundColor: c.type === 'deposit' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.15)',
                color: c.type === 'deposit' ? '#10B981' : '#F59E0B'
              }"
            >
              <q-icon :name="c.type === 'deposit' ? 'south_west' : 'north_east'" size="18px" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <div class="row items-center q-gutter-x-sm">
              <span class="text-weight-bold text-body2">{{ getGoalName(c.goal_id) }}</span>
              <AppStatusBadge
                :label="c.type === 'deposit' ? 'Aporte' : 'Retiro'"
                :tone="c.type === 'deposit' ? 'success' : 'warning'"
              />
            </div>
            <q-item-label caption class="text-muted q-mt-xs">
              {{ formatDateCL(c.contribution_date) }}
              <span v-if="c.notes"> • {{ c.notes }}</span>
            </q-item-label>
          </q-item-section>
          <q-item-section side class="font-mono text-weight-bolder text-subtitle1">
            <span :class="c.type === 'deposit' ? 'text-positive' : 'text-warning'">
              {{ c.type === 'deposit' ? '+' : '-' }}{{ formatCLP(c.amount) }}
            </span>
          </q-item-section>
        </q-item>
      </q-list>
    </AppSectionCard>

    <!-- MODAL CREAR / EDITAR META -->
    <q-dialog v-model="goalDialogOpen">
      <AppFormCard
        :title="editingGoalId ? 'Editar meta de ahorro' : 'Nueva meta de ahorro'"
        subtitle="Define tu objetivo y la cuenta donde se custodiarán los fondos"
        icon="savings"
      >
        <q-form @submit.prevent="saveGoalForm" class="q-gutter-y-md">
          <div>
            <label class="field-label">Nombre de la meta *</label>
            <q-input
              v-model="goalForm.name"
              outlined
              dense
              placeholder="Ej: Fondo de emergencia, Viaje, Instrumento musical"
              :rules="[(val) => Boolean(val && val.trim()) || 'Nombre obligatorio']"
            />
          </div>
          <div>
            <label class="field-label">Descripción</label>
            <q-input
              v-model="goalForm.description"
              outlined
              dense
              placeholder="Propósito u objetivo del ahorro"
            />
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <label class="field-label">Monto objetivo (CLP) *</label>
              <q-input
                v-model.number="goalForm.target_amount"
                type="number"
                outlined
                dense
                prefix="$"
                :rules="[(val) => Number(val) > 0 || 'Mayor a $0']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <label class="field-label">Fecha objetivo (opcional)</label>
              <q-input
                v-model="goalForm.target_date"
                type="date"
                outlined
                dense
              />
            </div>
          </div>
          <div>
            <label class="field-label">Cuenta donde se custodia el ahorro</label>
            <q-select
              v-model="goalForm.linked_account_id"
              :options="financeStore.activeAccounts"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              outlined
              dense
              clearable
            />
          </div>
          <div class="row justify-end q-gutter-sm q-pt-sm">
            <AppActionButton variant="ghost" label="Cancelar" v-close-popup />
            <AppActionButton type="submit" icon="check" label="Guardar meta" />
          </div>
        </q-form>
      </AppFormCard>
    </q-dialog>

    <!-- MODAL APORTE / RETIRO -->
    <q-dialog v-model="contribDialogOpen">
      <AppFormCard
        :title="contribForm.type === 'deposit' ? 'Registrar aporte a meta' : 'Registrar retiro de meta'"
        :subtitle="`Meta seleccionada: ${selectedGoalForContrib?.name ?? ''}`"
        :icon="contribForm.type === 'deposit' ? 'add_circle' : 'remove_circle_outline'"
      >
        <q-form @submit.prevent="saveContributionForm" class="q-gutter-y-md">
          <div>
            <label class="field-label">Monto (CLP) *</label>
            <q-input
              v-model.number="contribForm.amount"
              type="number"
              outlined
              prefix="$"
              input-class="text-h6 text-weight-bold font-mono"
              :rules="[(val) => Number(val) > 0 || 'Ingresa un monto mayor a $0']"
            />
          </div>
          <div>
            <label class="field-label">
              {{ contribForm.type === 'deposit' ? 'Cuenta origen de los fondos' : 'Cuenta destino del retiro' }}
            </label>
            <q-select
              v-model="contribForm.source_account_id"
              :options="financeStore.activeAccounts"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              outlined
              dense
            />
          </div>
          <div class="surface-subtle q-pa-sm rounded-borders">
            <q-checkbox
              v-model="contribForm.create_internal_transfer"
              dense
              label="Generar transferencia interna hacia/desde la cuenta vinculada a la meta (sin contarse como gasto)"
            />
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-5">
              <label class="field-label">Fecha *</label>
              <q-input
                v-model="contribForm.contribution_date"
                type="date"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-7">
              <label class="field-label">Nota u observación</label>
              <q-input
                v-model="contribForm.notes"
                outlined
                dense
                placeholder="Ej: Aporte mensual"
              />
            </div>
          </div>
          <div class="row justify-end q-gutter-sm q-pt-sm">
            <AppActionButton variant="ghost" label="Cancelar" v-close-popup />
            <AppActionButton type="submit" icon="check" label="Confirmar operación" />
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
import { estimateMonthsToGoal } from '@/utils/finance'
import { formatCLP, formatDateCL, getTodayISO } from '@/utils/format'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSectionCard from '@/components/common/AppSectionCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppFormCard from '@/components/common/AppFormCard.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import type { SavingsGoal } from '@/types/finance'

const $q = useQuasar()
const financeStore = useFinanceStore()

const goalsWithProjection = computed(() =>
  financeStore.savingsGoals.map((goal) => {
    const percentage =
      goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
    const projection = estimateMonthsToGoal(goal, financeStore.savingsContributions)
    return {
      ...goal,
      percentage,
      projection
    }
  })
)

function getGoalName(goalId: string): string {
  return financeStore.savingsGoals.find((g) => g.id === goalId)?.name ?? 'Meta'
}

const goalDialogOpen = ref(false)
const editingGoalId = ref<string | undefined>(undefined)
const goalForm = reactive({
  name: '',
  description: '',
  target_amount: 1000000,
  target_date: '',
  color: '#0D9488',
  icon: 'savings',
  linked_account_id: null as string | null
})

function openGoalDialog(goal?: SavingsGoal) {
  if (goal) {
    editingGoalId.value = goal.id
    goalForm.name = goal.name
    goalForm.description = goal.description ?? ''
    goalForm.target_amount = goal.target_amount
    goalForm.target_date = goal.target_date ?? ''
    goalForm.color = goal.color
    goalForm.icon = goal.icon
    goalForm.linked_account_id = goal.linked_account_id
  } else {
    editingGoalId.value = undefined
    goalForm.name = ''
    goalForm.description = ''
    goalForm.target_amount = 1000000
    goalForm.target_date = ''
    goalForm.color = '#0D9488'
    goalForm.icon = 'savings'
    goalForm.linked_account_id =
      financeStore.activeAccounts.find((a) => a.type === 'savings')?.id ??
      financeStore.activeAccounts[0]?.id ??
      null
  }
  goalDialogOpen.value = true
}

async function saveGoalForm() {
  try {
    await financeStore.saveSavingsGoal({
      id: editingGoalId.value,
      name: goalForm.name,
      description: goalForm.description || null,
      target_amount: goalForm.target_amount,
      target_date: goalForm.target_date || null,
      color: goalForm.color,
      icon: goalForm.icon,
      linked_account_id: goalForm.linked_account_id
    })
    goalDialogOpen.value = false
    $q.notify({ type: 'positive', message: 'Meta de ahorro guardada' })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al guardar meta'
    })
  }
}

function confirmDeleteGoal(goal: SavingsGoal) {
  $q.dialog({
    title: 'Eliminar meta de ahorro',
    message: `¿Eliminar la meta "${goal.name}"?`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, noCaps: true }
  }).onOk(async () => {
    await financeStore.deleteSavingsGoal(goal.id)
    $q.notify({ type: 'positive', message: 'Meta eliminada' })
  })
}

const contribDialogOpen = ref(false)
const selectedGoalForContrib = ref<SavingsGoal | null>(null)
const contribForm = reactive({
  type: 'deposit' as 'deposit' | 'withdrawal',
  amount: 50000,
  source_account_id: '' as string | null,
  create_internal_transfer: true,
  contribution_date: getTodayISO(),
  notes: ''
})

function openContributionDialog(goal: SavingsGoal, type: 'deposit' | 'withdrawal') {
  selectedGoalForContrib.value = goal
  contribForm.type = type
  contribForm.amount = 50000
  contribForm.source_account_id = financeStore.activeAccounts[0]?.id ?? null
  contribForm.create_internal_transfer = true
  contribForm.contribution_date = getTodayISO()
  contribForm.notes = ''
  contribDialogOpen.value = true
}

async function saveContributionForm() {
  if (!selectedGoalForContrib.value) return
  try {
    await financeStore.recordSavingsContribution({
      goal_id: selectedGoalForContrib.value.id,
      type: contribForm.type,
      amount: contribForm.amount,
      contribution_date: contribForm.contribution_date,
      source_account_id: contribForm.source_account_id,
      create_internal_transfer: contribForm.create_internal_transfer,
      notes: contribForm.notes || null
    })
    contribDialogOpen.value = false
    $q.notify({
      type: 'positive',
      message:
        contribForm.type === 'deposit'
          ? 'Aporte registrado correctamente'
          : 'Retiro registrado correctamente'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al registrar operación'
    })
  }
}
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 5px;
}
</style>
