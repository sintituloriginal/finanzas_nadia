<template>
  <q-page class="page-container">
    <AppPageHeader
      eyebrow="ORGANIZADOR INMOBILIARIO"
      title="Viviendas de Interés"
      subtitle="Guarda, compara y evalúa opciones de departamentos y casas sin alterar tus finanzas."
    >
      <template #actions>
        <AppActionButton
          icon="add"
          label="Nueva vivienda"
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
            placeholder="Buscar por nombre, comuna o sector..."
            class="filter-input"
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
        </div>

        <!-- Filtro Tipo -->
        <div class="col-6 col-sm-4 col-md-2">
          <q-select
            v-model="filterType"
            :options="propertyTypeOptions"
            emit-value
            map-options
            outlined
            dense
            options-dense
            label="Tipo"
            class="filter-input"
          />
        </div>

        <!-- Filtro Operación -->
        <div class="col-6 col-sm-4 col-md-2">
          <q-select
            v-model="filterOperation"
            :options="operationOptions"
            emit-value
            map-options
            outlined
            dense
            options-dense
            label="Modalidad"
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
        <div class="col-12 col-sm-4 col-md-1 row items-center justify-start">
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
    <q-card v-if="filteredProperties.length === 0" flat class="fintech-card q-mb-xl">
      <AppEmptyState
        icon="home_work"
        :title="properties.length === 0 ? 'Aún no tienes viviendas guardadas' : 'Sin resultados para los filtros seleccionados'"
        :description="properties.length === 0 ? 'Registra tu primera opción de casa o departamento para comparar precios, ubicación y características.' : 'Intenta limpiar los filtros o ajustar los términos de búsqueda.'"
      >
        <template #action>
          <AppActionButton
            v-if="properties.length === 0"
            icon="add"
            label="Registrar primera vivienda"
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
        v-for="item in filteredProperties"
        :key="item.id"
        class="col-12 col-sm-6 col-lg-4"
      >
        <q-card flat class="property-card full-height column justify-between">
          <!-- Imagen y Badges superiores -->
          <div class="property-media-box">
            <img
              :src="item.image_url || defaultPropertyImg"
              :alt="item.name"
              class="property-img"
              @error="handleImgError"
            />
            <div class="media-overlay-top">
              <div class="row q-gutter-xs items-center">
                <q-badge
                  :color="item.property_type === 'house' ? 'teal-8' : 'indigo-8'"
                  text-color="white"
                  class="type-badge"
                >
                  {{ item.property_type === 'house' ? 'Casa' : 'Departamento' }}
                </q-badge>
                <q-badge
                  v-if="item.operation_type"
                  :color="item.operation_type === 'rent' ? 'blue-8' : 'deep-orange-8'"
                  text-color="white"
                  class="type-badge"
                >
                  {{ item.operation_type === 'rent' ? 'Arriendo' : 'Compra' }}
                </q-badge>
              </div>

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

              <!-- Precio destacado -->
              <div class="price-container q-mb-sm">
                <div class="text-h6 text-weight-bolder text-primary font-mono leading-none">
                  {{ item.price ? formatCLP(item.price) : 'Precio a consultar' }}
                </div>
                <div v-if="item.common_expenses" class="text-caption text-muted font-mono q-mt-xs">
                  + {{ formatCLP(item.common_expenses) }} GG.CC.
                </div>
              </div>

              <!-- Características: Dorm, Baños, m2, Estacionamiento -->
              <div class="features-row row q-gutter-x-sm q-gutter-y-xs q-mb-sm text-caption text-secondary-ink">
                <span v-if="item.bedrooms" class="feature-item">
                  <q-icon name="bed" size="14px" /> {{ item.bedrooms }} dorm
                </span>
                <span v-if="item.bathrooms" class="feature-item">
                  <q-icon name="bathtub" size="14px" /> {{ item.bathrooms }} bñ
                </span>
                <span v-if="item.surface_m2" class="feature-item">
                  <q-icon name="square_foot" size="14px" /> {{ item.surface_m2 }} m²
                </span>
                <span v-if="item.parking_spots" class="feature-item">
                  <q-icon name="directions_car" size="14px" /> {{ item.parking_spots }} est
                </span>
              </div>

              <!-- Observaciones breves -->
              <p v-if="item.notes" class="text-caption text-muted notes-clamp q-mb-none">
                {{ item.notes }}
              </p>
            </div>

            <!-- Acciones al pie de la tarjeta -->
            <div class="card-footer row items-center justify-between q-pt-md q-mt-sm border-top">
              <q-btn
                v-if="item.source_url"
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                icon="open_in_new"
                label="Ver anuncio"
                :href="item.source_url"
                target="_blank"
                rel="noopener noreferrer"
              />
              <span v-else class="text-caption text-muted">Sin enlace</span>

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
        :title="editingId ? 'Editar vivienda' : 'Nueva vivienda de interés'"
        :subtitle="editingId ? 'Actualiza los datos o estado de la vivienda' : 'Registra una opción para comparar y evaluar'"
        icon="home"
      >
        <q-form @submit.prevent="saveForm" class="property-form">
          <!-- 1. Información del inmueble -->
          <div class="form-section">
            <div class="section-title">Información del inmueble</div>

            <div class="form-row">
              <div class="form-group col-12">
                <label class="field-label">Nombre o título de referencia <span class="text-negative">*</span></label>
                <q-input
                  v-model="form.name"
                  outlined
                  dense
                  placeholder="Ej: Depto 2D2B Pedro de Valdivia"
                  :rules="[(val) => Boolean(val && val.trim()) || 'El título es obligatorio']"
                  hide-bottom-space
                  class="compact-input"
                />
              </div>
            </div>

            <div class="form-row form-grid-2">
              <div class="form-group">
                <label class="field-label">Tipo de inmueble <span class="text-negative">*</span></label>
                <q-select
                  v-model="form.property_type"
                  :options="[
                    { label: 'Departamento', value: 'apartment' },
                    { label: 'Casa', value: 'house' }
                  ]"
                  emit-value
                  map-options
                  outlined
                  dense
                  options-dense
                  :rules="[(val) => Boolean(val) || 'Selecciona un tipo']"
                  class="compact-input"
                />
              </div>
              <div class="form-group">
                <label class="field-label">Modalidad</label>
                <q-select
                  v-model="form.operation_type"
                  :options="[
                    { label: 'Arriendo', value: 'rent' },
                    { label: 'Compra', value: 'buy' }
                  ]"
                  emit-value
                  map-options
                  outlined
                  dense
                  options-dense
                  clearable
                  class="compact-input"
                />
              </div>
            </div>
          </div>

          <!-- 2. Precios y costos -->
          <div class="form-section">
            <div class="section-title">Precios y costos</div>

            <div class="form-row form-grid-2">
              <div class="form-group">
                <label class="field-label">Precio (CLP)</label>
                <AppCurrencyInput v-model="form.price" class="compact-input" />
              </div>
              <div class="form-group">
                <label class="field-label">Gastos comunes (CLP)</label>
                <AppCurrencyInput v-model="form.common_expenses" class="compact-input" />
              </div>
            </div>
          </div>

          <!-- 3. Ubicación -->
          <div class="form-section">
            <div class="section-title">Ubicación</div>

            <div class="form-row">
              <div class="form-group col-12">
                <label class="field-label">Dirección / Sector</label>
                <q-input
                  v-model="form.address"
                  outlined
                  dense
                  placeholder="Ej: Av. Providencia 1234"
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
                  placeholder="Ej: Providencia"
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
          </div>

          <!-- 4. Distribución y características -->
          <div class="form-section">
            <div class="section-title">Distribución y características</div>

            <div class="form-row form-grid-2">
              <div class="form-group">
                <label class="field-label">Dormitorios</label>
                <q-input
                  v-model.number="form.bedrooms"
                  type="number"
                  min="0"
                  outlined
                  dense
                  placeholder="Ej: 2"
                  class="compact-input"
                />
              </div>
              <div class="form-group">
                <label class="field-label">Baños</label>
                <q-input
                  v-model.number="form.bathrooms"
                  type="number"
                  min="0"
                  outlined
                  dense
                  placeholder="Ej: 2"
                  class="compact-input"
                />
              </div>
            </div>

            <div class="form-row form-grid-2">
              <div class="form-group">
                <label class="field-label">Superficie útil (m²)</label>
                <q-input
                  v-model.number="form.surface_m2"
                  type="number"
                  min="0"
                  step="0.5"
                  outlined
                  dense
                  placeholder="Ej: 65"
                  class="compact-input"
                />
              </div>
              <div class="form-group">
                <label class="field-label">Estacionamientos</label>
                <q-input
                  v-model.number="form.parking_spots"
                  type="number"
                  min="0"
                  outlined
                  dense
                  placeholder="Ej: 1"
                  class="compact-input"
                />
              </div>
            </div>
          </div>

          <!-- 5. Fotografías y enlaces -->
          <div class="form-section">
            <div class="section-title">Fotografías y enlaces</div>

            <div class="form-row">
              <div class="form-group col-12">
                <AppImageUpload v-model="form.image_url" folder="properties" label="Fotografía de referencia" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-12">
                <label class="field-label">Enlace del anuncio o portal</label>
                <q-input
                  v-model="form.source_url"
                  outlined
                  dense
                  placeholder="https://portalinmobiliario.com/..."
                  class="compact-input"
                >
                  <template #prepend>
                    <q-icon name="link" size="18px" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- 6. Evaluación y notas -->
          <div class="form-section">
            <div class="section-title">Evaluación y notas</div>

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
                    label="Marcar como favorito"
                    color="amber-9"
                    dense
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-12">
                <label class="field-label">Observaciones y notas personales</label>
                <q-input
                  v-model="form.notes"
                  type="textarea"
                  outlined
                  dense
                  rows="2"
                  placeholder="Ej: Visita agendada para sábado, contactar a corredora María..."
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
              :label="editingId ? 'Guardar cambios' : 'Guardar vivienda'"
              :loading="isSubmitting"
              :disable="isSubmitting"
              class="modal-btn modal-btn-save"
            />
          </div>
        </q-form>
      </AppFormCard>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePlacesStore } from '@/stores/places'
import { formatCLP } from '@/utils/format'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import AppFormCard from '@/components/common/AppFormCard.vue'
import AppCurrencyInput from '@/components/common/AppCurrencyInput.vue'
import AppImageUpload from '@/components/common/AppImageUpload.vue'
import type {
  SavedProperty,
  PropertyType,
  PropertyOperationType,
  PropertyStatus
} from '@/types/places'

const $q = useQuasar()
const placesStore = usePlacesStore()

const defaultPropertyImg =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'

// Filtros y orden
const searchQuery = ref('')
const filterType = ref<string>('all')
const filterOperation = ref<string>('all')
const filterStatus = ref<string>('all')
const sortBy = ref<'recent' | 'price_asc' | 'price_desc'>('recent')
const onlyFavorites = ref(false)

const propertyTypeOptions = [
  { label: 'Todos los tipos', value: 'all' },
  { label: 'Departamento', value: 'apartment' },
  { label: 'Casa', value: 'house' }
]

const operationOptions = [
  { label: 'Todas las modalidades', value: 'all' },
  { label: 'Arriendo', value: 'rent' },
  { label: 'Compra', value: 'buy' }
]

const statusFilterOptions = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Por revisar', value: 'to_review' },
  { label: 'Nos interesa', value: 'interested' },
  { label: 'Contactado', value: 'contacted' },
  { label: 'Visita agendada', value: 'visit_scheduled' },
  { label: 'Visitado', value: 'visited' },
  { label: 'Descartado', value: 'discarded' }
]

const statusOptions = [
  { label: 'Por revisar', value: 'to_review' },
  { label: 'Nos interesa', value: 'interested' },
  { label: 'Contactado', value: 'contacted' },
  { label: 'Visita agendada', value: 'visit_scheduled' },
  { label: 'Visitado', value: 'visited' },
  { label: 'Descartado', value: 'discarded' }
]

const sortOptions = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Precio: menor a mayor', value: 'price_asc' },
  { label: 'Precio: mayor a menor', value: 'price_desc' }
]

const properties = computed(() => placesStore.properties)

const filteredProperties = computed(() => {
  let list = [...placesStore.properties]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q)
      const matchCommune = p.commune?.toLowerCase().includes(q) ?? false
      const matchAddress = p.address?.toLowerCase().includes(q) ?? false
      const matchRegion = p.region?.toLowerCase().includes(q) ?? false
      return matchName || matchCommune || matchAddress || matchRegion
    })
  }

  if (filterType.value !== 'all') {
    list = list.filter((p) => p.property_type === filterType.value)
  }

  if (filterOperation.value !== 'all') {
    list = list.filter((p) => p.operation_type === filterOperation.value)
  }

  if (filterStatus.value !== 'all') {
    list = list.filter((p) => p.status === filterStatus.value)
  }

  if (onlyFavorites.value) {
    list = list.filter((p) => p.is_favorite)
  }

  // Ordenamiento
  list.sort((a, b) => {
    // Si hay favoritos, podemos priorizarlos o seguir el criterio seleccionado
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
  filterOperation.value = 'all'
  filterStatus.value = 'all'
  onlyFavorites.value = false
  sortBy.value = 'recent'
}

function statusLabel(status: PropertyStatus): string {
  switch (status) {
    case 'to_review':
      return 'Por revisar'
    case 'interested':
      return 'Nos interesa'
    case 'contacted':
      return 'Contactado'
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

function statusTone(status: PropertyStatus): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'interested':
    case 'visited':
      return 'success'
    case 'visit_scheduled':
      return 'warning'
    case 'contacted':
      return 'info'
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

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) {
    target.src = defaultPropertyImg
  }
}

async function toggleFavorite(id: string) {
  try {
    await placesStore.togglePropertyFavorite(id)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: 'No se pudo actualizar el favorito' })
  }
}

function confirmDelete(item: SavedProperty) {
  $q.dialog({
    title: 'Eliminar vivienda',
    message: `¿Estás seguro de eliminar "${item.name}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, noCaps: true }
  }).onOk(async () => {
    try {
      await placesStore.deleteProperty(item.id)
      $q.notify({ type: 'positive', message: 'Vivienda eliminada correctamente' })
    } catch (err: any) {
      $q.notify({ type: 'negative', message: 'Error al eliminar la vivienda' })
    }
  })
}

// -----------------------------------------------------------------------------
// Formulario y Diálogo
// -----------------------------------------------------------------------------
const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)

const form = reactive({
  name: '',
  property_type: 'apartment' as PropertyType,
  operation_type: 'rent' as PropertyOperationType | null,
  price: null as number | null,
  common_expenses: null as number | null,
  address: '',
  commune: '',
  region: '',
  bedrooms: null as number | null,
  bathrooms: null as number | null,
  surface_m2: null as number | null,
  parking_spots: null as number | null,
  image_url: null as string | null,
  source_url: '',
  notes: '',
  status: 'to_review' as PropertyStatus,
  is_favorite: false
})

function openDialog(item?: SavedProperty) {
  if (item) {
    editingId.value = item.id
    form.name = item.name
    form.property_type = item.property_type
    form.operation_type = item.operation_type
    form.price = item.price
    form.common_expenses = item.common_expenses
    form.address = item.address || ''
    form.commune = item.commune || ''
    form.region = item.region || ''
    form.bedrooms = item.bedrooms
    form.bathrooms = item.bathrooms
    form.surface_m2 = item.surface_m2
    form.parking_spots = item.parking_spots
    form.image_url = item.image_url
    form.source_url = item.source_url || ''
    form.notes = item.notes || ''
    form.status = item.status
    form.is_favorite = item.is_favorite
  } else {
    editingId.value = null
    form.name = ''
    form.property_type = 'apartment'
    form.operation_type = 'rent'
    form.price = null
    form.common_expenses = null
    form.address = ''
    form.commune = ''
    form.region = ''
    form.bedrooms = null
    form.bathrooms = null
    form.surface_m2 = null
    form.parking_spots = null
    form.image_url = null
    form.source_url = ''
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
      name: form.name.trim(),
      property_type: form.property_type,
      operation_type: form.operation_type,
      price: form.price,
      common_expenses: form.common_expenses,
      address: form.address.trim() || null,
      commune: form.commune.trim() || null,
      region: form.region.trim() || null,
      bedrooms: form.bedrooms !== null ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms !== null ? Number(form.bathrooms) : null,
      surface_m2: form.surface_m2 !== null ? Number(form.surface_m2) : null,
      parking_spots: form.parking_spots !== null ? Number(form.parking_spots) : null,
      image_url: form.image_url,
      source_url: form.source_url.trim() || null,
      description: null,
      notes: form.notes.trim() || null,
      status: form.status,
      is_favorite: form.is_favorite
    }

    if (editingId.value) {
      await placesStore.updateProperty(editingId.value, payload)
      $q.notify({ type: 'positive', message: 'Vivienda actualizada correctamente' })
    } else {
      await placesStore.createProperty(payload)
      $q.notify({ type: 'positive', message: 'Vivienda guardada correctamente' })
    }
    dialogOpen.value = false
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Error al guardar la vivienda' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  placesStore.fetchProperties()
})
</script>

<style scoped>
.property-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.property-media-box {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: var(--bg-surface-subtle, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.property-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transition: transform 0.25s ease;
}

.property-card:hover .property-img {
  transform: scale(1.02);
}

.media-overlay-top {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
  pointer-events: none;
}

.media-overlay-top > * {
  pointer-events: auto;
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

.border-top {
  border-top: 1px solid var(--border-soft);
}

/* Modal Form Layout & Sections */
:deep(.form-modal-card) {
  max-width: min(580px, calc(100vw - 20px)) !important;
}

.property-form {
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
  .property-media-box {
    height: 190px;
  }

  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .toggle-placeholder-label {
    display: none;
  }
}

@media (max-width: 375px) {
  .property-media-box {
    height: 170px;
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
