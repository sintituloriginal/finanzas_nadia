-- =============================================================================
-- SEED IDEMPOTENTE PARA USUARIOS EXISTENTES EN SUPABASE
-- =============================================================================
-- Ejecuta la semilla de cuentas y categorías iniciales para cualquier usuario
-- ya creado manualmente desde el panel de Authentication de Supabase.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM auth.users LOOP
    PERFORM public.seed_user_defaults(r.id);
  END LOOP;
END;
$$;

