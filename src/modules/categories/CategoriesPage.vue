<template>
  <q-page class="page-container">
    <AppPageHeader
      eyebrow="ESTRUCTURA PATRIMONIAL"
      title="Cuentas Financieras y Categorías"
      subtitle="Saldos bancarios conciliados automáticamente y catálogo personalizable de clasificación."
    >
      <template #actions>
        <AppActionButton
          variant="outline"
          icon="account_balance"
          label="Nueva cuenta"
          @click="openAccountDialog()"
        />
        <AppActionButton
          icon="add"
          label="Nueva categoría"
          @click="openCategoryDialog()"
        />
      </template>
    </AppPageHeader>

    <!-- SECCIÓN 1: CUENTAS FINANCIERAS -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="acc in financeStore.accountsWithBalances"
        :key="acc.id"
        class="col-12 col-sm-6 col-md-3"
      >
        <q-card
          flat
          class="fintech-card fintech-card--interactive full-height"
          :class="{ 'opacity-60': !acc.is_active }"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-md">
              <q-avatar
                size="38px"
                :style="{ backgroundColor: acc.color + '18', color: acc.color }"
              >
                <q-icon :name="acc.icon" size="20px" />
              </q-avatar>
              <div class="row items-center q-gutter-xs">
                <AppStatusBadge
                  :label="acc.is_active ? 'Activa' : 'Inactiva'"
                  :tone="acc.is_active ? 'success' : 'neutral'"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="edit"
                  class="text-muted"
                  @click="openAccountDialog(acc)"
                />
              </div>
            </div>

            <div class="text-subtitle1 text-weight-bold ellipsis">{{ acc.name }}</div>
            <div class="text-caption text-muted q-mb-md">{{ accountTypeLabel(acc.type) }}</div>

            <div class="text-h5 text-weight-bolder font-mono text-primary">
              {{ formatCLP(acc.current_balance) }}
            </div>
            <div class="text-caption text-muted font-mono q-mt-xs">
              Saldo inicial: {{ formatCLP(acc.initial_balance) }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- SECCIÓN 2: CATEGORÍAS PERSONALIZABLES -->
    <AppSectionCard
      title="Catálogo de Categorías"
      subtitle="Personaliza iconos, colores y estados sin perder la trazabilidad histórica."
      icon="category"
      no-padding
      bordered-header
    >
      <q-tabs
        v-model="activeTab"
        dense
        class="text-muted q-px-md q-pt-sm"
        active-color="primary"
        indicator-color="primary"
        align="left"
        no-caps
      >
        <q-tab name="expense" icon="south_east" label="Categorías de Egresos / Gastos" />
        <q-tab name="income" icon="north_east" label="Categorías de Ingresos" />
      </q-tabs>

      <q-separator />

      <div class="q-pa-lg">
        <div class="row q-col-gutter-md">
          <div
            v-for="cat in filteredCategories"
            :key="cat.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <div class="border-subtle q-pa-md row items-center justify-between no-wrap">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="40px"
                  :style="{ backgroundColor: cat.color + '18', color: cat.color }"
                  class="q-mr-md"
                >
                  <q-icon :name="cat.icon" size="20px" />
                </q-avatar>
                <div>
                  <div class="row items-center q-gutter-x-xs">
                    <span class="text-weight-bold text-body2">{{ cat.name }}</span>
                    <AppStatusBadge
                      v-if="!cat.is_active"
                      label="Inactiva"
                      tone="neutral"
                    />
                  </div>
                  <div class="text-caption text-muted">
                    {{ financeStore.getCategoryUsageCount(cat.id) }} movimiento(s) asociado(s)
                  </div>
                </div>
              </div>

              <div class="row items-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="edit"
                  color="primary"
                  @click="openCategoryDialog(cat)"
                >
                  <q-tooltip>Editar categoría</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  :icon="cat.is_active ? 'visibility_off' : 'visibility'"
                  class="text-muted"
                  @click="toggleCategoryActive(cat)"
                >
                  <q-tooltip>{{ cat.is_active ? 'Desactivar' : 'Activar' }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="delete_outline"
                  color="negative"
                  @click="openDeleteCategoryDialog(cat)"
                >
                  <q-tooltip>Eliminar o reasignar</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSectionCard>

    <!-- MODAL CREAR / EDITAR CATEGORÍA -->
    <q-dialog v-model="categoryDialogOpen">
      <AppFormCard
        :title="editingCategory ? 'Editar categoría' : 'Nueva categoría'"
        subtitle="Personaliza nombre, tipo, icono y color identificador"
        icon="category"
      >
        <q-form @submit.prevent="saveCategoryForm" class="q-gutter-y-md">
          <div>
            <label class="field-label">Nombre de la categoría *</label>
            <q-input
              v-model="catForm.name"
              outlined
              dense
              placeholder="Ej: Supermercado, Suscripciones..."
              :rules="[(val) => Boolean(val && val.trim()) || 'Nombre obligatorio']"
            />
          </div>
          <div>
            <label class="field-label">Tipo *</label>
            <q-select
              v-model="catForm.type"
              outlined
              dense
              emit-value
              map-options
              :disable="Boolean(editingCategory)"
              :options="[
                { label: 'Egreso / Gasto', value: 'expense' },
                { label: 'Ingreso', value: 'income' }
              ]"
            />
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <label class="field-label">Icono</label>
              <q-select
                v-model="catForm.icon"
                outlined
                dense
                emit-value
                map-options
                :options="iconOptions"
              >
                <template #prepend>
                  <q-icon :name="catForm.icon" />
                </template>
              </q-select>
            </div>
            <div class="col-6">
              <label class="field-label">Color HEX</label>
              <q-input v-model="catForm.color" outlined dense>
                <template #append>
                  <input
                    type="color"
                    v-model="catForm.color"
                    style="border: none; width: 26px; height: 26px; cursor: pointer; background: transparent"
                  />
                </template>
              </q-input>
            </div>
          </div>
          <div class="modal-footer q-pt-xs">
            <AppActionButton variant="ghost" label="Cancelar" v-close-popup class="modal-btn modal-btn-cancel" />
            <AppActionButton type="submit" label="Guardar categoría" icon="check" class="modal-btn modal-btn-save" />
          </div>
        </q-form>
      </AppFormCard>
    </q-dialog>

    <!-- MODAL ELIMINAR / REASIGNAR CATEGORÍA CON MOVIMIENTOS -->
    <q-dialog v-model="deleteCategoryDialogOpen">
      <AppFormCard
        :title="`Eliminar categoría: ${categoryToDelete?.name ?? ''}`"
        subtitle="Protección de integridad de movimientos históricos"
        icon="warning_amber"
      >
        <div class="q-gutter-y-md">
          <div
            v-if="deleteCategoryUsage > 0"
            class="surface-subtle border-subtle q-pa-md text-caption text-secondary-ink"
          >
            Esta categoría está asociada a <strong>{{ deleteCategoryUsage }}</strong> movimiento(s).
            Para proteger tu contabilidad, puedes <strong>desactivarla</strong> o <strong>reasignar</strong> sus movimientos a otra categoría antes de eliminarla.
          </div>
          <div v-else class="text-body2 text-secondary-ink">
            Esta categoría no tiene movimientos asociados y puede eliminarse de forma inmediata.
          </div>

          <div v-if="deleteCategoryUsage > 0">
            <label class="field-label">Reasignar movimientos a la categoría:</label>
            <q-select
              v-model="reassignTargetId"
              outlined
              dense
              emit-value
              map-options
              :options="reassignOptions"
            />
          </div>

          <div class="modal-footer q-pt-xs">
            <AppActionButton variant="ghost" label="Cancelar" v-close-popup class="modal-btn modal-btn-cancel" />
            <AppActionButton
              v-if="deleteCategoryUsage > 0"
              variant="outline"
              label="Solo desactivar"
              class="modal-btn"
              @click="deactivateInsteadOfDelete"
            />
            <AppActionButton
              variant="danger"
              :disable="deleteCategoryUsage > 0 && !reassignTargetId"
              :label="deleteCategoryUsage > 0 ? 'Reasignar y eliminar' : 'Eliminar'"
              class="modal-btn modal-btn-save"
              @click="confirmCategoryDeletion"
            />
          </div>
        </div>
      </AppFormCard>
    </q-dialog>

    <!-- MODAL CREAR / EDITAR CUENTA FINANCIERA -->
    <q-dialog v-model="accountDialogOpen">
      <AppFormCard
        :title="editingAccount ? 'Editar cuenta financiera' : 'Nueva cuenta financiera'"
        subtitle="Representa dónde está custodiado tu dinero"
        icon="account_balance"
      >
        <q-form @submit.prevent="saveAccountForm" class="q-gutter-y-md">
          <div>
            <label class="field-label">Nombre de la cuenta *</label>
            <q-input
              v-model="accForm.name"
              outlined
              dense
              placeholder="Ej: Banco de Chile Cuenta Corriente"
              :rules="[(val) => Boolean(val && val.trim()) || 'Nombre obligatorio']"
            />
          </div>
          <div>
            <label class="field-label">Tipo de cuenta *</label>
            <q-select
              v-model="accForm.type"
              outlined
              dense
              emit-value
              map-options
              :options="[
                { label: 'Cuenta Corriente', value: 'checking' },
                { label: 'Cuenta Vista / RUT', value: 'sight' },
                { label: 'Cuenta de Ahorro', value: 'savings' },
                { label: 'Efectivo', value: 'cash' },
                { label: 'Tarjeta de Crédito', value: 'credit' }
              ]"
            />
          </div>
          <div>
            <label class="field-label">Saldo inicial (CLP)</label>
            <AppCurrencyInput
              v-model="accForm.initial_balance"
              hint="El saldo actual se calcula automáticamente sumando tus movimientos confirmados."
            />
          </div>
          <q-toggle
            v-if="editingAccount"
            v-model="accForm.is_active"
            label="Cuenta activa"
            color="primary"
          />
          <div class="modal-footer q-pt-xs">
            <AppActionButton variant="ghost" label="Cancelar" v-close-popup class="modal-btn modal-btn-cancel" />
            <AppActionButton type="submit" label="Guardar cuenta" icon="check" class="modal-btn modal-btn-save" />
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
import { formatCLP, parseCLPInput } from '@/utils/format'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSectionCard from '@/components/common/AppSectionCard.vue'
import AppFormCard from '@/components/common/AppFormCard.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import AppCurrencyInput from '@/components/common/AppCurrencyInput.vue'
import type { Account, Category } from '@/types/finance'

const $q = useQuasar()
const financeStore = useFinanceStore()

const activeTab = ref<'expense' | 'income'>('expense')

const filteredCategories = computed(() =>
  financeStore.categories.filter((c) => c.type === activeTab.value)
)

const iconOptions = [
  { label: 'Hogar / Vivienda', value: 'home' },
  { label: 'Restaurante', value: 'restaurant' },
  { label: 'Supermercado', value: 'shopping_cart' },
  { label: 'Transporte', value: 'directions_bus' },
  { label: 'Combustible', value: 'local_gas_station' },
  { label: 'Servicios / Luz', value: 'bolt' },
  { label: 'Internet / Wifi', value: 'wifi' },
  { label: 'Salud', value: 'medical_services' },
  { label: 'Gimnasio', value: 'fitness_center' },
  { label: 'Música', value: 'music_note' },
  { label: 'Entretenimiento', value: 'movie' },
  { label: 'Compras', value: 'shopping_bag' },
  { label: 'Familia', value: 'family_restroom' },
  { label: 'Donaciones', value: 'volunteer_activism' },
  { label: 'Suscripciones', value: 'subscriptions' },
  { label: 'Trabajo / Sueldo', value: 'work' },
  { label: 'Laptop / Freelance', value: 'laptop_mac' },
  { label: 'Otros', value: 'category' }
]

const categoryDialogOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const catForm = reactive({
  name: '',
  type: 'expense' as 'expense' | 'income',
  icon: 'category',
  color: '#0D9488'
})

function openCategoryDialog(cat?: Category) {
  if (cat) {
    editingCategory.value = cat
    catForm.name = cat.name
    catForm.type = cat.type
    catForm.icon = cat.icon
    catForm.color = cat.color
  } else {
    editingCategory.value = null
    catForm.name = ''
    catForm.type = activeTab.value
    catForm.icon = 'category'
    catForm.color = '#0D9488'
  }
  categoryDialogOpen.value = true
}

async function saveCategoryForm() {
  try {
    if (editingCategory.value) {
      await financeStore.updateCategory(editingCategory.value.id, {
        name: catForm.name,
        icon: catForm.icon,
        color: catForm.color
      })
      $q.notify({ type: 'positive', message: 'Categoría actualizada' })
    } else {
      await financeStore.createCategory({
        name: catForm.name,
        type: catForm.type,
        icon: catForm.icon,
        color: catForm.color
      })
      $q.notify({ type: 'positive', message: 'Categoría creada' })
    }
    categoryDialogOpen.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al guardar categoría'
    })
  }
}

async function toggleCategoryActive(cat: Category) {
  await financeStore.updateCategory(cat.id, { is_active: !cat.is_active })
  $q.notify({
    type: 'info',
    message: cat.is_active ? 'Categoría activada' : 'Categoría desactivada'
  })
}

const deleteCategoryDialogOpen = ref(false)
const categoryToDelete = ref<Category | null>(null)
const reassignTargetId = ref<string | null>(null)

const deleteCategoryUsage = computed(() =>
  categoryToDelete.value ? financeStore.getCategoryUsageCount(categoryToDelete.value.id) : 0
)

const reassignOptions = computed(() => {
  if (!categoryToDelete.value) return []
  return financeStore.categories
    .filter((c) => c.type === categoryToDelete.value?.type && c.id !== categoryToDelete.value?.id)
    .map((c) => ({ label: c.name, value: c.id }))
})

function openDeleteCategoryDialog(cat: Category) {
  categoryToDelete.value = cat
  reassignTargetId.value = reassignOptions.value[0]?.value ?? null
  deleteCategoryDialogOpen.value = true
}

async function deactivateInsteadOfDelete() {
  if (!categoryToDelete.value) return
  await financeStore.updateCategory(categoryToDelete.value.id, { is_active: false })
  deleteCategoryDialogOpen.value = false
  $q.notify({ type: 'positive', message: 'Categoría desactivada manteniendo el historial' })
}

async function confirmCategoryDeletion() {
  if (!categoryToDelete.value) return
  try {
    await financeStore.deleteOrReassignCategory(
      categoryToDelete.value.id,
      deleteCategoryUsage.value > 0 ? (reassignTargetId.value ?? undefined) : undefined
    )
    deleteCategoryDialogOpen.value = false
    $q.notify({ type: 'positive', message: 'Categoría eliminada correctamente' })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al eliminar categoría'
    })
  }
}

const accountDialogOpen = ref(false)
const editingAccount = ref<Account | null>(null)
const accForm = reactive({
  name: '',
  type: 'checking' as Account['type'],
  initial_balance: 0 as number | null,
  color: '#0D9488',
  icon: 'account_balance',
  is_active: true
})

function accountTypeLabel(type: Account['type']): string {
  const labels: Record<Account['type'], string> = {
    checking: 'Cuenta Corriente',
    sight: 'Cuenta Vista / RUT',
    savings: 'Cuenta de Ahorro',
    cash: 'Efectivo',
    credit: 'Tarjeta de Crédito'
  }
  return labels[type]
}

function openAccountDialog(acc?: Account) {
  if (acc) {
    editingAccount.value = acc
    accForm.name = acc.name
    accForm.type = acc.type
    accForm.initial_balance = acc.initial_balance
    accForm.color = acc.color
    accForm.icon = acc.icon
    accForm.is_active = acc.is_active
  } else {
    editingAccount.value = null
    accForm.name = ''
    accForm.type = 'checking'
    accForm.initial_balance = 0
    accForm.color = '#0D9488'
    accForm.icon = 'account_balance'
    accForm.is_active = true
  }
  accountDialogOpen.value = true
}

async function saveAccountForm() {
  try {
    const cleanInitial = typeof accForm.initial_balance === 'number' && Number.isSafeInteger(accForm.initial_balance)
      ? accForm.initial_balance
      : parseCLPInput(String(accForm.initial_balance ?? '')) ?? 0

    if (editingAccount.value) {
      await financeStore.updateAccount(editingAccount.value.id, {
        name: accForm.name,
        type: accForm.type,
        initial_balance: cleanInitial,
        is_active: accForm.is_active
      })
      $q.notify({ type: 'positive', message: 'Cuenta actualizada' })
    } else {
      await financeStore.createAccount({
        name: accForm.name,
        type: accForm.type,
        initial_balance: cleanInitial,
        color: accForm.color,
        icon: accForm.icon
      })
      $q.notify({ type: 'positive', message: 'Cuenta creada correctamente' })
    }
    accountDialogOpen.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al guardar cuenta'
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
