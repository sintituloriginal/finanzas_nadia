<template>
  <q-page class="page-container">
    <AppPageHeader
      eyebrow="PREFERENCIAS DEL SISTEMA"
      title="Configuración y Cuenta"
      subtitle="Personaliza tu perfil, el tema visual, la cuenta predeterminada y revisa el estado de tu sesión."
    />

    <div class="row q-col-gutter-lg">
      <!-- Preferencias de Usuario -->
      <div class="col-12 col-md-7">
        <AppSectionCard
          title="Preferencias Generales"
          subtitle="Ajustes operativos para agilizar el registro diario"
          icon="tune"
          bordered-header
        >
          <q-form @submit.prevent="savePreferences" class="q-gutter-y-md">
            <div>
              <label class="field-label">Nombre visible</label>
              <q-input
                v-model="fullName"
                outlined
                dense
                :rules="[(val) => Boolean(val && val.trim()) || 'Ingresa un nombre']"
              />
            </div>

            <div>
              <label class="field-label">Apariencia / Tema de la interfaz</label>
              <q-select
                v-model="themePreference"
                outlined
                dense
                emit-value
                map-options
                :options="[
                  { label: 'Automático (Según el sistema operativo)', value: 'system' },
                  { label: 'Modo Claro Refinado', value: 'light' },
                  { label: 'Modo Oscuro Fintech', value: 'dark' }
                ]"
              />
            </div>

            <div>
              <label class="field-label">Cuenta financiera predeterminada para nuevos movimientos</label>
              <q-select
                v-model="defaultAccountId"
                :options="financeStore.activeAccounts"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                outlined
                dense
              />
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <label class="field-label">Moneda principal</label>
                <q-input
                  model-value="Peso Chileno (CLP - $)"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div class="col-12 col-sm-6">
                <label class="field-label">Zona horaria y formato</label>
                <q-input
                  model-value="America/Santiago (DD/MM/YYYY)"
                  outlined
                  dense
                  readonly
                />
              </div>
            </div>

            <div class="row justify-end q-pt-sm">
              <AppActionButton
                type="submit"
                icon="check"
                label="Guardar configuración"
              />
            </div>
          </q-form>
        </AppSectionCard>
      </div>

      <!-- Información de Sesión y Seguridad -->
      <div class="col-12 col-md-5">
        <AppSectionCard
          title="Seguridad y Sesión Activa"
          subtitle="Estado de autenticación y persistencia de datos"
          icon="verified_user"
          bordered-header
        >
          <div class="q-gutter-y-md">
            <div class="surface-subtle q-pa-md">
              <div class="text-caption text-muted">Correo electrónico autenticado</div>
              <div class="text-weight-bold text-body1 q-mt-xs">{{ authStore.user?.email }}</div>
            </div>

            <div class="surface-subtle q-pa-md">
              <div class="text-caption text-muted">Identificador único de usuario (UUID)</div>
              <div class="font-mono text-caption text-secondary-ink q-mt-xs">
                {{ authStore.user?.id }}
              </div>
            </div>

            <div class="surface-subtle q-pa-md row items-center justify-between">
              <div>
                <div class="text-caption text-muted">Motor de Persistencia</div>
                <div class="text-weight-semibold text-body2 q-mt-xs">
                  {{
                    authStore.isCloudMode
                      ? 'Supabase PostgreSQL (RLS Activo)'
                      : 'Almacenamiento Local Seguro'
                  }}
                </div>
              </div>
              <AppStatusBadge
                :label="authStore.isCloudMode ? 'Nube' : 'Local'"
                :tone="authStore.isCloudMode ? 'success' : 'warning'"
              />
            </div>

            <q-separator class="q-my-md" />

            <AppActionButton
              variant="danger"
              icon="logout"
              label="Cerrar sesión en este dispositivo"
              class="full-width"
              @click="handleLogout"
            />
          </div>
        </AppSectionCard>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSectionCard from '@/components/common/AppSectionCard.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import type { ThemePreference } from '@/types/finance'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const financeStore = useFinanceStore()

const fullName = ref('')
const themePreference = ref<ThemePreference>('system')
const defaultAccountId = ref<string | null>(null)

watchEffect(() => {
  if (authStore.profile) {
    fullName.value = authStore.profile.full_name
    themePreference.value = authStore.profile.theme_preference
    defaultAccountId.value = authStore.profile.default_account_id
  }
})

async function savePreferences() {
  try {
    await authStore.updateProfileSettings({
      full_name: fullName.value.trim(),
      theme_preference: themePreference.value,
      default_account_id: defaultAccountId.value
    })
    $q.notify({
      type: 'positive',
      message: 'Preferencias actualizadas correctamente'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al guardar configuración'
    })
  }
}

async function handleLogout() {
  await authStore.signOut()
  await router.push('/login')
}
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 5px;
}
</style>
