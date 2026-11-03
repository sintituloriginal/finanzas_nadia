<template>
  <q-dialog v-model="isOpen" persistent position="standard">
    <q-card class="quick-tx-card column no-wrap">
      <!-- Encabezado compacto en dos filas ordenadas -->
      <q-card-section class="dialog-header q-px-md q-py-sm shrink-0">
        <div class="row items-center justify-between no-wrap full-width">
          <div class="row items-center no-wrap min-w-0 q-mr-sm">
            <div class="modal-icon-box q-mr-sm shrink-0">
              <q-icon name="receipt_long" size="18px" color="primary" />
            </div>
            <div class="text-subtitle1 text-weight-bolder ellipsis leading-tight dialog-title">
              {{ editingTransaction ? 'Editar movimiento' : 'Nuevo movimiento' }}
            </div>
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            size="sm"
            class="text-muted shrink-0"
            aria-label="Cerrar modal"
          />
        </div>
        <div class="text-caption text-muted q-mt-xs dialog-subtitle">
          Registro rápido en Pesos Chilenos (CLP)
        </div>
      </q-card-section>

      <q-separator />

      <!-- Cuerpo del formulario con scroll interno -->
      <q-card-section class="dialog-body col q-pa-md scroll">
        <q-form ref="formRef" id="quick-tx-form" @submit="handleSubmit" class="q-gutter-y-sm">
          <!-- Selector segmentado compacto de tipo de movimiento -->
          <div class="q-mb-xs">
            <q-btn-toggle
              v-model="form.type"
              spread
              no-caps
              unelevated
              toggle-color="primary"
              color="transparent"
              text-color="grey-8"
              class="type-toggle"
              :options="[
                { label: 'Gasto', value: 'expense', icon: 'trending_down' },
                { label: 'Ingreso', value: 'income', icon: 'trending_up' },
                { label: 'Transferencia', value: 'transfer', icon: 'swap_horiz' }
              ]"
            />
          </div>

          <!-- Monto CLP con formato de miles chileno y separación limpia -->
          <AppCurrencyInput
            v-model="form.amount"
            label="Monto en CLP *"
            autofocus
            :rules="[
              (val) => Boolean(val && Number(val) > 0) || 'Ingresa un monto positivo mayor a $0'
            ]"
            hint="Monto entero sin decimales (ej: 25.000)"
          />

          <!-- Categoría (para ingreso o gasto) -->
          <div v-if="form.type !== 'transfer'">
            <q-select
              v-model="form.category_id"
              :options="availableCategories"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              outlined
              dense
              options-dense
              label="Categoría *"
              :rules="[(val) => Boolean(val) || 'Selecciona una categoría']"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps" dense>
                  <q-item-section avatar style="min-width: 32px">
                    <q-avatar
                      size="26px"
                      :style="{ backgroundColor: scope.opt.color + '20', color: scope.opt.color }"
                    >
                      <q-icon :name="scope.opt.icon" size="15px" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-body2">{{ scope.opt.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Cuentas financieras -->
          <div class="row q-col-gutter-sm">
            <div :class="form.type === 'transfer' ? 'col-12 col-sm-6' : 'col-12'">
              <q-select
                v-model="form.account_id"
                :options="financeStore.activeAccounts"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                outlined
                dense
                options-dense
                :label="form.type === 'transfer' ? 'Cuenta origen *' : 'Cuenta financiera *'"
                :rules="[(val) => Boolean(val) || 'Selecciona una cuenta']"
              />
            </div>

            <div v-if="form.type === 'transfer'" class="col-12 col-sm-6">
              <q-select
                v-model="form.destination_account_id"
                :options="destinationAccountOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                outlined
                dense
                options-dense
                label="Cuenta destino *"
                :rules="[
                  (val) => Boolean(val) || 'Selecciona la cuenta destino',
                  (val) => val !== form.account_id || 'Debe ser distinta a la cuenta origen'
                ]"
              />
            </div>
          </div>

          <!-- Descripción y Fecha -->
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-7">
              <q-input
                v-model="form.description"
                outlined
                dense
                label="Descripción *"
                placeholder="Ej: Supermercado, Sueldo"
                :rules="[(val) => Boolean(val && val.trim()) || 'Ingresa una descripción breve']"
              />
            </div>
            <div class="col-12 col-sm-5">
              <q-input
                v-model="form.transaction_date"
                type="date"
                outlined
                dense
                label="Fecha *"
                :rules="[(val) => Boolean(val) || 'Selecciona la fecha']"
              />
            </div>
          </div>

          <!-- Estado y Observaciones opcionales -->
          <div class="row q-col-gutter-sm items-center">
            <div class="col-12 col-sm-5">
              <q-select
                v-model="form.status"
                outlined
                dense
                options-dense
                emit-value
                map-options
                label="Estado"
                :options="[
                  { label: 'Confirmado', value: 'confirmed' },
                  { label: 'Pendiente', value: 'pending' }
                ]"
              />
            </div>
            <div class="col-12 col-sm-7">
              <q-input
                v-model="form.notes"
                outlined
                dense
                label="Observaciones (opcional)"
              />
            </div>
          </div>

          <q-banner
            v-if="form.type === 'transfer'"
            rounded
            dense
            class="bg-blue-1 text-blue-9 text-caption q-py-xs"
          >
            <template #avatar>
              <q-icon name="info" color="primary" size="18px" />
            </template>
            Las transferencias actualizan saldos sin computar ingreso ni gasto.
          </q-banner>
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Acciones fijas en la base del diálogo -->
      <q-card-actions class="dialog-actions q-px-md q-py-sm shrink-0">
        <div class="modal-footer">
          <q-btn flat no-caps label="Cancelar" color="grey-7" v-close-popup class="modal-btn modal-btn-cancel" />
          <q-btn
            form="quick-tx-form"
            type="submit"
            unelevated
            no-caps
            color="primary"
            icon="check"
            :label="editingTransaction ? 'Guardar cambios' : 'Guardar movimiento'"
            :loading="saving"
            class="modal-btn modal-btn-save"
            @click="onSaveClick"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '@/stores/finance'
import { useAuthStore } from '@/stores/auth'
import { getTodayISO } from '@/utils/format'
import AppCurrencyInput from '@/components/common/AppCurrencyInput.vue'
import type { Transaction, TransactionStatus, TransactionType } from '@/types/finance'

const props = defineProps<{
  modelValue: boolean
  editingTransaction?: Transaction | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const formRef = ref<any>(null)

const $q = useQuasar()
const financeStore = useFinanceStore()
const authStore = useAuthStore()
const saving = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive<{
  type: TransactionType
  amount: number | null
  category_id: string | null
  account_id: string
  destination_account_id: string | null
  description: string
  notes: string
  transaction_date: string
  status: TransactionStatus
}>({
  type: 'expense',
  amount: null,
  category_id: null,
  account_id: '',
  destination_account_id: null,
  description: '',
  notes: '',
  transaction_date: getTodayISO(),
  status: 'confirmed'
})

const availableCategories = computed(() =>
  form.type === 'income' ? financeStore.incomeCategories : financeStore.expenseCategories
)

const destinationAccountOptions = computed(() =>
  financeStore.activeAccounts.filter((a) => a.id !== form.account_id)
)

function resetForm() {
  const defaultAccount =
    authStore.profile?.default_account_id ||
    financeStore.activeAccounts[0]?.id ||
    ''

  if (props.editingTransaction) {
    const tx = props.editingTransaction
    form.type = tx.type
    form.amount = tx.amount
    form.category_id = tx.category_id
    form.account_id = tx.account_id
    form.destination_account_id = tx.destination_account_id
    form.description = tx.description
    form.notes = tx.notes ?? ''
    form.transaction_date = tx.transaction_date
    form.status = tx.status
  } else {
    form.type = 'expense'
    form.amount = null
    form.account_id = defaultAccount
    form.destination_account_id = null
    form.category_id = financeStore.expenseCategories[0]?.id ?? null
    form.description = ''
    form.notes = ''
    form.transaction_date = getTodayISO()
    form.status = 'confirmed'
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm()
  }
)

watch(
  () => form.type,
  (newType) => {
    if (props.editingTransaction && props.editingTransaction.type === newType) return
    if (newType === 'income') {
      form.category_id = financeStore.incomeCategories[0]?.id ?? null
      form.destination_account_id = null
    } else if (newType === 'expense') {
      form.category_id = financeStore.expenseCategories[0]?.id ?? null
      form.destination_account_id = null
    } else {
      form.category_id = null
      const otherAcc = financeStore.activeAccounts.find((a) => a.id !== form.account_id)
      form.destination_account_id = otherAcc?.id ?? null
      if (!form.description) {
        form.description = 'Transferencia entre cuentas'
      }
    }
  }
)

watch(
  () => form.category_id,
  (catId) => {
    if (!props.editingTransaction && !form.description && catId) {
      const cat = financeStore.categories.find((c) => c.id === catId)
      if (cat) form.description = cat.name
    }
  }
)

async function onSaveClick() {
  if (saving.value) return
  if (formRef.value) {
    const valid = await formRef.value.validate()
    if (valid) {
      await handleSubmit()
    }
  } else {
    await handleSubmit()
  }
}

async function handleSubmit() {
  saving.value = true
  try {
    const payload = {
      type: form.type,
      amount: Math.round(Number(form.amount) || 0),
      category_id: form.type === 'transfer' ? null : form.category_id,
      account_id: form.account_id,
      destination_account_id: form.type === 'transfer' ? form.destination_account_id : null,
      description: form.description.trim(),
      notes: form.notes.trim() || null,
      transaction_date: form.transaction_date,
      status: form.status
    }

    if (props.editingTransaction) {
      await financeStore.updateTransaction(props.editingTransaction.id, payload)
      $q.notify({
        type: 'positive',
        message: 'Movimiento actualizado correctamente',
        position: 'top-right'
      })
    } else {
      await financeStore.createTransaction(payload)
      $q.notify({
        type: 'positive',
        message: 'Movimiento registrado correctamente',
        position: 'top-right'
      })
    }

    emit('saved')
    isOpen.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al guardar el movimiento',
      position: 'top-right'
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.quick-tx-card {
  width: 100%;
  max-width: min(520px, calc(100vw - 24px));
  max-height: min(90dvh, 90vh);
  border-radius: 14px;
  box-sizing: border-box;
  overflow: hidden;
  background-color: var(--bg-surface);
}

.shrink-0 {
  flex-shrink: 0;
}

.dialog-header {
  background-color: var(--bg-surface);
}

.dialog-subtitle {
  font-size: 0.75rem;
  line-height: 1.2;
}

.dialog-body {
  max-height: 100%;
  box-sizing: border-box;
}

.dialog-actions {
  background-color: var(--bg-surface);
  padding-bottom: max(10px, env(safe-area-inset-bottom));
}

.type-toggle {
  background-color: var(--bg-surface-subtle);
  border-radius: 10px;
  padding: 3px;
  width: 100%;
  border: 1px solid var(--border-color);
}

.type-toggle :deep(.q-btn) {
  min-height: 38px;
  padding: 4px 6px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.type-toggle :deep(.q-btn .q-icon) {
  font-size: 16px;
  margin-right: 4px;
}

.modal-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: var(--brand-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.q-field--dense .q-field__control) {
  height: var(--control-height, 42px);
  min-height: var(--control-height, 42px);
  border-radius: 10px;
}

:deep(.q-field--dense .q-field__marginal) {
  height: var(--control-height, 42px);
}

:deep(.q-field--dense .q-field__native) {
  font-size: 0.9rem;
}

.action-btn {
  height: 40px;
  min-height: 40px;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 600;
  padding: 0 16px;
}
</style>

