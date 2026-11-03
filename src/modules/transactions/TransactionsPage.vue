<template>
  <q-page class="page-container">
    <AppPageHeader
      eyebrow="REGISTRO CONTABLE"
      title="Historial de Movimientos"
      subtitle="Administra tus ingresos, gastos y transferencias entre cuentas con precisión en CLP."
    >
      <template #actions>
        <AppActionButton
          icon="add"
          label="Nuevo movimiento"
          @click="openCreate"
        />
      </template>
    </AppPageHeader>

    <!-- Barra de filtros moderna y resumen -->
    <AppFilterBar>
      <template #default>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              dense
              outlined
              clearable
              placeholder="Buscar por descripción u observación..."
            >
              <template #prepend>
                <q-icon name="search" class="text-muted" />
              </template>
            </q-input>
          </div>

          <div class="col-6 col-md-2">
            <q-select
              v-model="typeFilter"
              dense
              outlined
              emit-value
              map-options
              label="Tipo"
              :options="[
                { label: 'Todos', value: 'all' },
                { label: 'Ingresos', value: 'income' },
                { label: 'Egresos', value: 'expense' },
                { label: 'Transferencias', value: 'transfer' }
              ]"
            />
          </div>

          <div class="col-6 col-md-3">
            <q-select
              v-model="categoryFilter"
              dense
              outlined
              emit-value
              map-options
              label="Categoría"
              :options="categoryFilterOptions"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="sortBy"
              dense
              outlined
              emit-value
              map-options
              label="Ordenar por"
              :options="[
                { label: 'Fecha (más reciente)', value: 'date_desc' },
                { label: 'Fecha (más antigua)', value: 'date_asc' },
                { label: 'Monto (mayor a menor)', value: 'amount_desc' },
                { label: 'Monto (menor a mayor)', value: 'amount_asc' }
              ]"
            />
          </div>
        </div>
      </template>

      <template #summary>
        <div class="row items-center justify-between q-col-gutter-sm text-caption">
          <div class="col-12 col-sm-auto text-secondary-ink">
            Mostrando <strong>{{ filteredTransactions.length }}</strong> movimiento(s) en el período
          </div>
          <div class="col-12 col-sm-auto row items-center q-gutter-x-md font-mono">
            <span class="text-positive">
              Ingresos: <strong>+{{ formatCLP(filteredSummary.income) }}</strong>
            </span>
            <span class="text-negative">
              Egresos: <strong>-{{ formatCLP(filteredSummary.expense) }}</strong>
            </span>
            <span class="text-weight-bold">
              Resultado: {{ formatCLP(filteredSummary.income - filteredSummary.expense) }}
            </span>
          </div>
        </div>
      </template>
    </AppFilterBar>

    <!-- Listado / Tabla adaptable a móvil y escritorio -->
    <q-card flat class="fintech-card overflow-hidden">
      <AppEmptyState
        v-if="filteredTransactions.length === 0"
        icon="receipt_long"
        title="No se encontraron movimientos"
        description="Prueba ajustando los filtros de búsqueda o registra un nuevo movimiento en este período."
      >
        <template #action>
          <AppActionButton icon="add" label="Registrar movimiento" @click="openCreate" />
        </template>
      </AppEmptyState>

      <q-table
        v-else
        :rows="filteredTransactions"
        :columns="columns"
        row-key="id"
        flat
        :grid="$q.screen.xs"
        :pagination="{ rowsPerPage: 10 }"
        class="fintech-table"
      >
        <!-- Vista de Cards para Mobile -->
        <template #item="props">
          <div class="q-pa-xs col-12">
            <div class="border-subtle q-pa-md rounded-borders">
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center q-gutter-x-xs">
                  <AppStatusBadge
                    :label="typeLabel(props.row.type)"
                    :tone="typeTone(props.row.type)"
                  />
                  <AppStatusBadge
                    v-if="props.row.status === 'pending'"
                    label="Pendiente"
                    tone="warning"
                  />
                </div>
                <span class="font-mono text-caption text-muted">
                  {{ formatDateCL(props.row.transaction_date) }}
                </span>
              </div>

              <div class="text-weight-bold text-body1 q-mt-xs">{{ props.row.description }}</div>
              <div class="text-caption text-muted q-mb-sm">
                {{ props.row.type === 'transfer' ? 'Entre cuentas' : getCategoryName(props.row.category_id) }}
                • {{ getAccountName(props.row.account_id) }}
              </div>

              <div class="row items-center justify-between q-pt-xs">
                <div
                  class="text-subtitle1 text-weight-bolder font-mono"
                  :class="{
                    'text-positive': props.row.type === 'income',
                    'text-negative': props.row.type === 'expense',
                    'text-primary': props.row.type === 'transfer'
                  }"
                >
                  {{ props.row.type === 'income' ? '+' : props.row.type === 'expense' ? '-' : '⇄ ' }}{{ formatCLP(props.row.amount) }}
                </div>
                <div class="row q-gutter-xs">
                  <q-btn flat round dense size="sm" icon="content_copy" @click="duplicateTransaction(props.row)" />
                  <q-btn flat round dense size="sm" icon="edit" color="primary" @click="openEdit(props.row)" />
                  <q-btn flat round dense size="sm" icon="delete_outline" color="negative" @click="confirmDelete(props.row)" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Celdas de Escritorio -->
        <template #body-cell-transaction_date="props">
          <q-td :props="props" class="font-mono text-secondary-ink">
            {{ formatDateCL(props.row.transaction_date) }}
          </q-td>
        </template>

        <template #body-cell-type="props">
          <q-td :props="props">
            <AppStatusBadge
              :label="typeLabel(props.row.type)"
              :tone="typeTone(props.row.type)"
              :icon="
                props.row.type === 'income'
                  ? 'north_east'
                  : props.row.type === 'expense'
                    ? 'south_east'
                    : 'swap_horiz'
              "
            />
          </q-td>
        </template>

        <template #body-cell-description="props">
          <q-td :props="props">
            <div class="text-weight-semibold">{{ props.row.description }}</div>
            <div v-if="props.row.notes" class="text-caption text-muted ellipsis" style="max-width: 240px">
              {{ props.row.notes }}
            </div>
          </q-td>
        </template>

        <template #body-cell-category="props">
          <q-td :props="props">
            <span v-if="props.row.type === 'transfer'" class="text-muted text-italic">
              Transferencia interna
            </span>
            <span v-else class="text-weight-medium">{{ getCategoryName(props.row.category_id) }}</span>
          </q-td>
        </template>

        <template #body-cell-account="props">
          <q-td :props="props" class="text-secondary-ink">
            <span v-if="props.row.type === 'transfer'">
              {{ getAccountName(props.row.account_id) }} → {{ getAccountName(props.row.destination_account_id) }}
            </span>
            <span v-else>{{ getAccountName(props.row.account_id) }}</span>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <AppStatusBadge
              :label="props.row.status === 'confirmed' ? 'Confirmado' : 'Pendiente'"
              :tone="props.row.status === 'confirmed' ? 'success' : 'warning'"
            />
          </q-td>
        </template>

        <template #body-cell-amount="props">
          <q-td :props="props" class="text-right font-mono text-weight-bolder">
            <span
              :class="{
                'text-positive': props.row.type === 'income',
                'text-negative': props.row.type === 'expense',
                'text-primary': props.row.type === 'transfer'
              }"
            >
              {{ props.row.type === 'income' ? '+' : props.row.type === 'expense' ? '-' : '⇄ ' }}{{ formatCLP(props.row.amount) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right q-gutter-xs">
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="content_copy"
              class="text-muted"
              @click="duplicateTransaction(props.row)"
            >
              <q-tooltip>Duplicar con fecha de hoy</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="edit"
              color="primary"
              @click="openEdit(props.row)"
            >
              <q-tooltip>Editar movimiento</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="delete_outline"
              color="negative"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal Crear / Editar -->
    <QuickTransactionDialog
      v-model="dialogOpen"
      :editing-transaction="selectedTransaction"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar, type QTableColumn } from 'quasar'
import { useFinanceStore } from '@/stores/finance'
import { isDateInPeriod } from '@/utils/finance'
import { formatCLP, formatDateCL, getTodayISO } from '@/utils/format'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppFilterBar from '@/components/common/AppFilterBar.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import QuickTransactionDialog from '@/components/finance/QuickTransactionDialog.vue'
import type { Transaction } from '@/types/finance'

const $q = useQuasar()
const financeStore = useFinanceStore()

const searchQuery = ref('')
const typeFilter = ref<'all' | 'income' | 'expense' | 'transfer'>('all')
const categoryFilter = ref<string>('all')
const sortBy = ref<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc')

const dialogOpen = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

const categoryFilterOptions = computed(() => [
  { label: 'Todas las categorías', value: 'all' },
  ...financeStore.categories.map((c) => ({ label: c.name, value: c.id }))
])

const filteredTransactions = computed(() => {
  const q = (searchQuery.value || '').trim().toLowerCase()

  const list = financeStore.transactions.filter((tx) => {
    if (!isDateInPeriod(tx.transaction_date, financeStore.periodFilter)) return false
    if (typeFilter.value !== 'all' && tx.type !== typeFilter.value) return false
    if (categoryFilter.value !== 'all' && tx.category_id !== categoryFilter.value) return false
    if (q) {
      const matchDesc = tx.description.toLowerCase().includes(q)
      const matchNotes = (tx.notes ?? '').toLowerCase().includes(q)
      if (!matchDesc && !matchNotes) return false
    }
    return true
  })

  return [...list].sort((a, b) => {
    if (sortBy.value === 'date_desc') return b.transaction_date.localeCompare(a.transaction_date)
    if (sortBy.value === 'date_asc') return a.transaction_date.localeCompare(b.transaction_date)
    if (sortBy.value === 'amount_desc') return b.amount - a.amount
    return a.amount - b.amount
  })
})

const filteredSummary = computed(() => {
  let income = 0
  let expense = 0
  for (const tx of filteredTransactions.value) {
    if (tx.status !== 'confirmed') continue
    if (tx.type === 'income') income += tx.amount
    else if (tx.type === 'expense') expense += tx.amount
  }
  return { income, expense }
})

const columns: QTableColumn<Transaction>[] = [
  { name: 'transaction_date', label: 'Fecha', field: 'transaction_date', align: 'left' },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
  { name: 'category', label: 'Categoría', field: 'category_id', align: 'left' },
  { name: 'account', label: 'Cuenta', field: 'account_id', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'amount', label: 'Monto (CLP)', field: 'amount', align: 'right' },
  { name: 'actions', label: 'Acciones', field: 'id', align: 'right' }
]

function typeLabel(type: Transaction['type']): string {
  if (type === 'income') return 'Ingreso'
  if (type === 'expense') return 'Egreso'
  return 'Transferencia'
}

function typeTone(type: Transaction['type']): 'success' | 'danger' | 'info' {
  if (type === 'income') return 'success'
  if (type === 'expense') return 'danger'
  return 'info'
}

function getCategoryName(categoryId: string | null): string {
  if (!categoryId) return '-'
  return financeStore.categories.find((c) => c.id === categoryId)?.name ?? 'Sin categoría'
}

function getAccountName(accountId: string | null): string {
  if (!accountId) return '-'
  return financeStore.accounts.find((a) => a.id === accountId)?.name ?? 'Cuenta'
}

function openCreate() {
  selectedTransaction.value = null
  dialogOpen.value = true
}

function openEdit(tx: Transaction) {
  selectedTransaction.value = tx
  dialogOpen.value = true
}

const isDuplicating = ref(false)

async function duplicateTransaction(tx: Transaction) {
  if (isDuplicating.value) return
  isDuplicating.value = true
  try {
    await financeStore.createTransaction({
      type: tx.type,
      amount: tx.amount,
      category_id: tx.category_id,
      account_id: tx.account_id,
      destination_account_id: tx.destination_account_id,
      description: `${tx.description} (copia)`,
      notes: tx.notes,
      transaction_date: getTodayISO(),
      status: tx.status
    })
    $q.notify({
      type: 'positive',
      message: 'Movimiento duplicado con fecha de hoy',
      position: 'top-right'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'No se pudo duplicar el movimiento'
    })
  } finally {
    isDuplicating.value = false
  }
}

function confirmDelete(tx: Transaction) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${tx.description}" por ${formatCLP(tx.amount)}?`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar movimiento', color: 'negative', unelevated: true, noCaps: true },
    persistent: true
  }).onOk(async () => {
    try {
      await financeStore.deleteTransaction(tx.id)
      $q.notify({
        type: 'positive',
        message: 'Movimiento eliminado correctamente',
        position: 'top-right'
      })
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: err instanceof Error ? err.message : 'Error al eliminar'
      })
    }
  })
}
</script>
