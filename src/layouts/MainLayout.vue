<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <!-- TOPBAR MODERNA -->
    <q-header class="app-header">
      <!-- HEADER DESKTOP (>= 768px: pantalla desktop y tablet horizontal) -->
      <div class="header-desktop gt-sm">
        <q-toolbar class="q-px-md q-px-lg-xl header-desktop-toolbar">
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Alternar menú lateral"
            @click="leftDrawerOpen = !leftDrawerOpen"
            class="q-mr-sm text-secondary-ink"
          />

          <!-- Título y resumen de patrimonio -->
          <div class="row items-center no-wrap min-w-0 q-mr-md">
            <div>
              <div class="text-subtitle1 text-weight-bolder leading-tight ellipsis">
                {{ currentPageTitle }}
              </div>
              <div class="text-caption text-muted ellipsis">
                Saldo total en cuentas:
                <strong class="font-mono text-primary">{{ formatCLP(financeStore.totalNetWorth) }}</strong>
              </div>
            </div>
          </div>

          <q-space />

          <!-- Selector global de período (Mes / Año) -->
          <PeriodSelector class="q-mr-md" />

          <!-- Alternador de tema Claro / Oscuro -->
          <q-btn
            flat
            round
            dense
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            aria-label="Cambiar tema visual"
            @click="toggleDarkMode"
            class="q-mr-xs text-secondary-ink"
          >
            <q-tooltip>Alternar modo claro / oscuro</q-tooltip>
          </q-btn>

          <!-- Acción primaria: Nuevo movimiento -->
          <AppActionButton
            icon="add"
            label="Nuevo movimiento"
            class="q-ml-xs"
            @click="financeStore.quickTransactionDialogOpen = true"
          />
        </q-toolbar>
      </div>

      <!-- HEADER MÓVIL (< 768px / lt-md: dos filas limpias y funcionales) -->
      <div class="header-mobile lt-md">
        <!-- Fila 1: Título a la izquierda, controles globales a la derecha -->
        <div class="header-mobile-row-1 row items-center justify-between no-wrap q-px-md">
          <div class="row items-center no-wrap min-w-0">
            <div class="brand-badge-sm q-mr-sm">
              <q-icon name="account_balance_wallet" size="18px" color="white" />
            </div>
            <div class="text-subtitle1 text-weight-bolder leading-tight ellipsis">
              {{ currentPageTitle }}
            </div>
          </div>

          <div class="row items-center no-wrap q-gutter-x-xs">
            <!-- Alternador de tema Claro / Oscuro -->
            <q-btn
              flat
              round
              dense
              :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
              aria-label="Cambiar tema visual"
              @click="toggleDarkMode"
              class="text-secondary-ink header-touch-btn"
            >
              <q-tooltip>Alternar modo claro / oscuro</q-tooltip>
            </q-btn>

            <!-- Menú de Usuario / Perfil -->
            <q-btn
              flat
              round
              dense
              class="header-touch-btn"
              aria-label="Perfil y ajustes"
            >
              <q-avatar color="primary" text-color="white" size="28px" class="text-weight-bold">
                {{ userInitial }}
              </q-avatar>
              <q-menu auto-close anchor="bottom right" self="top right">
                <q-list style="min-width: 190px">
                  <q-item class="surface-subtle">
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-caption ellipsis">
                        {{ authStore.profile?.full_name || 'Mi Perfil' }}
                      </q-item-label>
                      <q-item-label caption class="ellipsis text-muted" style="font-size: 0.72rem">
                        {{ authStore.user?.email }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable to="/configuracion">
                    <q-item-section avatar style="min-width: 32px">
                      <q-icon name="tune" size="18px" />
                    </q-item-section>
                    <q-item-section>Configuración</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable @click="handleLogout" class="text-negative">
                    <q-item-section avatar style="min-width: 32px">
                      <q-icon name="logout" size="18px" color="negative" />
                    </q-item-section>
                    <q-item-section>Cerrar sesión</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>

        <!-- Fila 2: Selector de mes y selector de año distribuidos al ancho disponible -->
        <div class="header-mobile-row-2 q-px-md q-pb-sm">
          <PeriodSelector is-mobile class="full-width" />
        </div>
      </div>

      <!-- Estado de conexión discreto y elegante -->
      <div
        v-if="!authStore.isCloudMode"
        class="connection-strip q-px-md q-px-lg-xl q-py-xs row items-center justify-between text-caption"
      >
        <div class="row items-center no-wrap min-w-0" style="max-width: 100%">
          <q-icon name="offline_bolt" size="15px" color="warning" class="q-mr-xs shrink-0" />
          <span class="ellipsis" style="font-size: 0.75rem">
            <strong>Modo Local Activo:</strong> Datos guardados localmente.
          </span>
        </div>
        <AppStatusBadge label="Local" tone="warning" class="gt-xs shrink-0" />
      </div>
    </q-header>

    <!-- SIDEBAR MODERNA EN ESCRITORIO -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :mini="miniState"
      :width="260"
      :mini-width="76"
      :breakpoint="768"
      class="app-drawer"
    >
      <div class="column full-height justify-between no-wrap">
        <div>
          <!-- Cabecera de marca -->
          <div class="row items-center justify-between q-px-md" style="min-height: 68px">
            <div v-if="!miniState" class="row items-center no-wrap">
              <div class="brand-badge q-mr-sm">
                <q-icon name="account_balance_wallet" size="20px" color="white" />
              </div>
              <div>
                <div class="text-subtitle1 text-weight-bolder leading-tight">Mi Presupuesto</div>
                <div class="text-caption text-muted" style="font-size: 0.72rem">
                  Finanzas Personales CLP
                </div>
              </div>
            </div>
            <div v-else class="full-width row justify-center">
              <div class="brand-badge cursor-pointer" @click="miniState = false">
                <q-icon name="account_balance_wallet" size="20px" color="white" />
              </div>
            </div>

            <q-btn
              v-if="!miniState"
              flat
              round
              dense
              size="sm"
              icon="chevron_left"
              class="text-muted"
              aria-label="Colapsar menú"
              @click="miniState = true"
            />
          </div>

          <q-separator class="q-mb-md" />

          <!-- Botón de acción rápida dentro del sidebar -->
          <div v-if="!miniState" class="q-px-md q-mb-md">
            <AppActionButton
              icon="add_circle"
              label="Registrar movimiento"
              class="full-width"
              @click="financeStore.quickTransactionDialogOpen = true"
            />
          </div>

          <!-- Menú de navegación -->
          <q-list class="q-px-sm">
            <q-item
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              clickable
              v-ripple
              exact
              active-class="nav-item-active"
              class="nav-item"
            >
              <q-item-section avatar style="min-width: 38px">
                <q-icon :name="item.icon" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
              </q-item-section>
              <q-tooltip v-if="miniState" anchor="center right" self="center left">
                {{ item.label }}
              </q-tooltip>
            </q-item>
          </q-list>
        </div>

        <!-- Pie de sidebar con perfil de usuario -->
        <div class="q-pa-sm">
          <div v-if="miniState" class="row justify-center q-mb-sm">
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="chevron_right"
              class="text-muted"
              @click="miniState = false"
            >
              <q-tooltip anchor="center right" self="center left">Expandir barra</q-tooltip>
            </q-btn>
          </div>

          <q-separator class="q-mb-sm" />

          <q-item class="rounded-borders surface-subtle q-pa-sm">
            <q-item-section avatar style="min-width: 40px">
              <q-avatar color="primary" text-color="white" size="34px" class="text-weight-bold">
                {{ userInitial }}
              </q-avatar>
            </q-item-section>
            <q-item-section v-if="!miniState">
              <q-item-label class="text-weight-bold text-body2 ellipsis">
                {{ authStore.profile?.full_name || 'Mi Cuenta' }}
              </q-item-label>
              <q-item-label caption class="ellipsis text-muted" style="font-size: 0.72rem">
                {{ authStore.user?.email }}
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="!miniState">
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="logout"
                color="negative"
                aria-label="Cerrar sesión"
                @click="handleLogout"
              >
                <q-tooltip>Cerrar sesión</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-drawer>

    <!-- CONTENIDO PRINCIPAL -->
    <q-page-container>
      <router-view />

      <!-- FAB móvil para registro rápido en 3 toques (elevado sobre footer para no tapar navegación ni contenido) -->
      <q-page-sticky position="bottom-right" :offset="[16, 72]" class="lt-sm">
        <q-btn
          fab
          icon="add"
          color="primary"
          class="shadow-4"
          aria-label="Nuevo movimiento rápido"
          @click="financeStore.quickTransactionDialogOpen = true"
        />
      </q-page-sticky>

      <!-- FAB para tablet vertical -->
      <q-page-sticky position="bottom-right" :offset="[20, 24]" class="gt-xs lt-md">
        <q-btn
          fab
          icon="add"
          color="primary"
          class="shadow-4"
          aria-label="Nuevo movimiento rápido"
          @click="financeStore.quickTransactionDialogOpen = true"
        />
      </q-page-sticky>
    </q-page-container>

    <!-- NAVEGACIÓN INFERIOR EN MÓVILES -->
    <q-footer class="lt-sm app-footer">
      <q-tabs
        dense
        no-caps
        active-color="primary"
        indicator-color="primary"
        class="text-muted"
        align="justify"
      >
        <q-route-tab to="/" exact icon="space_dashboard" label="Inicio" />
        <q-route-tab to="/movimientos" icon="receipt_long" label="Movimientos" />
        <q-route-tab to="/presupuestos" icon="pie_chart" label="Presupuesto" />
        <q-route-tab to="/ahorros" icon="savings" label="Ahorros" />
        <q-route-tab to="/reportes" icon="insights" label="Reportes" />
      </q-tabs>
    </q-footer>

    <!-- Modal Global de Nuevo Movimiento -->
    <QuickTransactionDialog v-model="financeStore.quickTransactionDialogOpen" />
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'
import { formatCLP } from '@/utils/format'
import PeriodSelector from '@/components/common/PeriodSelector.vue'
import AppActionButton from '@/components/common/AppActionButton.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import QuickTransactionDialog from '@/components/finance/QuickTransactionDialog.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const financeStore = useFinanceStore()

const leftDrawerOpen = ref(true)
const miniState = ref(false)

const navItems = [
  { label: 'Dashboard', icon: 'space_dashboard', to: '/' },
  { label: 'Movimientos', icon: 'receipt_long', to: '/movimientos' },
  { label: 'Categorías y Cuentas', icon: 'account_balance', to: '/categorias' },
  { label: 'Presupuestos', icon: 'pie_chart', to: '/presupuestos' },
  { label: 'Ahorros', icon: 'savings', to: '/ahorros' },
  { label: 'Reportes', icon: 'insights', to: '/reportes' },
  { label: 'Configuración', icon: 'tune', to: '/configuracion' }
]

const currentPageTitle = computed(() => {
  const match = navItems.find((item) => item.to === route.path)
  return match?.label ?? 'Mi Presupuesto'
})

const userInitial = computed(() => {
  const name = authStore.profile?.full_name || authStore.user?.email || 'U'
  return name.charAt(0).toUpperCase()
})

function toggleDarkMode() {
  const next = !$q.dark.isActive
  $q.dark.set(next)
  const themePref = next ? 'dark' : 'light'
  localStorage.setItem('mi_presupuesto_theme', themePref)
  if (authStore.isAuthenticated) {
    authStore.updateProfileSettings({ theme_preference: themePref })
  }
}

async function handleLogout() {
  await authStore.signOut()
  await router.push('/login')
}

onMounted(async () => {
  await financeStore.fetchAllData()
})
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}

.shrink-0 {
  flex-shrink: 0;
}

.header-desktop-toolbar {
  min-height: 68px;
}

.header-mobile-row-1 {
  min-height: 50px;
  padding-top: 6px;
  padding-bottom: 4px;
}

.header-mobile-row-2 {
  width: 100%;
  box-sizing: border-box;
}

.brand-badge-sm {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-touch-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.connection-strip {
  background-color: rgba(245, 158, 11, 0.08);
  border-top: 1px solid rgba(245, 158, 11, 0.18);
  color: var(--text-secondary);
  box-sizing: border-box;
  width: 100%;
}
</style>
