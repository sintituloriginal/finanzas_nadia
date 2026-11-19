<template>
  <div class="venue-documents-container">
    <!-- Header de la sección de documentos con botón de adjuntar -->
    <div class="row items-center justify-between q-mb-sm">
      <div class="row items-center no-wrap">
        <q-icon name="picture_as_pdf" size="18px" color="negative" class="q-mr-xs" />
        <span class="text-subtitle2 text-weight-bold text-secondary-ink">
          Documentos adjuntos (PDF)
        </span>
        <q-badge
          color="grey-4"
          text-color="grey-9"
          class="q-ml-xs text-weight-bold"
          rounded
        >
          {{ totalDocsCount }}
        </q-badge>
      </div>

      <!-- Botón de carga si es editable -->
      <div v-if="editable" class="row items-center">
        <q-file
          ref="fileInputRef"
          v-model="selectedFile"
          accept="application/pdf"
          max-file-size="10485760"
          style="display: none"
          @update:model-value="handleFilePicked"
          @rejected="handleFileRejected"
        />
        <q-btn
          unelevated
          no-caps
          dense
          size="sm"
          color="primary"
          icon="attach_file"
          label="Adjuntar PDF"
          class="attach-btn"
          :loading="isUploading"
          :disable="isUploading"
          @click="triggerFileSelect"
        />
      </div>
    </div>

    <!-- Indicador de carga de archivo -->
    <div v-if="isUploading" class="uploading-banner q-pa-sm q-mb-sm row items-center">
      <q-spinner-dots size="20px" color="primary" class="q-mr-sm" />
      <span class="text-caption text-secondary-ink">Subiendo documento PDF de forma segura...</span>
    </div>

    <!-- Lista de documentos (persistidos y pendientes) -->
    <div v-if="totalDocsCount > 0" class="docs-list column q-gutter-y-xs">
      <!-- 1. Documentos ya persistidos en Supabase / Store -->
      <div
        v-for="doc in venueDocs"
        :key="doc.id"
        class="doc-item-card row items-center justify-between no-wrap q-pa-sm"
      >
        <div class="row items-center no-wrap min-w-0 q-mr-sm">
          <div class="pdf-icon-box q-mr-sm shrink-0">
            <q-icon name="description" size="18px" color="negative" />
          </div>
          <div class="column min-w-0">
            <div class="text-caption text-weight-bold ellipsis text-secondary-ink title-text">
              {{ doc.display_name || doc.original_filename }}
              <q-tooltip>{{ doc.display_name || doc.original_filename }}</q-tooltip>
            </div>
            <div class="text-caption text-muted row items-center no-wrap font-mono meta-text">
              <span>{{ formatFileSize(doc.file_size) }}</span>
              <span class="dot-separator">•</span>
              <span>{{ formatDate(doc.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Acciones: Ver, Descargar, Eliminar -->
        <div class="row items-center no-wrap q-gutter-x-xs shrink-0">
          <q-btn
            flat
            round
            dense
            size="sm"
            icon="visibility"
            color="primary"
            class="action-icon-btn"
            aria-label="Visualizar PDF"
            :loading="activeActionId === doc.id && actionType === 'view'"
            @click.stop="viewDocument(doc)"
          >
            <q-tooltip>Ver PDF</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            size="sm"
            icon="download"
            class="text-secondary-ink action-icon-btn"
            aria-label="Descargar PDF"
            :loading="activeActionId === doc.id && actionType === 'download'"
            @click.stop="downloadDoc(doc)"
          >
            <q-tooltip>Descargar PDF</q-tooltip>
          </q-btn>
          <q-btn
            v-if="editable"
            flat
            round
            dense
            size="sm"
            icon="delete_outline"
            color="negative"
            class="action-icon-btn"
            aria-label="Eliminar documento"
            @click.stop="confirmDelete(doc)"
          >
            <q-tooltip>Eliminar documento</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- 2. Documentos encolados pendientes de guardar al crear el recinto -->
      <div
        v-for="pDoc in pendingFiles"
        :key="pDoc.tempId"
        class="doc-item-card pending-doc-item row items-center justify-between no-wrap q-pa-sm"
      >
        <div class="row items-center no-wrap min-w-0 q-mr-sm">
          <div class="pdf-icon-box q-mr-sm shrink-0">
            <q-icon name="description" size="18px" color="negative" />
          </div>
          <div class="column min-w-0">
            <div class="text-caption text-weight-bold ellipsis text-secondary-ink title-text">
              {{ pDoc.displayName }}
              <q-tooltip>{{ pDoc.displayName }}</q-tooltip>
            </div>
            <div class="text-caption text-muted row items-center no-wrap font-mono meta-text">
              <span>{{ formatFileSize(pDoc.fileSize) }}</span>
              <span class="dot-separator">•</span>
              <q-badge color="amber-8" text-color="white" label="Pendiente de guardar" rounded class="text-weight-medium" />
            </div>
          </div>
        </div>

        <div class="row items-center no-wrap shrink-0">
          <q-btn
            flat
            round
            dense
            size="sm"
            icon="close"
            color="negative"
            class="action-icon-btn"
            aria-label="Quitar archivo pendiente"
            @click.stop="removePendingDoc(pDoc.tempId)"
          >
            <q-tooltip>Quitar archivo</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-docs-box row items-center justify-center q-pa-md">
      <q-icon name="folder_open" size="20px" class="text-muted q-mr-xs" />
      <span class="text-caption text-muted">
        {{ editable ? 'Sin documentos PDF adjuntos (cotizaciones, menús, catálogos)' : 'No hay documentos adjuntos' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar, type QFile } from 'quasar'
import { usePlacesStore } from '@/stores/places'
import { formatFileSize } from '@/utils/format'
import type { WeddingVenueDocument } from '@/types/places'

interface PendingDocument {
  tempId: string
  file: File
  displayName: string
  fileSize: number
}

const props = withDefaults(
  defineProps<{
    venueId?: string
    isNew?: boolean
    editable?: boolean
  }>(),
  {
    isNew: false,
    editable: false
  }
)

const $q = useQuasar()
const placesStore = usePlacesStore()

const fileInputRef = ref<InstanceType<typeof QFile> | null>(null)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const activeActionId = ref<string | null>(null)
const actionType = ref<'view' | 'download' | null>(null)

const pendingFiles = ref<PendingDocument[]>([])

const venueDocs = computed(() => {
  if (!props.venueId) return []
  return placesStore.venueDocuments.filter((d) => d.wedding_venue_id === props.venueId)
})

const totalDocsCount = computed(() => venueDocs.value.length + pendingFiles.value.length)

function triggerFileSelect() {
  if (fileInputRef.value) {
    fileInputRef.value.pickFiles()
  }
}

async function handleFilePicked(file: File | null) {
  if (!file) return

  // Diálogo para ingresar un nombre descriptivo opcional
  $q.dialog({
    title: 'Nombre del documento',
    message: 'Ingresa un nombre descriptivo para identificar este PDF (opcional):',
    prompt: {
      model: file.name.replace(/\.pdf$/i, ''),
      type: 'text',
      outlined: true,
      dense: true
    },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Adjuntar PDF', color: 'primary', unelevated: true, noCaps: true }
  }).onOk(async (displayName: string) => {
    const finalDisplayName = displayName?.trim() || file.name

    // 1. Si estamos creando un nuevo recinto, encolamos el archivo localmente
    // para subirlo tras la creación exitosa del recinto en la base de datos
    if (props.isNew || !props.venueId) {
      pendingFiles.value.push({
        tempId: 'temp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        file,
        displayName: finalDisplayName,
        fileSize: file.size
      })
      $q.notify({
        type: 'info',
        message: 'PDF preparado. Se guardará al crear el recinto.'
      })
      selectedFile.value = null
      return
    }

    // 2. Si el recinto ya existe en la base de datos, subimos directamente
    isUploading.value = true
    try {
      await placesStore.uploadVenueDocument(
        props.venueId,
        file,
        finalDisplayName
      )
      $q.notify({
        type: 'positive',
        message: 'Documento PDF adjuntado correctamente'
      })
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.message || 'Error al subir el documento PDF'
      })
    } finally {
      isUploading.value = false
      selectedFile.value = null
    }
  }).onCancel(() => {
    selectedFile.value = null
  })
}

function removePendingDoc(tempId: string) {
  pendingFiles.value = pendingFiles.value.filter((p) => p.tempId !== tempId)
}

async function uploadPending(persistedVenueId: string): Promise<void> {
  if (pendingFiles.value.length === 0) return
  isUploading.value = true
  try {
    for (const item of pendingFiles.value) {
      await placesStore.uploadVenueDocument(persistedVenueId, item.file, item.displayName)
    }
    pendingFiles.value = []
  } finally {
    isUploading.value = false
  }
}

function clearPending() {
  pendingFiles.value = []
}

defineExpose({
  uploadPending,
  clearPending,
  hasPendingFiles: computed(() => pendingFiles.value.length > 0)
})

function handleFileRejected() {
  $q.notify({
    type: 'negative',
    message: 'El archivo debe ser un PDF válido de hasta 10 MB'
  })
  selectedFile.value = null
}

async function viewDocument(doc: WeddingVenueDocument) {
  activeActionId.value = doc.id
  actionType.value = 'view'
  try {
    const url = await placesStore.getDocumentSignedUrl(doc.storage_path)
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || 'No se pudo abrir el documento'
    })
  } finally {
    activeActionId.value = null
    actionType.value = null
  }
}

async function downloadDoc(doc: WeddingVenueDocument) {
  activeActionId.value = doc.id
  actionType.value = 'download'
  try {
    await placesStore.downloadVenueDocument(
      doc.storage_path,
      doc.display_name || doc.original_filename
    )
    $q.notify({
      type: 'positive',
      message: 'Descarga iniciada'
    })
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Error al descargar el documento'
    })
  } finally {
    activeActionId.value = null
    actionType.value = null
  }
}

function confirmDelete(doc: WeddingVenueDocument) {
  $q.dialog({
    title: 'Eliminar documento',
    message: `¿Estás seguro de eliminar el archivo "${doc.display_name || doc.original_filename}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, noCaps: true }
  }).onOk(async () => {
    try {
      await placesStore.deleteVenueDocument(doc.id)
      $q.notify({
        type: 'positive',
        message: 'Documento eliminado correctamente'
      })
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.message || 'Error al eliminar el documento'
      })
    }
  })
}

function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.venue-documents-container {
  width: 100%;
}

.attach-btn {
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.78rem;
}

.uploading-banner {
  background-color: var(--brand-primary-soft, rgba(15, 118, 110, 0.08));
  border-radius: 8px;
  border: 1px dashed var(--brand-primary, #0f766e);
}

.doc-item-card {
  background-color: var(--bg-surface-elevated, #f8fafc);
  border: 1px solid var(--border-soft, #e2e8f0);
  border-radius: 8px;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.doc-item-card:hover {
  border-color: var(--brand-primary, #0f766e);
  background-color: var(--bg-surface, #ffffff);
}

.pdf-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-text {
  font-size: 0.82rem;
  line-height: 1.25;
}

.meta-text {
  font-size: 0.72rem;
  margin-top: 2px;
}

.dot-separator {
  margin: 0 6px;
}

.action-icon-btn {
  width: 30px;
  height: 30px;
}

.empty-docs-box {
  border: 1px dashed var(--border-soft, #e2e8f0);
  border-radius: 8px;
  background-color: var(--bg-surface-elevated, #f8fafc);
}

.min-w-0 {
  min-width: 0;
}

.shrink-0 {
  flex-shrink: 0;
}
</style>
