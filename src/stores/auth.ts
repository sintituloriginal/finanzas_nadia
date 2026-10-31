import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Dark } from 'quasar'
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import { DEMO_USER_ID, createInitialSeedData } from '@/services/seedData'
import type { Profile, ThemePreference } from '@/types/finance'

const LOCAL_SESSION_KEY = 'mi_presupuesto_local_session_v1'
const LOCAL_PROFILE_KEY = 'mi_presupuesto_local_profile_v1'

export interface AuthUser {
  id: string
  email: string
}

function translateAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) {
    return 'Correo electrónico o contraseña incorrectos. Verifica tus credenciales.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Tu correo electrónico aún no ha sido confirmado en Supabase.'
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Demasiados intentos de inicio de sesión. Espera unos minutos antes de reintentar.'
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Error de conexión de red al contactar con el servidor de autenticación.'
  }
  return `Error de autenticación: ${message}`
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref<boolean>(true)
  const initialized = ref<boolean>(false)
  const authError = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(user.value))
  const isCloudMode = computed(() => isSupabaseConfigured)

  function applyTheme(pref: ThemePreference) {
    if (pref === 'dark') {
      Dark.set(true)
    } else if (pref === 'light') {
      Dark.set(false)
    } else {
      Dark.set('auto')
    }
  }

  async function loadProfile(userId: string) {
    if (isSupabaseConfigured && supabase) {
      // Asegurar semillas iniciales en Supabase de manera idempotente
      await supabase.rpc('seed_user_defaults', { p_user_id: userId } as never)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (data) {
        const typedProfile = data as unknown as Profile
        profile.value = typedProfile
        applyTheme(typedProfile.theme_preference)
        return
      }
    }

    // Modo local persistente
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Profile
        profile.value = parsed
        applyTheme(parsed.theme_preference)
        return
      } catch {
        // continuar con seed
      }
    }
    const seed = createInitialSeedData(userId).profile
    profile.value = seed
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(seed))
    applyTheme(seed.theme_preference)
  }

  async function initAuth() {
    if (initialized.value) return
    loading.value = true
    authError.value = null

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          authError.value = translateAuthError(error.message)
        } else if (data.session?.user) {
          user.value = {
            id: data.session.user.id,
            email: data.session.user.email ?? 'usuario@mipresupuesto.cl'
          }
          await loadProfile(data.session.user.id)
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            user.value = {
              id: session.user.id,
              email: session.user.email ?? 'usuario@mipresupuesto.cl'
            }
            await loadProfile(session.user.id)
          } else {
            user.value = null
            profile.value = null
          }
        })
      } else {
        const saved = localStorage.getItem(LOCAL_SESSION_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as AuthUser
          user.value = parsed
          await loadProfile(parsed.id)
        }
      }
    } finally {
      initialized.value = true
      loading.value = false
    }
  }

  async function signInWithPassword(email: string, password: string): Promise<boolean> {
    authError.value = null
    loading.value = true
    const cleanEmail = email.trim().toLowerCase()

    try {
      if (!cleanEmail || !cleanEmail.includes('@')) {
        authError.value = 'Ingresa un correo electrónico válido.'
        return false
      }
      if (!password || password.length < 6) {
        authError.value = 'La contraseña debe tener al menos 6 caracteres.'
        return false
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        })
        if (error || !data.user) {
          authError.value = translateAuthError(error?.message ?? 'No se pudo iniciar sesión')
          return false
        }
        user.value = {
          id: data.user.id,
          email: data.user.email ?? cleanEmail
        }
        await loadProfile(data.user.id)
        return true
      }

      // Modo local de evaluación cuando aún no se configura .env con Supabase
      const localUser: AuthUser = {
        id: DEMO_USER_ID,
        email: cleanEmail
      }
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser))
      user.value = localUser
      await loadProfile(localUser.id)
      return true
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut()
      }
      localStorage.removeItem(LOCAL_SESSION_KEY)
      user.value = null
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  async function updateProfileSettings(updates: {
    full_name?: string
    theme_preference?: ThemePreference
    default_account_id?: string | null
  }) {
    if (!user.value || !profile.value) return
    const nextProfile: Profile = {
      ...profile.value,
      ...updates,
      updated_at: new Date().toISOString()
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: nextProfile.full_name,
          theme_preference: nextProfile.theme_preference,
          default_account_id: nextProfile.default_account_id
        } as never)
        .eq('id', user.value.id)

      if (error) throw new Error(`No se pudo actualizar el perfil: ${error.message}`)
    } else {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(nextProfile))
    }

    profile.value = nextProfile
    if (updates.theme_preference) {
      applyTheme(updates.theme_preference)
    }
  }

  return {
    user,
    profile,
    loading,
    initialized,
    authError,
    isAuthenticated,
    isCloudMode,
    initAuth,
    signInWithPassword,
    signOut,
    updateProfileSettings
  }
})

