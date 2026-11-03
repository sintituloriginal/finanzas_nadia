import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import { createInitialSeedData, DEMO_USER_ID } from '@/services/seedData'
import { useAuthStore } from '@/stores/auth'
import {
  calculateAccountBalances,
  calculateBudgetSummaries,
  calculatePeriodMetrics
} from '@/utils/finance'
import { parseCLPInput } from '@/utils/format'
import type {
  Account,
  Budget,
  Category,
  PeriodFilter,
  SavingsContribution,
  SavingsGoal,
  Transaction
} from '@/types/finance'

function toCleanAmount(val: unknown): number {
  if (typeof val === 'number') {
    return Number.isSafeInteger(val) ? val : Math.round(Number(val) || 0)
  }
  if (typeof val === 'string') {
    return parseCLPInput(val) ?? 0
  }
  return 0
}

const STORAGE_DATA_KEY = 'mi_presupuesto_local_data_v1'
const STORAGE_FILTER_KEY = 'mi_presupuesto_period_filter_v1'

interface LocalDataBundle {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  savingsContributions: SavingsContribution[]
}

function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useFinanceStore = defineStore('finance', () => {
  const authStore = useAuthStore()

  const now = new Date()
  const savedFilterRaw = sessionStorage.getItem(STORAGE_FILTER_KEY)
  const initialFilter: PeriodFilter = savedFilterRaw
    ? (JSON.parse(savedFilterRaw) as PeriodFilter)
    : {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        startDate: null,
        endDate: null
      }

  const periodFilter = ref<PeriodFilter>(initialFilter)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const quickTransactionDialogOpen = ref<boolean>(false)

  const accounts = ref<Account[]>([])
  const categories = ref<Category[]>([])
  const transactions = ref<Transaction[]>([])
  const budgets = ref<Budget[]>([])
  const savingsGoals = ref<SavingsGoal[]>([])
  const savingsContributions = ref<SavingsContribution[]>([])

  watch(
    periodFilter,
    (val) => {
      sessionStorage.setItem(STORAGE_FILTER_KEY, JSON.stringify(val))
    },
    { deep: true }
  )

  function persistLocalBundle() {
    if (isSupabaseConfigured) return
    const bundle: LocalDataBundle = {
      accounts: accounts.value,
      categories: categories.value,
      transactions: transactions.value,
      budgets: budgets.value,
      savingsGoals: savingsGoals.value,
      savingsContributions: savingsContributions.value
    }
    localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(bundle))
  }

  async function fetchAllData() {
    loading.value = true
    error.value = null
    const userId = authStore.user?.id ?? DEMO_USER_ID

    try {
      if (isSupabaseConfigured && supabase && authStore.user) {
        const [accRes, catRes, txRes, bdgRes, goalRes, contribRes] = await Promise.all([
          supabase.from('accounts').select('*').order('created_at', { ascending: true }),
          supabase.from('categories').select('*').order('name', { ascending: true }),
          supabase
            .from('transactions')
            .select('*')
            .order('transaction_date', { ascending: false })
            .order('created_at', { ascending: false }),
          supabase.from('budgets').select('*'),
          supabase.from('savings_goals').select('*').order('created_at', { ascending: true }),
          supabase
            .from('savings_contributions')
            .select('*')
            .order('contribution_date', { ascending: false })
        ])

        if (accRes.error) throw accRes.error
        if (catRes.error) throw catRes.error
        if (txRes.error) throw txRes.error
        if (bdgRes.error) throw bdgRes.error
        if (goalRes.error) throw goalRes.error
        if (contribRes.error) throw contribRes.error

        accounts.value = (accRes.data ?? []) as unknown as Account[]
        categories.value = (catRes.data ?? []) as unknown as Category[]
        transactions.value = (txRes.data ?? []) as unknown as Transaction[]
        budgets.value = (bdgRes.data ?? []) as unknown as Budget[]
        savingsGoals.value = (goalRes.data ?? []) as unknown as SavingsGoal[]
        savingsContributions.value = (contribRes.data ?? []) as unknown as SavingsContribution[]
        return
      }

      // Modo local persistente
      const raw = localStorage.getItem(STORAGE_DATA_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as LocalDataBundle
        accounts.value = parsed.accounts ?? []
        categories.value = parsed.categories ?? []
        transactions.value = parsed.transactions ?? []
        budgets.value = parsed.budgets ?? []
        savingsGoals.value = parsed.savingsGoals ?? []
        savingsContributions.value = parsed.savingsContributions ?? []
      } else {
        const seed = createInitialSeedData(userId)
        accounts.value = seed.accounts
        categories.value = seed.categories
        transactions.value = seed.transactions
        budgets.value = seed.budgets
        savingsGoals.value = seed.savingsGoals
        savingsContributions.value = seed.savingsContributions
        persistLocalBundle()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar los datos financieros'
    } finally {
      loading.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // GETTERS Y CÁLCULOS REACTIVOS
  // ---------------------------------------------------------------------------
  const accountsWithBalances = computed(() =>
    calculateAccountBalances(accounts.value, transactions.value)
  )

  const activeAccounts = computed(() =>
    accountsWithBalances.value.filter((a) => a.is_active)
  )

  const totalNetWorth = computed(() =>
    activeAccounts.value.reduce((sum, a) => sum + a.current_balance, 0)
  )

  const periodMetrics = computed(() =>
    calculatePeriodMetrics(
      transactions.value,
      budgets.value,
      savingsContributions.value,
      periodFilter.value
    )
  )

  const budgetSummaries = computed(() =>
    calculateBudgetSummaries(
      budgets.value,
      transactions.value,
      categories.value,
      periodFilter.value
    )
  )

  const activeCategories = computed(() => categories.value.filter((c) => c.is_active))
  const incomeCategories = computed(() =>
    categories.value.filter((c) => c.type === 'income' && c.is_active)
  )
  const expenseCategories = computed(() =>
    categories.value.filter((c) => c.type === 'expense' && c.is_active)
  )

  // ---------------------------------------------------------------------------
  // CRUD MOVIMIENTOS (TRANSACTIONS)
  // ---------------------------------------------------------------------------
  async function createTransaction(
    payload: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction> {
    const userId = authStore.user?.id ?? DEMO_USER_ID
    const cleanAmount = toCleanAmount(payload.amount)
    if (cleanAmount <= 0) {
      throw new Error('El monto debe ser un número entero mayor a 0 CLP.')
    }
    if (!payload.description.trim()) {
      throw new Error('La descripción es obligatoria.')
    }
    if (payload.type === 'transfer') {
      if (!payload.destination_account_id) {
        throw new Error('Debes seleccionar una cuenta de destino para la transferencia.')
      }
      if (payload.destination_account_id === payload.account_id) {
        throw new Error('La cuenta de destino debe ser distinta a la cuenta de origen.')
      }
    } else if (!payload.category_id) {
      throw new Error('Debes seleccionar una categoría.')
    }

    const nowIso = new Date().toISOString()
    const rowPayload = {
      user_id: userId,
      type: payload.type,
      amount: cleanAmount,
      category_id: payload.type === 'transfer' ? null : payload.category_id,
      account_id: payload.account_id,
      destination_account_id: payload.type === 'transfer' ? payload.destination_account_id : null,
      description: payload.description.trim(),
      notes: payload.notes?.trim() || null,
      transaction_date: payload.transaction_date,
      status: payload.status
    }

    if (isSupabaseConfigured && supabase && authStore.user) {
      const { data, error: err } = await supabase
        .from('transactions')
        .insert(rowPayload as never)
        .select('*')
        .single()
      if (err) throw new Error(err.message)
      const created = data as unknown as Transaction
      transactions.value = [created, ...transactions.value]
      return created
    }

    const created: Transaction = {
      id: generateId('tx'),
      ...rowPayload,
      created_at: nowIso,
      updated_at: nowIso
    }
    transactions.value = [created, ...transactions.value]
    persistLocalBundle()
    return created
  }

  async function updateTransaction(
    id: string,
    payload: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<void> {
    const existing = transactions.value.find((t) => t.id === id)
    if (!existing) throw new Error('Movimiento no encontrado.')

    const cleanAmount = payload.amount !== undefined ? toCleanAmount(payload.amount) : existing.amount
    if (payload.amount !== undefined && cleanAmount <= 0) {
      throw new Error('El monto debe ser un número entero mayor a 0 CLP.')
    }

    const merged: Transaction = {
      ...existing,
      ...payload,
      amount: cleanAmount,
      category_id:
        (payload.type ?? existing.type) === 'transfer'
          ? null
          : (payload.category_id ?? existing.category_id),
      destination_account_id:
        (payload.type ?? existing.type) === 'transfer'
          ? (payload.destination_account_id ?? existing.destination_account_id)
          : null,
      updated_at: new Date().toISOString()
    }

    if (merged.amount <= 0) throw new Error('El monto debe ser mayor a 0 CLP.')
    if (merged.type === 'transfer' && merged.account_id === merged.destination_account_id) {
      throw new Error('La cuenta de origen y destino no pueden ser la misma.')
    }

    if (isSupabaseConfigured && supabase && authStore.user) {
      const { error: err } = await supabase
        .from('transactions')
        .update({
          type: merged.type,
          amount: merged.amount,
          category_id: merged.category_id,
          account_id: merged.account_id,
          destination_account_id: merged.destination_account_id,
          description: merged.description,
          notes: merged.notes,
          transaction_date: merged.transaction_date,
          status: merged.status
        } as never)
        .eq('id', id)
      if (err) throw new Error(err.message)
    }

    transactions.value = transactions.value.map((t) => (t.id === id ? merged : t))
    persistLocalBundle()
  }

  async function deleteTransaction(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase && authStore.user) {
      const { error: err } = await supabase.from('transactions').delete().eq('id', id)
      if (err) throw new Error(err.message)
    }
    transactions.value = transactions.value.filter((t) => t.id !== id)
    persistLocalBundle()
  }

  // ---------------------------------------------------------------------------
  // CRUD CATEGORÍAS
  // ---------------------------------------------------------------------------
  function getCategoryUsageCount(categoryId: string): number {
    return transactions.value.filter((t) => t.category_id === categoryId).length
  }

  async function createCategory(payload: {
    name: string
    type: 'income' | 'expense'
    icon: string
    color: string
  }): Promise<Category> {
    const cleanName = payload.name.trim()
    if (!cleanName) throw new Error('El nombre de la categoría es obligatorio.')

    const duplicate = categories.value.some(
      (c) => c.type === payload.type && c.name.toLowerCase() === cleanName.toLowerCase()
    )
    if (duplicate) {
      throw new Error(`Ya existe una categoría "${cleanName}" de este mismo tipo.`)
    }

    const userId = authStore.user?.id ?? DEMO_USER_ID
    const nowIso = new Date().toISOString()

    if (isSupabaseConfigured && supabase && authStore.user) {
      const { data, error: err } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name: cleanName,
          type: payload.type,
          icon: payload.icon,
          color: payload.color,
          is_active: true
        } as never)
        .select('*')
        .single()
      if (err) throw new Error(err.message)
      const created = data as unknown as Category
      categories.value = [...categories.value, created]
      return created
    }

    const created: Category = {
      id: generateId('cat'),
      user_id: userId,
      name: cleanName,
      type: payload.type,
      icon: payload.icon,
      color: payload.color,
      is_active: true,
      created_at: nowIso,
      updated_at: nowIso
    }
    categories.value = [...categories.value, created]
    persistLocalBundle()
    return created
  }

  async function updateCategory(
    id: string,
    payload: Partial<Pick<Category, 'name' | 'icon' | 'color' | 'is_active'>>
  ): Promise<void> {
    const current = categories.value.find((c) => c.id === id)
    if (!current) throw new Error('Categoría no encontrada.')

    if (payload.name) {
      const cleanName = payload.name.trim()
      const duplicate = categories.value.some(
        (c) =>
          c.id !== id &&
          c.type === current.type &&
          c.name.toLowerCase() === cleanName.toLowerCase()
      )
      if (duplicate) {
        throw new Error(`Ya existe otra categoría "${cleanName}" del mismo tipo.`)
      }
    }

    if (isSupabaseConfigured && supabase && authStore.user) {
      const { error: err } = await supabase
        .from('categories')
        .update(payload as never)
        .eq('id', id)
      if (err) throw new Error(err.message)
    }

    categories.value = categories.value.map((c) =>
      c.id === id ? { ...c, ...payload, updated_at: new Date().toISOString() } : c
    )
    persistLocalBundle()
  }

  async function deleteOrReassignCategory(
    categoryId: string,
    reassignToCategoryId?: string
  ): Promise<void> {
    const usageCount = getCategoryUsageCount(categoryId)
    if (usageCount > 0 && !reassignToCategoryId) {
      throw new Error(
        `Esta categoría tiene ${usageCount} movimiento(s) asociado(s). Puedes desactivarla o elegir otra categoría para reasignar sus movimientos.`
      )
    }

    if (isSupabaseConfigured && supabase && authStore.user) {
      if (usageCount > 0 && reassignToCategoryId) {
        const { error: rpcErr } = await supabase.rpc('reassign_and_delete_category', {
          p_old_category_id: categoryId,
          p_new_category_id: reassignToCategoryId
        } as never)
        if (rpcErr) throw new Error(rpcErr.message)
      } else {
        const { error: delErr } = await supabase.from('categories').delete().eq('id', categoryId)
        if (delErr) throw new Error(delErr.message)
      }
    }

    if (reassignToCategoryId) {
      transactions.value = transactions.value.map((tx) =>
        tx.category_id === categoryId ? { ...tx, category_id: reassignToCategoryId } : tx
      )
    }
    categories.value = categories.value.filter((c) => c.id !== categoryId)
    budgets.value = budgets.value.filter((b) => b.category_id !== categoryId)
    persistLocalBundle()
  }

  // ---------------------------------------------------------------------------
  // CRUD CUENTAS FINANCIERAS
  // ---------------------------------------------------------------------------
  async function createAccount(payload: {
    name: string
    type: Account['type']
    initial_balance: number
    color: string
    icon: string
  }): Promise<Account> {
    const cleanName = payload.name.trim()
    if (!cleanName) throw new Error('El nombre de la cuenta es obligatorio.')

    const duplicate = accounts.value.some((a) => a.name.toLowerCase() === cleanName.toLowerCase())
    if (duplicate) throw new Error(`Ya existe una cuenta llamada "${cleanName}".`)

    const userId = authStore.user?.id ?? DEMO_USER_ID
    const nowIso = new Date().toISOString()
    const cleanInitial = toCleanAmount(payload.initial_balance)

    if (isSupabaseConfigured && supabase && authStore.user) {
      const { data, error: err } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          name: cleanName,
          type: payload.type,
          initial_balance: cleanInitial,
          color: payload.color,
          icon: payload.icon,
          is_active: true
        } as never)
        .select('*')
        .single()
      if (err) throw new Error(err.message)
      const created = data as unknown as Account
      accounts.value = [...accounts.value, created]
      return created
    }

    const created: Account = {
      id: generateId('acc'),
      user_id: userId,
      name: cleanName,
      type: payload.type,
      initial_balance: cleanInitial,
      color: payload.color,
      icon: payload.icon,
      is_active: true,
      created_at: nowIso,
      updated_at: nowIso
    }
    accounts.value = [...accounts.value, created]
    persistLocalBundle()
    return created
  }

  async function updateAccount(
    id: string,
    payload: Partial<Pick<Account, 'name' | 'type' | 'initial_balance' | 'color' | 'icon' | 'is_active'>>
  ): Promise<void> {
    if (isSupabaseConfigured && supabase && authStore.user) {
      const { error: err } = await supabase
        .from('accounts')
        .update(payload as never)
        .eq('id', id)
      if (err) throw new Error(err.message)
    }

    accounts.value = accounts.value.map((a) =>
      a.id === id ? { ...a, ...payload, updated_at: new Date().toISOString() } : a
    )
    persistLocalBundle()
  }

  // ---------------------------------------------------------------------------
  // CRUD PRESUPUESTOS MENSUALES
  // ---------------------------------------------------------------------------
  async function saveBudget(payload: {
    id?: string
    category_id: string
    month: number
    year: number
    amount: number
  }): Promise<void> {
    const cleanAmount = toCleanAmount(payload.amount)
    if (cleanAmount <= 0) throw new Error('El monto presupuestado debe ser un número entero mayor a 0 CLP.')

    const duplicate = budgets.value.find(
      (b) =>
        b.id !== payload.id &&
        b.category_id === payload.category_id &&
        b.month === payload.month &&
        b.year === payload.year
    )
    if (duplicate) {
      throw new Error('Ya existe un presupuesto para esta categoría en el período seleccionado.')
    }

    const userId = authStore.user?.id ?? DEMO_USER_ID
    const nowIso = new Date().toISOString()

    if (payload.id) {
      if (isSupabaseConfigured && supabase && authStore.user) {
        const { error: err } = await supabase
          .from('budgets')
          .update({ amount: cleanAmount, category_id: payload.category_id } as never)
          .eq('id', payload.id)
        if (err) throw new Error(err.message)
      }
      budgets.value = budgets.value.map((b) =>
        b.id === payload.id
          ? { ...b, amount: cleanAmount, category_id: payload.category_id, updated_at: nowIso }
          : b
      )
    } else {
      if (isSupabaseConfigured && supabase && authStore.user) {
        const { data, error: err } = await supabase
          .from('budgets')
          .insert({
            user_id: userId,
            category_id: payload.category_id,
            month: payload.month,
            year: payload.year,
            amount: cleanAmount
          } as never)
          .select('*')
          .single()
        if (err) throw new Error(err.message)
        budgets.value = [...budgets.value, data as unknown as Budget]
      } else {
        budgets.value = [
          ...budgets.value,
          {
            id: generateId('bdg'),
            user_id: userId,
            category_id: payload.category_id,
            month: payload.month,
            year: payload.year,
            amount: cleanAmount,
            created_at: nowIso,
            updated_at: nowIso
          }
        ]
      }
    }
    persistLocalBundle()
  }

  async function deleteBudget(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase && authStore.user) {
      const { error: err } = await supabase.from('budgets').delete().eq('id', id)
      if (err) throw new Error(err.message)
    }
    budgets.value = budgets.value.filter((b) => b.id !== id)
    persistLocalBundle()
  }

  async function copyBudgetsToNextMonth(month: number, year: number): Promise<number> {
    const sourceBudgets = budgets.value.filter((b) => b.month === month && b.year === year)
    if (sourceBudgets.length === 0) return 0

    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year

    let copiedCount = 0
    for (const src of sourceBudgets) {
      const exists = budgets.value.some(
        (b) => b.category_id === src.category_id && b.month === nextMonth && b.year === nextYear
      )
      if (!exists) {
        await saveBudget({
          category_id: src.category_id,
          month: nextMonth,
          year: nextYear,
          amount: src.amount
        })
        copiedCount++
      }
    }
    return copiedCount
  }

  // ---------------------------------------------------------------------------
  // CRUD METAS DE AHORRO Y APORTES/RETIROS
  // ---------------------------------------------------------------------------
  async function saveSavingsGoal(payload: {
    id?: string
    name: string
    description: string | null
    target_amount: number
    target_date: string | null
    color: string
    icon: string
    linked_account_id: string | null
    status?: SavingsGoal['status']
  }): Promise<void> {
    const cleanName = payload.name.trim()
    if (!cleanName) throw new Error('El nombre de la meta es obligatorio.')
    const cleanTarget = toCleanAmount(payload.target_amount)
    if (cleanTarget <= 0) throw new Error('La meta debe tener un monto objetivo mayor a 0 CLP.')

    const userId = authStore.user?.id ?? DEMO_USER_ID
    const nowIso = new Date().toISOString()

    if (payload.id) {
      if (isSupabaseConfigured && supabase && authStore.user) {
        const { error: err } = await supabase
          .from('savings_goals')
          .update({
            name: cleanName,
            description: payload.description,
            target_amount: cleanTarget,
            target_date: payload.target_date,
            color: payload.color,
            icon: payload.icon,
            linked_account_id: payload.linked_account_id,
            status: payload.status ?? 'active'
          } as never)
          .eq('id', payload.id)
        if (err) throw new Error(err.message)
      }
      savingsGoals.value = savingsGoals.value.map((g) =>
        g.id === payload.id
          ? {
              ...g,
              name: cleanName,
              description: payload.description,
              target_amount: cleanTarget,
              target_date: payload.target_date,
              color: payload.color,
              icon: payload.icon,
              linked_account_id: payload.linked_account_id,
              status: payload.status ?? g.status,
              updated_at: nowIso
            }
          : g
      )
    } else {
      if (isSupabaseConfigured && supabase && authStore.user) {
        const { data, error: err } = await supabase
          .from('savings_goals')
          .insert({
            user_id: userId,
            name: cleanName,
            description: payload.description,
            target_amount: cleanTarget,
            current_amount: 0,
            target_date: payload.target_date,
            status: 'active',
            color: payload.color,
            icon: payload.icon,
            linked_account_id: payload.linked_account_id
          } as never)
          .select('*')
          .single()
        if (err) throw new Error(err.message)
        savingsGoals.value = [...savingsGoals.value, data as unknown as SavingsGoal]
      } else {
        savingsGoals.value = [
          ...savingsGoals.value,
          {
            id: generateId('goal'),
            user_id: userId,
            name: cleanName,
            description: payload.description,
            target_amount: cleanTarget,
            current_amount: 0,
            target_date: payload.target_date,
            status: 'active',
            color: payload.color,
            icon: payload.icon,
            linked_account_id: payload.linked_account_id,
            created_at: nowIso,
            updated_at: nowIso
          }
        ]
      }
    }
    persistLocalBundle()
  }

  async function deleteSavingsGoal(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase && authStore.user) {
      const { error: err } = await supabase.from('savings_goals').delete().eq('id', id)
      if (err) throw new Error(err.message)
    }
    savingsGoals.value = savingsGoals.value.filter((g) => g.id !== id)
    savingsContributions.value = savingsContributions.value.filter((c) => c.goal_id !== id)
    persistLocalBundle()
  }

  async function recordSavingsContribution(payload: {
    goal_id: string
    type: 'deposit' | 'withdrawal'
    amount: number
    contribution_date: string
    source_account_id: string | null
    create_internal_transfer: boolean
    notes: string | null
  }): Promise<void> {
    const goal = savingsGoals.value.find((g) => g.id === payload.goal_id)
    if (!goal) throw new Error('Meta de ahorro no encontrada.')

    const cleanAmount = toCleanAmount(payload.amount)
    if (cleanAmount <= 0) throw new Error('El monto debe ser un número entero mayor a 0 CLP.')

    if (payload.type === 'withdrawal' && cleanAmount > goal.current_amount) {
      throw new Error('El monto del retiro no puede superar el saldo acumulado en la meta.')
    }

    const destAccountId = payload.create_internal_transfer ? goal.linked_account_id : null

    if (isSupabaseConfigured && supabase && authStore.user) {
      const { error: rpcErr } = await supabase.rpc('record_savings_contribution', {
        p_goal_id: payload.goal_id,
        p_type: payload.type,
        p_amount: cleanAmount,
        p_contribution_date: payload.contribution_date,
        p_source_account_id: payload.source_account_id,
        p_destination_account_id: destAccountId,
        p_notes: payload.notes
      } as never)
      if (rpcErr) throw new Error(rpcErr.message)
      await fetchAllData()
      return
    }

    // Ejecución atómica local
    const userId = authStore.user?.id ?? DEMO_USER_ID
    let linkedTxId: string | null = null

    if (
      payload.create_internal_transfer &&
      payload.source_account_id &&
      goal.linked_account_id &&
      payload.source_account_id !== goal.linked_account_id
    ) {
      const tx = await createTransaction({
        type: 'transfer',
        amount: cleanAmount,
        category_id: null,
        account_id:
          payload.type === 'deposit' ? payload.source_account_id : goal.linked_account_id,
        destination_account_id:
          payload.type === 'deposit' ? goal.linked_account_id : payload.source_account_id,
        description:
          payload.type === 'deposit'
            ? `Aporte a meta: ${goal.name}`
            : `Retiro de meta: ${goal.name}`,
        notes: payload.notes,
        transaction_date: payload.contribution_date,
        status: 'confirmed'
      })
      linkedTxId = tx.id
    }

    const contrib: SavingsContribution = {
      id: generateId('contrib'),
      user_id: userId,
      goal_id: payload.goal_id,
      account_id: payload.source_account_id,
      linked_transaction_id: linkedTxId,
      type: payload.type,
      amount: cleanAmount,
      contribution_date: payload.contribution_date,
      notes: payload.notes,
      created_at: new Date().toISOString()
    }

    savingsContributions.value = [contrib, ...savingsContributions.value]

    const nextAmount =
      payload.type === 'deposit'
        ? goal.current_amount + cleanAmount
        : Math.max(0, goal.current_amount - cleanAmount)

    savingsGoals.value = savingsGoals.value.map((g) =>
      g.id === goal.id
        ? {
            ...g,
            current_amount: nextAmount,
            status: nextAmount >= g.target_amount ? 'completed' : g.status,
            updated_at: new Date().toISOString()
          }
        : g
    )

    persistLocalBundle()
  }

  return {
    periodFilter,
    loading,
    error,
    quickTransactionDialogOpen,
    accounts,
    categories,
    transactions,
    budgets,
    savingsGoals,
    savingsContributions,
    accountsWithBalances,
    activeAccounts,
    totalNetWorth,
    periodMetrics,
    budgetSummaries,
    activeCategories,
    incomeCategories,
    expenseCategories,
    fetchAllData,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getCategoryUsageCount,
    createCategory,
    updateCategory,
    deleteOrReassignCategory,
    createAccount,
    updateAccount,
    saveBudget,
    deleteBudget,
    copyBudgetsToNextMonth,
    saveSavingsGoal,
    deleteSavingsGoal,
    recordSavingsContribution
  }
})

