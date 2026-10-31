<template>
  <div class="login-page row items-center justify-center q-pa-md">
    <div class="login-container">
      <q-card flat class="fintech-card login-card q-pa-lg q-pa-sm-xl">
        <!-- Branding limpio y elegante -->
        <div class="column items-center text-center q-mb-lg">
          <div class="brand-hero-icon q-mb-md">
            <q-icon name="account_balance_wallet" size="30px" color="white" />
          </div>
          <div class="text-overline text-primary text-weight-bold" style="letter-spacing: 0.1em">
            GESTIÓN PATRIMONIAL
          </div>
          <h1 class="text-h5 text-weight-bolder q-my-xs">Mi Presupuesto</h1>
          <p class="text-body2 text-muted q-mb-none">
            Control de ingresos, gastos, presupuestos y ahorro en CLP
          </p>
        </div>

        <!-- Estado de entorno local o nube -->
        <div
          v-if="!authStore.isCloudMode"
          class="surface-subtle border-subtle q-pa-md q-mb-md text-caption row items-start no-wrap"
        >
          <q-icon name="verified_user" color="primary" size="18px" class="q-mr-sm q-mt-xs" />
          <div class="text-secondary-ink">
            <strong>Modo Demostración Local:</strong> Ingresa cualquier correo válido y una
            contraseña de al menos 6 caracteres para explorar la aplicación con persistencia en tu
            navegador.
          </div>
        </div>

        <div
          v-if="authStore.authError"
          class="error-box q-pa-sm q-mb-md text-caption row items-center no-wrap"
        >
          <q-icon name="error_outline" color="negative" size="18px" class="q-mr-sm" />
          <span>{{ authStore.authError }}</span>
        </div>

        <!-- Formulario de acceso -->
        <q-form @submit.prevent="handleLogin" class="q-gutter-y-md">
          <div>
            <label class="field-label">Correo electrónico</label>
            <q-input
              v-model="email"
              type="email"
              outlined
              dense
              placeholder="nombre@ejemplo.cl"
              autocomplete="email"
              :rules="[
                (val) => Boolean(val && val.trim()) || 'Ingresa tu correo electrónico',
                (val) => val.includes('@') || 'Ingresa un correo válido'
              ]"
            >
              <template #prepend>
                <q-icon name="mail_outline" size="18px" class="text-muted" />
              </template>
            </q-input>
          </div>

          <div>
            <label class="field-label">Contraseña</label>
            <q-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              placeholder="••••••••"
              autocomplete="current-password"
              :rules="[
                (val) => Boolean(val) || 'Ingresa tu contraseña',
                (val) => val.length >= 6 || 'Mínimo 6 caracteres'
              ]"
            >
              <template #prepend>
                <q-icon name="lock_outline" size="18px" class="text-muted" />
              </template>
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  class="text-muted"
                  @click="showPassword = !showPassword"
                  aria-label="Mostrar u ocultar contraseña"
                />
              </template>
            </q-input>
          </div>

          <q-btn
            type="submit"
            unelevated
            no-caps
            color="primary"
            size="md"
            class="full-width rounded-btn q-py-sm text-weight-bold q-mt-sm"
            label="Ingresar a Mi Presupuesto"
            icon-right="arrow_forward"
            :loading="authStore.loading"
          />
        </q-form>

        <q-separator class="q-my-lg" />

        <div class="row items-center justify-center text-caption text-muted">
          <q-icon name="shield" size="15px" color="primary" class="q-mr-xs" />
          <span>Datos protegidos por usuario con PostgreSQL Row Level Security</span>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('usuario@mipresupuesto.cl')
const password = ref('')
const showPassword = ref(false)

async function handleLogin() {
  const ok = await authStore.signInWithPassword(email.value, password.value)
  if (ok) {
    const redirect = (route.query.redirect as string) || '/'
    await router.push(redirect)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 15%, rgba(13, 148, 136, 0.12), transparent 45%),
    radial-gradient(circle at 85% 85%, rgba(59, 130, 246, 0.08), transparent 45%),
    var(--bg-page);
}

.login-container {
  width: 100%;
  max-width: 440px;
}

.login-card {
  border-radius: 20px;
}

.brand-hero-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px -6px rgba(13, 148, 136, 0.45);
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.error-box {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
  color: #dc2626;
}
</style>
