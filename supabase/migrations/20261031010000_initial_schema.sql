-- =============================================================================
-- MIGRACIÓN 001: ESQUEMA INICIAL NORMALIZADO — MI PRESUPUESTO (CLP)
-- =============================================================================
-- Reglas de diseño:
-- 1. UUID como clave primaria en todas las entidades.
-- 2. NUMERIC(15, 0) para importes en CLP (pesos chilenos enteros sin pérdida de precisión).
-- 3. Fechas operativas en DATE para evitar desplazamientos por huso horario.
-- 4. Timestamps de auditoría en TIMESTAMPTZ.
-- 5. Integridad referencial compuesta por (id, user_id) para impedir referencias cruzadas entre usuarios.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TABLA: profiles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Usuario',
  currency TEXT NOT NULL DEFAULT 'CLP' CHECK (currency = 'CLP'),
  timezone TEXT NOT NULL DEFAULT 'America/Santiago',
  theme_preference TEXT NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  default_account_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. TABLA: accounts (Cuentas financieras)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  type TEXT NOT NULL CHECK (type IN ('checking', 'sight', 'savings', 'cash', 'credit')),
  initial_balance NUMERIC(15, 0) NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#0F766E',
  icon TEXT NOT NULL DEFAULT 'account_balance',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_accounts_user_name UNIQUE (user_id, name),
  CONSTRAINT uq_accounts_id_user UNIQUE (id, user_id)
);

-- Vincular default_account_id en profiles asegurando pertenencia
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS fk_profiles_default_account;

ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_default_account
  FOREIGN KEY (default_account_id, id)
  REFERENCES public.accounts(id, user_id)
  ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 3. TABLA: categories (Categorías de ingresos y egresos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL DEFAULT 'category',
  color TEXT NOT NULL DEFAULT '#2563EB',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_categories_user_type_name UNIQUE (user_id, type, name),
  CONSTRAINT uq_categories_id_user UNIQUE (id, user_id)
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: transactions (Movimientos: ingreso, egreso, transferencia)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(15, 0) NOT NULL CHECK (amount > 0),
  category_id UUID NULL,
  account_id UUID NOT NULL,
  destination_account_id UUID NULL,
  description TEXT NOT NULL CHECK (char_length(trim(description)) > 0),
  notes TEXT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_transactions_id_user UNIQUE (id, user_id),
  CONSTRAINT fk_transactions_account_owner
    FOREIGN KEY (account_id, user_id)
    REFERENCES public.accounts(id, user_id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_dest_account_owner
    FOREIGN KEY (destination_account_id, user_id)
    REFERENCES public.accounts(id, user_id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_category_owner
    FOREIGN KEY (category_id, user_id)
    REFERENCES public.categories(id, user_id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_transfer_integrity CHECK (
    (type = 'transfer' AND destination_account_id IS NOT NULL AND destination_account_id <> account_id AND category_id IS NULL)
    OR
    (type IN ('income', 'expense') AND destination_account_id IS NULL AND category_id IS NOT NULL)
  )
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: budgets (Presupuestos mensuales por categoría)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL,
  month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year SMALLINT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  amount NUMERIC(15, 0) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_budgets_user_category_period UNIQUE (user_id, category_id, year, month),
  CONSTRAINT fk_budgets_category_owner
    FOREIGN KEY (category_id, user_id)
    REFERENCES public.categories(id, user_id)
    ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 6. TABLA: savings_goals (Metas de ahorro)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  description TEXT NULL,
  target_amount NUMERIC(15, 0) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15, 0) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  color TEXT NOT NULL DEFAULT '#10B981',
  icon TEXT NOT NULL DEFAULT 'savings',
  linked_account_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_savings_goals_id_user UNIQUE (id, user_id),
  CONSTRAINT fk_savings_goals_account_owner
    FOREIGN KEY (linked_account_id, user_id)
    REFERENCES public.accounts(id, user_id)
    ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 7. TABLA: savings_contributions (Aportes y retiros de metas de ahorro)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL,
  account_id UUID NULL,
  linked_transaction_id UUID NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount NUMERIC(15, 0) NOT NULL CHECK (amount > 0),
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_contributions_goal_owner
    FOREIGN KEY (goal_id, user_id)
    REFERENCES public.savings_goals(id, user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_contributions_account_owner
    FOREIGN KEY (account_id, user_id)
    REFERENCES public.accounts(id, user_id)
    ON DELETE SET NULL,
  CONSTRAINT fk_contributions_tx_owner
    FOREIGN KEY (linked_transaction_id, user_id)
    REFERENCES public.transactions(id, user_id)
    ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 8. ÍNDICES DE RENDIMIENTO
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON public.accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON public.categories(user_id, type, is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_status ON public.transactions(user_id, type, status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_account ON public.transactions(user_id, account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_status ON public.savings_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_savings_contributions_goal_date ON public.savings_contributions(user_id, goal_id, contribution_date DESC);

