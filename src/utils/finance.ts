import type {
  Account,
  AccountWithBalance,
  Budget,
  BudgetStatus,
  BudgetSummary,
  Category,
  PeriodFilter,
  PeriodMetrics,
  SavingsContribution,
  SavingsGoal,
  Transaction
} from '@/types/finance'
import { parseYearMonth } from '@/utils/format'

/**
 * Verifica si una fecha 'YYYY-MM-DD' pertenece al filtro de período indicado.
 * Opera directamente sobre strings 'YYYY-MM-DD' para evitar errores de huso horario.
 */
export function isDateInPeriod(isoDate: string, filter: PeriodFilter): boolean {
  const clean = isoDate.slice(0, 10)
  if (filter.startDate && filter.endDate) {
    return clean >= filter.startDate.slice(0, 10) && clean <= filter.endDate.slice(0, 10)
  }
  const { year, month } = parseYearMonth(clean)
  if (year !== filter.year) return false
  if (filter.month === 0) return true // 0 = Todo el año
  return month === filter.month
}

/**
 * Retorna el filtro correspondiente al mes inmediatamente anterior.
 */
export function getPreviousPeriodFilter(filter: PeriodFilter): PeriodFilter {
  if (filter.month <= 1) {
    return { month: 12, year: filter.year - 1 }
  }
  return { month: filter.month - 1, year: filter.year }
}

/**
 * Calcula los saldos derivados de cada cuenta a partir de su saldo inicial y
 * los movimientos confirmados (ingresos, egresos y transferencias).
 * Las transferencias entre cuentas no alteran el patrimonio total.
 */
export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): AccountWithBalance[] {
  return accounts.map((account) => {
    let incomeTotal = 0
    let expenseTotal = 0
    let transfersIn = 0
    let transfersOut = 0

    for (const tx of transactions) {
      if (tx.status !== 'confirmed') continue
      const amount = Math.round(Number(tx.amount) || 0)
      if (amount <= 0) continue

      if (tx.type === 'income' && tx.account_id === account.id) {
        incomeTotal += amount
      } else if (tx.type === 'expense' && tx.account_id === account.id) {
        expenseTotal += amount
      } else if (tx.type === 'transfer') {
        if (tx.account_id === account.id && tx.destination_account_id !== account.id) {
          transfersOut += amount
        } else if (tx.destination_account_id === account.id && tx.account_id !== account.id) {
          transfersIn += amount
        }
      }
    }

    const initial = Math.round(Number(account.initial_balance) || 0)
    const currentBalance = initial + incomeTotal + transfersIn - expenseTotal - transfersOut

    return {
      ...account,
      initial_balance: initial,
      current_balance: currentBalance,
      income_total: incomeTotal,
      expense_total: expenseTotal,
      transfers_in: transfersIn,
      transfers_out: transfersOut
    }
  })
}

/**
 * Determina el estado semántico de un presupuesto según el porcentaje consumido:
 * - normal: < 80%
 * - warning: >= 80% y < 100%
 * - reached: === 100%
 * - exceeded: > 100%
 */
export function getBudgetStatus(spentAmount: number, budgetAmount: number): BudgetStatus {
  if (budgetAmount <= 0) return spentAmount > 0 ? 'exceeded' : 'normal'
  const ratio = (spentAmount / budgetAmount) * 100
  if (ratio > 100) return 'exceeded'
  if (Math.abs(ratio - 100) < 0.0001) return 'reached'
  if (ratio >= 80) return 'warning'
  return 'normal'
}

/**
 * Calcula el resumen de presupuestos del período cruzando con los egresos confirmados.
 */
export function calculateBudgetSummaries(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  filter: PeriodFilter
): BudgetSummary[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  const periodBudgets = budgets.filter(
    (b) => b.year === filter.year && (filter.month === 0 || b.month === filter.month)
  )

  return periodBudgets.map((budget) => {
    const category = categoryMap.get(budget.category_id)
    const budgetAmount = Math.round(Number(budget.amount) || 0)

    const spentAmount = transactions
      .filter(
        (tx) =>
          tx.status === 'confirmed' &&
          tx.type === 'expense' &&
          tx.category_id === budget.category_id &&
          isDateInPeriod(tx.transaction_date, { month: budget.month, year: budget.year })
      )
      .reduce((acc, tx) => acc + Math.round(Number(tx.amount) || 0), 0)

    const availableAmount = budgetAmount - spentAmount
    const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0

    return {
      ...budget,
      amount: budgetAmount,
      category_name: category?.name ?? 'Categoría eliminada',
      category_icon: category?.icon ?? 'category',
      category_color: category?.color ?? '#64748B',
      spent_amount: spentAmount,
      available_amount: availableAmount,
      percentage_used: Number(percentageUsed.toFixed(2)),
      status: getBudgetStatus(spentAmount, budgetAmount)
    }
  })
}

/**
 * Calcula aportes netos a metas de ahorro en un período:
 * Aportes (deposit) - Retiros (withdrawal).
 * Los aportes a ahorro NO son gastos.
 */
export function calculateNetSavingsInPeriod(
  contributions: SavingsContribution[],
  filter: PeriodFilter
): number {
  return contributions
    .filter((c) => isDateInPeriod(c.contribution_date, filter))
    .reduce((acc, c) => {
      const amount = Math.round(Number(c.amount) || 0)
      return c.type === 'deposit' ? acc + amount : acc - amount
    }, 0)
}

/**
 * Calcula todos los KPIs financieros de un período siguiendo las reglas contables:
 * - Ingresos: suma de ingresos confirmados
 * - Egresos: suma de egresos confirmados (sin transferencias ni ahorros)
 * - Balance neto: Ingresos - Egresos
 * - Balance disponible estimado: Ingresos - Egresos - max(0, Ahorro neto del mes)
 * - Porcentaje de ahorro: (Aportes netos / Ingresos) * 100 si Ingresos > 0, sino 0
 */
export function calculatePeriodMetrics(
  transactions: Transaction[],
  budgets: Budget[],
  contributions: SavingsContribution[],
  filter: PeriodFilter
): PeriodMetrics {
  let income = 0
  let expenses = 0
  let pendingExpenses = 0
  let pendingIncome = 0

  for (const tx of transactions) {
    if (!isDateInPeriod(tx.transaction_date, filter)) continue
    const amount = Math.round(Number(tx.amount) || 0)
    if (amount <= 0) continue

    if (tx.status === 'confirmed') {
      if (tx.type === 'income') income += amount
      else if (tx.type === 'expense') expenses += amount
      // tx.type === 'transfer' se ignora deliberadamente en ingresos y egresos
    } else if (tx.status === 'pending') {
      if (tx.type === 'income') pendingIncome += amount
      else if (tx.type === 'expense') pendingExpenses += amount
    }
  }

  const netBalance = income - expenses
  const netSavings = calculateNetSavingsInPeriod(contributions, filter)
  const effectiveReservedSavings = Math.max(0, netSavings)
  const estimatedAvailableBalance = netBalance - effectiveReservedSavings

  const savingsRatePercentage =
    income > 0 ? Number(((effectiveReservedSavings / income) * 100).toFixed(2)) : 0

  // Presupuestos del período
  const periodBudgets = budgets.filter(
    (b) => b.year === filter.year && (filter.month === 0 || b.month === filter.month)
  )
  const budgetAssigned = periodBudgets.reduce((acc, b) => acc + Math.round(Number(b.amount) || 0), 0)
  const budgetedCategoryIds = new Set(periodBudgets.map((b) => b.category_id))

  const budgetConsumed = transactions
    .filter(
      (tx) =>
        tx.status === 'confirmed' &&
        tx.type === 'expense' &&
        tx.category_id !== null &&
        budgetedCategoryIds.has(tx.category_id) &&
        isDateInPeriod(tx.transaction_date, filter)
    )
    .reduce((acc, tx) => acc + Math.round(Number(tx.amount) || 0), 0)

  const budgetConsumedPercentage =
    budgetAssigned > 0 ? Number(((budgetConsumed / budgetAssigned) * 100).toFixed(2)) : 0

  // Variación respecto al mes anterior
  const prevFilter = getPreviousPeriodFilter(filter)
  const previousMonthExpenses = transactions
    .filter(
      (tx) =>
        tx.status === 'confirmed' &&
        tx.type === 'expense' &&
        isDateInPeriod(tx.transaction_date, prevFilter)
    )
    .reduce((acc, tx) => acc + Math.round(Number(tx.amount) || 0), 0)

  const expenseVariationPercentage =
    previousMonthExpenses > 0
      ? Number((((expenses - previousMonthExpenses) / previousMonthExpenses) * 100).toFixed(2))
      : null

  return {
    income,
    expenses,
    netBalance,
    estimatedAvailableBalance,
    netSavings,
    savingsRatePercentage,
    budgetAssigned,
    budgetConsumed,
    budgetConsumedPercentage,
    previousMonthExpenses,
    expenseVariationPercentage,
    pendingExpenses,
    pendingIncome
  }
}

/**
 * Estima en cuántos meses se alcanzará una meta de ahorro según el ritmo histórico
 * promedio mensual de aportes netos.
 */
export function estimateMonthsToGoal(
  goal: SavingsGoal,
  contributions: SavingsContribution[]
): { remainingAmount: number; averageMonthlyNet: number; estimatedMonths: number | null } {
  const target = Math.round(Number(goal.target_amount) || 0)
  const current = Math.round(Number(goal.current_amount) || 0)
  const remainingAmount = Math.max(0, target - current)

  if (remainingAmount === 0) {
    return { remainingAmount: 0, averageMonthlyNet: 0, estimatedMonths: 0 }
  }

  const goalContribs = contributions.filter((c) => c.goal_id === goal.id)
  if (goalContribs.length === 0) {
    return { remainingAmount, averageMonthlyNet: 0, estimatedMonths: null }
  }

  const byMonth = new Map<string, number>()
  for (const c of goalContribs) {
    const key = c.contribution_date.slice(0, 7) // YYYY-MM
    const amount = Math.round(Number(c.amount) || 0)
    const signed = c.type === 'deposit' ? amount : -amount
    byMonth.set(key, (byMonth.get(key) ?? 0) + signed)
  }

  const totalNet = Array.from(byMonth.values()).reduce((a, b) => a + b, 0)
  const monthsCount = Math.max(1, byMonth.size)
  const averageMonthlyNet = Math.round(totalNet / monthsCount)

  if (averageMonthlyNet <= 0) {
    return { remainingAmount, averageMonthlyNet, estimatedMonths: null }
  }

  const estimatedMonths = Math.ceil(remainingAmount / averageMonthlyNet)
  return { remainingAmount, averageMonthlyNet, estimatedMonths }
}

/**
 * Genera el contenido CSV compatible con Microsoft Excel en configuración regional chilena:
 * - Incluye BOM UTF-8 (\uFEFF) para tildes y eñes.
 * - Usa punto y coma (;) como delimitador de columnas.
 */
export function generateTransactionsCSV(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[]
): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]))

  const headers = [
    'ID',
    'Fecha (DD/MM/YYYY)',
    'Tipo',
    'Estado',
    'Categoría',
    'Descripción',
    'Cuenta Origen',
    'Cuenta Destino',
    'Monto (CLP)',
    'Observaciones'
  ]

  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return ''
    const str = String(val).replace(/"/g, '""')
    return /[;"\n\r]/.test(str) ? `"${str}"` : str
  }

  const typeLabel: Record<string, string> = {
    income: 'Ingreso',
    expense: 'Egreso',
    transfer: 'Transferencia'
  }

  const statusLabel: Record<string, string> = {
    confirmed: 'Confirmado',
    pending: 'Pendiente'
  }

  const rows = transactions.map((tx) => {
    const [y, m, d] = tx.transaction_date.slice(0, 10).split('-')
    const dateCL = `${d}/${m}/${y}`
    return [
      escapeCell(tx.id),
      escapeCell(dateCL),
      escapeCell(typeLabel[tx.type] ?? tx.type),
      escapeCell(statusLabel[tx.status] ?? tx.status),
      escapeCell(tx.category_id ? (categoryMap.get(tx.category_id) ?? 'Sin categoría') : 'Transferencia entre cuentas'),
      escapeCell(tx.description),
      escapeCell(accountMap.get(tx.account_id) ?? ''),
      escapeCell(tx.destination_account_id ? (accountMap.get(tx.destination_account_id) ?? '') : ''),
      escapeCell(Math.round(Number(tx.amount) || 0)),
      escapeCell(tx.notes ?? '')
    ].join(';')
  })

  return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n')
}

