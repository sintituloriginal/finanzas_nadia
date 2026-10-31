import { describe, expect, it } from 'vitest'
import {
  calculateAccountBalances,
  calculateBudgetSummaries,
  calculateNetSavingsInPeriod,
  calculatePeriodMetrics,
  estimateMonthsToGoal,
  generateTransactionsCSV,
  getBudgetStatus
} from '@/utils/finance'
import { formatCLP, formatDateCL } from '@/utils/format'
import type {
  Account,
  Budget,
  Category,
  SavingsContribution,
  SavingsGoal,
  Transaction
} from '@/types/finance'

const USER_A = 'user-a-uuid'

const baseAccounts: Account[] = [
  {
    id: 'acc-checking',
    user_id: USER_A,
    name: 'Cuenta Corriente',
    type: 'checking',
    initial_balance: 500000,
    color: '#0F766E',
    icon: 'account_balance',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'acc-savings',
    user_id: USER_A,
    name: 'Cuenta Ahorro',
    type: 'savings',
    initial_balance: 1000000,
    color: '#10B981',
    icon: 'savings',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
]

const baseCategories: Category[] = [
  {
    id: 'cat-sueldo',
    user_id: USER_A,
    name: 'Sueldo',
    type: 'income',
    icon: 'work',
    color: '#16A34A',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-alimentacion',
    user_id: USER_A,
    name: 'Alimentación',
    type: 'expense',
    icon: 'restaurant',
    color: '#EA580C',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-transporte',
    user_id: USER_A,
    name: 'Transporte',
    type: 'expense',
    icon: 'directions_bus',
    color: '#2563EB',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
]

describe('Motor Financiero — Reglas Contables en CLP', () => {
  it('calcula correctamente el balance mensual (Ingresos - Egresos) excluyendo transferencias', () => {
    const transactions: Transaction[] = [
      {
        id: 't1',
        user_id: USER_A,
        type: 'income',
        amount: 1500000,
        category_id: 'cat-sueldo',
        account_id: 'acc-checking',
        destination_account_id: null,
        description: 'Sueldo Octubre',
        notes: null,
        transaction_date: '2026-10-01',
        status: 'confirmed',
        created_at: '2026-10-01T10:00:00Z',
        updated_at: '2026-10-01T10:00:00Z'
      },
      {
        id: 't2',
        user_id: USER_A,
        type: 'expense',
        amount: 250000,
        category_id: 'cat-alimentacion',
        account_id: 'acc-checking',
        destination_account_id: null,
        description: 'Supermercado',
        notes: null,
        transaction_date: '2026-10-05',
        status: 'confirmed',
        created_at: '2026-10-05T10:00:00Z',
        updated_at: '2026-10-05T10:00:00Z'
      },
      {
        id: 't3',
        user_id: USER_A,
        type: 'transfer',
        amount: 300000,
        category_id: null,
        account_id: 'acc-checking',
        destination_account_id: 'acc-savings',
        description: 'Traspaso a cuenta de ahorro',
        notes: null,
        transaction_date: '2026-10-06',
        status: 'confirmed',
        created_at: '2026-10-06T10:00:00Z',
        updated_at: '2026-10-06T10:00:00Z'
      }
    ]

    const metrics = calculatePeriodMetrics(transactions, [], [], { month: 10, year: 2026 })
    expect(metrics.income).toBe(1500000)
    expect(metrics.expenses).toBe(250000)
    expect(metrics.netBalance).toBe(1250000)
  })

  it('mantiene el patrimonio total invariante ante transferencias entre cuentas', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-transfer',
        user_id: USER_A,
        type: 'transfer',
        amount: 200000,
        category_id: null,
        account_id: 'acc-checking',
        destination_account_id: 'acc-savings',
        description: 'Transferencia interna',
        notes: null,
        transaction_date: '2026-10-10',
        status: 'confirmed',
        created_at: '2026-10-10T10:00:00Z',
        updated_at: '2026-10-10T10:00:00Z'
      }
    ]

    const balances = calculateAccountBalances(baseAccounts, transactions)
    const checking = balances.find((a) => a.id === 'acc-checking')!
    const savings = balances.find((a) => a.id === 'acc-savings')!

    expect(checking.current_balance).toBe(300000) // 500.000 - 200.000
    expect(savings.current_balance).toBe(1200000) // 1.000.000 + 200.000
    expect(checking.current_balance + savings.current_balance).toBe(1500000)
  })

  it('clasifica correctamente los estados de presupuestos (normal, warning, reached, exceeded)', () => {
    expect(getBudgetStatus(150000, 250000)).toBe('normal') // 60%
    expect(getBudgetStatus(200000, 250000)).toBe('warning') // 80%
    expect(getBudgetStatus(245000, 250000)).toBe('warning') // 98%
    expect(getBudgetStatus(250000, 250000)).toBe('reached') // 100%
    expect(getBudgetStatus(260000, 250000)).toBe('exceeded') // 104%

    const budgets: Budget[] = [
      {
        id: 'b1',
        user_id: USER_A,
        category_id: 'cat-alimentacion',
        month: 10,
        year: 2026,
        amount: 250000,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z'
      }
    ]
    const transactions: Transaction[] = [
      {
        id: 't-exp-1',
        user_id: USER_A,
        type: 'expense',
        amount: 210000,
        category_id: 'cat-alimentacion',
        account_id: 'acc-checking',
        destination_account_id: null,
        description: 'Compras alimentación',
        notes: null,
        transaction_date: '2026-10-12',
        status: 'confirmed',
        created_at: '2026-10-12T00:00:00Z',
        updated_at: '2026-10-12T00:00:00Z'
      }
    ]

    const summaries = calculateBudgetSummaries(budgets, transactions, baseCategories, {
      month: 10,
      year: 2026
    })
    expect(summaries).toHaveLength(1)
    expect(summaries[0].spent_amount).toBe(210000)
    expect(summaries[0].available_amount).toBe(40000)
    expect(summaries[0].percentage_used).toBe(84)
    expect(summaries[0].status).toBe('warning')
  })

  it('procesa aportes y retiros de ahorro sin contabilizarlos como gastos y proyecta la meta', () => {
    const contributions: SavingsContribution[] = [
      {
        id: 'c1',
        user_id: USER_A,
        goal_id: 'g1',
        account_id: 'acc-checking',
        linked_transaction_id: null,
        type: 'deposit',
        amount: 250000,
        contribution_date: '2026-10-05',
        notes: null,
        created_at: '2026-10-05T00:00:00Z'
      },
      {
        id: 'c2',
        user_id: USER_A,
        goal_id: 'g1',
        account_id: 'acc-checking',
        linked_transaction_id: null,
        type: 'withdrawal',
        amount: 50000,
        contribution_date: '2026-10-18',
        notes: null,
        created_at: '2026-10-18T00:00:00Z'
      }
    ]

    const netSavings = calculateNetSavingsInPeriod(contributions, { month: 10, year: 2026 })
    expect(netSavings).toBe(200000)

    const goal: SavingsGoal = {
      id: 'g1',
      user_id: USER_A,
      name: 'Instrumento musical',
      description: null,
      target_amount: 1000000,
      current_amount: 400000,
      target_date: null,
      status: 'active',
      color: '#10B981',
      icon: 'music_note',
      linked_account_id: 'acc-savings',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-10-18T00:00:00Z'
    }

    const projection = estimateMonthsToGoal(goal, contributions)
    expect(projection.remainingAmount).toBe(600000)
    expect(projection.averageMonthlyNet).toBe(200000)
    expect(projection.estimatedMonths).toBe(3)
  })

  it('maneja períodos sin ingresos sin producir división por cero (NaN / Infinity)', () => {
    const contributions: SavingsContribution[] = [
      {
        id: 'c1',
        user_id: USER_A,
        goal_id: 'g1',
        account_id: 'acc-checking',
        linked_transaction_id: null,
        type: 'deposit',
        amount: 100000,
        contribution_date: '2026-10-05',
        notes: null,
        created_at: '2026-10-05T00:00:00Z'
      }
    ]

    const metrics = calculatePeriodMetrics([], [], contributions, { month: 10, year: 2026 })
    expect(metrics.income).toBe(0)
    expect(metrics.savingsRatePercentage).toBe(0)
    expect(Number.isFinite(metrics.savingsRatePercentage)).toBe(true)
  })

  it('filtra correctamente entre meses y años distintos', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-sep-2025',
        user_id: USER_A,
        type: 'expense',
        amount: 80000,
        category_id: 'cat-transporte',
        account_id: 'acc-checking',
        destination_account_id: null,
        description: 'Gasto Sept 2025',
        notes: null,
        transaction_date: '2025-09-15',
        status: 'confirmed',
        created_at: '2025-09-15T00:00:00Z',
        updated_at: '2025-09-15T00:00:00Z'
      },
      {
        id: 'tx-oct-2026',
        user_id: USER_A,
        type: 'expense',
        amount: 120000,
        category_id: 'cat-transporte',
        account_id: 'acc-checking',
        destination_account_id: null,
        description: 'Gasto Oct 2026',
        notes: null,
        transaction_date: '2026-10-15',
        status: 'confirmed',
        created_at: '2026-10-15T00:00:00Z',
        updated_at: '2026-10-15T00:00:00Z'
      }
    ]

    const m2025 = calculatePeriodMetrics(transactions, [], [], { month: 9, year: 2025 })
    const m2026 = calculatePeriodMetrics(transactions, [], [], { month: 10, year: 2026 })

    expect(m2025.expenses).toBe(80000)
    expect(m2026.expenses).toBe(120000)
  })

  it('no computa movimientos pendientes en saldos de cuentas ni en egresos confirmados', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-pending',
        user_id: USER_A,
        type: 'expense',
        amount: 95000,
        category_id: 'cat-alimentacion',
        account_id: 'acc-checking',
        destination_account_id: null,
        description: 'Compra por confirmar',
        notes: null,
        transaction_date: '2026-10-20',
        status: 'pending',
        created_at: '2026-10-20T00:00:00Z',
        updated_at: '2026-10-20T00:00:00Z'
      }
    ]

    const balances = calculateAccountBalances(baseAccounts, transactions)
    expect(balances[0].current_balance).toBe(500000) // Intacto

    const metrics = calculatePeriodMetrics(transactions, [], [], { month: 10, year: 2026 })
    expect(metrics.expenses).toBe(0)
    expect(metrics.pendingExpenses).toBe(95000)
  })

  it('formatea CLP, fechas DD/MM/YYYY y exporta CSV con UTF-8 BOM para Excel Chile', () => {
    expect(formatCLP(250000)).toContain('250.000')
    expect(formatDateCL('2026-10-31')).toBe('31/10/2026')

    const csv = generateTransactionsCSV(
      [
        {
          id: 'tx-csv',
          user_id: USER_A,
          type: 'expense',
          amount: 45990,
          category_id: 'cat-alimentacion',
          account_id: 'acc-checking',
          destination_account_id: null,
          description: 'Colación y café',
          notes: null,
          transaction_date: '2026-10-31',
          status: 'confirmed',
          created_at: '2026-10-31T00:00:00Z',
          updated_at: '2026-10-31T00:00:00Z'
        }
      ],
      baseCategories,
      baseAccounts
    )

    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('31/10/2026;Egreso;Confirmado;Alimentación;Colación y café')
  })
})

