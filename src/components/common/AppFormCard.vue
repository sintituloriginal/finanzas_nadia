<template>
  <q-card class="form-modal-card column no-wrap" flat>
    <q-card-section class="dialog-header q-px-md q-py-sm shrink-0">
      <!-- Fila 1: Icono + Título a la izquierda, botón cerrar arriba a la derecha -->
      <div class="row items-center justify-between no-wrap full-width">
        <div class="row items-center no-wrap min-w-0 q-mr-sm">
          <div v-if="icon" class="modal-icon-box q-mr-sm shrink-0">
            <q-icon :name="icon" size="18px" color="primary" />
          </div>
          <div class="text-subtitle1 text-weight-bolder leading-tight ellipsis dialog-title">
            {{ title }}
          </div>
        </div>
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          size="sm"
          class="text-muted shrink-0"
          aria-label="Cerrar modal"
        />
      </div>

      <!-- Fila 2: Subtítulo inmediatamente debajo en estilo secundario -->
      <div v-if="subtitle" class="text-caption text-muted q-mt-xs dialog-subtitle">
        {{ subtitle }}
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="dialog-body col q-pa-md scroll">
      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  icon?: string
}>()
</script>

<style scoped>
.form-modal-card {
  width: 100%;
  max-width: min(520px, calc(100vw - 24px));
  max-height: min(90dvh, 90vh);
  background-color: var(--bg-surface);
  border-radius: 14px;
  box-sizing: border-box;
  overflow: hidden;
}

.shrink-0 {
  flex-shrink: 0;
}

.min-w-0 {
  min-width: 0;
}

.dialog-header {
  background-color: var(--bg-surface);
}

.dialog-title {
  font-size: 1.05rem;
}

.dialog-subtitle {
  font-size: 0.76rem;
  line-height: 1.25;
}

.dialog-body {
  max-height: 100%;
  box-sizing: border-box;
}

.modal-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: var(--brand-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

