-- =============================================================================
-- MIGRACIÓN 005: DOCUMENTOS PDF EN LUGARES DE MATRIMONIO
-- =============================================================================
-- Permite adjuntar y gestionar cotizaciones, menús y propuestas en formato PDF
-- para cada recinto registrado, con aislamiento estricto por usuario y almacenamiento
-- privado en Supabase Storage.

-- -----------------------------------------------------------------------------
-- 1. TABLA: wedding_venue_documents
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wedding_venue_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_venue_id UUID NOT NULL REFERENCES public.wedding_venues(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL CHECK (char_length(trim(original_filename)) > 0),
  display_name TEXT NULL,
  storage_path TEXT NOT NULL CHECK (char_length(trim(storage_path)) > 0),
  mime_type TEXT NOT NULL DEFAULT 'application/pdf' CHECK (mime_type = 'application/pdf'),
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_wedding_venue_documents_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wedding_venue_docs_venue 
  ON public.wedding_venue_documents(wedding_venue_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wedding_venue_docs_user 
  ON public.wedding_venue_documents(user_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_wedding_venue_documents_updated_at ON public.wedding_venue_documents;
CREATE TRIGGER trg_wedding_venue_documents_updated_at
  BEFORE UPDATE ON public.wedding_venue_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. POLÍTICAS RLS PARA wedding_venue_documents
-- -----------------------------------------------------------------------------
ALTER TABLE public.wedding_venue_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_venue_documents FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wedding_venue_docs_select_own" ON public.wedding_venue_documents;
CREATE POLICY "wedding_venue_docs_select_own" ON public.wedding_venue_documents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wedding_venue_docs_insert_own" ON public.wedding_venue_documents;
CREATE POLICY "wedding_venue_docs_insert_own" ON public.wedding_venue_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.wedding_venues v 
      WHERE v.id = wedding_venue_id AND v.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "wedding_venue_docs_update_own" ON public.wedding_venue_documents;
CREATE POLICY "wedding_venue_docs_update_own" ON public.wedding_venue_documents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wedding_venue_docs_delete_own" ON public.wedding_venue_documents;
CREATE POLICY "wedding_venue_docs_delete_own" ON public.wedding_venue_documents
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. STORAGE: Bucket privado para documentos de recintos (PDFs)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-venue-documents',
  'wedding-venue-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

DROP POLICY IF EXISTS "venue_docs_storage_select_own" ON storage.objects;
CREATE POLICY "venue_docs_storage_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'wedding-venue-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "venue_docs_storage_insert_own" ON storage.objects;
CREATE POLICY "venue_docs_storage_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'wedding-venue-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "venue_docs_storage_update_own" ON storage.objects;
CREATE POLICY "venue_docs_storage_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'wedding-venue-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'wedding-venue-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "venue_docs_storage_delete_own" ON storage.objects;
CREATE POLICY "venue_docs_storage_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'wedding-venue-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
