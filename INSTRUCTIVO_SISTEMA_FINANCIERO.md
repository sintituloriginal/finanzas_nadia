# SISTEMA INTELIGENTE DE FINANZAS PERSONALES EN EXCEL
## Arquitectura de Software Financiero — Guía Operativa y Técnica

---

### 1. ESTRUCTURA Y ARCHIVOS ENTREGADOS

En el directorio del proyecto se encuentran generados los siguientes artefactos:
1. [Finanzas_Personales_Inteligente.xlsx](file:///c:/Users/sinti/OneDrive/Documentos/Carpeta%20personal/Excel%20presupuesto/Finanzas_Personales_Inteligente.xlsx): Plantilla de producción limpia, lista para usar con tus datos reales.
2. [Finanzas_Personales_Demo.xlsx](file:///c:/Users/sinti/OneDrive/Documentos/Carpeta%20personal/Excel%20presupuesto/Finanzas_Personales_Demo.xlsx): Versión de demostración con 30 movimientos reales en CLP, presupuestos ejecutados, conciliación de tarjetas y los 6 gráficos del Dashboard funcionando a plena capacidad.
3. [generate_finance_system.py](file:///c:/Users/sinti/OneDrive/Documentos/Carpeta%20personal/Excel%20presupuesto/generate_finance_system.py): Código fuente automatizado de generación en Python con `xlsxwriter`.
4. [run_quality_assurance.py](file:///c:/Users/sinti/OneDrive/Documentos/Carpeta%20personal/Excel%20presupuesto/run_quality_assurance.py): Suite de pruebas de aseguramiento de la calidad (QA).

---

### 2. MAPA DE HOJAS DEL SISTEMA

| Hoja | Función Principal |
| :--- | :--- |
| **`Dashboard`** | Panel de control ejecutivo. Contiene 14 KPIs dinámicos, diagnóstico de reglas y 6 gráficos interactivos. |
| **`Movimientos`** | **Única fuente de verdad (Single Source of Truth).** Registro de ingresos, gastos, transferencias y ajustes. |
| **`Presupuesto`** | Control mensual por categoría, cálculo de desvíos, % consumido y alertas tipo semáforo. |
| **`Cuentas`** | Conciliación de saldos líquidos (cuentas corrientes, vista, ahorro, efectivo) y pasivos (tarjetas de crédito). |
| **`Gastos Fijos`** | Catálogo de suscripciones y compromisos recurrentes con indicador de pago del mes activo. |
| **`Metas`** | Objetivos de ahorro (Fondo de emergencia, vacaciones, etc.) con cálculo de ahorro mensual requerido. |
| **`Deudas`** | Préstamos y créditos en cuotas con amortización de capital e interés. |
| **`Ingresos`** | Clasificación fija vs variable y análisis comparativo intermensual. |
| **`Proyecciones`** | Estimación de flujo de caja y cierre a 3, 6 y 12 meses bajo escenarios Base, Conservador y Optimista. |
| **`Configuración`** | Catálogo maestro de categorías, cuentas, mes/año de consulta y umbrales de alerta. |

---

### 3. CAMPOS MANUALES VS CÁLCULOS AUTOMÁTICOS

#### ¿Qué completas manualmente?
1. **En `Configuración`:**
   - Mes y Año activo que deseas consultar en el Dashboard.
   - Umbrales de alerta y porcentajes de metas (si deseas personalizarlos).
2. **En `Cuentas`:**
   - La columna `Saldo Inicial` de tus cuentas bancarias y efectivo (sólo una vez al comenzar).
3. **En `Presupuesto`:**
   - La columna `Presupuesto Asignado` para cada categoría de gasto.
4. **En `Movimientos` (Tu registro diario):**
   - `Fecha Operación`, `Tipo` (desplegable), `Categoría` (desplegable), `Subcategoría`, `Descripción`, `Monto (CLP)`, `Cuenta Origen`, `Cuenta Destino` (si es transferencia), `Medio de Pago`, `Frecuencia` y `Estado` (`Pagado`, `Pendiente`, `Programado`).

#### ¿Qué se calcula de forma 100% automática?
- **En `Movimientos`:** `Mes` (`=MONTH`), `Año` (`=YEAR`) y la columna `Alerta Duplicado` (detecta si coinciden fecha, monto, descripción y cuenta).
- **En `Dashboard`:** Todos los 14 indicadores, KPIs, alertas de diagnóstico y los 6 gráficos.
- **En `Presupuesto`:** `Gasto Real Pagado`, `Gasto Comprometido`, `Total Ejecutado`, `Saldo Restante`, `% Consumo`, `Desviación CLP` y `Estado de Cumplimiento`.
- **En `Cuentas`:** `Saldo Actual Calculado` considerando ingresos, gastos y transferencias netas.
- **En `Gastos Fijos`:** Detección de si el compromiso ya fue pagado en el mes activo (`¿Pagado este Mes?`).
- **En `Metas`:** Acumulado real aportado, % avance, monto pendiente y ahorro mensual requerido.
- **En `Deudas`:** Cuotas pendientes y saldo capital insoluto.
- **En `Proyecciones`:** Flujos netos acumulados y semáforo de riesgo de déficit.

---

### 4. REGLAS CONTABLES CLAVE

1. **Transferencias Internas:** Cuando mueves dinero entre cuentas (ej. de Cuenta Corriente a Cuenta de Ahorro), se registra como `Tipo = "Transferencia"`. La cuenta de origen disminuye y la de destino aumenta, **sin alterar los ingresos netos ni inflar los gastos de consumo**.
2. **Tarjetas de Crédito:**
   - Al comprar: Regístralo como `Tipo = "Gasto"` con `Cuenta Origen = "Tarjeta de Crédito"`. Esto computa el gasto en el presupuesto del mes.
   - Al pagar la facturación a fin de mes: Regístralo como `Tipo = "Transferencia"` desde `Cuenta Corriente` hacia `Tarjeta de Crédito`. De esta forma, disminuye el dinero del banco y se libera el cupo de la tarjeta **sin duplicar el gasto**.
3. **Gastos Pendientes / Programados:** Un gasto con estado `Pendiente` o `Programado` no se computa en el gasto pagado ni descuenta saldo en cuentas hasta que cambies su estado a `Pagado`.
