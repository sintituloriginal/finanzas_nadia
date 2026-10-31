<template>
  <q-dialog v-model="isOpen" persistent maximized-mobile>
    <q-card class="quick-tx-card">
      <q-card-section class="row items-center justify-between q-pb-sm">
        <div>
          <div class="text-h6 text-weight-bold">
            {{ editingTransaction ? 'Editar movimiento' : 'Nuevo movimiento' }}
          </div>
          <div class="text-caption text-grey-6">
            Registro rápido en Pesos Chilenos (CLP)
          </div>
        </div>
        <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar modal" />
      </q-card-section>

      <q-separator />

      <q-form @submit.prevent="handleSubmit" class="q-pa-md q-gutter-y-md">
        <!-- Selector de tipo de movimiento -->
        <q-btn-toggle
          v-model="form.type"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          color="grey-2"
          text-color="grey-9"
          class="rounded-borders"
          :options="[
            { label: 'Gasto / Egreso', value: 'expense', icon: 'trending_down' },
            { label: 'Ingreso', value: 'income', icon: 'trending_up' },
            { label: 'Transferencia', value: 'transfer', icon: 'swap_horiz' }
          ]"
        />

        <!-- Paso 1: Monto CLP destacado -->
        <q-input
          v-model.number="form.amount"
          type="number"
          label="1. Monto en CLP *"
          prefix="$"
          outlined
          autofocus
          input-class="text-h5 text-weight-bold font-mono"
          :rules="[
            (val) => Number(val) > 0 || 'Ingresa un monto entero positivo mayor a $0'
          ]"
          hint="Solo números enteros sin decimales (ej: 25000)"
        />

        <!-- Paso 2: Categoría (para ingreso o gasto) -->
        <div v-if="form.type !== 'transfer'">
          <q-select
            v-model="form.category_id"
            :options="availableCategories"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            outlined
            label="2. Categoría *"
            :rules="[(val) => Boolean(val) || 'Selecciona una categoría']"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar
                    size="32px"
                    :style="{ backgroundColor: scope.opt.color + '20', color: scope.opt.color }"
                  >
                    <q-icon :name="scope.opt.icon" size="18px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
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
              label="Descripción *"
              placeholder="Ej: Supermercado, Sueldo, Carga Bip!"
              :rules="[(val) => Boolean(val && val.trim()) || 'Ingresa una descripción breve']"
            />
          </div>
          <div class="col-12 col-sm-5">
            <q-input
              v-model="form.transaction_date"
              type="date"
              outlined
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
          class="bg-blue-1 text-blue-9 text-caption"
        >
          <template #avatar>
            <q-icon name="info" color="primary" />
          </template>
          Las transferencias entre cuentas actualizan ambos saldos sin contarse como ingreso ni como gasto del mes.
        </q-banner>

        <div class="row justify-end q-gutter-sm q-pt-sm">
          <q-btn flat no-caps label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            type="submit"
            unelevated
            no-caps
            color="primary"
            icon="check"
            :label="editingTransaction ? 'Guardar cambios' : '3. Guardar movimiento'"
            :loading="saving"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '@/stores/finance'
import { useAuthStore } from '@/stores/auth'
import { getTodayISO } from '@/utils/format'
import type { Transaction, TransactionStatus, TransactionType } from '@/types/finance'

const props = defineProps<{
  modelValue: boolean
  editingTransaction?: Transaction | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

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
  max-width: 540px;
  border-radius: 16px;
}
</style>

