<template>
  <q-page class="page-container">
    <AppPageHeader
      eyebrow="ORGANIZADOR DE EVENTOS"
      title="Lugares de Matrimonio"
      subtitle="Guarda, compara y organiza centros de eventos, salones y parcelas sin registrar gastos contables."
    >
      <template #actions>
        <AppActionButton
          icon="add"
          label="Nuevo lugar"
          @click="openDialog()"
        />
      </template>
    </AppPageHeader>

    <!-- Barra de Filtros y Búsqueda -->
    <q-card flat class="fintech-card q-mb-md q-pa-sm">
      <div class="row q-col-gutter-sm items-center">
        <!-- Búsqueda texto -->
        <div class="col-12 col-sm-4 col-md-3">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            clearable
            placeholder="Buscar por nombre, comuna o servicios..."
            class="filter-input"
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
        </div>

        <!-- Filtro Tipo de Recinto -->
        <div class="col-6 col-sm-4 col-md-2">
          <q-select
            v-model="filterType"
            :options="venueTypeFilterOptions"
            emit-value
            map-options
            outlined
            dense
            options-dense
            label="Tipo de recinto"
            class="filter-input"
          />
        </div>

        <!-- Filtro Estado -->
        <div class="col-6 col-sm-4 col-md-2">
          <q-select
            v-model="filterStatus"
            :options="statusFilterOptions"
            emit-value
            map-options
            outlined
            dense
            options-dense
            label="Estado"
            class="filter-input"
          />
        </div>

        <!-- Ordenamiento -->
        <div class="col-6 col-sm-4 col-md-2">
          <q-select
            v-model="sortBy"
            :options="sortOptions"
            emit-value
            map-options
            outlined
            dense
            options-dense
            label="Ordenar por"
            class="filter-input"
          />
        </div>

        <!-- Solo favoritos -->
        <div class="col-6 col-sm-4 col-md-1 row items-center justify-start">
          <q-btn
            :flat="!onlyFavorites"
            :unelevated="onlyFavorites"
            :color="onlyFavorites ? 'amber-9' : 'grey-7'"
            round
            dense
            size="sm"
            :icon="onlyFavorites ? 'star' : 'star_border'"
            aria-label="Ver solo favoritos"
            @click="onlyFavorites = !onlyFavorites"
          >
            <q-tooltip>{{ onlyFavorites ? 'Mostrando solo favoritos' : 'Filtrar favoritos' }}</q-tooltip>
          </q-btn>
          <span class="text-caption q-ml-xs text-muted">Favoritos</span>
        </div>
      </div>
    </q-card>

    <!-- Estado vacío -->
    <q-card v-if="filteredVenues.length === 0" flat class="fintech-card q-mb-xl">
      <AppEmptyState
        icon="celebration"
        :title="venues.length === 0 ? 'Aún no tienes recintos guardados' : 'Sin resultados para los filtros seleccionados'"
        :description="venues.length === 0 ? 'Guarda y organiza opciones de centros de eventos, parcelas o salones para cotizar y comparar con calma.' : 'Intenta limpiar los filtros o ajustar los términos de búsqueda.'"
      >
        <template #action>
          <AppActionButton
            v-if="venues.length === 0"
            icon="add"
            label="Registrar primer lugar"
            @click="openDialog()"
          />
          <AppActionButton
            v-else
            variant="outline"
            icon="clear"
            label="Limpiar filtros"
            @click="clearFilters"
          />
        </template>
      </AppEmptyState>
    </q-card>

    <!-- Grilla de Tarjetas -->
    <div v-else class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="item in filteredVenues"
        :key="item.id"
        class="col-12 col-sm-6 col-lg-4"
      >
        <q-card flat class="venue-card full-height column justify-between">
          <!-- Imagen y Badges superiores -->
          <div class="venue-media-box">
            <img
              :src="item.image_url || defaultVenueImg"
              :alt="item.name"
              class="venue-img"
              @error="handleImgError"
            />
            <div class="media-overlay-top">
              <q-badge
                v-if="item.venue_type"
                color="deep-purple-8"
                text-color="white"
                class="type-badge"
              >
                {{ venueTypeLabel(item.venue_type) }}
              </q-badge>
              <div v-else />

              <div class="row items-center q-gutter-x-xs">
                <!-- Botón de favorito -->
                <q-btn
                  round
                  dense
                  flat
                  size="sm"
                  :icon="item.is_favorite ? 'star' : 'star_border'"
                  :color="item.is_favorite ? 'amber-4' : 'white'"
                  class="bg-dark-opacity card-action-overlay-btn"
                  aria-label="Alternar favorito"
                  @click.stop="toggleFavorite(item.id)"
                />

                <!-- Menú móvil de acciones (Editar / Eliminar) -->
                <q-btn
                  round
                  dense
                  flat
                  size="sm"
                  icon="more_vert"
                  color="white"
                  class="bg-dark-opacity card-action-overlay-btn lt-sm"
                  aria-label="Más opciones"
                  @click.stop
                >
                  <q-menu auto-close anchor="bottom right" self="top right">
                    <q-list dense style="min-width: 140px">
                      <q-item clickable v-close-popup @click="openDialog(item)">
                        <q-item-section avatar style="min-width: 28px">
                          <q-icon name="edit" size="18px" class="text-secondary-ink" />
                        </q-item-section>
                        <q-item-section>Editar</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item clickable v-close-popup @click="confirmDelete(item)" class="text-negative">
                        <q-item-section avatar style="min-width: 28px">
                          <q-icon name="delete_outline" size="18px" color="negative" />
                        </q-item-section>
                        <q-item-section>Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </div>

          <!-- Contenido de la Tarjeta -->
          <q-card-section class="q-pa-md col column justify-between">
            <div>
              <div class="row items-center justify-between no-wrap q-mb-xs">
                <AppStatusBadge
                  :label="statusLabel(item.status)"
                  :tone="statusTone(item.status)"
                />
                <span class="text-caption text-muted font-mono">
                  {{ formatDate(item.created_at) }}
                </span>
              </div>

              <div class="text-subtitle1 text-weight-bolder leading-tight q-mb-xs title-clamp">
                {{ item.name }}
              </div>

              <div v-if="item.commune || item.address" class="text-caption text-muted row items-center q-mb-sm">
                <q-icon name="place" size="14px" class="q-mr-xs text-primary" />
                <span class="ellipsis">{{ [item.address, item.commune, item.region].filter(Boolean).join(', ') }}</span>
              </div>

              <!-- Precio / Cotización destacado -->
              <div class="price-container q-mb-sm">
                <div class="text-h6 text-weight-bolder text-primary font-mono leading-none">
                  {{ item.price ? formatCLP(item.price) : 'Cotización pendiente' }}
                </div>
                <div v-if="item.price" class="text-caption text-muted font-mono q-mt-xs">
                  {{ priceTypeLabel(item.price_type) }}
                </div>
              </div>

              <!-- Capacidad, Teléfono, Fecha de interés -->
              <div class="features-row row q-gutter-x-sm q-gutter-y-xs q-mb-sm text-caption text-secondary-ink">
                <span v-if="item.capacity" class="feature-item">
                  <q-icon name="groups" size="14px" /> Hasta {{ item.capacity }} pers.
                </span>
                <span v-if="item.target_date" class="feature-item">
                  <q-icon name="event" size="14px" /> {{ formatTargetDate(item.target_date) }}
                </span>
                <span v-if="item.contact_phone" class="feature-item">
                  <q-icon name="phone" size="14px" /> {{ item.contact_phone }}
                </span>
              </div>

              <!-- Servicios incluidos -->
              <div v-if="item.services" class="services-box q-mb-xs text-caption text-muted">
                <span class="text-weight-bold text-secondary-ink">Servicios:</span> {{ item.services }}
              </div>

              <!-- Documentos adjuntos (consulta y descarga directa) -->
              <div v-if="getVenueDocs(item.id).length > 0" class="docs-card-box q-mb-xs">
                <div class="row items-center justify-between no-wrap q-mb-xs">
                  <span class="text-caption text-weight-bold text-secondary-ink row items-center no-wrap">
                    <q-icon name="picture_as_pdf" size="14px" color="negative" class="q-mr-xs shrink-0" />
                    Documentos ({{ getVenueDocs(item.id).length }})
                  </span>
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="xs"
                    color="primary"
                    label="Ver todos"
                    @click.stop="openDocsModal(item)"
                  />
                </div>

                <div class="column q-gutter-y-xs">
                  <div
                    v-for="doc in getVenueDocs(item.id).slice(0, 2)"
                    :key="doc.id"
                    class="doc-mini-pill row items-center justify-between no-wrap q-px-sm q-py-xs"
                  >
                    <div class="row items-center no-wrap min-w-0 q-mr-xs">
                      <q-icon name="description" size="13px" color="negative" class="q-mr-xs shrink-0" />
                      <span class="ellipsis text-caption title-ellipsis">
                        {{ doc.display_name || doc.original_filename }}
                      </span>
                      <q-tooltip>{{ doc.display_name || doc.original_filename }} ({{ formatFileSize(doc.file_size) }})</q-tooltip>
                    </div>
                    <div class="row items-center q-gutter-x-xs shrink-0">
                      <q-btn
                        flat
                        round
                        dense
                        size="xs"
                        icon="visibility"
                        color="primary"
                        aria-label="Ver PDF"
                        @click.stop="viewDoc(doc)"
                      >
                        <q-tooltip>Ver</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        size="xs"
                        icon="download"
                        class="text-secondary-ink"
                        aria-label="Descargar PDF"
                        @click.stop="downloadDoc(doc)"
                      >
                        <q-tooltip>Descargar</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Observaciones breves -->
              <p v-if="item.notes" class="text-caption text-muted notes-clamp q-mb-none">
                {{ item.notes }}
              </p>
            </div>

            <!-- Acciones al pie de la tarjeta -->
            <div class="card-footer row items-center justify-between q-pt-md q-mt-sm border-top">
              <div class="row q-gutter-xs items-center">
                <q-btn
                  v-if="item.source_url"
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="primary"
                  icon="open_in_new"
                  label="Sitio / Instagram"
                  :href="item.source_url"
                  target="_blank"
                  rel="noopener noreferrer"
                />
                <q-btn
                  v-if="item.source_url"
                  flat
                  round
                  dense
                  size="xs"
                  icon="content_copy"
                  class="text-muted"
                  aria-label="Copiar enlace"
                  @click.stop="copyLink(item.source_url)"
                >
                  <q-tooltip>Copiar enlace</q-tooltip>
                </q-btn>
              </div>

              <div class="row q-gutter-xs gt-xs">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="edit"
                  class="text-muted"
                  aria-label="Editar"
                  @click="openDialog(item)"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="delete_outline"
                  color="negative"
                  aria-label="Eliminar"
                  @click="confirmDelete(item)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Modal Formulario Crear / Editar -->
    <q-dialog v-model="dialogOpen" persistent>
      <AppFormCard
        :title="editingId ? 'Editar lugar de matrimonio' : 'Nuevo lugar de matrimonio'"
        :subtitle="editingId ? 'Actualiza la cotización, capacidad o detalles del lugar' : 'Guarda una opción para comparar recintos y cotizaciones'"
        icon="celebration"
      >
        <q-form @submit.prevent="saveForm" class="venue-form">
          <!-- 1. Información del recinto -->
          <div class="form-section">
            <div class="section-title">Información del recinto</div>
            
            <div class="form-row">
              <div class="form-group col-12">
                <label class="field-label">Nombre del recinto o lugar *</label>
                <q-input
                  v-model="form.name"
                  outlined
                  dense
                  placeholder="Ej: Casona San José de Chicureo"
                  :rules="[(val) => Boolean(val && val.trim()) || 'El nombre es obligatorio']"
                  hide-bottom-space
                  class="compact-input"
                />
              </div>
            </div>

            <div class="form-row form-grid-2">
              <div class="form-group">
                <label class="field-label">Tipo de recinto</label>
                <q-select
                  v-model="form.venue_type"
                  :options="venueTypeOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  options-dense
                  clearable
                  class="compact-input"
                />
              </div>
              <div class="form-group">
                <label class="field-label">Modalidad de precio</label>
                <q-select
                  v-model="form.price_type"
                  :options="[
                    { label: 'Precio total', value: 'total' },
                    { label: 'Por persona', value: 'per_person' },
                    { label: 'Otro formato', value: 'other' }
                  ]"
                  emit-value
                  map-options
                  outlined
                  dense
                  options-dense
                  class="compact-input"
                />
              </div>
            </div>
          </div>

          <!-- 2. Precio y capacidad -->
          <div class="form-section">
            <div class="section-title">Precio y capacidad</div>

            <div class="form-row form-grid-2">
              <div class="form-group">
                <label class="field-label">Precio o cotización (CLP)</label>
                <AppCurrencyInput v-model="form.price" class="compact-input" />
              </div>
              <div class="form-group">
                <label class="field-label">Capacidad de invitados</label>
                <q-input
                  v-model.number="form.capacity"
                  type="number"
                  min="0"
                  outlined
                  dense
                  placeholder="Ej: 200"
                  class="compact-input"
                />
              </div>
            </div>
          </div>

          <!-- 3. Ubicación y contacto -->
          <div class="form-section">
            <div class="section-title">Ubicación y contacto</div>

            <div class="form-row">
              <div class="form-group col-12">
                <label class="field-label">Dirección</label>
                <q-input
                  v-model="form.address"
                  outlined
                  dense
                  placeholder="Ej: Camino Chicureo Km 2.5"
                  class="compact-input"
                />
              </div>
            </div>

            <div class="form-row form-grid-2">
              <div class="form-group">
                <label class="field-label">Comuna</label>
                <q-input
                  v-model="form.commune"
                  outlined
                  dense
                  placeholder="Ej: Colina"
                  class="compact-input"
                />
              </div>
              <div class="form-group">
                <label class="field-label">Región</label>
                <q-input
                  v-model="form.region"
                  outlined
                  dense
                  placeholder="Ej: Metropolitana de Santiago"
                  class="compact-input"
                />
              </div>
            </div>

            <div class="form-row form-grid-2">
              <div class="form-group">
                <label class="field-label">Teléfono o contacto</label>
                <q-input
                  v-model="form.contact_phone"
                  outlined
                  dense
                  placeholder="+56 9 1234 5678"
                  class="compact-input"
                />
              </div>
              <div class="form-group">
                <label class="field-label">Fecha tentativa de interés</label>
                <q-input
                  v-model="form.target_date"
                  type="date"
                  outlined
                  dense
                  class="compact-input"
                />
              </div>
            </div>
          </div>

          <!-- 4. Fotografías y enlaces -->
          <div class="form-section">
            <div class="section-title">Fotografías y enlaces</div>

            <div class="form-row">
              <div class="form-group col-12">
                <AppImageUpload v-model="form.image_url" folder="venues" label="Fotografía de referencia" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-12">
                <label class="field-label">Sitio web o Instagram</label>
                <q-input
                  v-model="form.source_url"
                  outlined
                  dense
                  placeholder="https://instagram.com/... o https://matrimonios.cl/..."
                  class="compact-input"
                >
                  <template #prepend>
                    <q-icon name="link" size="18px" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- 5. Documentos adjuntos (PDFs) -->
          <div class="form-section">
            <AppVenueDocuments
              ref="venueDocsRef"
              :venue-id="editingId || undefined"
              :is-new="!editingId"
              :editable="true"
            />
          </div>

          <!-- 6. Información adicional -->
          <div class="form-section">
            <div class="section-title">Información adicional</div>

            <div class="form-row">
              <div class="form-group col-12">
                <label class="field-label">Servicios incluidos</label>
                <q-input
                  v-model="form.services"
                  type="textarea"
                  outlined
                  dense
                  rows="2"
                  placeholder="Ej: Banquetería, DJ, vajilla rústica, estacionamiento, suite de novios..."
                />
              </div>
            </div>

            <div class="form-row form-grid-2 items-center">
              <div class="form-group">
                <label class="field-label">Estado de evaluación</label>
                <q-select
                  v-model="form.status"
                  :options="statusOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  options-dense
                  class="compact-input"
                />
              </div>
              <div class="form-group toggle-group">
                <label class="field-label toggle-placeholder-label">&nbsp;</label>
                <div class="favorite-toggle-card">
                  <q-toggle
                    v-model="form.is_favorite"
                    label="Marcar favorito"
                    color="amber-9"
                    dense
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-12">
                <label class="field-label">Notas y observaciones personales</label>
                <q-input
                  v-model="form.notes"
                  type="textarea"
                  outlined
                  dense
                  rows="2"
                  placeholder="Ej: Nos atendió Andrea. Ofrecen 10% de descuento si reservamos antes de fin de mes..."
                />
              </div>
            </div>
          </div>

          <!-- Footer con botones de acción -->
          <div class="modal-footer q-pt-sm">
            <AppActionButton
              variant="ghost"
              label="Cancelar"
              v-close-popup
              class="modal-btn modal-btn-cancel"
            />
            <AppActionButton
              type="submit"
              icon="check"
              :label="editingId ? 'Guardar cambios' : 'Guardar lugar'"
              :loading="isSubmitting"
              :disable="isSubmitting"
              class="modal-btn modal-btn-save"
            />
          </div>
        </q-form>
      </AppFormCard>
    </q-dialog>

    <!-- Modal Consulta Directa de Documentos -->
    <q-dialog v-model="docsDialogOpen">
      <AppFormCard
        :title="selectedVenueForDocs ? `Documentos: ${selectedVenueForDocs.name}` : 'Documentos adjuntos'"
        subtitle="Cotizaciones, catálogos y menús en formato PDF"
        icon="picture_as_pdf"
      >
        <div class="q-py-xs">
          <AppVenueDocuments
            v-if="selectedVenueForDocs"
            :venue-id="selectedVenueForDocs.id"
            :editable="false"
          />
        </div>
      </AppFormCard>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePlacesStore } from '@/stores/places'
import { formatCLP, formatFileSize } from '@/utils/format'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import AppFormCard from '@/components/common/AppFormCard.vue'
import AppCurrencyInput from '@/components/common/AppCurrencyInput.vue'
import AppImageUpload from '@/components/common/AppImageUpload.vue'
import AppVenueDocuments from '@/components/common/AppVenueDocuments.vue'
import type {
  WeddingVenue,
  VenueType,
  VenuePriceType,
  VenueStatus,
  WeddingVenueDocument
} from '@/types/places'

const $q = useQuasar()
const placesStore = usePlacesStore()

const defaultVenueImg =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'

// Filtros y orden
const searchQuery = ref('')
const filterType = ref<string>('all')
const filterStatus = ref<string>('all')
const sortBy = ref<'recent' | 'price_asc' | 'price_desc'>('recent')
const onlyFavorites = ref(false)

const venueTypeOptions = [
  { label: 'Centro de eventos', value: 'event_center' },
  { label: 'Salón', value: 'hall' },
  { label: 'Parcela', value: 'parcel' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Restaurante', value: 'restaurant' },
  { label: 'Otro recinto', value: 'other' }
]

const venueTypeFilterOptions = [
  { label: 'Todos los recintos', value: 'all' },
  ...venueTypeOptions
]

const statusFilterOptions = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Por revisar', value: 'to_review' },
  { label: 'Nos interesa', value: 'interested' },
  { label: 'Cotización solicitada', value: 'quote_requested' },
  { label: 'Cotizado', value: 'quoted' },
  { label: 'Visita agendada', value: 'visit_scheduled' },
  { label: 'Visitado', value: 'visited' },
  { label: 'Descartado', value: 'discarded' }
]

const statusOptions = [
  { label: 'Por revisar', value: 'to_review' },
  { label: 'Nos interesa', value: 'interested' },
  { label: 'Cotización solicitada', value: 'quote_requested' },
  { label: 'Cotizado', value: 'quoted' },
  { label: 'Visita agendada', value: 'visit_scheduled' },
  { label: 'Visitado', value: 'visited' },
  { label: 'Descartado', value: 'discarded' }
]

const sortOptions = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Precio: menor a mayor', value: 'price_asc' },
  { label: 'Precio: mayor a menor', value: 'price_desc' }
]

const venues = computed(() => placesStore.weddingVenues)

const filteredVenues = computed(() => {
  let list = [...placesStore.weddingVenues]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((v) => {
      const matchName = v.name.toLowerCase().includes(q)
      const matchCommune = v.commune?.toLowerCase().includes(q) ?? false
      const matchAddress = v.address?.toLowerCase().includes(q) ?? false
      const matchServices = v.services?.toLowerCase().includes(q) ?? false
      return matchName || matchCommune || matchAddress || matchServices
    })
  }

  if (filterType.value !== 'all') {
    list = list.filter((v) => v.venue_type === filterType.value)
  }

  if (filterStatus.value !== 'all') {
    list = list.filter((v) => v.status === filterStatus.value)
  }

  if (onlyFavorites.value) {
    list = list.filter((v) => v.is_favorite)
  }

  // Ordenamiento
  list.sort((a, b) => {
    if (sortBy.value === 'price_asc') {
      return (a.price ?? Infinity) - (b.price ?? Infinity)
    }
    if (sortBy.value === 'price_desc') {
      return (b.price ?? -Infinity) - (a.price ?? -Infinity)
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return list
})

function clearFilters() {
  searchQuery.value = ''
  filterType.value = 'all'
  filterStatus.value = 'all'
  onlyFavorites.value = false
  sortBy.value = 'recent'
}

function venueTypeLabel(type: VenueType | null): string {
  switch (type) {
    case 'event_center':
      return 'Centro de eventos'
    case 'hall':
      return 'Salón'
    case 'parcel':
      return 'Parcela'
    case 'hotel':
      return 'Hotel'
    case 'restaurant':
      return 'Restaurante'
    case 'other':
      return 'Otro recinto'
    default:
      return 'Recinto'
  }
}

function priceTypeLabel(type: VenuePriceType): string {
  switch (type) {
    case 'total':
      return 'Precio total estimado'
    case 'per_person':
      return 'Por persona (p/p)'
    case 'other':
      return 'Valor personalizado'
    default:
      return ''
  }
}

function statusLabel(status: VenueStatus): string {
  switch (status) {
    case 'to_review':
      return 'Por revisar'
    case 'interested':
      return 'Nos interesa'
    case 'quote_requested':
      return 'Cotización pedida'
    case 'quoted':
      return 'Cotizado'
    case 'visit_scheduled':
      return 'Visita agendada'
    case 'visited':
      return 'Visitado'
    case 'discarded':
      return 'Descartado'
    default:
      return status
  }
}

function statusTone(status: VenueStatus): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'interested':
    case 'quoted':
    case 'visited':
      return 'success'
    case 'visit_scheduled':
    case 'quote_requested':
      return 'warning'
    case 'discarded':
      return 'danger'
    default:
      return 'neutral'
  }
}

function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
}

function formatTargetDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  } catch {
    return dateStr
  }
}

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) {
    target.src = defaultVenueImg
  }
}

async function toggleFavorite(id: string) {
  try {
    await placesStore.toggleVenueFavorite(id)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: 'No se pudo actualizar el favorito' })
  }
}

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    $q.notify({ type: 'positive', message: 'Enlace copiado al portapapeles' })
  } catch {
    $q.notify({ type: 'info', message: 'Selecciona y copia el enlace manualmente' })
  }
}

function confirmDelete(item: WeddingVenue) {
  $q.dialog({
    title: 'Eliminar recinto',
    message: `¿Estás seguro de eliminar "${item.name}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, noCaps: true }
  }).onOk(async () => {
    try {
      await placesStore.deleteWeddingVenue(item.id)
      $q.notify({ type: 'positive', message: 'Lugar eliminado correctamente' })
    } catch (err: any) {
      $q.notify({ type: 'negative', message: 'Error al eliminar el lugar' })
    }
  })
}

function getVenueDocs(venueId: string): WeddingVenueDocument[] {
  return placesStore.venueDocuments.filter((d) => d.wedding_venue_id === venueId)
}

const docsDialogOpen = ref(false)
const selectedVenueForDocs = ref<WeddingVenue | null>(null)

function openDocsModal(venue: WeddingVenue) {
  selectedVenueForDocs.value = venue
  docsDialogOpen.value = true
}

async function viewDoc(doc: WeddingVenueDocument) {
  try {
    const url = await placesStore.getDocumentSignedUrl(doc.storage_path)
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'No se pudo abrir el PDF' })
  }
}

async function downloadDoc(doc: WeddingVenueDocument) {
  try {
    await placesStore.downloadVenueDocument(doc.storage_path, doc.display_name || doc.original_filename)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Error al descargar' })
  }
}

// -----------------------------------------------------------------------------
// Formulario y Diálogo
// -----------------------------------------------------------------------------
const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingVenueId = ref<string>('')
const isSubmitting = ref(false)
const venueDocsRef = ref<InstanceType<typeof AppVenueDocuments> | null>(null)

const form = reactive({
  name: '',
  venue_type: null as VenueType | null,
  image_url: null as string | null,
  address: '',
  commune: '',
  region: '',
  price: null as number | null,
  price_type: 'total' as VenuePriceType,
  capacity: null as number | null,
  services: '',
  source_url: '',
  contact_phone: '',
  target_date: '',
  notes: '',
  status: 'to_review' as VenueStatus,
  is_favorite: false
})

function openDialog(item?: WeddingVenue) {
  if (venueDocsRef.value) {
    venueDocsRef.value.clearPending()
  }
  if (item) {
    editingId.value = item.id
    pendingVenueId.value = item.id
    form.name = item.name
    form.venue_type = item.venue_type
    form.image_url = item.image_url
    form.address = item.address || ''
    form.commune = item.commune || ''
    form.region = item.region || ''
    form.price = item.price
    form.price_type = item.price_type
    form.capacity = item.capacity
    form.services = item.services || ''
    form.source_url = item.source_url || ''
    form.contact_phone = item.contact_phone || ''
    form.target_date = item.target_date || ''
    form.notes = item.notes || ''
    form.status = item.status
    form.is_favorite = item.is_favorite
  } else {
    editingId.value = null
    pendingVenueId.value = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'venue-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
    form.name = ''
    form.venue_type = 'event_center'
    form.image_url = null
    form.address = ''
    form.commune = ''
    form.region = ''
    form.price = null
    form.price_type = 'total'
    form.capacity = null
    form.services = ''
    form.source_url = ''
    form.contact_phone = ''
    form.target_date = ''
    form.notes = ''
    form.status = 'to_review'
    form.is_favorite = false
  }
  dialogOpen.value = true
}

async function saveForm() {
  if (!form.name.trim()) return
  isSubmitting.value = true
  try {
    const payload = {
      ...(editingId.value ? {} : { id: pendingVenueId.value }),
      name: form.name.trim(),
      venue_type: form.venue_type,
      image_url: form.image_url,
      address: form.address.trim() || null,
      commune: form.commune.trim() || null,
      region: form.region.trim() || null,
      price: form.price,
      price_type: form.price_type,
      capacity: form.capacity !== null ? Number(form.capacity) : null,
      services: form.services.trim() || null,
      source_url: form.source_url.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      target_date: form.target_date || null,
      notes: form.notes.trim() || null,
      status: form.status,
      is_favorite: form.is_favorite
    }

    if (editingId.value) {
      await placesStore.updateWeddingVenue(editingId.value, payload)
      $q.notify({ type: 'positive', message: 'Lugar actualizado correctamente' })
    } else {
      const createdVenue = await placesStore.createWeddingVenue(payload)
      if (venueDocsRef.value?.hasPendingFiles) {
        await venueDocsRef.value.uploadPending(createdVenue.id)
      }
      $q.notify({ type: 'positive', message: 'Lugar guardado correctamente' })
    }
    dialogOpen.value = false
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Error al guardar el lugar' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  placesStore.fetchWeddingVenues()
  placesStore.fetchVenueDocuments()
})
</script>

<style scoped>
.venue-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.venue-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.venue-media-box {
  position: relative;
  width: 100%;
  height: 180px;
  background-color: var(--bg-surface-elevated);
  overflow: hidden;
}

.venue-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.venue-card:hover .venue-img {
  transform: scale(1.03);
}

.media-overlay-top {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.type-badge {
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 3px 8px;
}

.bg-dark-opacity {
  background: rgba(0, 0, 0, 0.55);
}

.card-action-overlay-btn {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  backdrop-filter: blur(4px);
}

.title-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notes-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
}

.features-row {
  background-color: var(--bg-surface-elevated);
  padding: 6px 10px;
  border-radius: 8px;
}

.feature-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.services-box {
  background-color: var(--bg-surface-elevated);
  padding: 6px 10px;
  border-radius: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.docs-card-box {
  background-color: var(--bg-surface-elevated);
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-soft);
}

.doc-mini-pill {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: 6px;
}

.title-ellipsis {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.border-top {
  border-top: 1px solid var(--border-soft);
}

/* Modal Form Layout & Sections */
:deep(.form-modal-card) {
  max-width: min(580px, calc(100vw - 20px)) !important;
}

.venue-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 0.73rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--brand-primary, #0f766e);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--border-soft);
  opacity: 0.7;
}

.form-row {
  width: 100%;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 12px;
  row-gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.field-label {
  display: block;
  font-size: 0.80rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.25;
}

.toggle-placeholder-label {
  visibility: hidden;
  user-select: none;
}

.favorite-toggle-card {
  min-height: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background-color: var(--bg-surface-elevated);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

:deep(.compact-input .q-field__control) {
  min-height: 44px !important;
  height: 44px !important;
  border-radius: 10px !important;
}

:deep(.compact-input .q-field__marginal) {
  height: 44px !important;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  border-top: 1px solid var(--border-soft);
  padding-top: 14px;
  margin-top: 6px;
}

:deep(.modal-btn) {
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 10px !important;
  font-size: 0.86rem !important;
  font-weight: 600 !important;
}

:deep(.modal-btn-cancel) {
  padding: 0 12px !important;
  color: var(--text-secondary) !important;
}

:deep(.modal-btn-save) {
  padding: 0 16px !important;
}

@media (max-width: 599px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .toggle-placeholder-label {
    display: none;
  }
}

@media (max-width: 380px) {
  .modal-footer {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 8px;
  }
}
</style>
