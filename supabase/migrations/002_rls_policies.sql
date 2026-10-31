-- =============================================================================
-- MIGRACIÓN 002: POLÍTICAS ROW LEVEL SECURITY (RLS) ESTRICTAS
-- =============================================================================
-- Garantiza que cada usuario autenticado acceda exclusivamente a sus propios
-- registros y que ninguna llave foránea apunte a recursos de otro usuario.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;

-- Forzar RLS incluso para propietarios de tablas si no usan rol bypass
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.budgets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions FORCE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 1. Políticas para profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. Políticas para accounts
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "accounts_select_own" ON public.accounts;
CREATE POLICY "accounts_select_own" ON public.accounts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "accounts_insert_own" ON public.accounts;
CREATE POLICY "accounts_insert_own" ON public.accounts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "accounts_update_own" ON public.accounts;
CREATE POLICY "accounts_update_own" ON public.accounts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "accounts_delete_own" ON public.accounts;
CREATE POLICY "accounts_delete_own" ON public.accounts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. Políticas para categories
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "categories_select_own" ON public.categories;
CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "categories_insert_own" ON public.categories;
CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "categories_update_own" ON public.categories;
CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "categories_delete_own" ON public.categories;
CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. Políticas para transactions (con validación explícita de FK pertenecientes al usuario)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.user_id = auth.uid()
    )
    AND (
      destination_account_id IS NULL OR EXISTS (
        SELECT 1 FROM public.accounts da
        WHERE da.id = destination_account_id AND da.user_id = auth.uid()
      )
    )
    AND (
      category_id IS NULL OR EXISTS (
        SELECT 1 FROM public.categories c
        WHERE c.id = category_id AND c.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "transactions_update_own" ON public.transactions;
CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.user_id = auth.uid()
    )
    AND (
      destination_account_id IS NULL OR EXISTS (
        SELECT 1 FROM public.accounts da
        WHERE da.id = destination_account_id AND da.user_id = auth.uid()
      )
    )
    AND (
      category_id IS NULL OR EXISTS (
        SELECT 1 FROM public.categories c
        WHERE c.id = category_id AND c.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "transactions_delete_own" ON public.transactions;
CREATE POLICY "transactions_delete_own" ON public.transactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. Políticas para budgets
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "budgets_select_own" ON public.budgets;
CREATE POLICY "budgets_select_own" ON public.budgets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "budgets_insert_own" ON public.budgets;
CREATE POLICY "budgets_insert_own" ON public.budgets
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.id = category_id AND c.user_id = auth.uid() AND c.type = 'expense'
    )
  );

DROP POLICY IF EXISTS "budgets_update_own" ON public.budgets;
CREATE POLICY "budgets_update_own" ON public.budgets
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.id = category_id AND c.user_id = auth.uid() AND c.type = 'expense'
    )
  );

DROP POLICY IF EXISTS "budgets_delete_own" ON public.budgets;
CREATE POLICY "budgets_delete_own" ON public.budgets
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. Políticas para savings_goals
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "savings_goals_select_own" ON public.savings_goals;
CREATE POLICY "savings_goals_select_own" ON public.savings_goals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "savings_goals_insert_own" ON public.savings_goals;
CREATE POLICY "savings_goals_insert_own" ON public.savings_goals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "savings_goals_update_own" ON public.savings_goals;
CREATE POLICY "savings_goals_update_own" ON public.savings_goals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "savings_goals_delete_own" ON public.savings_goals;
CREATE POLICY "savings_goals_delete_own" ON public.savings_goals
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. Políticas para savings_contributions
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "savings_contributions_select_own" ON public.savings_contributions;
CREATE POLICY "savings_contributions_select_own" ON public.savings_contributions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "savings_contributions_insert_own" ON public.savings_contributions;
CREATE POLICY "savings_contributions_insert_own" ON public.savings_contributions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.savings_goals g
      WHERE g.id = goal_id AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "savings_contributions_delete_own" ON public.savings_contributions;
CREATE POLICY "savings_contributions_delete_own" ON public.savings_contributions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

