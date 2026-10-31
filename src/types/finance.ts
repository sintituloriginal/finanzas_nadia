export type TransactionType = 'income' | 'expense' | 'transfer'
export type TransactionStatus = 'pending' | 'confirmed'
export type CategoryType = 'income' | 'expense'
export type AccountType = 'checking' | 'sight' | 'savings' | 'cash' | 'credit'
export type BudgetStatus = 'normal' | 'warning' | 'reached' | 'exceeded'
export type SavingsGoalStatus = 'active' | 'completed' | 'paused'
export type SavingsContributionType = 'deposit' | 'withdrawal'
export type ThemePreference = 'light' | 'dark' | 'system'

export interface Profile {
  id: string
  full_name: string
  currency: 'CLP'
  timezone: string
  theme_preference: ThemePreference
  default_account_id: string | null
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  initial_balance: number
  color: string
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AccountWithBalance extends Account {
  current_balance: number
  income_total: number
  expense_total: number
  transfers_in: number
  transfers_out: number
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  icon: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category_id: string | null
  account_id: string
  destination_account_id: string | null
  description: string
  notes: string | null
  transaction_date: string // YYYY-MM-DD
  status: TransactionStatus
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  month: number // 1..12
  year: number
  amount: number
  created_at: string
  updated_at: string
}

export interface BudgetSummary extends Budget {
  category_name: string
  category_icon: string
  category_color: string
  spent_amount: number
  available_amount: number
  percentage_used: number
  status: BudgetStatus
}

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  target_date: string | null
  status: SavingsGoalStatus
  color: string
  icon: string
  linked_account_id: string | null
  created_at: string
  updated_at: string
}

export interface SavingsContribution {
  id: string
  user_id: string
  goal_id: string
  account_id: string | null
  linked_transaction_id: string | null
  type: SavingsContributionType
  amount: number
  contribution_date: string // YYYY-MM-DD
  notes: string | null
  created_at: string
}

export interface PeriodFilter {
  month: number // 1..12 (0 = todo el año)
  year: number
  startDate?: string | null
  endDate?: string | null
}

export interface PeriodMetrics {
  income: number
  expenses: number
  netBalance: number
  estimatedAvailableBalance: number
  netSavings: number
  savingsRatePercentage: number
  budgetAssigned: number
  budgetConsumed: number
  budgetConsumedPercentage: number
  previousMonthExpenses: number
  expenseVariationPercentage: number | null
  pendingExpenses: number
  pendingIncome: number
}

