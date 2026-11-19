import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { DEMO_USER_ID } from '@/services/seedData'
import type {
  SavedProperty,
  PropertyStatus,
  WeddingVenue,
  VenueStatus,
  WeddingVenueDocument
} from '@/types/places'

const STORAGE_PROPERTIES_KEY = 'mi_presupuesto_properties_v1'
const STORAGE_VENUES_KEY = 'mi_presupuesto_venues_v1'
const STORAGE_VENUE_DOCS_KEY = 'mi_presupuesto_venue_docs_v1'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'uuid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

const initialPropertiesSeed: SavedProperty[] = [
  {
    id: 'prop-demo-1',
    user_id: DEMO_USER_ID,
    name: 'Depto 2D2B en Providencia - Pedro de Valdivia',
    property_type: 'apartment',
    operation_type: 'rent',
    price: 650000,
    common_expenses: 95000,
    address: 'Av. Pedro de Valdivia 1420',
    commune: 'Providencia',
    region: 'Metropolitana de Santiago',
    bedrooms: 2,
    bathrooms: 2,
    surface_m2: 68,
    parking_spots: 1,
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    source_url: 'https://www.portalinmobiliario.com',
    description: 'Excelente departamento nororiente, cocina integrada con loggia y terraza amplia.',
    notes: 'A 8 min caminando del metro Inés de Suárez. Aceptan mascotas.',
    status: 'interested',
    is_favorite: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'prop-demo-2',
    user_id: DEMO_USER_ID,
    name: 'Casa Condominio Los Dominicos',
    property_type: 'house',
    operation_type: 'buy',
    price: 340000000,
    common_expenses: 120000,
    address: 'Camino El Alba 9200',
    commune: 'Las Condes',
    region: 'Metropolitana de Santiago',
    bedrooms: 4,
    bathrooms: 3,
    surface_m2: 185,
    parking_spots: 2,
    image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    source_url: 'https://www.tocnc.com',
    description: 'Casa de 2 pisos, amplio jardín formado, piscina y quincho techado.',
    notes: 'Visita coordinada con la corredora para este sábado 11:00 am.',
    status: 'visit_scheduled',
    is_favorite: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
  }
]

const initialVenuesSeed: WeddingVenue[] = [
  {
    id: 'venue-demo-1',
    user_id: DEMO_USER_ID,
    name: 'Casona San José de Chicureo',
    venue_type: 'event_center',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    address: 'Camino Chicureo Km 2.5',
    commune: 'Colina',
    region: 'Metropolitana de Santiago',
    price: 4800000,
    price_type: 'total',
    capacity: 220,
    services: 'Banquetería opcional, DJ, iluminación perimetral, suite de novios, estacionamiento para 100 autos.',
    source_url: 'https://www.matrimonios.cl',
    contact_phone: '+56 9 8765 4321',
    target_date: '2027-03-20',
    notes: 'Cotización incluye mantelería y mobiliario rústico. Nos atendió Paulina.',
    status: 'quoted',
    is_favorite: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'venue-demo-2',
    user_id: DEMO_USER_ID,
    name: 'Parcela Valle del Maipo & Viñedos',
    venue_type: 'parcel',
    image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    address: 'Ruta G-46 Isla de Maipo',
    commune: 'Isla de Maipo',
    region: 'Metropolitana de Santiago',
    price: 52000,
    price_type: 'per_person',
    capacity: 180,
    services: 'Cóctel al aire libre, cena de 3 tiempos, barra libre 6 horas, pista de baile techada.',
    source_url: 'https://www.instagram.com',
    contact_phone: '+56 9 7654 3210',
    target_date: '2027-04-10',
    notes: 'Entorno campestre precioso para fotos de atardecer. Preguntar por menú vegetariano.',
    status: 'interested',
    is_favorite: false,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString()
  }
]

const initialVenueDocsSeed: WeddingVenueDocument[] = [
  {
    id: 'doc-demo-1',
    user_id: DEMO_USER_ID,
    wedding_venue_id: 'venue-demo-1',
    original_filename: 'Cotizacion_Casona_San_Jose_2027.pdf',
    display_name: 'Cotización matrimonio 2027',
    storage_path: `${DEMO_USER_ID}/venue-demo-1/doc-demo-1_Cotizacion.pdf`,
    mime_type: 'application/pdf',
    file_size: 1845000,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'doc-demo-2',
    user_id: DEMO_USER_ID,
    wedding_venue_id: 'venue-demo-1',
    original_filename: 'Catalogo_Servicios_Banqueteria.pdf',
    display_name: 'Catálogo de servicios y menús',
    storage_path: `${DEMO_USER_ID}/venue-demo-1/doc-demo-2_Catalogo.pdf`,
    mime_type: 'application/pdf',
    file_size: 3420000,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
]

export const usePlacesStore = defineStore('places', () => {
  const authStore = useAuthStore()

  const properties = ref<SavedProperty[]>([])
  const weddingVenues = ref<WeddingVenue[]>([])
  const venueDocuments = ref<WeddingVenueDocument[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function loadLocalProperties(): SavedProperty[] {
    try {
      const raw = localStorage.getItem(STORAGE_PROPERTIES_KEY)
      if (raw) {
        return JSON.parse(raw) as SavedProperty[]
      }
    } catch (e) {
      console.warn('Error reading local properties:', e)
    }
    localStorage.setItem(STORAGE_PROPERTIES_KEY, JSON.stringify(initialPropertiesSeed))
    return initialPropertiesSeed
  }

  function saveLocalProperties(data: SavedProperty[]) {
    try {
      localStorage.setItem(STORAGE_PROPERTIES_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Error saving local properties:', e)
    }
  }

  function loadLocalVenues(): WeddingVenue[] {
    try {
      const raw = localStorage.getItem(STORAGE_VENUES_KEY)
      if (raw) {
        return JSON.parse(raw) as WeddingVenue[]
      }
    } catch (e) {
      console.warn('Error reading local venues:', e)
    }
    localStorage.setItem(STORAGE_VENUES_KEY, JSON.stringify(initialVenuesSeed))
    return initialVenuesSeed
  }

  function saveLocalVenues(data: WeddingVenue[]) {
    try {
      localStorage.setItem(STORAGE_VENUES_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Error saving local venues:', e)
    }
  }

  function loadLocalVenueDocs(): WeddingVenueDocument[] {
    try {
      const raw = localStorage.getItem(STORAGE_VENUE_DOCS_KEY)
      if (raw) {
        return JSON.parse(raw) as WeddingVenueDocument[]
      }
    } catch (e) {
      console.warn('Error reading local venue documents:', e)
    }
    localStorage.setItem(STORAGE_VENUE_DOCS_KEY, JSON.stringify(initialVenueDocsSeed))
    return initialVenueDocsSeed
  }

  function saveLocalVenueDocs(data: WeddingVenueDocument[]) {
    try {
      localStorage.setItem(STORAGE_VENUE_DOCS_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Error saving local venue documents:', e)
    }
  }

  // ---------------------------------------------------------------------------
  // Helper: Resolución segura del usuario autenticado (evita DEMO_USER_ID en nube)
  // ---------------------------------------------------------------------------
  async function resolveAuthUserId(): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      const { data, error: authErr } = await supabase.auth.getUser()
      if (authErr || !data.user) {
        throw new Error('Sesión de usuario no válida o expirada. Inicia sesión nuevamente.')
      }
      if (authStore.user && authStore.user.id !== data.user.id) {
        authStore.user.id = data.user.id
        authStore.user.email = data.user.email ?? authStore.user.email
      }
      return data.user.id
    }
    return authStore.user?.id || DEMO_USER_ID
  }

  // ---------------------------------------------------------------------------
  // Properties CRUD
  // ---------------------------------------------------------------------------
  async function fetchProperties() {
    loading.value = true
    error.value = null
    try {
      if (isSupabaseConfigured && supabase && authStore.user) {
        const { data, error: err } = await supabase
          .from('saved_properties')
          .select('*')
          .order('created_at', { ascending: false })

        if (err) throw err
        properties.value = (data as SavedProperty[]) ?? []
      } else {
        properties.value = loadLocalProperties()
      }
    } catch (err: any) {
      console.error('fetchProperties error:', err)
      error.value = err.message || 'Error al cargar viviendas'
      properties.value = loadLocalProperties()
    } finally {
      loading.value = false
    }
  }

  async function createProperty(
    item: Omit<SavedProperty, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<SavedProperty> {
    loading.value = true
    error.value = null
    try {
      const currentUserId = await resolveAuthUserId()
      const nowIso = new Date().toISOString()
      const newId = generateUUID()

      const newRecord: SavedProperty = {
        ...item,
        id: newId,
        user_id: currentUserId,
        created_at: nowIso,
        updated_at: nowIso
      }

      if (isSupabaseConfigured && supabase && authStore.user) {
        const { data, error: err } = await supabase
          .from('saved_properties')
          .insert({
            id: newRecord.id,
            user_id: currentUserId,
            name: newRecord.name,
            property_type: newRecord.property_type,
            operation_type: newRecord.operation_type,
            price: newRecord.price,
            common_expenses: newRecord.common_expenses,
            address: newRecord.address,
            commune: newRecord.commune,
            region: newRecord.region,
            bedrooms: newRecord.bedrooms,
            bathrooms: newRecord.bathrooms,
            surface_m2: newRecord.surface_m2,
            parking_spots: newRecord.parking_spots,
            image_url: newRecord.image_url,
            source_url: newRecord.source_url,
            description: newRecord.description,
            notes: newRecord.notes,
            status: newRecord.status,
            is_favorite: newRecord.is_favorite
          } as never)
          .select()
          .single()

        if (err) throw err
        const created = data as SavedProperty
        properties.value = [created, ...properties.value]
        return created
      } else {
        properties.value = [newRecord, ...properties.value]
        saveLocalProperties(properties.value)
        return newRecord
      }
    } catch (err: any) {
      console.error('createProperty error:', err)
      error.value = err.message || 'Error al guardar vivienda'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProperty(
    id: string,
    patch: Partial<SavedProperty>
  ): Promise<SavedProperty> {
    loading.value = true
    error.value = null
    try {
      const idx = properties.value.findIndex((p) => p.id === id)
      if (idx === -1) throw new Error('Vivienda no encontrada')

      const updatedRecord: SavedProperty = {
        ...properties.value[idx],
        ...patch,
        updated_at: new Date().toISOString()
      }

      if (isSupabaseConfigured && supabase && authStore.user) {
        const { data, error: err } = await supabase
          .from('saved_properties')
          .update(patch as never)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const updated = data as SavedProperty
        properties.value[idx] = updated
        return updated
      } else {
        properties.value[idx] = updatedRecord
        saveLocalProperties(properties.value)
        return updatedRecord
      }
    } catch (err: any) {
      console.error('updateProperty error:', err)
      error.value = err.message || 'Error al actualizar vivienda'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProperty(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      if (isSupabaseConfigured && supabase && authStore.user) {
        const { error: err } = await supabase
          .from('saved_properties')
          .delete()
          .eq('id', id)

        if (err) throw err
      }
      properties.value = properties.value.filter((p) => p.id !== id)
      if (!isSupabaseConfigured || !authStore.user) {
        saveLocalProperties(properties.value)
      }
    } catch (err: any) {
      console.error('deleteProperty error:', err)
      error.value = err.message || 'Error al eliminar vivienda'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function togglePropertyFavorite(id: string): Promise<void> {
    const item = properties.value.find((p) => p.id === id)
    if (!item) return
    const nextFavorite = !item.is_favorite
    await updateProperty(id, { is_favorite: nextFavorite })
  }

  async function updatePropertyStatus(id: string, status: PropertyStatus): Promise<void> {
    await updateProperty(id, { status })
  }

  // ---------------------------------------------------------------------------
  // Wedding Venues CRUD
  // ---------------------------------------------------------------------------
  async function fetchWeddingVenues() {
    loading.value = true
    error.value = null
    try {
      if (isSupabaseConfigured && supabase && authStore.user) {
        const { data, error: err } = await supabase
          .from('wedding_venues')
          .select('*')
          .order('created_at', { ascending: false })

        if (err) throw err
        weddingVenues.value = (data as WeddingVenue[]) ?? []
      } else {
        weddingVenues.value = loadLocalVenues()
      }
    } catch (err: any) {
      console.error('fetchWeddingVenues error:', err)
      error.value = err.message || 'Error al cargar lugares de matrimonio'
      weddingVenues.value = loadLocalVenues()
    } finally {
      loading.value = false
    }
  }

  async function createWeddingVenue(
    item: Omit<WeddingVenue, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<WeddingVenue> {
    loading.value = true
    error.value = null
    try {
      const currentUserId = await resolveAuthUserId()
      const nowIso = new Date().toISOString()
      const newId = item.id || generateUUID()

      const newRecord: WeddingVenue = {
        ...item,
        id: newId,
        user_id: currentUserId,
        created_at: nowIso,
        updated_at: nowIso
      }

      if (isSupabaseConfigured && supabase && authStore.user) {
        const { data, error: err } = await supabase
          .from('wedding_venues')
          .insert({
            id: newRecord.id,
            user_id: currentUserId,
            name: newRecord.name,
            venue_type: newRecord.venue_type,
            image_url: newRecord.image_url,
            address: newRecord.address,
            commune: newRecord.commune,
            region: newRecord.region,
            price: newRecord.price,
            price_type: newRecord.price_type,
            capacity: newRecord.capacity,
            services: newRecord.services,
            source_url: newRecord.source_url,
            contact_phone: newRecord.contact_phone,
            target_date: newRecord.target_date,
            notes: newRecord.notes,
            status: newRecord.status,
            is_favorite: newRecord.is_favorite
          } as never)
          .select()
          .single()

        if (err) throw err
        const created = data as WeddingVenue
        weddingVenues.value = [created, ...weddingVenues.value]
        return created
      } else {
        weddingVenues.value = [newRecord, ...weddingVenues.value]
        saveLocalVenues(weddingVenues.value)
        return newRecord
      }
    } catch (err: any) {
      console.error('createWeddingVenue error:', err)
      error.value = err.message || 'Error al guardar lugar de matrimonio'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateWeddingVenue(
    id: string,
    patch: Partial<WeddingVenue>
  ): Promise<WeddingVenue> {
    loading.value = true
    error.value = null
    try {
      const idx = weddingVenues.value.findIndex((v) => v.id === id)
      if (idx === -1) throw new Error('Lugar no encontrado')

      const updatedRecord: WeddingVenue = {
        ...weddingVenues.value[idx],
        ...patch,
        updated_at: new Date().toISOString()
      }

      if (isSupabaseConfigured && supabase && authStore.user) {
        const { data, error: err } = await supabase
          .from('wedding_venues')
          .update(patch as never)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        const updated = data as WeddingVenue
        weddingVenues.value[idx] = updated
        return updated
      } else {
        weddingVenues.value[idx] = updatedRecord
        saveLocalVenues(weddingVenues.value)
        return updatedRecord
      }
    } catch (err: any) {
      console.error('updateWeddingVenue error:', err)
      error.value = err.message || 'Error al actualizar lugar de matrimonio'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteWeddingVenue(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      if (isSupabaseConfigured && supabase && authStore.user) {
        const { error: err } = await supabase
          .from('wedding_venues')
          .delete()
          .eq('id', id)

        if (err) throw err
      }
      weddingVenues.value = weddingVenues.value.filter((v) => v.id !== id)
      venueDocuments.value = venueDocuments.value.filter((d) => d.wedding_venue_id !== id)
      if (!isSupabaseConfigured || !authStore.user) {
        saveLocalVenues(weddingVenues.value)
        saveLocalVenueDocs(venueDocuments.value)
      }
    } catch (err: any) {
      console.error('deleteWeddingVenue error:', err)
      error.value = err.message || 'Error al eliminar lugar de matrimonio'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleVenueFavorite(id: string): Promise<void> {
    const item = weddingVenues.value.find((v) => v.id === id)
    if (!item) return
    const nextFavorite = !item.is_favorite
    await updateWeddingVenue(id, { is_favorite: nextFavorite })
  }

  async function updateVenueStatus(id: string, status: VenueStatus): Promise<void> {
    await updateWeddingVenue(id, { status })
  }

  // ---------------------------------------------------------------------------
  // Wedding Venue Documents (PDFs)
  // ---------------------------------------------------------------------------
  async function fetchVenueDocuments(venueId?: string) {
    loading.value = true
    error.value = null
    try {
      if (isSupabaseConfigured && supabase && authStore.user) {
        let query = supabase
          .from('wedding_venue_documents')
          .select('*')
          .order('created_at', { ascending: false })

        if (venueId) {
          query = query.eq('wedding_venue_id', venueId)
        }

        const { data, error: err } = await query
        if (err) throw err

        const fetched = (data as WeddingVenueDocument[]) ?? []
        if (venueId) {
          const otherDocs = venueDocuments.value.filter((d) => d.wedding_venue_id !== venueId)
          venueDocuments.value = [...otherDocs, ...fetched]
        } else {
          venueDocuments.value = fetched
        }
      } else {
        const local = loadLocalVenueDocs()
        venueDocuments.value = local
      }
    } catch (err: any) {
      console.error('fetchVenueDocuments error:', err)
      error.value = err.message || 'Error al cargar documentos'
      venueDocuments.value = loadLocalVenueDocs()
    } finally {
      loading.value = false
    }
  }

  async function uploadVenueDocument(
    venueId: string,
    file: File,
    displayName?: string
  ): Promise<WeddingVenueDocument> {
    const isPdfMime = file.type === 'application/pdf'
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf')
    if (!isPdfMime && !isPdfExt) {
      throw new Error('Solo se permiten documentos en formato PDF (.pdf)')
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('El archivo supera el tamaño máximo permitido de 10 MB')
    }

    if (file.size <= 0) {
      throw new Error('El archivo está vacío o dañado')
    }

    loading.value = true
    error.value = null

    try {
      const currentUserId = await resolveAuthUserId()

      // Trazabilidad temporal controlada (segura y sin secretos)
      console.debug('[Trace uploadVenueDocument:start]', {
        timestamp: new Date().toISOString(),
        authUserId: currentUserId,
        venueId,
        fileName: file.name,
        fileSize: file.size
      })

      // 1. Verificación previa de existencia y propiedad del recinto
      if (isSupabaseConfigured && supabase) {
        const { data, error: venueErr } = await supabase
          .from('wedding_venues')
          .select('id, user_id')
          .eq('id', venueId)
          .maybeSingle()

        const venue = data as { id: string; user_id: string } | null

        if (venueErr) {
          console.error('[Trace uploadVenueDocument:venue_query_error]', venueErr)
          throw new Error(`Error al verificar recinto: ${venueErr.message}`)
        }

        if (!venue) {
          console.warn('[Trace uploadVenueDocument:venue_not_found]', { venueId, authUserId: currentUserId })
          throw new Error('El recinto aún no ha sido guardado. Guarda el recinto antes de adjuntar documentos.')
        }

        if (venue.user_id !== currentUserId) {
          console.warn('[Trace uploadVenueDocument:owner_mismatch]', {
            venueOwner: venue.user_id,
            requestUser: currentUserId
          })
          throw new Error('Permiso denegado: el recinto pertenece a otro usuario.')
        }
      } else {
        if (weddingVenues.value.length === 0) {
          weddingVenues.value = loadLocalVenues()
        }
        const localVenue = weddingVenues.value.find((v) => v.id === venueId)
        if (!localVenue) {
          throw new Error('El recinto aún no ha sido guardado. Guarda el recinto antes de adjuntar documentos.')
        }
        if (localVenue.user_id !== currentUserId) {
          throw new Error('Permiso denegado: el recinto pertenece a otro usuario.')
        }
      }

      const docId = generateUUID()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${currentUserId}/${venueId}/${docId}_${sanitizedName}`
      const nowIso = new Date().toISOString()

      const newRecord: WeddingVenueDocument = {
        id: docId,
        user_id: currentUserId,
        wedding_venue_id: venueId,
        original_filename: file.name,
        display_name: displayName?.trim() || file.name,
        storage_path: filePath,
        mime_type: 'application/pdf',
        file_size: file.size,
        created_at: nowIso,
        updated_at: nowIso
      }

      if (isSupabaseConfigured && supabase && authStore.user) {
        // A) Subir al bucket privado
        const { error: uploadErr } = await supabase.storage
          .from('wedding-venue-documents')
          .upload(filePath, file, {
            contentType: 'application/pdf',
            cacheControl: '3600',
            upsert: false
          })

        if (uploadErr) {
          console.error('[Trace uploadVenueDocument:storage_upload_error]', uploadErr)
          throw new Error(`Error al subir archivo a Storage: ${uploadErr.message}`)
        }

        // B) Registrar en base de datos
        const { data: dbData, error: dbErr } = await supabase
          .from('wedding_venue_documents')
          .insert({
            id: newRecord.id,
            user_id: currentUserId,
            wedding_venue_id: venueId,
            original_filename: newRecord.original_filename,
            display_name: newRecord.display_name,
            storage_path: newRecord.storage_path,
            mime_type: 'application/pdf',
            file_size: newRecord.file_size
          } as never)
          .select()
          .single()

        if (dbErr) {
          console.error('[Trace uploadVenueDocument:db_insert_error]', dbErr)
          // Mecanismo de compensación: borrar archivo huérfano de storage
          await supabase.storage.from('wedding-venue-documents').remove([filePath])
          throw new Error(`Error al registrar documento: ${dbErr.message}`)
        }

        console.debug('[Trace uploadVenueDocument:success]', { docId: newRecord.id, venueId })
        const created = dbData as WeddingVenueDocument
        venueDocuments.value = [created, ...venueDocuments.value]
        return created
      } else {
        venueDocuments.value = [newRecord, ...venueDocuments.value]
        saveLocalVenueDocs(venueDocuments.value)
        return newRecord
      }
    } catch (err: any) {
      console.error('uploadVenueDocument error:', err)
      error.value = err.message || 'Error al subir documento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteVenueDocument(docId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const doc = venueDocuments.value.find((d) => d.id === docId)
      if (!doc) throw new Error('Documento no encontrado')

      if (isSupabaseConfigured && supabase && authStore.user) {
        const { error: dbErr } = await supabase
          .from('wedding_venue_documents')
          .delete()
          .eq('id', docId)

        if (dbErr) throw dbErr

        await supabase.storage
          .from('wedding-venue-documents')
          .remove([doc.storage_path])
      }

      venueDocuments.value = venueDocuments.value.filter((d) => d.id !== docId)
      if (!isSupabaseConfigured || !authStore.user) {
        saveLocalVenueDocs(venueDocuments.value)
      }
    } catch (err: any) {
      console.error('deleteVenueDocument error:', err)
      error.value = err.message || 'Error al eliminar documento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getDocumentSignedUrl(storagePath: string): Promise<string> {
    if (isSupabaseConfigured && supabase && authStore.user) {
      const { data, error: err } = await supabase.storage
        .from('wedding-venue-documents')
        .createSignedUrl(storagePath, 120) // 2 minutos

      if (err || !data?.signedUrl) {
        throw new Error(err?.message || 'No se pudo generar el enlace seguro al documento')
      }
      return data.signedUrl
    }

    if (storagePath.startsWith('blob:') || storagePath.startsWith('http')) {
      return storagePath
    }
    const dummyBlob = new Blob([`Contenido PDF demo para la ruta: ${storagePath}`], {
      type: 'application/pdf'
    })
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      return URL.createObjectURL(dummyBlob)
    }
    return `data:application/pdf;base64,demo-${encodeURIComponent(storagePath)}`
  }

  async function downloadVenueDocument(storagePath: string, filename: string): Promise<void> {
    try {
      let downloadBlob: Blob

      if (isSupabaseConfigured && supabase && authStore.user) {
        const { data, error: err } = await supabase.storage
          .from('wedding-venue-documents')
          .download(storagePath)

        if (err || !data) {
          throw new Error(err?.message || 'Error al descargar documento de Storage')
        }
        downloadBlob = data
      } else {
        downloadBlob = new Blob([`Contenido PDF de demostración para: ${filename}`], {
          type: 'application/pdf'
        })
      }

      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        const blobUrl = URL.createObjectURL(downloadBlob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      }
    } catch (err: any) {
      console.error('downloadVenueDocument error:', err)
      throw new Error(err.message || 'No se pudo descargar el archivo')
    }
  }

  // ---------------------------------------------------------------------------
  // Supabase Storage Helper for images
  // ---------------------------------------------------------------------------
  async function uploadPlaceImage(file: File, folder: 'properties' | 'venues'): Promise<string> {
    // 1. Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Solo se permiten imágenes JPG, PNG o WebP')
    }
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('La imagen supera el límite máximo de 5MB')
    }

    // 2. Upload to Supabase if configured & user logged in
    if (isSupabaseConfigured && supabase && authStore.user) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_')
      const filePath = `${authStore.user.id}/${folder}/${Date.now()}_${sanitizedName}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('places-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadErr) {
        console.error('Error uploading image to storage:', uploadErr)
        throw new Error(`Error al subir imagen: ${uploadErr.message}`)
      }

      // Generate signed URL with long expiry (e.g. 1 year) or fallback to public URL
      const { data: signedData, error: signedErr } = await supabase.storage
        .from('places-media')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year

      if (signedErr || !signedData?.signedUrl) {
        // Fallback to getPublicUrl if bucket is made public by user
        const { data: pubData } = supabase.storage
          .from('places-media')
          .getPublicUrl(filePath)
        return pubData.publicUrl
      }

      return signedData.signedUrl
    }

    // 3. Fallback for demo / local offline mode (read as data URL)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('No se pudo leer la imagen localmente'))
      reader.readAsDataURL(file)
    })
  }

  return {
    properties,
    weddingVenues,
    venueDocuments,
    loading,
    error,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    togglePropertyFavorite,
    updatePropertyStatus,
    fetchWeddingVenues,
    createWeddingVenue,
    updateWeddingVenue,
    deleteWeddingVenue,
    toggleVenueFavorite,
    updateVenueStatus,
    uploadPlaceImage,
    fetchVenueDocuments,
    uploadVenueDocument,
    deleteVenueDocument,
    getDocumentSignedUrl,
    downloadVenueDocument
  }
})
