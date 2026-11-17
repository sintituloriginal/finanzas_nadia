-- =============================================================================
-- MIGRACIÓN 004: MÓDULOS VIVIENDAS Y LUGARES DE MATRIMONIO
-- =============================================================================
-- Agrega soporte para guardar opciones inmobiliarias (departamentos y casas)
-- y recintos para eventos de matrimonio sin alterar el motor financiero.

-- -----------------------------------------------------------------------------
-- 1. TABLA: saved_properties (Viviendas de interés)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment')),
  operation_type TEXT NULL CHECK (operation_type IS NULL OR operation_type IN ('rent', 'buy')),
  price NUMERIC(15, 0) NULL CHECK (price IS NULL OR price >= 0),
  common_expenses NUMERIC(15, 0) NULL CHECK (common_expenses IS NULL OR common_expenses >= 0),
  address TEXT NULL,
  commune TEXT NULL,
  region TEXT NULL,
  bedrooms INTEGER NULL CHECK (bedrooms IS NULL OR bedrooms >= 0),
  bathrooms INTEGER NULL CHECK (bathrooms IS NULL OR bathrooms >= 0),
  surface_m2 NUMERIC(10, 2) NULL CHECK (surface_m2 IS NULL OR surface_m2 >= 0),
  parking_spots INTEGER NULL CHECK (parking_spots IS NULL OR parking_spots >= 0),
  image_url TEXT NULL,
  source_url TEXT NULL,
  description TEXT NULL,
  notes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'to_review' CHECK (status IN ('to_review', 'interested', 'contacted', 'visit_scheduled', 'visited', 'discarded')),
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_saved_properties_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_properties_user_date ON public.saved_properties(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_favorite ON public.saved_properties(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_status ON public.saved_properties(user_id, status);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_type ON public.saved_properties(user_id, property_type, operation_type);

DROP TRIGGER IF EXISTS trg_saved_properties_updated_at ON public.saved_properties;
CREATE TRIGGER trg_saved_properties_updated_at
  BEFORE UPDATE ON public.saved_properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_properties_select_own" ON public.saved_properties;
CREATE POLICY "saved_properties_select_own" ON public.saved_properties
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_properties_insert_own" ON public.saved_properties;
CREATE POLICY "saved_properties_insert_own" ON public.saved_properties
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_properties_update_own" ON public.saved_properties;
CREATE POLICY "saved_properties_update_own" ON public.saved_properties
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_properties_delete_own" ON public.saved_properties;
CREATE POLICY "saved_properties_delete_own" ON public.saved_properties
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. TABLA: wedding_venues (Lugares y centros de eventos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wedding_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  venue_type TEXT NULL CHECK (venue_type IS NULL OR venue_type IN ('event_center', 'hall', 'parcel', 'hotel', 'restaurant', 'other')),
  image_url TEXT NULL,
  address TEXT NULL,
  commune TEXT NULL,
  region TEXT NULL,
  price NUMERIC(15, 0) NULL CHECK (price IS NULL OR price >= 0),
  price_type TEXT NOT NULL DEFAULT 'total' CHECK (price_type IN ('total', 'per_person', 'other')),
  capacity INTEGER NULL CHECK (capacity IS NULL OR capacity >= 0),
  services TEXT NULL,
  source_url TEXT NULL,
  contact_phone TEXT NULL,
  target_date DATE NULL,
  notes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'to_review' CHECK (status IN ('to_review', 'interested', 'quote_requested', 'quoted', 'visit_scheduled', 'visited', 'discarded')),
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_wedding_venues_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wedding_venues_user_date ON public.wedding_venues(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wedding_venues_user_favorite ON public.wedding_venues(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_wedding_venues_user_status ON public.wedding_venues(user_id, status);

DROP TRIGGER IF EXISTS trg_wedding_venues_updated_at ON public.wedding_venues;
CREATE TRIGGER trg_wedding_venues_updated_at
  BEFORE UPDATE ON public.wedding_venues
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.wedding_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_venues FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wedding_venues_select_own" ON public.wedding_venues;
CREATE POLICY "wedding_venues_select_own" ON public.wedding_venues
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wedding_venues_insert_own" ON public.wedding_venues;
CREATE POLICY "wedding_venues_insert_own" ON public.wedding_venues
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wedding_venues_update_own" ON public.wedding_venues;
CREATE POLICY "wedding_venues_update_own" ON public.wedding_venues
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wedding_venues_delete_own" ON public.wedding_venues;
CREATE POLICY "wedding_venues_delete_own" ON public.wedding_venues
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. STORAGE: Bucket privado para imágenes subidas
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'places-media',
  'places-media',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "places_media_select_own" ON storage.objects;
CREATE POLICY "places_media_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'places-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "places_media_insert_own" ON storage.objects;
CREATE POLICY "places_media_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'places-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "places_media_update_own" ON storage.objects;
CREATE POLICY "places_media_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'places-media' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'places-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "places_media_delete_own" ON storage.objects;
CREATE POLICY "places_media_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'places-media' AND (storage.foldername(name))[1] = auth.uid()::text);
