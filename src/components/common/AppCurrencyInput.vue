<template>
  <q-input
    ref="qInputRef"
    :model-value="displayValue"
    type="text"
    inputmode="numeric"
    :outlined="outlined"
    :dense="dense"
    :label="label"
    :prefix="prefix"
    :hint="hint"
    :rules="computedRules"
    :disable="disable"
    :readonly="readonly"
    :autofocus="autofocus"
    :input-class="['font-mono', inputClass]"
    class="app-currency-input"
    @update:model-value="handleValueUpdate"
    @keydown="handleKeyDown"
    @blur="handleBlur"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { QInput } from 'quasar'
import { formatCLPInput, parseCLPInput } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    modelValue: number | null | undefined
    label?: string
    prefix?: string
    hint?: string
    outlined?: boolean
    dense?: boolean
    rules?: Array<(val: any) => boolean | string | Promise<boolean | string>>
    disable?: boolean
    readonly?: boolean
    autofocus?: boolean
    inputClass?: string
    maxDigits?: number
  }>(),
  {
    prefix: '$',
    outlined: true,
    dense: true,
    maxDigits: 12
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: number | null): void
  (e: 'change', val: number | null): void
}>()

const qInputRef = ref<InstanceType<typeof QInput> | null>(null)
const displayValue = ref<string>(formatCLPInput(props.modelValue))

watch(
  () => props.modelValue,
  (newVal) => {
    const currentNumeric = parseCLPInput(displayValue.value)
    if (newVal !== currentNumeric) {
      displayValue.value = formatCLPInput(newVal)
    }
  },
  { immediate: true }
)

/**
 * Los rules de Quasar reciben el valor del input (displayValue).
 * computedRules adapta cada regla para que evalúe el valor numérico entero real (number | null),
 * evitando conversiones erróneas con Number() sobre cadenas con separadores de miles ("150.000").
 */
const computedRules = computed(() => {
  if (!props.rules || props.rules.length === 0) return undefined
  return props.rules.map((rule) => {
    return (rawDisplayVal: any) => {
      const numericVal = typeof rawDisplayVal === 'number'
        ? rawDisplayVal
        : parseCLPInput(rawDisplayVal)
      return rule(numericVal)
    }
  })
})

function getNativeInput(): HTMLInputElement | null {
  if (!qInputRef.value) return null
  if (qInputRef.value.nativeEl) {
    return qInputRef.value.nativeEl as HTMLInputElement
  }
  if (typeof qInputRef.value.getNativeElement === 'function') {
    return qInputRef.value.getNativeElement() as HTMLInputElement
  }
  const el = qInputRef.value.$el as HTMLElement | undefined
  return el?.querySelector('input') ?? null
}

function handleValueUpdate(val: string | number | null) {
  const rawText = String(val ?? '')
  const inputEl = getNativeInput()
  const cursorPos = inputEl?.selectionStart ?? rawText.length
  const digitsBeforeCursor = rawText.slice(0, cursorPos).replace(/\D/g, '').length

  const numericVal = parseCLPInput(rawText)

  if (numericVal === null) {
    displayValue.value = ''
    emit('update:modelValue', null)
    emit('change', null)
    return
  }

  const formatted = formatCLPInput(numericVal)
  displayValue.value = formatted
  emit('update:modelValue', numericVal)
  emit('change', numericVal)

  nextTick(() => {
    const native = getNativeInput()
    if (!native) return

    let targetPos = 0
    let seenDigits = 0
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        seenDigits++
      }
      if (seenDigits === digitsBeforeCursor) {
        targetPos = i + 1
        break
      }
    }
    if (seenDigits < digitsBeforeCursor) {
      targetPos = formatted.length
    }
    native.setSelectionRange(targetPos, targetPos)
  })
}

function handleKeyDown(event: KeyboardEvent) {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Tab',
    'Home',
    'End',
    'Enter',
    'Escape'
  ]
  if (allowedKeys.includes(event.key)) return
  if (event.ctrlKey || event.metaKey || event.altKey) return

  // Rechazar caracteres no numéricos
  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
    return
  }

  // Limitar longitud máxima de dígitos
  const currentDigits = displayValue.value.replace(/\D/g, '')
  if (currentDigits.length >= props.maxDigits && window.getSelection()?.toString() === '') {
    event.preventDefault()
  }
}

function handleBlur() {
  emit('change', parseCLPInput(displayValue.value))
}

defineExpose({
  focus: () => getNativeInput()?.focus(),
  blur: () => getNativeInput()?.blur(),
  validate: (val?: any) => {
    if (val !== undefined) {
      const display = typeof val === 'number' ? formatCLPInput(val) : val
      return qInputRef.value?.validate(display)
    }
    return qInputRef.value?.validate()
  }
})
</script>

<style scoped>
.app-currency-input :deep(.q-field__control) {
  height: var(--control-height, 42px);
  min-height: var(--control-height, 42px);
  border-radius: var(--field-radius, 10px);
}

.app-currency-input :deep(.q-field__marginal) {
  height: var(--control-height, 42px);
  font-size: 0.92rem;
}

.app-currency-input :deep(.q-field__native) {
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
</style>

