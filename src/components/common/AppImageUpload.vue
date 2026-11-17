<template>
  <div class="app-image-upload">
    <div class="row items-center justify-between q-mb-xs">
      <label class="field-label q-mb-none">{{ label || 'Fotografía de referencia' }}</label>
      <q-btn-toggle
        v-model="inputMode"
        no-caps
        dense
        unelevated
        size="xs"
        class="mode-toggle"
        toggle-color="primary"
        color="grey-3"
        text-color="grey-8"
        :options="[
          { label: 'Subir archivo', value: 'file' },
          { label: 'URL directa', value: 'url' }
        ]"
      />
    </div>

    <!-- Mode: File upload -->
    <div v-if="inputMode === 'file'" class="upload-zone">
      <q-file
        v-model="selectedFile"
        outlined
        dense
        clearable
        accept="image/jpeg,image/png,image/webp"
        max-file-size="5242880"
        label="Seleccionar imagen (JPG, PNG, WebP máx. 5MB)"
        class="app-file-input"
        :loading="isUploading"
        @update:model-value="handleFileSelected"
        @rejected="handleFileRejected"
      >
        <template #prepend>
          <q-icon name="cloud_upload" size="18px" />
        </template>
      </q-file>
    </div>

    <!-- Mode: Direct URL -->
    <div v-else class="url-zone">
      <q-input
        :model-value="modelValue"
        outlined
        dense
        clearable
        placeholder="https://ejemplo.com/foto.jpg"
        class="app-url-input"
        @update:model-value="handleUrlUpdate"
      >
        <template #prepend>
          <q-icon name="link" size="18px" />
        </template>
      </q-input>
    </div>

    <!-- Image preview / placeholder -->
    <div class="preview-container q-mt-xs">
      <div v-if="modelValue" class="preview-box">
        <img
          :src="modelValue"
          alt="Vista previa"
          class="preview-img"
          @error="handleImgError"
        />
        <div class="preview-overlay">
          <q-btn
            icon="delete"
            flat
            round
            dense
            size="xs"
            color="white"
            class="bg-dark-opacity"
            aria-label="Quitar fotografía"
            @click="clearImage"
          />
        </div>
      </div>
      <div v-else class="placeholder-box">
        <q-icon name="photo" size="24px" class="text-muted" />
        <span class="text-caption text-muted q-ml-xs">Sin fotografía asignada</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePlacesStore } from '@/stores/places'

const props = defineProps<{
  modelValue?: string | null
  label?: string
  folder?: 'properties' | 'venues'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const $q = useQuasar()
const placesStore = usePlacesStore()

const inputMode = ref<'file' | 'url'>('file')
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    if (val && val.startsWith('http') && !val.includes('supabase') && !val.includes('blob')) {
      inputMode.value = 'url'
    }
  },
  { immediate: true }
)

async function handleFileSelected(file: File | null) {
  if (!file) return
  isUploading.value = true
  try {
    const url = await placesStore.uploadPlaceImage(file, props.folder || 'properties')
    emit('update:modelValue', url)
    $q.notify({ type: 'positive', message: 'Fotografía cargada correctamente' })
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Error al subir la imagen' })
    selectedFile.value = null
  } finally {
    isUploading.value = false
  }
}

function handleFileRejected() {
  $q.notify({
    type: 'negative',
    message: 'El archivo debe ser JPG, PNG o WebP de máximo 5MB'
  })
}

function handleUrlUpdate(val: string | number | null) {
  const str = typeof val === 'string' ? val.trim() : null
  emit('update:modelValue', str || null)
}

function clearImage() {
  selectedFile.value = null
  emit('update:modelValue', null)
}

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) {
    target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Sin+imagen'
  }
}
</script>

<style scoped>
.app-image-upload {
  width: 100%;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.mode-toggle {
  border-radius: 6px;
  overflow: hidden;
  font-size: 0.72rem;
}

:deep(.app-file-input .q-field__control),
:deep(.app-url-input .q-field__control) {
  min-height: 42px !important;
  height: 42px !important;
  border-radius: 10px !important;
}

:deep(.app-file-input .q-field__marginal),
:deep(.app-url-input .q-field__marginal) {
  height: 42px !important;
}

.preview-container {
  width: 100%;
}

.preview-box {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
  background-color: var(--bg-surface-elevated);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 6px;
  right: 6px;
}

.bg-dark-opacity {
  background: rgba(0, 0, 0, 0.55);
}

.placeholder-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  border-radius: 8px;
  border: 1px dashed var(--border-soft);
  background-color: var(--bg-surface-elevated);
}
</style>
