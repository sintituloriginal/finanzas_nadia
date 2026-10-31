const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0
})

const numberFormatter = new Intl.NumberFormat('es-CL', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0
})

/**
 * Formatea un número entero en Pesos Chilenos (CLP) según es-CL.
 * Ejemplo: 250000 -> "$250.000"
 */
export function formatCLP(amount: number | null | undefined): string {
  const safe = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0
  return clpFormatter.format(safe)
}

export function formatInteger(amount: number | null | undefined): string {
  const safe = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0
  return numberFormatter.format(safe)
}

export function formatPercentage(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '0%'
  }
  return `${value.toFixed(decimals).replace('.', ',')}%`
}

/**
 * Convierte una fecha ISO local 'YYYY-MM-DD' al formato chileno 'DD/MM/YYYY'
 * sin usar Date UTC implícito para evitar desfases por zona horaria America/Santiago.
 */
export function formatDateCL(isoDate: string | null | undefined): string {
  if (!isoDate) return '-'
  const clean = isoDate.slice(0, 10)
  const parts = clean.split('-')
  if (parts.length !== 3) return isoDate
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

/**
 * Retorna la fecha actual en zona America/Santiago como 'YYYY-MM-DD'.
 */
export function getTodayISO(timeZone = 'America/Santiago'): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return formatter.format(new Date())
}

/**
 * Extrae año y mes numéricos desde un string 'YYYY-MM-DD' sin conversión de huso horario.
 */
export function parseYearMonth(isoDate: string): { year: number; month: number; day: number } {
  const clean = isoDate.slice(0, 10)
  const [y, m, d] = clean.split('-').map(Number)
  return {
    year: y || 1970,
    month: m || 1,
    day: d || 1
  }
}

export const MONTHS_ES = [
  { value: 1, label: 'Enero', short: 'Ene' },
  { value: 2, label: 'Febrero', short: 'Feb' },
  { value: 3, label: 'Marzo', short: 'Mar' },
  { value: 4, label: 'Abril', short: 'Abr' },
  { value: 5, label: 'Mayo', short: 'May' },
  { value: 6, label: 'Junio', short: 'Jun' },
  { value: 7, label: 'Julio', short: 'Jul' },
  { value: 8, label: 'Agosto', short: 'Ago' },
  { value: 9, label: 'Septiembre', short: 'Sep' },
  { value: 10, label: 'Octubre', short: 'Oct' },
  { value: 11, label: 'Noviembre', short: 'Nov' },
  { value: 12, label: 'Diciembre', short: 'Dic' }
] as const

export function getMonthName(month: number): string {
  if (month === 0) return 'Todo el año'
  return MONTHS_ES.find((m) => m.value === month)?.label ?? ''
}

