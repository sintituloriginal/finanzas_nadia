<template>
  <span class="status-pill" :class="`status-pill--${tone}`">
    <q-icon v-if="icon" :name="icon" size="13px" class="q-mr-xs" />
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
    icon?: string
  }>(),
  {
    tone: 'neutral'
  }
)
</script>

<style scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.73rem;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
}

.status-pill--success {
  background-color: rgba(16, 185, 129, 0.14);
  color: #059669;
}

body.body--dark .status-pill--success {
  color: #34d399;
}

.status-pill--warning {
  background-color: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

body.body--dark .status-pill--warning {
  color: #fbbf24;
}

.status-pill--danger {
  background-color: rgba(239, 68, 68, 0.14);
  color: #dc2626;
}

body.body--dark .status-pill--danger {
  color: #f87171;
}

.status-pill--info {
  background-color: rgba(59, 130, 246, 0.14);
  color: #2563eb;
}

body.body--dark .status-pill--info {
  color: #60a5fa;
}

.status-pill--neutral {
  background-color: rgba(100, 116, 139, 0.14);
  color: #475569;
}

body.body--dark .status-pill--neutral {
  color: #cbd5e1;
}
</style>

