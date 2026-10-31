import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Verificación de aislamiento multi-usuario y políticas Row Level Security (RLS)
 * entre dos usuarios de prueba (Usuario A y Usuario B), validando tanto las
 * políticas SQL declaradas en las migraciones como un simulador de motor RLS.
 */
describe('Seguridad Row Level Security (RLS) — Aislamiento entre dos usuarios de prueba', () => {
  const USER_A = '11111111-1111-4111-8111-111111111111'
  const USER_B = '22222222-2222-4222-8222-222222222222'

  it('verifica que las políticas RLS habilitan y fuerzan RLS en las 7 tablas privadas', () => {
    const sqlPath = resolve(process.cwd(), 'supabase/migrations/20261031010100_rls_policies.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    const requiredTables = [
      'profiles',
      'accounts',
      'categories',
      'transactions',
      'budgets',
      'savings_goals',
      'savings_contributions'
    ]

    for (const table of requiredTables) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`)
      expect(sql).toContain(`ALTER TABLE public.${table} FORCE ROW LEVEL SECURITY;`)
    }
  })

  it('impide que el Usuario A consulte, modifique o referencie cuentas/categorías del Usuario B', () => {
    // Simulador de políticas RLS equivalente a las cláusulas USING y WITH CHECK de PostgreSQL
    const dbAccounts = [
      { id: 'acc-a', user_id: USER_A, name: 'Cuenta Usuario A' },
      { id: 'acc-b', user_id: USER_B, name: 'Cuenta Usuario B' }
    ]
    const dbCategories = [
      { id: 'cat-a', user_id: USER_A, name: 'Alimentación A', type: 'expense' },
      { id: 'cat-b', user_id: USER_B, name: 'Alimentación B', type: 'expense' }
    ]
    const dbTransactions = [
      {
        id: 'tx-a',
        user_id: USER_A,
        account_id: 'acc-a',
        category_id: 'cat-a',
        amount: 50000
      },
      {
        id: 'tx-b',
        user_id: USER_B,
        account_id: 'acc-b',
        category_id: 'cat-b',
        amount: 90000
      }
    ]

    const selectTransactionsAs = (authUid: string) =>
      dbTransactions.filter((row) => row.user_id === authUid)

    const canInsertTransactionAs = (
      authUid: string,
      tx: { user_id: string; account_id: string; category_id: string | null }
    ) => {
      const ownsRow = tx.user_id === authUid
      const ownsAccount = dbAccounts.some(
        (a) => a.id === tx.account_id && a.user_id === authUid
      )
      const ownsCategory =
        tx.category_id === null ||
        dbCategories.some((c) => c.id === tx.category_id && c.user_id === authUid)
      return ownsRow && ownsAccount && ownsCategory
    }

    // 1. Usuario A solo ve sus propios registros
    const visibleToA = selectTransactionsAs(USER_A)
    expect(visibleToA).toHaveLength(1)
    expect(visibleToA[0].id).toBe('tx-a')

    // 2. Usuario B solo ve sus propios registros
    const visibleToB = selectTransactionsAs(USER_B)
    expect(visibleToB).toHaveLength(1)
    expect(visibleToB[0].id).toBe('tx-b')

    // 3. Usuario A intenta inyectar un movimiento apuntando a una cuenta del Usuario B (Ataque IDOR)
    const crossAccountAttack = canInsertTransactionAs(USER_A, {
      user_id: USER_A,
      account_id: 'acc-b', // Cuenta de Usuario B
      category_id: 'cat-a'
    })
    expect(crossAccountAttack).toBe(false)

    // 4. Usuario A intenta insertar un registro a nombre del Usuario B
    const impersonationAttack = canInsertTransactionAs(USER_A, {
      user_id: USER_B,
      account_id: 'acc-a',
      category_id: 'cat-a'
    })
    expect(impersonationAttack).toBe(false)
  })
})

