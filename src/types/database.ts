import type {
  Account,
  Budget,
  Category,
  Profile,
  SavingsContribution,
  SavingsGoal,
  Transaction
} from '@/types/finance'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
      }
      accounts: {
        Row: Account
        Insert: Omit<Account, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at'>>
      }
      savings_goals: {
        Row: SavingsGoal
        Insert: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<SavingsGoal, 'id' | 'user_id' | 'created_at'>>
      }
      savings_contributions: {
        Row: SavingsContribution
        Insert: Omit<SavingsContribution, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<SavingsContribution, 'id' | 'user_id' | 'created_at'>>
      }
    }
    Functions: {
      seed_user_defaults: {
        Args: { p_user_id?: string }
        Returns: void
      }
      record_savings_contribution: {
        Args: {
          p_goal_id: string
          p_type: 'deposit' | 'withdrawal'
          p_amount: number
          p_contribution_date: string
          p_source_account_id?: string | null
          p_destination_account_id?: string | null
          p_notes?: string | null
        }
        Returns: string
      }
      reassign_and_delete_category: {
        Args: {
          p_old_category_id: string
          p_new_category_id: string
        }
        Returns: void
      }
    }
  }
}

