# Mi Presupuesto — Aplicación Web Full-Stack de Finanzas Personales (CLP)

Aplicación web moderna de finanzas personales desarrollada con **Vue 3 (Composition API)**, **Quasar Framework 2**, **TypeScript estricto**, **Pinia**, **Vue Router**, **Apache ECharts** y **Supabase PostgreSQL con Row Level Security (RLS)**.

Diseñada específicamente para **Chile**:
- **Moneda predeterminada:** Peso Chileno (`CLP` — enteros sin decimales, formateados con `Intl.NumberFormat('es-CL')`).
- **Zona horaria:** `America/Santiago`.
- **Formato de fechas:** `DD/MM/YYYY`.

---

## 1. Arquitectura y Estructura del Proyecto

```text
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql       # Tablas normalizadas, NUMERIC(15,0), FKs compuestas (id, user_id)
│   │   ├── 002_rls_policies.sql         # Políticas Row Level Security estrictas por usuario
│   │   └── 003_functions_and_triggers.sql # Semillas automáticas por usuario y RPCs atómicas
│   └── seed.sql                         # Inicialización idempotente para usuarios existentes
├── src/
│   ├── components/
│   │   ├── common/PeriodSelector.vue    # Selector reactivo de mes y año persistido en sesión
│   │   └── finance/QuickTransactionDialog.vue # Modal rápido de 3 pasos (Monto -> Categoría -> Guardar)
│   ├── layouts/MainLayout.vue           # Sidebar colapsable en escritorio + barra inferior móvil
│   ├── modules/
│   │   ├── auth/LoginPage.vue           # Autenticación Supabase Auth + restauración de sesión
│   │   ├── dashboard/DashboardPage.vue  # 8 KPIs, alertas de presupuesto, ECharts y últimos movimientos
│   │   ├── transactions/TransactionsPage.vue # CRUD completo, filtros, búsqueda, duplicación y resumen
│   │   ├── categories/CategoriesPage.vue # Cuentas financieras + Categorías con reasignación segura
│   │   ├── budgets/BudgetsPage.vue      # Presupuestos mensuales con semáforo y copia al mes siguiente
│   │   ├── savings/SavingsPage.vue      # Metas de ahorro, aportes/retiros y proyección de término
│   │   ├── reports/ReportsPage.vue      # Estadísticas anuales y exportación CSV UTF-8 BOM (Excel Chile)
│   │   └── settings/SettingsPage.vue    # Tema claro/oscuro/sistema, cuenta por defecto y sesión
│   ├── router/index.ts                  # Rutas privadas con guards de sesión
│   ├── services/
│   │   ├── supabase.ts                  # Cliente tipado @supabase/supabase-js
│   │   └── seedData.ts                  # Datos semilla locales cuando aún no se configura .env
│   ├── stores/
│   │   ├── auth.ts                      # Store de sesión y perfil
│   │   └── finance.ts                   # Store financiero con soporte dual (Supabase Cloud / Local)
│   ├── types/
│   │   ├── finance.ts                   # Modelos de dominio
│   │   └── database.ts                  # Tipos de tablas y RPCs de Supabase
│   └── utils/
│       ├── finance.ts                   # Motor contable puro libre de doble conteo
│       └── format.ts                    # Formateadores CLP y fechas America/Santiago
├── tests/
│   ├── finance.spec.ts                  # Suite unitaria Vitest de reglas financieras
│   └── rls-policies.spec.ts             # Verificación de políticas RLS multi-usuario
├── vercel.json                          # Rewrites SPA y cabeceras de seguridad para Vercel
└── .env.example                         # Plantilla de variables de entorno
```

---

## 2. Reglas Financieras y Contables Implementadas

1. **Ingresos del período:** Suma exclusiva de movimientos con `type = 'income'` y `status = 'confirmed'`.
2. **Egresos del período:** Suma exclusiva de movimientos con `type = 'expense'` y `status = 'confirmed'`.
3. **Balance neto del período:** $\text{Ingresos Confirmados} - \text{Egresos Confirmados}$.
4. **Transferencias entre cuentas (`type = 'transfer'`):**
   - Descuentan saldo de la cuenta de origen (`account_id`) e incrementan el saldo de la cuenta de destino (`destination_account_id`).
   - **Nunca** se suman como ingresos ni como gastos del período.
5. **Aportes y retiros de ahorro (`savings_contributions`):**
   - Los ahorros son reservas patrimoniales y **no se cuentan como gasto**.
   - Permiten generar opcionalmente la transferencia interna hacia la cuenta de ahorro vinculada mediante la función transaccional `record_savings_contribution`.
6. **Saldo de cuenta financiera:**
   $$\text{Saldo Actual} = \text{Saldo Inicial} + \text{Ingresos Confirmados} + \text{Transferencias Recibidas} - \text{Egresos Confirmados} - \text{Transferencias Enviadas}$$

---

## 3. Configuración de Supabase Paso a Paso

1. Crea un nuevo proyecto en [Supabase](https://supabase.com).
2. En el panel lateral de Supabase, abre **SQL Editor** y ejecuta en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions_and_triggers.sql`
3. Ve a **Authentication → Providers → Email** y deshabilita **Allow new users to sign up** si deseas mantener el registro público cerrado.
4. Ve a **Authentication → Users → Add user → Create new user** y crea tu usuario con tu correo y contraseña.
   - El trigger `on_auth_user_created` creará automáticamente tu perfil, tus 4 cuentas iniciales y las 21 categorías iniciales (16 de egresos y 5 de ingresos).
   - Si creaste el usuario antes de correr los triggers, ejecuta `supabase/seed.sql` en el SQL Editor.
5. Copia la **Project URL** y la **anon / publishable key** desde **Project Settings → API**.

---

## 4. Desarrollo Local

1. Copia el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en `.env`.
   *(Si aún no configuras `.env`, la aplicación mostrará un aviso transparente en la parte superior y funcionará con persistencia local en el navegador para que puedas probar todos los módulos de inmediato).*
3. Instala las dependencias y ejecuta los comandos:
   ```bash
   npm install
   npm run dev        # Servidor de desarrollo
   npm run typecheck  # Verificación estricta de tipos TypeScript
   npm run test       # Suite de pruebas unitarias con Vitest
   npm run build      # Compilación de producción en dist/
   ```

---

## 5. Despliegue en GitHub y Vercel

1. Inicializa el repositorio y súbelo a GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial full-stack implementation of Mi Presupuesto"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/mi-presupuesto.git
   git push -u origin main
   ```
2. Ingresa a [Vercel](https://vercel.com) → **Add New Project** → importa tu repositorio `mi-presupuesto`.
3. En **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Haz clic en **Deploy**. El archivo `vercel.json` ya incluye la regla de reescritura SPA (`/(.*) -> /index.html`) para que Vue Router funcione al recargar cualquier ruta.