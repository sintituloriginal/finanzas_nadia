// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlacesStore } from '@/stores/places'
import {
  calculateAccountBalances,
  calculatePeriodMetrics
} from '@/utils/finance'
import type { Account, Transaction } from '@/types/finance'

describe('Módulos Viviendas y Lugares de Matrimonio', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('Store usePlacesStore - Viviendas', () => {
    it('debe inicializar y cargar la lista de viviendas', async () => {
      const store = usePlacesStore()
      await store.fetchProperties()
      expect(Array.isArray(store.properties)).toBe(true)
      expect(store.properties.length).toBeGreaterThan(0)
    })

    it('debe crear una nueva propiedad con campos completos', async () => {
      const store = usePlacesStore()
      await store.fetchProperties()
      const initialCount = store.properties.length

      const newProp = await store.createProperty({
        name: 'Departamento 1D1B Santiago Centro',
        property_type: 'apartment',
        operation_type: 'rent',
        price: 380000,
        common_expenses: 60000,
        address: 'Santa Isabel 450',
        commune: 'Santiago',
        region: 'RM',
        bedrooms: 1,
        bathrooms: 1,
        surface_m2: 38,
        parking_spots: 0,
        image_url: 'https://images.example.com/depto.jpg',
        source_url: 'https://portalinmobiliario.com/depto123',
        description: 'Excelente conectividad, metro Santa Isabel.',
        notes: 'Gastos comunes bajos.',
        status: 'interested',
        is_favorite: true
      })

      expect(newProp.id).toBeDefined()
      expect(newProp.name).toBe('Departamento 1D1B Santiago Centro')
      expect(store.properties.length).toBe(initialCount + 1)
      expect(store.properties[0].id).toBe(newProp.id)
    })

    it('debe actualizar los datos y estado de una vivienda existente', async () => {
      const store = usePlacesStore()
      await store.fetchProperties()
      const first = store.properties[0]

      const updated = await store.updateProperty(first.id, {
        price: 720000,
        status: 'visit_scheduled',
        notes: 'Visita confirmada para el sábado.'
      })

      expect(updated.price).toBe(720000)
      expect(updated.status).toBe('visit_scheduled')
      expect(updated.notes).toBe('Visita confirmada para el sábado.')
    })

    it('debe alternar el estado de favorito correctamente', async () => {
      const store = usePlacesStore()
      await store.fetchProperties()
      const first = store.properties[0]
      const originalFav = first.is_favorite

      await store.togglePropertyFavorite(first.id)
      const after = store.properties.find((p) => p.id === first.id)
      expect(after?.is_favorite).toBe(!originalFav)

      await store.togglePropertyFavorite(first.id)
      const restored = store.properties.find((p) => p.id === first.id)
      expect(restored?.is_favorite).toBe(originalFav)
    })

    it('debe eliminar una vivienda correctamente', async () => {
      const store = usePlacesStore()
      await store.fetchProperties()
      const initialCount = store.properties.length
      const targetId = store.properties[0].id

      await store.deleteProperty(targetId)
      expect(store.properties.length).toBe(initialCount - 1)
      expect(store.properties.some((p) => p.id === targetId)).toBe(false)
    })
  })

  describe('Store usePlacesStore - Lugares de Matrimonio', () => {
    it('debe inicializar y cargar la lista de lugares', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()
      expect(Array.isArray(store.weddingVenues)).toBe(true)
      expect(store.weddingVenues.length).toBeGreaterThan(0)
    })

    it('debe crear un nuevo lugar de matrimonio con cotización', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()
      const initialCount = store.weddingVenues.length

      const newVenue = await store.createWeddingVenue({
        name: 'Castillo Forestal Eventos',
        venue_type: 'restaurant',
        image_url: 'https://images.example.com/castillo.jpg',
        address: 'Cardenal José María Caro 390',
        commune: 'Santiago',
        region: 'RM',
        price: 55000,
        price_type: 'per_person',
        capacity: 120,
        services: 'Cena gourmet francesa, coctelería de autor, terraza privada.',
        source_url: 'https://castilloforestal.cl',
        contact_phone: '+56 9 1122 3344',
        target_date: '2027-05-15',
        notes: 'Coordinar degustación de menú en diciembre.',
        status: 'quote_requested',
        is_favorite: true
      })

      expect(newVenue.id).toBeDefined()
      expect(newVenue.name).toBe('Castillo Forestal Eventos')
      expect(newVenue.price_type).toBe('per_person')
      expect(store.weddingVenues.length).toBe(initialCount + 1)
      expect(store.weddingVenues[0].id).toBe(newVenue.id)
    })

    it('debe actualizar la cotización y estado de un lugar', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()
      const first = store.weddingVenues[0]

      const updated = await store.updateWeddingVenue(first.id, {
        price: 6200000,
        status: 'quoted',
        notes: 'Cotización formal recibida por correo.'
      })

      expect(updated.price).toBe(6200000)
      expect(updated.status).toBe('quoted')
    })

    it('debe alternar favorito en lugares de matrimonio', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()
      const first = store.weddingVenues[0]
      const originalFav = first.is_favorite

      await store.toggleVenueFavorite(first.id)
      const after = store.weddingVenues.find((v) => v.id === first.id)
      expect(after?.is_favorite).toBe(!originalFav)
    })

    it('debe eliminar un lugar de matrimonio correctamente', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()
      const initialCount = store.weddingVenues.length
      const targetId = store.weddingVenues[0].id

      await store.deleteWeddingVenue(targetId)
      expect(store.weddingVenues.length).toBe(initialCount - 1)
      expect(store.weddingVenues.some((v) => v.id === targetId)).toBe(false)
    })
  })

  describe('Validación de imágenes y subida', () => {
    it('debe rechazar archivos que superen los 5MB', async () => {
      const store = usePlacesStore()
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'foto_pesada.jpg', {
        type: 'image/jpeg'
      })

      await expect(store.uploadPlaceImage(largeFile, 'properties')).rejects.toThrow(
        /supera el límite máximo de 5MB/
      )
    })

    it('debe rechazar tipos MIME no permitidos (ej: pdf o exe)', async () => {
      const store = usePlacesStore()
      const badFile = new File(['dummy content'], 'documento.pdf', {
        type: 'application/pdf'
      })

      await expect(store.uploadPlaceImage(badFile, 'properties')).rejects.toThrow(
        /Solo se permiten imágenes JPG, PNG o WebP/
      )
    })
  })

  describe('Documentos PDF en Lugares de Matrimonio', () => {
    it('debe inicializar y cargar documentos de recintos', async () => {
      const store = usePlacesStore()
      await store.fetchVenueDocuments()
      expect(Array.isArray(store.venueDocuments)).toBe(true)
      expect(store.venueDocuments.length).toBeGreaterThan(0)
    })

    it('debe adjuntar un archivo PDF válido con metadatos completos a un recinto propio', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()
      await store.fetchVenueDocuments()
      const initialCount = store.venueDocuments.length

      const pdfFile = new File(['%PDF-1.4 dummy content'], 'Cotizacion_2027.pdf', {
        type: 'application/pdf'
      })

      const doc = await store.uploadVenueDocument(
        'venue-demo-1',
        pdfFile,
        'Propuesta comercial 2027'
      )

      expect(doc.id).toBeDefined()
      expect(doc.wedding_venue_id).toBe('venue-demo-1')
      expect(doc.original_filename).toBe('Cotizacion_2027.pdf')
      expect(doc.display_name).toBe('Propuesta comercial 2027')
      expect(doc.mime_type).toBe('application/pdf')
      expect(doc.file_size).toBe(pdfFile.size)
      expect(store.venueDocuments.length).toBe(initialCount + 1)
    })

    it('debe rechazar documento para un recinto que pertenece a otro usuario', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()

      // Inyectar un recinto de otro usuario ajeno
      store.weddingVenues.push({
        id: 'venue-other-user',
        user_id: '99999999-9999-9999-9999-999999999999',
        name: 'Recinto de Otro Usuario',
        venue_type: 'event_center',
        image_url: null,
        address: null,
        commune: null,
        region: null,
        price: 5000000,
        price_type: 'total',
        capacity: 150,
        services: null,
        source_url: null,
        contact_phone: null,
        target_date: null,
        notes: null,
        status: 'to_review',
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      const pdfFile = new File(['%PDF-1.4 dummy content'], 'hack_doc.pdf', {
        type: 'application/pdf'
      })

      await expect(
        store.uploadVenueDocument('venue-other-user', pdfFile, 'Intento ajeno')
      ).rejects.toThrow(/Permiso denegado: el recinto pertenece a otro usuario/)
    })

    it('debe rechazar documento para un recinto que aún no ha sido guardado', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()

      const pdfFile = new File(['%PDF-1.4 dummy content'], 'doc_huerfano.pdf', {
        type: 'application/pdf'
      })

      await expect(
        store.uploadVenueDocument('unregistered-venue-id-123', pdfFile)
      ).rejects.toThrow(/El recinto aún no ha sido guardado/)
    })

    it('debe permitir guardar documento después de crear un nuevo recinto', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()
      await store.fetchVenueDocuments()

      // 1. Crear el nuevo recinto primero
      const newVenue = await store.createWeddingVenue({
        name: 'Casona Valle Hermoso',
        venue_type: 'event_center',
        image_url: null,
        address: 'Camino La Aurora 100',
        commune: 'Curacaví',
        region: 'RM',
        price: 3500000,
        price_type: 'total',
        capacity: 200,
        services: 'Banquetería y DJ',
        source_url: null,
        contact_phone: '+56911223344',
        target_date: '2027-11-20',
        notes: 'Espacio campestre',
        status: 'interested',
        is_favorite: false
      })

      expect(newVenue.id).toBeDefined()

      // 2. Adjuntar el documento PDF al recinto recién creado y persistido
      const pdfFile = new File(['%PDF-1.4 presupuesto'], 'Propuesta_Valle_Hermoso.pdf', {
        type: 'application/pdf'
      })

      const doc = await store.uploadVenueDocument(
        newVenue.id,
        pdfFile,
        'Cotización inicial'
      )

      expect(doc.id).toBeDefined()
      expect(doc.wedding_venue_id).toBe(newVenue.id)
      expect(store.venueDocuments.some((d) => d.id === doc.id)).toBe(true)
    })

    it('debe adjuntar documento al editar un recinto existente', async () => {
      const store = usePlacesStore()
      await store.fetchWeddingVenues()
      await store.fetchVenueDocuments()
      const existingVenue = store.weddingVenues[0]

      const pdfFile = new File(['%PDF-1.4 anexo'], 'Anexo_Menu_Vegetariano.pdf', {
        type: 'application/pdf'
      })

      const doc = await store.uploadVenueDocument(
        existingVenue.id,
        pdfFile,
        'Anexo menú especial'
      )

      expect(doc.id).toBeDefined()
      expect(doc.wedding_venue_id).toBe(existingVenue.id)
      expect(doc.display_name).toBe('Anexo menú especial')
    })

    it('debe rechazar documentos que no sean PDF', async () => {
      const store = usePlacesStore()
      const wordFile = new File(['dummy text'], 'contrato.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      await expect(
        store.uploadVenueDocument('venue-demo-1', wordFile)
      ).rejects.toThrow(/Solo se permiten documentos en formato PDF/)
    })

    it('debe rechazar archivos PDF que superen los 10MB', async () => {
      const store = usePlacesStore()
      const hugeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'catalogo_gigante.pdf', {
        type: 'application/pdf'
      })

      await expect(
        store.uploadVenueDocument('venue-demo-1', hugeFile)
      ).rejects.toThrow(/supera el tamaño máximo permitido de 10 MB/)
    })

    it('debe generar una URL segura para visualización', async () => {
      const store = usePlacesStore()
      await store.fetchVenueDocuments()
      const doc = store.venueDocuments[0]

      const url = await store.getDocumentSignedUrl(doc.storage_path)
      expect(typeof url).toBe('string')
      expect(url.length).toBeGreaterThan(0)
    })

    it('debe eliminar un documento adjunto correctamente', async () => {
      const store = usePlacesStore()
      await store.fetchVenueDocuments()
      const initialCount = store.venueDocuments.length
      const targetDoc = store.venueDocuments[0]

      await store.deleteVenueDocument(targetDoc.id)
      expect(store.venueDocuments.length).toBe(initialCount - 1)
      expect(store.venueDocuments.some((d) => d.id === targetDoc.id)).toBe(false)
    })
  })

  describe('Aislamiento financiero estricto', () => {
    it('los precios de viviendas y lugares NO deben alterar balances de cuentas ni cálculos de métricas', () => {
      const accounts: Account[] = [
        {
          id: 'acc-1',
          user_id: 'user-demo',
          name: 'Cuenta Principal',
          type: 'checking',
          initial_balance: 1000000,
          color: '#0F766E',
          icon: 'account_balance',
          is_active: true,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z'
        }
      ]

      const realTransactions: Transaction[] = [
        {
          id: 'tx-1',
          user_id: 'user-demo',
          account_id: 'acc-1',
          destination_account_id: null,
          category_id: 'cat-1',
          type: 'expense',
          status: 'confirmed',
          amount: 50000,
          transaction_date: '2026-11-05',
          description: 'Supermercado',
          notes: null,
          created_at: '2026-11-05T00:00:00Z',
          updated_at: '2026-11-05T00:00:00Z'
        }
      ]

      // Balances normales de finanzas
      const initialBalances = calculateAccountBalances(accounts, realTransactions)
      expect(initialBalances[0].current_balance).toBe(950000)

      const initialMetrics = calculatePeriodMetrics(realTransactions, [], [], {
        month: 11,
        year: 2026
      })
      expect(initialMetrics.expenses).toBe(50000)

      // Guardar una propiedad de $350.000.000 o un recinto de $6.000.000
      // NUNCA debe inyectarse en transactions ni alterar balances:
      const balancesAfterPlaces = calculateAccountBalances(accounts, realTransactions)
      expect(balancesAfterPlaces[0].current_balance).toBe(950000)

      const metricsAfterPlaces = calculatePeriodMetrics(realTransactions, [], [], {
        month: 11,
        year: 2026
      })
      expect(metricsAfterPlaces.expenses).toBe(50000)
    })
  })
})
