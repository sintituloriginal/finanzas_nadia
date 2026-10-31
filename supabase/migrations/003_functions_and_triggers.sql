-- =============================================================================
-- MIGRACIÓN 003: TRIGGERS, SEMILLAS POR USUARIO Y FUNCIONES RPC TRANSACCIONALES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Trigger para actualizar automáticamente updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_accounts_updated_at ON public.accounts;
CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_budgets_updated_at ON public.budgets;
CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_savings_goals_updated_at ON public.savings_goals;
CREATE TRIGGER trg_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Función idempotente para inicializar categorías y cuentas de un usuario
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_user_defaults(p_user_id UUID DEFAULT auth.uid())
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_checking_id UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Si se invoca desde cliente, validar que solo inicialice su propio usuario
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'No autorizado para inicializar datos de otro usuario';
  END IF;

  -- Crear perfil si no existe
  INSERT INTO public.profiles (id, full_name, currency, timezone)
  VALUES (p_user_id, 'Mi Perfil Financiero', 'CLP', 'America/Santiago')
  ON CONFLICT (id) DO NOTHING;

  -- Crear cuentas predeterminadas
  INSERT INTO public.accounts (user_id, name, type, initial_balance, color, icon)
  VALUES
    (p_user_id, 'Cuenta Corriente Principal', 'checking', 0, '#0F766E', 'account_balance'),
    (p_user_id, 'Cuenta Vista / RUT', 'sight', 0, '#2563EB', 'credit_card'),
    (p_user_id, 'Cuenta de Ahorro', 'savings', 0, '#10B981', 'savings'),
    (p_user_id, 'Efectivo', 'cash', 0, '#F59E0B', 'payments')
  ON CONFLICT (user_id, name) DO NOTHING;

  -- Asignar cuenta predeterminada si no tiene
  SELECT id INTO v_checking_id
  FROM public.accounts
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  UPDATE public.profiles
  SET default_account_id = COALESCE(default_account_id, v_checking_id)
  WHERE id = p_user_id;

  -- Categorías de Egresos iniciales (16 categorías obligatorias)
  INSERT INTO public.categories (user_id, name, type, icon, color)
  VALUES
    (p_user_id, 'Vivienda', 'expense', 'home', '#0F766E'),
    (p_user_id, 'Alimentación', 'expense', 'restaurant', '#EA580C'),
    (p_user_id, 'Supermercado', 'expense', 'shopping_cart', '#16A34A'),
    (p_user_id, 'Transporte', 'expense', 'directions_bus', '#2563EB'),
    (p_user_id, 'Combustible', 'expense', 'local_gas_station', '#D97706'),
    (p_user_id, 'Servicios básicos', 'expense', 'bolt', '#0284C7'),
    (p_user_id, 'Internet y telefonía', 'expense', 'wifi', '#4F46E5'),
    (p_user_id, 'Salud', 'expense', 'medical_services', '#DC2626'),
    (p_user_id, 'Gimnasio', 'expense', 'fitness_center', '#059669'),
    (p_user_id, 'Música e instrumentos', 'expense', 'music_note', '#7C3AED'),
    (p_user_id, 'Entretenimiento', 'expense', 'movie', '#DB2777'),
    (p_user_id, 'Compras', 'expense', 'shopping_bag', '#9333EA'),
    (p_user_id, 'Familia', 'expense', 'family_restroom', '#0D9488'),
    (p_user_id, 'Donaciones', 'expense', 'volunteer_activism', '#E11D48'),
    (p_user_id, 'Suscripciones', 'expense', 'subscriptions', '#6366F1'),
    (p_user_id, 'Otros', 'expense', 'more_horiz', '#64748B')
  ON CONFLICT (user_id, type, name) DO NOTHING;

  -- Categorías de Ingresos iniciales (5 categorías obligatorias)
  INSERT INTO public.categories (user_id, name, type, icon, color)
  VALUES
    (p_user_id, 'Sueldo', 'income', 'Work', '#16A34A'),
    (p_user_id, 'Bonos', 'income', 'workspace_premium', '#0D9488'),
    (p_user_id, 'Trabajos independientes', 'income', 'laptop_mac', '#2563EB'),
    (p_user_id, 'Reembolsos', 'income', 'replay', '#7C3AED'),
    (p_user_id, 'Otros ingresos', 'income', 'attach_money', '#059669')
  ON CONFLICT (user_id, type, name) DO NOTHING;
END;
$$;

-- Trigger automático al registrar un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_user_defaults(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 3. RPC Atómica: Registrar aporte o retiro de ahorro con trazabilidad contable
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_savings_contribution(
  p_goal_id UUID,
  p_type TEXT,
  p_amount NUMERIC(15, 0),
  p_contribution_date DATE,
  p_source_account_id UUID DEFAULT NULL,
  p_destination_account_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current NUMERIC(15, 0);
  v_target NUMERIC(15, 0);
  v_new_amount NUMERIC(15, 0);
  v_goal_name TEXT;
  v_tx_id UUID := NULL;
  v_contrib_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Sesión no válida';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'El monto del movimiento de ahorro debe ser mayor a cero';
  END IF;

  SELECT current_amount, target_amount, name
  INTO v_current, v_target, v_goal_name
  FROM public.savings_goals
  WHERE id = p_goal_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meta de ahorro no encontrada o sin permisos';
  END IF;

  IF p_type = 'withdrawal' AND v_current < p_amount THEN
    RAISE EXCEPTION 'El retiro supera el monto acumulado en la meta';
  END IF;

  -- Si se indican cuentas de origen y destino distintas, crear transferencia interna trazable
  IF p_source_account_id IS NOT NULL AND p_destination_account_id IS NOT NULL AND p_source_account_id <> p_destination_account_id THEN
    INSERT INTO public.transactions (
      user_id,
      type,
      amount,
      category_id,
      account_id,
      destination_account_id,
      description,
      notes,
      transaction_date,
      status
    ) VALUES (
      v_user_id,
      'transfer',
      p_amount,
      NULL,
      CASE WHEN p_type = 'deposit' THEN p_source_account_id ELSE p_destination_account_id END,
      CASE WHEN p_type = 'deposit' THEN p_destination_account_id ELSE p_source_account_id END,
      CASE WHEN p_type = 'deposit' THEN 'Aporte a meta: ' || v_goal_name ELSE 'Retiro de meta: ' || v_goal_name END,
      p_notes,
      p_contribution_date,
      'confirmed'
    )
    RETURNING id INTO v_tx_id;
  END IF;

  INSERT INTO public.savings_contributions (
    user_id,
    goal_id,
    account_id,
    linked_transaction_id,
    type,
    amount,
    contribution_date,
    notes
  ) VALUES (
    v_user_id,
    p_goal_id,
    p_source_account_id,
    v_tx_id,
    p_type,
    p_amount,
    p_contribution_date,
    p_notes
  )
  RETURNING id INTO v_contrib_id;

  v_new_amount := CASE
    WHEN p_type = 'deposit' THEN v_current + p_amount
    ELSE GREATEST(0, v_current - p_amount)
  END;

  UPDATE public.savings_goals
  SET
    current_amount = v_new_amount,
    status = CASE WHEN v_new_amount >= v_target THEN 'completed' ELSE status END,
    updated_at = NOW()
  WHERE id = p_goal_id AND user_id = v_user_id;

  RETURN v_contrib_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. RPC Atómica: Reasignar movimientos de una categoría antes de eliminarla
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reassign_and_delete_category(
  p_old_category_id UUID,
  p_new_category_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_old_type TEXT;
  v_new_type TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Sesión no válida';
  END IF;

  IF p_old_category_id = p_new_category_id THEN
    RAISE EXCEPTION 'La categoría de destino debe ser distinta a la original';
  END IF;

  SELECT type INTO v_old_type FROM public.categories WHERE id = p_old_category_id AND user_id = v_user_id;
  SELECT type INTO v_new_type FROM public.categories WHERE id = p_new_category_id AND user_id = v_user_id;

  IF v_old_type IS NULL OR v_new_type IS NULL THEN
    RAISE EXCEPTION 'Categoría no encontrada';
  END IF;

  IF v_old_type <> v_new_type THEN
    RAISE EXCEPTION 'Ambas categorías deben ser del mismo tipo (ingreso o egreso)';
  END IF;

  UPDATE public.transactions
  SET category_id = p_new_category_id, updated_at = NOW()
  WHERE user_id = v_user_id AND category_id = p_old_category_id;

  DELETE FROM public.categories
  WHERE id = p_old_category_id AND user_id = v_user_id;
END;
$$;

