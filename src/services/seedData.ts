import type {
  Account,
  Budget,
  Category,
  Profile,
  SavingsContribution,
  SavingsGoal,
  Transaction
} from '@/types/finance'

export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001'

export function createInitialSeedData(userId = DEMO_USER_ID): {
  profile: Profile
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  savingsContributions: SavingsContribution[]
} {
  const now = new Date().toISOString()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const pad = (n: number) => String(n).padStart(2, '0')
  const ym = `${currentYear}-${pad(currentMonth)}`
  const prevYm = `${prevYear}-${pad(prevMonth)}`

  const accounts: Account[] = [
    {
      id: 'acc-checking-1',
      user_id: userId,
      name: 'Cuenta Corriente Principal',
      type: 'checking',
      initial_balance: 850000,
      color: '#0F766E',
      icon: 'account_balance',
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 'acc-sight-1',
      user_id: userId,
      name: 'Cuenta Vista / RUT',
      type: 'sight',
      initial_balance: 180000,
      color: '#2563EB',
      icon: 'credit_card',
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 'acc-savings-1',
      user_id: userId,
      name: 'Cuenta de Ahorro UF',
      type: 'savings',
      initial_balance: 2400000,
      color: '#10B981',
      icon: 'savings',
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 'acc-cash-1',
      user_id: userId,
      name: 'Efectivo',
      type: 'cash',
      initial_balance: 65000,
      color: '#F59E0B',
      icon: 'payments',
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ]

  const expenseCategories: Array<{ id: string; name: string; icon: string; color: string }> = [
    { id: 'cat-exp-vivienda', name: 'Vivienda', icon: 'home', color: '#0F766E' },
    { id: 'cat-exp-alimentacion', name: 'Alimentación', icon: 'restaurant', color: '#EA580C' },
    { id: 'cat-exp-supermercado', name: 'Supermercado', icon: 'shopping_cart', color: '#16A34A' },
    { id: 'cat-exp-transporte', name: 'Transporte', icon: 'directions_bus', color: '#2563EB' },
    { id: 'cat-exp-combustible', name: 'Combustible', icon: 'local_gas_station', color: '#D97706' },
    { id: 'cat-exp-servicios', name: 'Servicios básicos', icon: 'bolt', color: '#0284C7' },
    { id: 'cat-exp-internet', name: 'Internet y telefonía', icon: 'wifi', color: '#4F46E5' },
    { id: 'cat-exp-salud', name: 'Salud', icon: 'medical_services', color: '#DC2626' },
    { id: 'cat-exp-gimnasio', name: 'Gimnasio', icon: 'fitness_center', color: '#059669' },
    { id: 'cat-exp-musica', name: 'Música e instrumentos', icon: 'music_note', color: '#7C3AED' },
    { id: 'cat-exp-entretenimiento', name: 'Entretenimiento', icon: 'movie', color: '#DB2777' },
    { id: 'cat-exp-compras', name: 'Compras', icon: 'shopping_bag', color: '#9333EA' },
    { id: 'cat-exp-familia', name: 'Familia', icon: 'family_restroom', color: '#0D9488' },
    { id: 'cat-exp-donaciones', name: 'Donaciones', icon: 'volunteer_activism', color: '#E11D48' },
    { id: 'cat-exp-suscripciones', name: 'Suscripciones', icon: 'subscriptions', color: '#6366F1' },
    { id: 'cat-exp-otros', name: 'Otros', icon: 'more_horiz', color: '#64748B' }
  ]

  const incomeCategories: Array<{ id: string; name: string; icon: string; color: string }> = [
    { id: 'cat-inc-sueldo', name: 'Sueldo', icon: 'work', color: '#16A34A' },
    { id: 'cat-inc-bonos', name: 'Bonos', icon: 'workspace_premium', color: '#0D9488' },
    { id: 'cat-inc-freelance', name: 'Trabajos independientes', icon: 'laptop_mac', color: '#2563EB' },
    { id: 'cat-inc-reembolsos', name: 'Reembolsos', icon: 'replay', color: '#7C3AED' },
    { id: 'cat-inc-otros', name: 'Otros ingresos', icon: 'attach_money', color: '#059669' }
  ]

  const categories: Category[] = [
    ...expenseCategories.map((c) => ({
      ...c,
      user_id: userId,
      type: 'expense' as const,
      is_active: true,
      created_at: now,
      updated_at: now
    })),
    ...incomeCategories.map((c) => ({
      ...c,
      user_id: userId,
      type: 'income' as const,
      is_active: true,
      created_at: now,
      updated_at: now
    }))
  ]

  const transactions: Transaction[] = [
    // Mes anterior
    {
      id: 'tx-prev-1',
      user_id: userId,
      type: 'income',
      amount: 1850000,
      category_id: 'cat-inc-sueldo',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Liquidación de sueldo mensual',
      notes: 'Empresa principal',
      transaction_date: `${prevYm}-01`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-prev-2',
      user_id: userId,
      type: 'expense',
      amount: 520000,
      category_id: 'cat-exp-vivienda',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Arriendo + Gastos comunes',
      notes: null,
      transaction_date: `${prevYm}-03`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-prev-3',
      user_id: userId,
      type: 'expense',
      amount: 215000,
      category_id: 'cat-exp-supermercado',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Compra mensual supermercado',
      notes: null,
      transaction_date: `${prevYm}-10`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    // Mes actual
    {
      id: 'tx-curr-1',
      user_id: userId,
      type: 'income',
      amount: 1850000,
      category_id: 'cat-inc-sueldo',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Liquidación de sueldo mensual',
      notes: 'Pago puntual día 1',
      transaction_date: `${ym}-01`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-2',
      user_id: userId,
      type: 'income',
      amount: 320000,
      category_id: 'cat-inc-freelance',
      account_id: 'acc-sight-1',
      destination_account_id: null,
      description: 'Asesoría de arquitectura de software',
      notes: 'Boleta de honorarios',
      transaction_date: `${ym}-05`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-3',
      user_id: userId,
      type: 'expense',
      amount: 520000,
      category_id: 'cat-exp-vivienda',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Arriendo y gastos comunes edificio',
      notes: null,
      transaction_date: `${ym}-03`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-4',
      user_id: userId,
      type: 'expense',
      amount: 198000,
      category_id: 'cat-exp-supermercado',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Compra quincenal supermercado',
      notes: null,
      transaction_date: `${ym}-07`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-5',
      user_id: userId,
      type: 'expense',
      amount: 68500,
      category_id: 'cat-exp-servicios',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Electricidad y agua potable',
      notes: null,
      transaction_date: `${ym}-09`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-6',
      user_id: userId,
      type: 'expense',
      amount: 34990,
      category_id: 'cat-exp-internet',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Fibra óptica hogar + plan móvil',
      notes: null,
      transaction_date: `${ym}-11`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-7',
      user_id: userId,
      type: 'expense',
      amount: 92000,
      category_id: 'cat-exp-alimentacion',
      account_id: 'acc-sight-1',
      destination_account_id: null,
      description: 'Almuerzos de trabajo y cafetería',
      notes: null,
      transaction_date: `${ym}-14`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-8',
      user_id: userId,
      type: 'expense',
      amount: 55000,
      category_id: 'cat-exp-transporte',
      account_id: 'acc-sight-1',
      destination_account_id: null,
      description: 'Carga tarjeta Bip! y traslados',
      notes: null,
      transaction_date: `${ym}-15`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-9',
      user_id: userId,
      type: 'expense',
      amount: 74000,
      category_id: 'cat-exp-entretenimiento',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Concierto y salida fin de semana',
      notes: null,
      transaction_date: `${ym}-18`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-10',
      user_id: userId,
      type: 'transfer',
      amount: 300000,
      category_id: null,
      account_id: 'acc-checking-1',
      destination_account_id: 'acc-savings-1',
      description: 'Aporte a meta: Fondo de Emergencia',
      notes: 'Transferencia programada de ahorro mensual',
      transaction_date: `${ym}-06`,
      status: 'confirmed',
      created_at: now,
      updated_at: now
    },
    {
      id: 'tx-curr-11',
      user_id: userId,
      type: 'expense',
      amount: 28900,
      category_id: 'cat-exp-suscripciones',
      account_id: 'acc-checking-1',
      destination_account_id: null,
      description: 'Streaming música y herramientas cloud',
      notes: 'Próximo cargo automático',
      transaction_date: `${ym}-25`,
      status: 'pending',
      created_at: now,
      updated_at: now
    }
  ]

  const budgets: Budget[] = [
    {
      id: 'bdg-1',
      user_id: userId,
      category_id: 'cat-exp-vivienda',
      month: currentMonth,
      year: currentYear,
      amount: 520000,
      created_at: now,
      updated_at: now
    },
    {
      id: 'bdg-2',
      user_id: userId,
      category_id: 'cat-exp-supermercado',
      month: currentMonth,
      year: currentYear,
      amount: 240000,
      created_at: now,
      updated_at: now
    },
    {
      id: 'bdg-3',
      user_id: userId,
      category_id: 'cat-exp-alimentacion',
      month: currentMonth,
      year: currentYear,
      amount: 110000,
      created_at: now,
      updated_at: now
    },
    {
      id: 'bdg-4',
      user_id: userId,
      category_id: 'cat-exp-transporte',
      month: currentMonth,
      year: currentYear,
      amount: 80000,
      created_at: now,
      updated_at: now
    },
    {
      id: 'bdg-5',
      user_id: userId,
      category_id: 'cat-exp-entretenimiento',
      month: currentMonth,
      year: currentYear,
      amount: 70000,
      created_at: now,
      updated_at: now
    }
  ]

  const savingsGoals: SavingsGoal[] = [
    {
      id: 'goal-1',
      user_id: userId,
      name: 'Fondo de Emergencia (6 meses)',
      description: 'Reserva líquida en UF para imprevistos',
      target_amount: 4500000,
      current_amount: 2700000,
      target_date: `${currentYear + 1}-06-30`,
      status: 'active',
      color: '#10B981',
      icon: 'shield',
      linked_account_id: 'acc-savings-1',
      created_at: now,
      updated_at: now
    },
    {
      id: 'goal-2',
      user_id: userId,
      name: 'Compra de Instrumento Musical',
      description: 'Guitarra acústica profesional / interfaz de audio',
      target_amount: 950000,
      current_amount: 420000,
      target_date: `${currentYear}-12-20`,
      status: 'active',
      color: '#7C3AED',
      icon: 'music_note',
      linked_account_id: 'acc-savings-1',
      created_at: now,
      updated_at: now
    },
    {
      id: 'goal-3',
      user_id: userId,
      name: 'Viaje Sur de Chile',
      description: 'Vacaciones en Carretera Austral',
      target_amount: 1200000,
      current_amount: 350000,
      target_date: `${currentYear + 1}-02-15`,
      status: 'active',
      color: '#0284C7',
      icon: 'flight_takeoff',
      linked_account_id: 'acc-savings-1',
      created_at: now,
      updated_at: now
    }
  ]

  const savingsContributions: SavingsContribution[] = [
    {
      id: 'contrib-1',
      user_id: userId,
      goal_id: 'goal-1',
      account_id: 'acc-checking-1',
      linked_transaction_id: 'tx-curr-10',
      type: 'deposit',
      amount: 300000,
      contribution_date: `${ym}-06`,
      notes: 'Aporte mensual sistemático',
      created_at: now
    },
    {
      id: 'contrib-2',
      user_id: userId,
      goal_id: 'goal-2',
      account_id: 'acc-sight-1',
      linked_transaction_id: null,
      type: 'deposit',
      amount: 80000,
      contribution_date: `${ym}-12`,
      notes: 'Reserva desde honorarios independientes',
      created_at: now
    }
  ]

  const profile: Profile = {
    id: userId,
    full_name: 'Usuario Mi Presupuesto',
    currency: 'CLP',
    timezone: 'America/Santiago',
    theme_preference: 'system',
    default_account_id: 'acc-checking-1',
    created_at: now,
    updated_at: now
  }

  return {
    profile,
    accounts,
    categories,
    transactions,
    budgets,
    savingsGoals,
    savingsContributions
  }
}

