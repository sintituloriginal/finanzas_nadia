<template>
  <div v-if="!authStore.initialized" class="fullscreen column items-center justify-center">
    <q-spinner-dots color="primary" size="48px" />
    <div class="text-subtitle2 text-grey-7 q-mt-md">
      Verificando sesión segura...
    </div>
  </div>
  <router-view v-else />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

