import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/modules/dashboard/DashboardPage.vue')
      },
      {
        path: 'movimientos',
        name: 'transactions',
        component: () => import('@/modules/transactions/TransactionsPage.vue')
      },
      {
        path: 'categorias',
        name: 'categories',
        component: () => import('@/modules/categories/CategoriesPage.vue')
      },
      {
        path: 'presupuestos',
        name: 'budgets',
        component: () => import('@/modules/budgets/BudgetsPage.vue')
      },
      {
        path: 'ahorros',
        name: 'savings',
        component: () => import('@/modules/savings/SavingsPage.vue')
      },
      {
        path: 'reportes',
        name: 'reports',
        component: () => import('@/modules/reports/ReportsPage.vue')
      },
      {
        path: 'configuracion',
        name: 'settings',
        component: () => import('@/modules/settings/SettingsPage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.initialized) {
    await authStore.initAuth()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false)

  if (requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined
    }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router

