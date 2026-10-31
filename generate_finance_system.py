# -*- coding: utf-8 -*-
"""
Generator script for Finanzas_Personales_Inteligente.xlsx and Finanzas_Personales_Demo.xlsx
Engineered with xlsxwriter for high-performance, native Excel 365 compatibility,
rich fintech aesthetics, automated formulas, charts, and accounting integrity.
"""

import sys
import os
import xlsxwriter

def build_workbook(filename, is_demo=False):
    print(f"Generating {'DEMO' if is_demo else 'PRODUCTION TEMPLATE'}: {filename}...")
    wb = xlsxwriter.Workbook(
        filename,
        {
            'strings_to_numbers': True,
            'strings_to_formulas': True,
            'default_date_format': 'yyyy-mm-dd'
        }
    )

    # -------------------------------------------------------------
    # COLOR PALETTE (Modern Fintech Navy & Emerald)
    # -------------------------------------------------------------
    NAVY_DARK = "#0F172A"       # Slate 900
    NAVY_PRIMARY = "#1E293B"    # Slate 800
    NAVY_ACCENT = "#2563EB"     # Royal Blue
    BLUE_LIGHT = "#EFF6FF"      # Blue 50
    TEXT_DARK = "#0F172A"       # Main Text
    TEXT_MUTED = "#64748B"      # Slate 500
    BG_CARD = "#FFFFFF"         # Card background
    BG_HEADER = "#1E293B"       # Table header
    BORDER_COLOR = "#E2E8F0"    # Slate 200

    GREEN_DARK = "#065F46"      # Emerald 800
    GREEN_LIGHT = "#ECFDF5"     # Emerald 50
    GREEN_ACCENT = "#10B981"    # Emerald 500

    AMBER_DARK = "#92400E"      # Amber 800
    AMBER_LIGHT = "#FFFBEB"     # Amber 50
    AMBER_ACCENT = "#F59E0B"    # Amber 500

    RED_DARK = "#991B1B"        # Rose 800
    RED_LIGHT = "#FEF2F2"       # Rose 50
    RED_ACCENT = "#EF4444"      # Rose 500

    # -------------------------------------------------------------
    # FORMAT DEFINITIONS
    # -------------------------------------------------------------
    fmt_title = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 18,
        'bold': True,
        'font_color': NAVY_DARK,
        'valign': 'vcenter'
    })

    fmt_subtitle = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 10,
        'font_color': TEXT_MUTED,
        'valign': 'vcenter'
    })

    fmt_section = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 13,
        'bold': True,
        'font_color': NAVY_PRIMARY,
        'valign': 'vcenter'
    })

    # KPI Card Formats
    fmt_kpi_title = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 9,
        'bold': True,
        'font_color': TEXT_MUTED,
        'bg_color': '#F8FAFC',
        'align': 'center',
        'valign': 'vcenter',
        'top': 1, 'left': 1, 'right': 1,
        'top_color': BORDER_COLOR, 'left_color': BORDER_COLOR, 'right_color': BORDER_COLOR
    })

    fmt_kpi_value_currency = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 15,
        'bold': True,
        'font_color': NAVY_DARK,
        'num_format': '$#,##0',
        'bg_color': '#FFFFFF',
        'align': 'center',
        'valign': 'vcenter',
        'left': 1, 'right': 1,
        'left_color': BORDER_COLOR, 'right_color': BORDER_COLOR
    })

    fmt_kpi_value_currency_green = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 15,
        'bold': True,
        'font_color': GREEN_DARK,
        'num_format': '$#,##0',
        'bg_color': GREEN_LIGHT,
        'align': 'center',
        'valign': 'vcenter',
        'left': 1, 'right': 1,
        'left_color': BORDER_COLOR, 'right_color': BORDER_COLOR
    })

    fmt_kpi_value_currency_red = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 15,
        'bold': True,
        'font_color': RED_DARK,
        'num_format': '$#,##0',
        'bg_color': RED_LIGHT,
        'align': 'center',
        'valign': 'vcenter',
        'left': 1, 'right': 1,
        'left_color': BORDER_COLOR, 'right_color': BORDER_COLOR
    })

    fmt_kpi_value_currency_blue = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 15,
        'bold': True,
        'font_color': NAVY_ACCENT,
        'num_format': '$#,##0',
        'bg_color': BLUE_LIGHT,
        'align': 'center',
        'valign': 'vcenter',
        'left': 1, 'right': 1,
        'left_color': BORDER_COLOR, 'right_color': BORDER_COLOR
    })

    fmt_kpi_value_pct = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 15,
        'bold': True,
        'font_color': NAVY_DARK,
        'num_format': '0.0%',
        'bg_color': '#FFFFFF',
        'align': 'center',
        'valign': 'vcenter',
        'left': 1, 'right': 1,
        'left_color': BORDER_COLOR, 'right_color': BORDER_COLOR
    })

    fmt_kpi_sub = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 8,
        'font_color': TEXT_MUTED,
        'bg_color': '#F8FAFC',
        'align': 'center',
        'valign': 'vcenter',
        'bottom': 1, 'left': 1, 'right': 1,
        'bottom_color': BORDER_COLOR, 'left_color': BORDER_COLOR, 'right_color': BORDER_COLOR
    })

    # Table Header & Cells
    fmt_tbl_hdr = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 10,
        'bold': True,
        'font_color': '#FFFFFF',
        'bg_color': NAVY_PRIMARY,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': True,
        'border': 1,
        'border_color': NAVY_PRIMARY
    })

    fmt_cell_text = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 9.5,
        'font_color': TEXT_DARK,
        'valign': 'vcenter',
        'border': 1,
        'border_color': BORDER_COLOR
    })

    fmt_cell_text_center = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 9.5,
        'font_color': TEXT_DARK,
        'align': 'center',
        'valign': 'vcenter',
        'border': 1,
        'border_color': BORDER_COLOR
    })

    fmt_cell_date = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 9.5,
        'font_color': TEXT_DARK,
        'num_format': 'yyyy-mm-dd',
        'align': 'center',
        'valign': 'vcenter',
        'border': 1,
        'border_color': BORDER_COLOR
    })

    fmt_cell_clp = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 9.5,
        'font_color': TEXT_DARK,
        'num_format': '$#,##0',
        'align': 'right',
        'valign': 'vcenter',
        'border': 1,
        'border_color': BORDER_COLOR
    })

    fmt_cell_pct = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 9.5,
        'font_color': TEXT_DARK,
        'num_format': '0.0%',
        'align': 'right',
        'valign': 'vcenter',
        'border': 1,
        'border_color': BORDER_COLOR
    })

    fmt_cell_total_clp = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 10,
        'bold': True,
        'font_color': NAVY_DARK,
        'num_format': '$#,##0',
        'bg_color': '#F1F5F9',
        'align': 'right',
        'valign': 'vcenter',
        'top': 1, 'bottom': 2,
        'border_color': NAVY_PRIMARY
    })

    fmt_cell_total_text = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 10,
        'bold': True,
        'font_color': NAVY_DARK,
        'bg_color': '#F1F5F9',
        'align': 'left',
        'valign': 'vcenter',
        'top': 1, 'bottom': 2,
        'border_color': NAVY_PRIMARY
    })

    fmt_selector_label = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 10,
        'bold': True,
        'font_color': NAVY_DARK,
        'bg_color': BLUE_LIGHT,
        'align': 'right',
        'valign': 'vcenter',
        'border': 1,
        'border_color': '#BFDBFE'
    })

    fmt_selector_value = wb.add_format({
        'font_name': 'Segoe UI',
        'font_size': 11,
        'bold': True,
        'font_color': NAVY_ACCENT,
        'bg_color': '#FFFFFF',
        'align': 'center',
        'valign': 'vcenter',
        'border': 2,
        'border_color': NAVY_ACCENT
    })

    # =============================================================
    # CREATE WORKSHEETS IN USER-FACING PRIORITY ORDER
    # =============================================================
    ws_dash = wb.add_worksheet('Dashboard')
    ws_mov = wb.add_worksheet('Movimientos')
    ws_pres = wb.add_worksheet('Presupuesto')
    ws_cuentas = wb.add_worksheet('Cuentas')
    ws_fijos = wb.add_worksheet('Gastos Fijos')
    ws_metas = wb.add_worksheet('Metas')
    ws_deudas = wb.add_worksheet('Deudas')
    ws_ing = wb.add_worksheet('Ingresos')
    ws_proy = wb.add_worksheet('Proyecciones')
    ws_config = wb.add_worksheet('Configuración')

    # Activate Dashboard as the opening tab
    ws_dash.activate()
    ws_dash.hide_gridlines(2)
    ws_dash.set_tab_color(NAVY_PRIMARY)

    # Tab colors
    ws_mov.set_tab_color(NAVY_ACCENT)
    ws_pres.set_tab_color(AMBER_ACCENT)
    ws_cuentas.set_tab_color(GREEN_ACCENT)
    ws_fijos.set_tab_color(NAVY_PRIMARY)
    ws_metas.set_tab_color(GREEN_DARK)
    ws_deudas.set_tab_color(RED_ACCENT)
    ws_ing.set_tab_color(GREEN_DARK)
    ws_proy.set_tab_color(NAVY_PRIMARY)
    ws_config.set_tab_color(NAVY_PRIMARY)

    # =============================================================
    # 1. WORKSHEET: Configuración (Master Config & Lookup Tables)
    # =============================================================
    ws_config.set_column('A:A', 4)
    ws_config.set_column('B:B', 25)
    ws_config.set_column('C:C', 18)
    ws_config.set_column('D:D', 6)
    ws_config.set_column('E:E', 24)
    ws_config.set_column('F:F', 20)
    ws_config.set_column('G:G', 6)
    ws_config.set_column('H:H', 24)
    ws_config.set_column('I:I', 18)
    ws_config.set_column('J:J', 6)
    ws_config.set_column('K:K', 18)

    ws_config.write('B2', 'SISTEMA FINANCIERO — PARÁMETROS GLOBALES', fmt_title)
    ws_config.write('B3', 'Modifica aquí los meses de consulta, umbrales y catálogos maestros.', fmt_subtitle)

    ws_config.write('B5', 'PARÁMETROS GENERALES', fmt_tbl_hdr)
    ws_config.write('C5', 'VALOR CONFIGURADO', fmt_tbl_hdr)

    params = [
        ('Mes de Consulta Activo', 10),
        ('Año de Consulta Activo', 2026),
        ('Moneda Principal', 'CLP ($)'),
        ('Meta de Ahorro Mensual (%)', 0.20),
        ('Umbral Saldo Mínimo de Seguridad', 300000),
        ('Umbral Presupuesto Verde (<)', 0.70),
        ('Umbral Presupuesto Amarillo (<)', 0.90),
        ('Umbral Presupuesto Naranja (<=)', 1.00),
        ('Umbral Presupuesto Rojo (>)', 1.00),
        ('Tasa Proyección Conservadora (Ingresos)', -0.10),
        ('Tasa Proyección Conservadora (Gastos)', 0.15),
        ('Tasa Proyección Optimista (Ingresos)', 0.10),
        ('Tasa Proyección Optimista (Gastos)', -0.10),
    ]

    for idx, (pname, pval) in enumerate(params):
        r = 6 + idx
        ws_config.write(r - 1, 1, pname, fmt_cell_text)
        if isinstance(pval, float) and abs(pval) <= 1.0:
            ws_config.write(r - 1, 2, pval, fmt_cell_pct)
        elif isinstance(pval, int) and pval > 1000:
            ws_config.write(r - 1, 2, pval, fmt_cell_clp)
        else:
            ws_config.write(r - 1, 2, pval, fmt_cell_text_center)

    # Master Categories Table (E5:F...)
    ws_config.write('E5', 'CATEGORÍA DE GASTO', fmt_tbl_hdr)
    ws_config.write('F5', 'TIPO DE GASTO', fmt_tbl_hdr)
    expense_categories = [
        ('Alimentación y Supermercado', 'Variable'),
        ('Vivienda y Servicios', 'Fijo'),
        ('Transporte y Combustible', 'Variable'),
        ('Salud y Seguros', 'Fijo'),
        ('Suscripciones y Gimnasio', 'Fijo'),
        ('Educación y Crecimiento', 'Fijo'),
        ('Tecnología e Instrumentos', 'Variable'),
        ('Ropa y Cuidado Personal', 'Variable'),
        ('Entretenimiento y Salidas', 'Variable'),
        ('Ahorro e Inversión', 'Fijo'),
        ('Imprevistos y Emergencias', 'Variable'),
        ('Otros Gastos', 'Variable')
    ]
    for idx, (cat, ctype) in enumerate(expense_categories):
        r = 6 + idx
        ws_config.write(r - 1, 4, cat, fmt_cell_text)
        ws_config.write(r - 1, 5, ctype, fmt_cell_text_center)

    # Master Accounts Table (H5:I...)
    ws_config.write('H5', 'CUENTA FINANCIERA', fmt_tbl_hdr)
    ws_config.write('I5', 'NATURALEZA', fmt_tbl_hdr)
    accounts = [
        ('Cuenta Corriente Banco', 'Activo Líquido'),
        ('Cuenta Vista / Débito', 'Activo Líquido'),
        ('Cuenta Ahorro / Inversión', 'Activo Inversión'),
        ('Efectivo', 'Activo Líquido'),
        ('Tarjeta de Crédito', 'Pasivo Revolvente')
    ]
    for idx, (acc, nature) in enumerate(accounts):
        r = 6 + idx
        ws_config.write(r - 1, 7, acc, fmt_cell_text)
        ws_config.write(r - 1, 8, nature, fmt_cell_text_center)

    # Transaction Types & Methods (K5:K...)
    ws_config.write('K5', 'TIPO MOVIMIENTO', fmt_tbl_hdr)
    types = ['Ingreso', 'Gasto', 'Transferencia', 'Ajuste']
    for idx, t in enumerate(types):
        ws_config.write(5 + idx, 10, t, fmt_cell_text_center)

    # =============================================================
    # 2. WORKSHEET: Movimientos (Single Source of Truth)
    # =============================================================
    ws_mov.freeze_panes(5, 0)
    # Column Schema:
    # 0: ID
    # 1: Fecha Operación
    # 2: Fecha Vencimiento
    # 3: Fecha Pago
    # 4: Tipo
    # 5: Categoría
    # 6: Subcategoría
    # 7: Descripción
    # 8: Monto CLP
    # 9: Cuenta Origen
    # 10: Cuenta Destino
    # 11: Medio de Pago
    # 12: Frecuencia
    # 13: Estado
    # 14: Observaciones
    # 15: Mes
    # 16: Año
    # 17: Alerta Duplicado

    mov_cols = [
        ('ID', 10),
        ('Fecha Operación', 14),
        ('Fecha Vencimiento', 14),
        ('Fecha Pago', 14),
        ('Tipo', 14),
        ('Categoría', 25),
        ('Subcategoría', 22),
        ('Descripción', 30),
        ('Monto (CLP)', 16),
        ('Cuenta Origen', 24),
        ('Cuenta Destino', 24),
        ('Medio de Pago', 16),
        ('Frecuencia', 13),
        ('Estado', 13),
        ('Observaciones', 25),
        ('Mes', 8),
        ('Año', 8),
        ('Alerta Duplicado', 20)
    ]

    for col_idx, (col_name, col_width) in enumerate(mov_cols):
        col_letter = chr(65 + col_idx) if col_idx < 26 else f"A{chr(65 + col_idx - 26)}"
        ws_mov.set_column(f"{col_letter}:{col_letter}", col_width)

    ws_mov.write('A2', 'REGISTRO CENTRALIZADO DE MOVIMIENTOS', fmt_title)
    ws_mov.write('A3', 'Fuente única de verdad. Ingresa aquí todos los movimientos. Mes, Año y Alertas son automáticos.', fmt_subtitle)

    for c_idx, (c_name, _) in enumerate(mov_cols):
        ws_mov.write(4, c_idx, c_name, fmt_tbl_hdr)

    # Demo transactions (18 columns)
    demo_movs = []
    if is_demo:
        demo_movs = [
            # ID, F_Op, F_Venc, F_Pago, Tipo, Cat, Subcat, Desc, Monto, CtaOrig, CtaDest, Medio, Freq, Estado, Obs
            ("MOV-0001", "2026-08-30", "2026-08-30", "2026-08-30", "Ingreso", "Sueldo Principal", "Salario Base", "Sueldo Agosto", 2450000, "Cuenta Corriente Banco", "", "Transferencia", "Recurrente", "Pagado", "Abono nómina"),
            ("MOV-0002", "2026-09-01", "2026-09-01", "2026-09-01", "Gasto", "Vivienda y Servicios", "Arriendo", "Arriendo Depto Septiembre", 680000, "Cuenta Corriente Banco", "", "Transferencia", "Recurrente", "Pagado", "Transferencia propietario"),
            ("MOV-0003", "2026-09-02", "2026-09-05", "2026-09-02", "Gasto", "Vivienda y Servicios", "Gastos Comunes", "Gastos Comunes Edificio", 125000, "Cuenta Corriente Banco", "", "Transferencia", "Recurrente", "Pagado", "Conserjería"),
            ("MOV-0004", "2026-09-05", "2026-09-05", "2026-09-05", "Gasto", "Alimentación y Supermercado", "Supermercado", "Compra Mensual Lider", 215000, "Cuenta Corriente Banco", "", "Débito", "Recurrente", "Pagado", "Despensa y aseo"),
            ("MOV-0005", "2026-09-08", "2026-09-08", "2026-09-08", "Gasto", "Transporte y Combustible", "Combustible", "Carga Bencina Shell", 45000, "Cuenta Corriente Banco", "", "Débito", "Variable", "Pagado", "Tanque lleno"),
            ("MOV-0006", "2026-09-10", "2026-09-10", "2026-09-10", "Gasto", "Suscripciones y Gimnasio", "Gimnasio", "SmartFit Mensualidad", 29990, "Tarjeta de Crédito", "", "Cargo Automático", "Recurrente", "Pagado", "Plan Black"),
            ("MOV-0007", "2026-09-15", "2026-09-15", "2026-09-15", "Transferencia", "Ahorro e Inversión", "Ahorro General", "Aporte Ahorro Septiembre", 400000, "Cuenta Corriente Banco", "Cuenta Ahorro / Inversión", "Transferencia", "Recurrente", "Pagado", "Fondo reserva"),
            ("MOV-0008", "2026-09-20", "2026-09-20", "2026-09-20", "Gasto", "Entretenimiento y Salidas", "Restaurantes", "Cena Aniversario", 85000, "Tarjeta de Crédito", "", "Crédito", "Único", "Pagado", "Restaurante"),
            ("MOV-0009", "2026-09-30", "2026-09-30", "2026-09-30", "Ingreso", "Sueldo Principal", "Salario Base", "Sueldo Septiembre", 2450000, "Cuenta Corriente Banco", "", "Transferencia", "Recurrente", "Pagado", "Abono nómina mensual"),
            ("MOV-0010", "2026-09-30", "2026-09-30", "2026-09-30", "Transferencia", "Otros Gastos", "Pago Tarjeta", "Pago Facturación Tarjeta Crédito", 114990, "Cuenta Corriente Banco", "Tarjeta de Crédito", "Transferencia", "Recurrente", "Pagado", "Pago total facturación sep"),

            # Month 10 (Current Active Month in Config)
            ("MOV-0011", "2026-10-01", "2026-10-01", "2026-10-01", "Gasto", "Vivienda y Servicios", "Arriendo", "Arriendo Depto Octubre", 680000, "Cuenta Corriente Banco", "", "Transferencia", "Recurrente", "Pagado", "Transferencia arrendador"),
            ("MOV-0012", "2026-10-02", "2026-10-05", "2026-10-02", "Gasto", "Vivienda y Servicios", "Gastos Comunes", "Gastos Comunes Octubre", 130000, "Cuenta Corriente Banco", "", "Transferencia", "Recurrente", "Pagado", "Gasto común edificio"),
            ("MOV-0013", "2026-10-03", "2026-10-08", "2026-10-03", "Gasto", "Vivienda y Servicios", "Servicios Básicos", "Enel Electricidad", 38500, "Cuenta Corriente Banco", "", "Débito", "Recurrente", "Pagado", "Consumo septiembre pagado oct"),
            ("MOV-0014", "2026-10-03", "2026-10-10", "2026-10-03", "Gasto", "Vivienda y Servicios", "Servicios Básicos", "Aguas Andinas", 21400, "Cuenta Corriente Banco", "", "Débito", "Recurrente", "Pagado", "Agua potable"),
            ("MOV-0015", "2026-10-04", "2026-10-04", "2026-10-04", "Gasto", "Alimentación y Supermercado", "Supermercado", "Compra Quincenal Jumbo", 168000, "Cuenta Corriente Banco", "", "Débito", "Variable", "Pagado", "Alimentos frescos y despensa"),
            ("MOV-0016", "2026-10-05", "2026-10-05", "2026-10-05", "Gasto", "Suscripciones y Gimnasio", "Suscripciones", "Netflix + Spotify", 18500, "Tarjeta de Crédito", "", "Cargo Automático", "Recurrente", "Pagado", "Entretenimiento digital"),
            ("MOV-0017", "2026-10-06", "2026-10-06", "2026-10-06", "Gasto", "Transporte y Combustible", "Combustible", "Carga Bencina Copec", 52000, "Cuenta Corriente Banco", "", "Débito", "Variable", "Pagado", "Octanaje 95"),
            ("MOV-0018", "2026-10-08", "2026-10-08", "2026-10-08", "Gasto", "Salud y Seguros", "Farmacia", "Medicamentos y Vitaminas", 34500, "Cuenta Corriente Banco", "", "Débito", "Variable", "Pagado", "Cruz Verde"),
            ("MOV-0019", "2026-10-10", "2026-10-10", "2026-10-10", "Gasto", "Suscripciones y Gimnasio", "Gimnasio", "SmartFit Mensualidad", 29990, "Tarjeta de Crédito", "", "Cargo Automático", "Recurrente", "Pagado", "Plan gimnasio"),
            ("MOV-0020", "2026-10-12", "2026-10-12", "2026-10-12", "Gasto", "Alimentación y Supermercado", "Feria y Verdulería", "Feria del fin de semana", 28000, "Efectivo", "", "Efectivo", "Variable", "Pagado", "Verduras y frutas"),
            ("MOV-0021", "2026-10-14", "2026-10-14", "2026-10-14", "Gasto", "Tecnología e Instrumentos", "Música / Accesorios", "Pedal afinador guitarra", 78000, "Tarjeta de Crédito", "", "Crédito", "Único", "Pagado", "Audiomúsica"),
            ("MOV-0022", "2026-10-15", "2026-10-15", "2026-10-15", "Transferencia", "Ahorro e Inversión", "Fondo Emergencia", "Aporte Fondo de Emergencia", 350000, "Cuenta Corriente Banco", "Cuenta Ahorro / Inversión", "Transferencia", "Recurrente", "Pagado", "Aporte mensual meta"),
            ("MOV-0023", "2026-10-18", "2026-10-18", "2026-10-18", "Gasto", "Entretenimiento y Salidas", "Restaurantes", "Almuerzo con amigos", 42000, "Cuenta Corriente Banco", "", "Débito", "Variable", "Pagado", "Restaurante Providencia"),
            ("MOV-0024", "2026-10-20", "2026-10-20", "2026-10-20", "Ingreso", "Honorarios / Freelance", "Consultoría", "Proyecto Asesoría Web", 480000, "Cuenta Corriente Banco", "", "Transferencia", "Único", "Pagado", "Honorarios cliente externo"),
            ("MOV-0025", "2026-10-22", "2026-10-22", "2026-10-22", "Gasto", "Alimentación y Supermercado", "Supermercado", "Reposición Lider Express", 64000, "Cuenta Corriente Banco", "", "Débito", "Variable", "Pagado", "Compras semanales"),
            ("MOV-0026", "2026-10-25", "2026-10-28", "", "Gasto", "Transporte y Combustible", "TAG / Peajes", "Facturación Autopistas TAG", 31000, "Cuenta Corriente Banco", "", "Cargo Automático", "Recurrente", "Pendiente", "Vence 28-oct"),
            ("MOV-0027", "2026-10-26", "2026-10-29", "", "Gasto", "Vivienda y Servicios", "Telecomunicaciones", "Plan Entel Fibra + Móvil", 39990, "Cuenta Corriente Banco", "", "Cargo Automático", "Recurrente", "Pendiente", "Vence 29-oct"),
            ("MOV-0028", "2026-10-28", "2026-10-30", "", "Gasto", "Imprevistos y Emergencias", "Mantenimiento", "Reparación fuga calefont", 55000, "Cuenta Corriente Banco", "", "Transferencia", "Único", "Programado", "Gasfiter agendado"),
            ("MOV-0029", "2026-10-30", "2026-10-30", "2026-10-30", "Ingreso", "Sueldo Principal", "Salario Base", "Sueldo Octubre", 2450000, "Cuenta Corriente Banco", "", "Transferencia", "Recurrente", "Pagado", "Abono empresa fin de mes"),
            ("MOV-0030", "2026-10-30", "2026-10-30", "", "Transferencia", "Otros Gastos", "Pago Tarjeta", "Pago Tarjeta Crédito Octubre", 126490, "Cuenta Corriente Banco", "Tarjeta de Crédito", "Transferencia", "Recurrente", "Programado", "Facturación total tarjeta oct")
        ]
    else:
        demo_movs = [
            ("MOV-0001", "2026-10-01", "2026-10-01", "2026-10-01", "Ingreso", "Sueldo Principal", "Salario Base", "Ingreso Sueldo Ejemplo", 1500000, "Cuenta Corriente Banco", "", "Transferencia", "Recurrente", "Pagado", "Ejemplo editable"),
            ("MOV-0002", "2026-10-02", "2026-10-02", "2026-10-02", "Gasto", "Vivienda y Servicios", "Arriendo", "Arriendo Ejemplo", 450000, "Cuenta Corriente Banco", "", "Transferencia", "Recurrente", "Pagado", "Ejemplo editable"),
            ("MOV-0003", "2026-10-03", "2026-10-03", "2026-10-03", "Gasto", "Alimentación y Supermercado", "Supermercado", "Supermercado Ejemplo", 120000, "Cuenta Corriente Banco", "", "Débito", "Variable", "Pagado", "Ejemplo editable")
        ]

    start_row = 5
    for idx, row in enumerate(demo_movs):
        r = start_row + idx
        excel_r = r + 1
        ws_mov.write(r, 0, row[0], fmt_cell_text_center)
        ws_mov.write(r, 1, row[1], fmt_cell_date)
        ws_mov.write(r, 2, row[2] if row[2] else "", fmt_cell_date)
        ws_mov.write(r, 3, row[3] if row[3] else "", fmt_cell_date)
        ws_mov.write(r, 4, row[4], fmt_cell_text_center)
        ws_mov.write(r, 5, row[5], fmt_cell_text)
        ws_mov.write(r, 6, row[6], fmt_cell_text)
        ws_mov.write(r, 7, row[7], fmt_cell_text)
        ws_mov.write(r, 8, row[8], fmt_cell_clp)
        ws_mov.write(r, 9, row[9], fmt_cell_text)
        ws_mov.write(r, 10, row[10], fmt_cell_text)
        ws_mov.write(r, 11, row[11], fmt_cell_text_center)
        ws_mov.write(r, 12, row[12], fmt_cell_text_center)
        ws_mov.write(r, 13, row[13], fmt_cell_text_center)
        ws_mov.write(r, 14, row[14], fmt_cell_text)
        # Mes & Año from Fecha Operación (Col B)
        ws_mov.write_formula(r, 15, f'=MONTH(B{excel_r})', fmt_cell_text_center)
        ws_mov.write_formula(r, 16, f'=YEAR(B{excel_r})', fmt_cell_text_center)
        # Smart Duplicate Detection Formula:
        # If count of identical Date, Amount, Description and Account is > 1 -> Alert!
        ws_mov.write_formula(
            r, 17,
            f'=IF(COUNTIFS($B$6:$B$5000,B{excel_r},$I$6:$I$5000,I{excel_r},$H$6:$H$5000,H{excel_r},$J$6:$J$5000,J{excel_r})>1,"⚠️ POSIBLE DUPLICADO","OK")',
            fmt_cell_text_center
        )

    end_row = start_row + len(demo_movs) - 1

    # Excel Table Definition
    ws_mov.add_table(4, 0, max(end_row, 15), 17, {
        'name': 'tbl_Movimientos',
        'style': 'TableStyleMedium9',
        'columns': [{'header': col[0]} for col in mov_cols]
    })

    # Data Validations on Movimientos
    # Tipo (Col E = 4)
    ws_mov.data_validation(5, 4, 4999, 4, {
        'validate': 'list',
        'source': '=Configuración!$K$6:$K$9',
        'error_title': 'Tipo no válido',
        'error_message': 'Selecciona Ingreso, Gasto, Transferencia o Ajuste.'
    })
    # Categoría (Col F = 5)
    ws_mov.data_validation(5, 5, 4999, 5, {
        'validate': 'list',
        'source': '=Configuración!$E$6:$E$17',
        'error_title': 'Categoría no válida',
        'error_message': 'Selecciona una categoría configurada.'
    })
    # Cuenta Origen (Col J = 9)
    ws_mov.data_validation(5, 9, 4999, 9, {
        'validate': 'list',
        'source': '=Configuración!$H$6:$H$10',
        'error_title': 'Cuenta no válida',
        'error_message': 'Selecciona una cuenta registrada.'
    })
    # Cuenta Destino (Col K = 10)
    ws_mov.data_validation(5, 10, 4999, 10, {
        'validate': 'list',
        'source': '=Configuración!$H$6:$H$10'
    })
    # Estado (Col N = 13)
    ws_mov.data_validation(5, 13, 4999, 13, {
        'validate': 'list',
        'source': ['Pagado', 'Pendiente', 'Programado']
    })

    # Conditional Formatting for Duplicate Warning & Status
    ws_mov.conditional_format(5, 17, 4999, 17, {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"⚠️ POSIBLE DUPLICADO"',
        'format': wb.add_format({'bg_color': RED_LIGHT, 'font_color': RED_DARK, 'bold': True})
    })
    ws_mov.conditional_format(5, 13, 4999, 13, {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"Pagado"',
        'format': wb.add_format({'bg_color': GREEN_LIGHT, 'font_color': GREEN_DARK})
    })
    ws_mov.conditional_format(5, 13, 4999, 13, {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"Pendiente"',
        'format': wb.add_format({'bg_color': AMBER_LIGHT, 'font_color': AMBER_DARK})
    })
    ws_mov.conditional_format(5, 13, 4999, 13, {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"Programado"',
        'format': wb.add_format({'bg_color': BLUE_LIGHT, 'font_color': NAVY_ACCENT})
    })

    # =============================================================
    # 3. WORKSHEET: Presupuesto (Monthly Smart Budget)
    # =============================================================
    ws_pres.freeze_panes(5, 0)
    pres_cols = [
        ('Categoría', 26),
        ('Tipo Gasto', 14),
        ('Presupuesto Asignado', 20),
        ('Gasto Real Pagado', 18),
        ('Gasto Comprometido', 18),
        ('Total Ejecutado', 18),
        ('Saldo Restante', 18),
        ('% Consumo', 14),
        ('Desviación CLP', 16),
        ('Estado Cumplimiento', 18)
    ]
    for c_idx, (c_name, c_width) in enumerate(pres_cols):
        col_letter = chr(65 + c_idx)
        ws_pres.set_column(f"{col_letter}:{col_letter}", c_width)

    ws_pres.write('A2', 'PRESUPUESTO MENSUAL INTELIGENTE', fmt_title)
    ws_pres.write('A3', 'Control de desvíos en tiempo real para el Mes y Año activos seleccionados.', fmt_subtitle)

    # Active Month / Year Indicators
    ws_pres.write('G2', 'Mes Activo:', fmt_selector_label)
    ws_pres.write_formula('H2', '=Configuración!$C$6', fmt_selector_value)
    ws_pres.write('I2', 'Año Activo:', fmt_selector_label)
    ws_pres.write_formula('J2', '=Configuración!$C$7', fmt_selector_value)

    # Table Header
    for c_idx, (c_name, _) in enumerate(pres_cols):
        ws_pres.write(4, c_idx, c_name, fmt_tbl_hdr)

    # Base budget allocations
    budget_allocations = [
        ('Alimentación y Supermercado', 'Variable', 320000),
        ('Vivienda y Servicios', 'Fijo', 900000),
        ('Transporte y Combustible', 'Variable', 150000),
        ('Salud y Seguros', 'Fijo', 60000),
        ('Suscripciones y Gimnasio', 'Fijo', 55000),
        ('Educación y Crecimiento', 'Fijo', 50000),
        ('Tecnología e Instrumentos', 'Variable', 80000),
        ('Ropa y Cuidado Personal', 'Variable', 50000),
        ('Entretenimiento y Salidas', 'Variable', 90000),
        ('Ahorro e Inversión', 'Fijo', 400000),
        ('Imprevistos y Emergencias', 'Variable', 80000),
        ('Otros Gastos', 'Variable', 30000)
    ]

    p_start_row = 5
    for idx, (b_cat, b_type, b_alloc) in enumerate(budget_allocations):
        r = p_start_row + idx
        excel_r = r + 1
        ws_pres.write(r, 0, b_cat, fmt_cell_text)
        ws_pres.write(r, 1, b_type, fmt_cell_text_center)
        ws_pres.write(r, 2, b_alloc, fmt_cell_clp)
        # Gasto Real Pagado: SUMIFS from Movimientos
        # Movimientos: Amount=Col I ($I$6:$I$5000), Type=Col E ($E$6:$E$5000), Status=Col N ($N$6:$N$5000), Cat=Col F ($F$6:$F$5000), Month=Col P ($P$6:$P$5000), Year=Col Q ($Q$6:$Q$5000)
        ws_pres.write_formula(
            r, 3,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Gasto",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$F$6:$F$5000,A{excel_r},Movimientos!$P$6:$P$5000,$H$2,Movimientos!$Q$6:$Q$5000,$J$2)',
            fmt_cell_clp
        )
        # Gasto Comprometido (Pendiente o Programado)
        ws_pres.write_formula(
            r, 4,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Gasto",Movimientos!$N$6:$N$5000,"<>Pagado",Movimientos!$F$6:$F$5000,A{excel_r},Movimientos!$P$6:$P$5000,$H$2,Movimientos!$Q$6:$Q$5000,$J$2)',
            fmt_cell_clp
        )
        # Total Ejecutado
        ws_pres.write_formula(r, 5, f'=D{excel_r}+E{excel_r}', fmt_cell_clp)
        # Saldo Restante: Presupuesto Asignado - Total Ejecutado
        ws_pres.write_formula(r, 6, f'=C{excel_r}-F{excel_r}', fmt_cell_clp)
        # % Consumo
        ws_pres.write_formula(r, 7, f'=IF(C{excel_r}>0,F{excel_r}/C{excel_r},0)', fmt_cell_pct)
        # Desviación CLP: Total Ejecutado - Presupuesto Asignado
        ws_pres.write_formula(r, 8, f'=F{excel_r}-C{excel_r}', fmt_cell_clp)
        # Estado de Cumplimiento basado en Configuración
        ws_pres.write_formula(
            r, 9,
            f'=IF(C{excel_r}=0,"Sin Asignación",IF(H{excel_r}<Configuración!$C$11,"🟢 Verde (<70%)",IF(H{excel_r}<Configuración!$C$12,"🟡 Amarillo (<90%)",IF(H{excel_r}<=Configuración!$C$13,"🟠 Naranja (100%)","🔴 Excedido"))))',
            fmt_cell_text_center
        )

    p_end_row = p_start_row + len(budget_allocations) - 1
    p_tot_r = p_end_row + 2
    ws_pres.write(p_end_row + 1, 0, 'TOTAL CONSOLIDADO', fmt_cell_total_text)
    ws_pres.write(p_end_row + 1, 1, '', fmt_cell_total_text)
    ws_pres.write_formula(p_end_row + 1, 2, f'=SUM(C6:C{p_end_row+1})', fmt_cell_total_clp)
    ws_pres.write_formula(p_end_row + 1, 3, f'=SUM(D6:D{p_end_row+1})', fmt_cell_total_clp)
    ws_pres.write_formula(p_end_row + 1, 4, f'=SUM(E6:E{p_end_row+1})', fmt_cell_total_clp)
    ws_pres.write_formula(p_end_row + 1, 5, f'=SUM(F6:F{p_end_row+1})', fmt_cell_total_clp)
    ws_pres.write_formula(p_end_row + 1, 6, f'=SUM(G6:G{p_end_row+1})', fmt_cell_total_clp)
    ws_pres.write_formula(p_end_row + 1, 7, f'=IF(C{p_tot_r}>0,F{p_tot_r}/C{p_tot_r},0)', fmt_cell_pct)
    ws_pres.write_formula(p_end_row + 1, 8, f'=SUM(I6:I{p_end_row+1})', fmt_cell_total_clp)
    ws_pres.write(p_end_row + 1, 9, '', fmt_cell_total_text)

    # Conditional formatting on Presupuesto Estado
    ws_pres.conditional_format(5, 9, p_end_row, 9, {
        'type': 'text',
        'criteria': 'containing',
        'value': 'Verde',
        'format': wb.add_format({'bg_color': GREEN_LIGHT, 'font_color': GREEN_DARK, 'bold': True})
    })
    ws_pres.conditional_format(5, 9, p_end_row, 9, {
        'type': 'text',
        'criteria': 'containing',
        'value': 'Amarillo',
        'format': wb.add_format({'bg_color': AMBER_LIGHT, 'font_color': AMBER_DARK, 'bold': True})
    })
    ws_pres.conditional_format(5, 9, p_end_row, 9, {
        'type': 'text',
        'criteria': 'containing',
        'value': 'Naranja',
        'format': wb.add_format({'bg_color': '#FFEDD5', 'font_color': '#C2410C', 'bold': True})
    })
    ws_pres.conditional_format(5, 9, p_end_row, 9, {
        'type': 'text',
        'criteria': 'containing',
        'value': 'Excedido',
        'format': wb.add_format({'bg_color': RED_LIGHT, 'font_color': RED_DARK, 'bold': True})
    })

    # =============================================================
    # 4. WORKSHEET: Cuentas (Balances & Strict Transfer Math)
    # =============================================================
    ws_cuentas.set_column('A:A', 24)
    ws_cuentas.set_column('B:B', 18)
    ws_cuentas.set_column('C:C', 18)
    ws_cuentas.set_column('D:D', 18)
    ws_cuentas.set_column('E:E', 18)
    ws_cuentas.set_column('F:F', 18)
    ws_cuentas.set_column('G:G', 18)
    ws_cuentas.set_column('H:H', 20)
    ws_cuentas.set_column('I:I', 18)

    ws_cuentas.write('A2', 'ESTADO Y CONCILIACIÓN DE CUENTAS', fmt_title)
    ws_cuentas.write('A3', 'Las transferencias mueven fondos entre cuentas sin alterar ingresos ni gastos de consumo.', fmt_subtitle)

    acc_cols = [
        'Cuenta', 'Tipo', 'Saldo Inicial', '(+) Ingresos', '(-) Gastos Pagados',
        '(-) Transferencias Salientes', '(+) Transferencias Entrantes', 'Saldo Actual Calculado', 'Estado'
    ]
    for c_idx, c_name in enumerate(acc_cols):
        ws_cuentas.write(4, c_idx, c_name, fmt_tbl_hdr)

    acc_data = [
        ('Cuenta Corriente Banco', 'Activo Líquido', 1200000 if is_demo else 500000),
        ('Cuenta Vista / Débito', 'Activo Líquido', 150000 if is_demo else 100000),
        ('Cuenta Ahorro / Inversión', 'Activo Inversión', 3500000 if is_demo else 1000000),
        ('Efectivo', 'Activo Líquido', 80000 if is_demo else 50000),
        ('Tarjeta de Crédito', 'Pasivo Revolvente', 0)
    ]

    for idx, (acc_name, acc_type, init_bal) in enumerate(acc_data):
        r = 5 + idx
        excel_r = r + 1
        ws_cuentas.write(r, 0, acc_name, fmt_cell_text)
        ws_cuentas.write(r, 1, acc_type, fmt_cell_text_center)
        ws_cuentas.write(r, 2, init_bal, fmt_cell_clp)
        # Ingresos: Amount=Col I, Type=Col E, Status=Col N, OrigAcc=Col J
        ws_cuentas.write_formula(
            r, 3,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Ingreso",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$J$6:$J$5000,A{excel_r})',
            fmt_cell_clp
        )
        # Gastos Pagados
        ws_cuentas.write_formula(
            r, 4,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Gasto",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$J$6:$J$5000,A{excel_r})',
            fmt_cell_clp
        )
        # Transferencias Salientes
        ws_cuentas.write_formula(
            r, 5,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Transferencia",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$J$6:$J$5000,A{excel_r})',
            fmt_cell_clp
        )
        # Transferencias Entrantes: DestAcc=Col K
        ws_cuentas.write_formula(
            r, 6,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Transferencia",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$K$6:$K$5000,A{excel_r})',
            fmt_cell_clp
        )
        # Saldo Actual Calculado
        if acc_name == 'Tarjeta de Crédito':
            ws_cuentas.write_formula(r, 7, f'=C{excel_r}-E{excel_r}+G{excel_r}', fmt_cell_clp)
        else:
            ws_cuentas.write_formula(r, 7, f'=C{excel_r}+D{excel_r}-E{excel_r}-F{excel_r}+G{excel_r}', fmt_cell_clp)
        ws_cuentas.write_formula(r, 8, f'=IF(H{excel_r}>=0,"🟢 Conciliado","🔴 En Negativo")', fmt_cell_text_center)

    # Total liquid assets row
    ws_cuentas.write(10, 0, 'TOTAL DINERO LÍQUIDO DISPONIBLE (Activos)', fmt_cell_total_text)
    ws_cuentas.write(10, 1, '', fmt_cell_total_text)
    ws_cuentas.write_formula(10, 2, '=SUM(C6:C9)', fmt_cell_total_clp)
    ws_cuentas.write_formula(10, 3, '=SUM(D6:D9)', fmt_cell_total_clp)
    ws_cuentas.write_formula(10, 4, '=SUM(E6:E9)', fmt_cell_total_clp)
    ws_cuentas.write_formula(10, 5, '=SUM(F6:F9)', fmt_cell_total_clp)
    ws_cuentas.write_formula(10, 6, '=SUM(G6:G9)', fmt_cell_total_clp)
    ws_cuentas.write_formula(10, 7, '=SUM(H6:H9)', fmt_cell_total_clp)
    ws_cuentas.write(10, 8, '', fmt_cell_total_text)

    # Credit Card Section Breakdown
    ws_cuentas.write('A13', 'ANÁLISIS DE TARJETA DE CRÉDITO (Obligación / Pasivo)', fmt_section)
    tc_metrics = [
        ('Cupo Total Aprobado', 2500000),
        ('Cupo Utilizado (Deuda Facturada y No Facturada)', '=-H10'),
        ('Cupo Disponible Real', '=B14-B15')
    ]
    for idx, (m_title, m_val) in enumerate(tc_metrics):
        r = 13 + idx
        ws_cuentas.write(r, 0, m_title, fmt_cell_text)
        if isinstance(m_val, str) and m_val.startswith('='):
            ws_cuentas.write_formula(r, 1, m_val, fmt_cell_clp)
        else:
            ws_cuentas.write(r, 1, m_val, fmt_cell_clp)

    # =============================================================
    # 5. WORKSHEET: Gastos Fijos (Subscriptions & Obligations)
    # =============================================================
    fijo_cols = [
        ('Nombre del Compromiso', 28),
        ('Categoría', 24),
        ('Monto Esperado', 18),
        ('Frecuencia', 14),
        ('Día Vencimiento', 16),
        ('Cuenta de Pago', 24),
        ('Estado Compromiso', 18),
        ('Renovación Automática', 22),
        ('¿Pagado este Mes?', 18)
    ]
    for c_idx, (c_name, c_width) in enumerate(fijo_cols):
        col_letter = chr(65 + c_idx)
        ws_fijos.set_column(f"{col_letter}:{col_letter}", c_width)

    ws_fijos.write('A2', 'CONTROL DE GASTOS FIJOS Y SUSCRIPCIONES', fmt_title)
    ws_fijos.write('A3', 'Obligaciones recurrentes planificadas. Distingue entre compromiso mensual y pago real ejecutado.', fmt_subtitle)

    for c_idx, (c_name, _) in enumerate(fijo_cols):
        ws_fijos.write(4, c_idx, c_name, fmt_tbl_hdr)

    fijos_data = [
        ('Arriendo Depto', 'Vivienda y Servicios', 680000, 'Mensual', 1, 'Cuenta Corriente Banco', 'Activo', 'Sí'),
        ('Gastos Comunes', 'Vivienda y Servicios', 130000, 'Mensual', 5, 'Cuenta Corriente Banco', 'Activo', 'Sí'),
        ('Enel Electricidad', 'Vivienda y Servicios', 40000, 'Mensual', 8, 'Cuenta Corriente Banco', 'Activo', 'Sí'),
        ('Aguas Andinas', 'Vivienda y Servicios', 22000, 'Mensual', 10, 'Cuenta Corriente Banco', 'Activo', 'Sí'),
        ('SmartFit Plan Black', 'Suscripciones y Gimnasio', 29990, 'Mensual', 10, 'Tarjeta de Crédito', 'Activo', 'Sí'),
        ('Netflix + Spotify', 'Suscripciones y Gimnasio', 18500, 'Mensual', 5, 'Tarjeta de Crédito', 'Activo', 'Sí'),
        ('Plan Entel Fibra + Móvil', 'Vivienda y Servicios', 39990, 'Mensual', 26, 'Cuenta Corriente Banco', 'Activo', 'Sí'),
        ('Seguro de Salud Complementario', 'Salud y Seguros', 35000, 'Mensual', 15, 'Cuenta Corriente Banco', 'Activo', 'Sí')
    ]

    for idx, f in enumerate(fijos_data):
        r = 5 + idx
        excel_r = r + 1
        ws_fijos.write(r, 0, f[0], fmt_cell_text)
        ws_fijos.write(r, 1, f[1], fmt_cell_text)
        ws_fijos.write(r, 2, f[2], fmt_cell_clp)
        ws_fijos.write(r, 3, f[3], fmt_cell_text_center)
        ws_fijos.write(r, 4, f[4], fmt_cell_text_center)
        ws_fijos.write(r, 5, f[5], fmt_cell_text)
        ws_fijos.write(r, 6, f[6], fmt_cell_text_center)
        ws_fijos.write(r, 7, f[7], fmt_cell_text_center)
        # Check if already paid in active month via COUNTIFS in Movimientos
        # Cat=Col F, Desc=Col H, Status=Col N, Month=Col P, Year=Col Q
        ws_fijos.write_formula(
            r, 8,
            f'=IF(COUNTIFS(Movimientos!$F$6:$F$5000,B{excel_r},Movimientos!$H$6:$H$5000,"*"&LEFT(A{excel_r},6)&"*",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,Configuración!$C$6,Movimientos!$Q$6:$Q$5000,Configuración!$C$7)>0,"✅ Pagado","⏳ Pendiente")',
            fmt_cell_text_center
        )

    f_end = 5 + len(fijos_data)
    ws_fijos.write(f_end, 0, 'TOTAL COMPROMISOS MENSUALES FIJOS', fmt_cell_total_text)
    ws_fijos.write(f_end, 1, '', fmt_cell_total_text)
    ws_fijos.write_formula(f_end, 2, f'=SUM(C6:C{f_end})', fmt_cell_total_clp)
    ws_fijos.write(f_end, 3, '', fmt_cell_total_text)
    ws_fijos.write(f_end, 4, '', fmt_cell_total_text)
    ws_fijos.write(f_end, 5, '', fmt_cell_total_text)
    ws_fijos.write(f_end, 6, '', fmt_cell_total_text)
    ws_fijos.write(f_end, 7, '', fmt_cell_total_text)
    ws_fijos.write(f_end, 8, '', fmt_cell_total_text)

    # =============================================================
    # 6. WORKSHEET: Metas (Savings Goals Tracking)
    # =============================================================
    meta_cols = [
        ('Nombre Meta', 24),
        ('Monto Objetivo', 18),
        ('Saldo Inicial', 18),
        ('Aportes Acumulados', 18),
        ('Total Acumulado', 18),
        ('% Avance', 14),
        ('Monto Pendiente', 18),
        ('Fecha Objetivo', 14),
        ('Meses Restantes', 14),
        ('Aporte Mensual Req.', 18),
        ('Estado Cumplimiento', 20)
    ]
    for c_idx, (c_name, c_width) in enumerate(meta_cols):
        col_letter = chr(65 + c_idx)
        ws_metas.set_column(f"{col_letter}:{col_letter}", c_width)

    ws_metas.write('A2', 'METAS DE AHORRO E INVERSIÓN', fmt_title)
    ws_metas.write('A3', 'Seguimiento de objetivos patrimoniales con cálculo de ahorro mensual requerido.', fmt_subtitle)

    for c_idx, (c_name, _) in enumerate(meta_cols):
        ws_metas.write(4, c_idx, c_name, fmt_tbl_hdr)

    metas_data = [
        ('Fondo de Emergencia (6m)', 6000000, 2000000 if is_demo else 500000, '2027-06-30'),
        ('Renovación Vehículo', 5000000, 1000000 if is_demo else 0, '2027-12-31'),
        ('Vacaciones Europa / Playa', 2500000, 500000 if is_demo else 0, '2027-02-28'),
        ('Equipamiento Musical y Tech', 1500000, 250000 if is_demo else 0, '2026-12-31')
    ]

    for idx, (m_name, m_target, m_init, m_date) in enumerate(metas_data):
        r = 5 + idx
        excel_r = r + 1
        ws_metas.write(r, 0, m_name, fmt_cell_text)
        ws_metas.write(r, 1, m_target, fmt_cell_clp)
        ws_metas.write(r, 2, m_init, fmt_cell_clp)
        # Aportes Acumulados: Amount=Col I, Type=Col E, Status=Col N, DestAcc=Col K, Desc=Col H
        ws_metas.write_formula(
            r, 3,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Transferencia",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$K$6:$K$5000,"Cuenta Ahorro / Inversión",Movimientos!$H$6:$H$5000,"*"&LEFT(A{excel_r},6)&"*")',
            fmt_cell_clp
        )
        # Total Acumulado
        ws_metas.write_formula(r, 4, f'=C{excel_r}+D{excel_r}', fmt_cell_clp)
        # % Avance
        ws_metas.write_formula(r, 5, f'=IF(B{excel_r}>0,E{excel_r}/B{excel_r},0)', fmt_cell_pct)
        # Monto Pendiente
        ws_metas.write_formula(r, 6, f'=MAX(0,B{excel_r}-E{excel_r})', fmt_cell_clp)
        # Fecha Objetivo
        ws_metas.write(r, 7, m_date, fmt_cell_date)
        # Meses Restantes
        ws_metas.write_formula(r, 8, f'=MAX(1,ROUND((H{excel_r}-DATE(Configuración!$C$7,Configuración!$C$6,1))/30,0))', fmt_cell_text_center)
        # Aporte Mensual Necesario
        ws_metas.write_formula(r, 9, f'=ROUND(G{excel_r}/I{excel_r},0)', fmt_cell_clp)
        # Estado
        ws_metas.write_formula(
            r, 10,
            f'=IF(F{excel_r}>=1,"🏆 Meta Cumplida",IF(F{excel_r}>=0.7,"🟢 En Buen Avance",IF(F{excel_r}>=0.3,"🟡 En Desarrollo","🟠 Aceleración Requerida")))',
            fmt_cell_text_center
        )

    m_end = 5 + len(metas_data)
    ws_metas.write(m_end, 0, 'TOTAL PATRIMONIO EN METAS', fmt_cell_total_text)
    ws_metas.write_formula(m_end, 1, f'=SUM(B6:B{m_end})', fmt_cell_total_clp)
    ws_metas.write_formula(m_end, 2, f'=SUM(C6:C{m_end})', fmt_cell_total_clp)
    ws_metas.write_formula(m_end, 3, f'=SUM(D6:D{m_end})', fmt_cell_total_clp)
    ws_metas.write_formula(m_end, 4, f'=SUM(E6:E{m_end})', fmt_cell_total_clp)
    ws_metas.write_formula(m_end, 5, f'=IF(B{m_end+1}>0,E{m_end+1}/B{m_end+1},0)', fmt_cell_pct)
    ws_metas.write_formula(m_end, 6, f'=SUM(G6:G{m_end})', fmt_cell_total_clp)
    ws_metas.write(m_end, 7, '', fmt_cell_total_text)
    ws_metas.write(m_end, 8, '', fmt_cell_total_text)
    ws_metas.write_formula(m_end, 9, f'=SUM(J6:J{m_end})', fmt_cell_total_clp)
    ws_metas.write(m_end, 10, '', fmt_cell_total_text)

    # =============================================================
    # 7. WORKSHEET: Deudas (Loans & Credit Commitments)
    # =============================================================
    deuda_cols = [
        ('Nombre de la Obligación', 26),
        ('Institución / Acreedor', 22),
        ('Monto Original', 18),
        ('Tasa Mensual (%)', 16),
        ('Cuotas Totales', 14),
        ('Cuotas Pagadas', 14),
        ('Cuotas Pendientes', 16),
        ('Valor Cuota Mensual', 18),
        ('Saldo Capital Insoluto', 20),
        ('Día Vencimiento', 16),
        ('Estado Deuda', 16)
    ]
    for c_idx, (c_name, c_width) in enumerate(deuda_cols):
        col_letter = chr(65 + c_idx)
        ws_deudas.set_column(f"{col_letter}:{col_letter}", c_width)

    ws_deudas.write('A2', 'CONTROL DE DEUDAS Y COMPROMISOS CREDITICIOS', fmt_title)
    ws_deudas.write('A3', 'Amortización y control de pasivos. Diferencia capital e interés.', fmt_subtitle)

    for c_idx, (c_name, _) in enumerate(deuda_cols):
        ws_deudas.write(4, c_idx, c_name, fmt_tbl_hdr)

    deudas_data = [
        ('Crédito de Consumo Vehículo', 'Banco de Chile', 4500000, 0.0125, 36, 14 if is_demo else 0, 156000, 15),
        ('Crédito Postgrado / Estudio', 'Banco Santander', 2800000, 0.0098, 24, 18 if is_demo else 0, 131500, 5)
    ]

    for idx, (d_name, d_bank, d_orig, d_rate, d_total_c, d_paid_c, d_cuota, d_dia) in enumerate(deudas_data):
        r = 5 + idx
        excel_r = r + 1
        ws_deudas.write(r, 0, d_name, fmt_cell_text)
        ws_deudas.write(r, 1, d_bank, fmt_cell_text)
        ws_deudas.write(r, 2, d_orig, fmt_cell_clp)
        ws_deudas.write(r, 3, d_rate, fmt_cell_pct)
        ws_deudas.write(r, 4, d_total_c, fmt_cell_text_center)
        ws_deudas.write(r, 5, d_paid_c, fmt_cell_text_center)
        ws_deudas.write_formula(r, 6, f'=E{excel_r}-F{excel_r}', fmt_cell_text_center)
        ws_deudas.write(r, 7, d_cuota, fmt_cell_clp)
        ws_deudas.write_formula(r, 8, f'=G{excel_r}*H{excel_r}*(1-D{excel_r})', fmt_cell_clp)
        ws_deudas.write(r, 9, d_dia, fmt_cell_text_center)
        ws_deudas.write_formula(r, 10, f'=IF(G{excel_r}=0,"🏆 Pagada Total","Al día")', fmt_cell_text_center)

    d_end = 5 + len(deudas_data)
    ws_deudas.write(d_end, 0, 'TOTAL PASIVOS EN CUOTAS', fmt_cell_total_text)
    ws_deudas.write(d_end, 1, '', fmt_cell_total_text)
    ws_deudas.write_formula(d_end, 2, f'=SUM(C6:C{d_end})', fmt_cell_total_clp)
    ws_deudas.write(d_end, 3, '', fmt_cell_total_text)
    ws_deudas.write(d_end, 4, '', fmt_cell_total_text)
    ws_deudas.write(d_end, 5, '', fmt_cell_total_text)
    ws_deudas.write(d_end, 6, '', fmt_cell_total_text)
    ws_deudas.write_formula(d_end, 7, f'=SUM(H6:H{d_end})', fmt_cell_total_clp)
    ws_deudas.write_formula(d_end, 8, f'=SUM(I6:I{d_end})', fmt_cell_total_clp)
    ws_deudas.write(d_end, 9, '', fmt_cell_total_text)
    ws_deudas.write(d_end, 10, '', fmt_cell_total_text)

    # =============================================================
    # 8. WORKSHEET: Ingresos (Income Analysis & Categories)
    # =============================================================
    ws_ing.set_column('A:A', 26)
    ws_ing.set_column('B:B', 16)
    ws_ing.set_column('C:C', 18)
    ws_ing.set_column('D:D', 18)
    ws_ing.set_column('E:E', 18)
    ws_ing.set_column('F:F', 16)

    ws_ing.write('A2', 'ESTRUCTURA Y ANÁLISIS DE INGRESOS', fmt_title)
    ws_ing.write('A3', 'Clasificación de ingresos fijos y variables para el mes activo.', fmt_subtitle)

    ing_cols = ['Fuente de Ingreso', 'Naturaleza', 'Ingreso Mes Activo', 'Ingreso Mes Anterior', 'Variación CLP', '% Variación']
    for c_idx, c_name in enumerate(ing_cols):
        ws_ing.write(4, c_idx, c_name, fmt_tbl_hdr)

    income_sources = [
        ('Sueldo Principal', 'Fijo'),
        ('Honorarios / Freelance', 'Variable'),
        ('Bonos y Gratificaciones', 'Variable'),
        ('Rentas e Inversiones', 'Variable'),
        ('Reembolsos y Otros', 'Variable')
    ]

    for idx, (s_name, s_type) in enumerate(income_sources):
        r = 5 + idx
        excel_r = r + 1
        ws_ing.write(r, 0, s_name, fmt_cell_text)
        ws_ing.write(r, 1, s_type, fmt_cell_text_center)
        # Mes Activo: Amount=Col I, Type=Col E, Status=Col N, Month=Col P, Year=Col Q, Desc=Col H
        ws_ing.write_formula(
            r, 2,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Ingreso",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,Configuración!$C$6,Movimientos!$Q$6:$Q$5000,Configuración!$C$7,Movimientos!$H$6:$H$5000,"*"&LEFT(A{excel_r},6)&"*")',
            fmt_cell_clp
        )
        # Mes Anterior (Mes - 1)
        ws_ing.write_formula(
            r, 3,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Ingreso",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,Configuración!$C$6-1,Movimientos!$Q$6:$Q$5000,Configuración!$C$7,Movimientos!$H$6:$H$5000,"*"&LEFT(A{excel_r},6)&"*")',
            fmt_cell_clp
        )
        # Variación CLP
        ws_ing.write_formula(r, 4, f'=C{excel_r}-D{excel_r}', fmt_cell_clp)
        # % Variación
        ws_ing.write_formula(r, 5, f'=IF(D{excel_r}>0,E{excel_r}/D{excel_r},0)', fmt_cell_pct)

    i_end = 5 + len(income_sources)
    ws_ing.write(i_end, 0, 'TOTAL INGRESOS', fmt_cell_total_text)
    ws_ing.write(i_end, 1, '', fmt_cell_total_text)
    ws_ing.write_formula(i_end, 2, f'=SUM(C6:C{i_end})', fmt_cell_total_clp)
    ws_ing.write_formula(i_end, 3, f'=SUM(D6:D{i_end})', fmt_cell_total_clp)
    ws_ing.write_formula(i_end, 4, f'=C{i_end+1}-D{i_end+1}', fmt_cell_total_clp)
    ws_ing.write_formula(i_end, 5, f'=IF(D{i_end+1}>0,E{i_end+1}/D{i_end+1},0)', fmt_cell_pct)

    # =============================================================
    # 9. WORKSHEET: Proyecciones (Multi-scenario Cash Flow)
    # =============================================================
    ws_proy.set_column('A:A', 26)
    ws_proy.set_column('B:B', 18)
    ws_proy.set_column('C:C', 18)
    ws_proy.set_column('D:D', 18)
    ws_proy.set_column('E:E', 24)

    ws_proy.write('A2', 'PROYECCIONES FINANCIERAS Y ANÁLISIS DE ESCENARIOS', fmt_title)
    ws_proy.write('A3', 'Estimaciones a 3, 6 y 12 meses bajo escenarios Base, Conservador y Optimista.', fmt_subtitle)

    ws_proy.write('A5', 'ESCENARIO / HORIZONTE', fmt_tbl_hdr)
    ws_proy.write('B5', 'FLUJO NETO ESTIMADO', fmt_tbl_hdr)
    ws_proy.write('C5', 'CAPITAL PROYECTADO', fmt_tbl_hdr)
    ws_proy.write('D5', 'RIESGO DÉFICIT', fmt_tbl_hdr)
    ws_proy.write('E5', 'RECOMENDACIÓN', fmt_tbl_hdr)

    horizons = [
        ('Cierre Mes Actual (Estimado)', '=Dashboard!$D$6-Dashboard!$B$10', '=Cuentas!$H$11+B6', '=IF(C6<Configuración!$C$10,"⚠️ Alto Riesgo","🟢 Seguro")', 'Monitorear gastos variables'),
        ('3 Meses — Escenario Base', '=B6*3', '=Cuentas!$H$11+B7', '🟢 Bajo', 'Mantener tasa de ahorro 20%'),
        ('3 Meses — Escenario Conservador', '=B6*3*(1+Configuración!$C$15)', '=Cuentas!$H$11+B8', '🟡 Moderado', 'Recortar gastos discrecionales'),
        ('3 Meses — Escenario Optimista', '=B6*3*(1+Configuración!$C$17)', '=Cuentas!$H$11+B9', '🟢 Mínimo', 'Acelerar metas de inversión'),
        ('6 Meses — Escenario Base', '=B6*6', '=Cuentas!$H$11+B10', '🟢 Bajo', 'Revisar cartera de fondos'),
        ('12 Meses — Escenario Base', '=B6*12', '=Cuentas!$H$11+B11', '🟢 Sólido', 'Meta patrimonial alcanzable')
    ]

    for idx, h in enumerate(horizons):
        r = 5 + idx
        ws_proy.write(r, 0, h[0], fmt_cell_text)
        ws_proy.write_formula(r, 1, h[1], fmt_cell_clp)
        ws_proy.write_formula(r, 2, h[2], fmt_cell_clp)
        if h[3].startswith('='):
            ws_proy.write_formula(r, 3, h[3], fmt_cell_text_center)
        else:
            ws_proy.write(r, 3, h[3], fmt_cell_text_center)
        ws_proy.write(r, 4, h[4], fmt_cell_text)

    # =============================================================
    # 10. WORKSHEET: Dashboard (Main Executive Cockpit & Charts)
    # =============================================================
    ws_dash.set_column('A:A', 3)
    ws_dash.set_column('B:B', 22)
    ws_dash.set_column('C:C', 22)
    ws_dash.set_column('D:D', 22)
    ws_dash.set_column('E:E', 22)
    ws_dash.set_column('F:F', 22)
    ws_dash.set_column('G:G', 22)
    ws_dash.set_column('H:H', 22)
    ws_dash.set_column('I:I', 3)

    # Header section
    ws_dash.write('B2', 'DASHBOARD FINANCIERO INTELIGENTE', fmt_title)
    ws_dash.write('B3', 'Panel de Control Ejecutivo y Diagnóstico Automatizado | Moneda: CLP ($)', fmt_subtitle)

    # Period Selectors
    ws_dash.write('F2', 'MES CONSULTA:', fmt_selector_label)
    ws_dash.write_formula('G2', '=Configuración!$C$6', fmt_selector_value)
    ws_dash.write('H2', 'AÑO:', fmt_selector_label)
    ws_dash.write_formula('H3', '=Configuración!$C$7', fmt_selector_value)

    # -------------------------------------------------------------
    # KPI CARDS ROW 1 (Core Balances & Liquidity)
    # -------------------------------------------------------------
    # B5:B7 -> Card 1: Ingresos Totales del Mes
    ws_dash.write('B5', 'INGRESOS TOTALES (MES)', fmt_kpi_title)
    ws_dash.write_formula(
        'B6',
        '=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Ingreso",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,$G$2,Movimientos!$Q$6:$Q$5000,$H$3)',
        fmt_kpi_value_currency_green
    )
    ws_dash.write('B7', 'Efectivamente cobrados', fmt_kpi_sub)

    # C5:C7 -> Card 2: Gastos Totales del Mes
    ws_dash.write('C5', 'GASTOS TOTALES (MES)', fmt_kpi_title)
    ws_dash.write_formula(
        'C6',
        '=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Gasto",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,$G$2,Movimientos!$Q$6:$Q$5000,$H$3)',
        fmt_kpi_value_currency_red
    )
    ws_dash.write('C7', 'Excluye transferencias', fmt_kpi_sub)

    # D5:D7 -> Card 3: Saldo Neto Mensual
    ws_dash.write('D5', 'SALDO NETO MENSUAL', fmt_kpi_title)
    ws_dash.write_formula('D6', '=B6-C6', fmt_kpi_value_currency_blue)
    ws_dash.write('D7', 'Superávit / Déficit', fmt_kpi_sub)

    # E5:E7 -> Card 4: Dinero Disponible Líquido
    ws_dash.write('E5', 'DISPONIBLE EN CUENTAS', fmt_kpi_title)
    ws_dash.write_formula('E6', '=Cuentas!$H$11', fmt_kpi_value_currency)
    ws_dash.write('E7', 'Suma bancos y efectivo', fmt_kpi_sub)

    # F5:F7 -> Card 5: Tasa de Ahorro
    ws_dash.write('F5', 'TASA DE AHORRO (%)', fmt_kpi_title)
    ws_dash.write_formula('F6', '=IF(B6>0,D6/B6,0)', fmt_kpi_value_pct)
    ws_dash.write('F7', 'Meta mínima: 20%', fmt_kpi_sub)

    # G5:G7 -> Card 6: Presupuesto Total
    ws_dash.write('G5', 'PRESUPUESTO TOTAL', fmt_kpi_title)
    ws_dash.write_formula('G6', '=Presupuesto!$C$18', fmt_kpi_value_currency)
    ws_dash.write('G7', 'Asignación mensual', fmt_kpi_sub)

    # H5:H7 -> Card 7: % Presupuesto Consumido
    ws_dash.write('H5', '% PRESUPUESTO USADO', fmt_kpi_title)
    ws_dash.write_formula('H6', '=IF(G6>0,C6/G6,0)', fmt_kpi_value_pct)
    ws_dash.write('H7', 'Límite prudente: 90%', fmt_kpi_sub)

    # -------------------------------------------------------------
    # KPI CARDS ROW 2 (Detailed Operations & Health)
    # -------------------------------------------------------------
    # B9:B11 -> Gastos Comprometidos Pendientes
    ws_dash.write('B9', 'COMPROMISOS PENDIENTES', fmt_kpi_title)
    ws_dash.write_formula(
        'B10',
        '=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Gasto",Movimientos!$N$6:$N$5000,"<>Pagado",Movimientos!$P$6:$P$5000,$G$2,Movimientos!$Q$6:$Q$5000,$H$3)',
        fmt_kpi_value_currency
    )
    ws_dash.write('B11', 'Por pagar en el mes', fmt_kpi_sub)

    # C9:C11 -> Gastos Fijos del Mes
    ws_dash.write('C9', 'GASTOS FIJOS (MES)', fmt_kpi_title)
    ws_dash.write_formula(
        'C10',
        '=SUMIFS(Presupuesto!$D$6:$D$17,Presupuesto!$B$6:$B$17,"Fijo")',
        fmt_kpi_value_currency
    )
    ws_dash.write('C11', 'Vivienda, servicios, salud', fmt_kpi_sub)

    # D9:D11 -> Gastos Variables del Mes
    ws_dash.write('D9', 'GASTOS VARIABLES (MES)', fmt_kpi_title)
    ws_dash.write_formula(
        'D10',
        '=SUMIFS(Presupuesto!$D$6:$D$17,Presupuesto!$B$6:$B$17,"Variable")',
        fmt_kpi_value_currency
    )
    ws_dash.write('D11', 'Supermercado, salidas, ocio', fmt_kpi_sub)

    # E9:E11 -> Saldo Proyectado Cierre
    ws_dash.write('E9', 'SALDO PROYECTADO CIERRE', fmt_kpi_title)
    ws_dash.write_formula('E10', '=E6-B10', fmt_kpi_value_currency_blue)
    ws_dash.write('E11', 'Disponible tras pendientes', fmt_kpi_sub)

    # F9:F11 -> Comparación Mes Anterior
    ws_dash.write('F9', 'VAR. GASTO VS MES ANT.', fmt_kpi_title)
    ws_dash.write_formula(
        'F10',
        '=IF(SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Gasto",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,$G$2-1,Movimientos!$Q$6:$Q$5000,$H$3)>0,(C6-SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Gasto",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,$G$2-1,Movimientos!$Q$6:$Q$5000,$H$3))/SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Gasto",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,$G$2-1,Movimientos!$Q$6:$Q$5000,$H$3),0)',
        fmt_kpi_value_pct
    )
    ws_dash.write('F11', 'Variación intermensual', fmt_kpi_sub)

    # G9:H11 -> Health Diagnostic Status
    ws_dash.merge_range('G9:H9', 'DIAGNÓSTICO FINANCIERO DEL SISTEMA', fmt_kpi_title)
    ws_dash.merge_range(
        'G10:H10',
        '=IF(H6>1,"🚨 ALERTA: Presupuesto Excedido",IF(F6<0.1,"⚠️ ALERTA: Ahorro por debajo de meta",IF(E10<Configuración!$C$10,"⚠️ RIESGO: Saldo proyectado bajo","✅ ESTADO FINANCIERO ÓPTIMO")))',
        fmt_tbl_hdr
    )
    ws_dash.merge_range('G11:H11', 'Evaluación por motor de reglas', fmt_kpi_sub)

    # -------------------------------------------------------------
    # HISTORICAL 12-MONTH SUMMARY DATA TABLE (B48:G60)
    # -------------------------------------------------------------
    ws_dash.write('B48', 'HISTÓRICO 12 MESES (Base para Gráficos Dinámicos)', fmt_section)
    hist_cols = ['Mes N°', 'Nombre Mes', 'Ingresos CLP', 'Gastos CLP', 'Saldo Neto CLP', 'Saldo Acumulado']
    for c_idx, c_name in enumerate(hist_cols):
        ws_dash.write(49, 1 + c_idx, c_name, fmt_tbl_hdr)

    month_names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    for m_i in range(1, 13):
        r = 49 + m_i
        excel_r = r + 1
        ws_dash.write(r, 1, m_i, fmt_cell_text_center)
        ws_dash.write(r, 2, month_names[m_i - 1], fmt_cell_text_center)
        # Ingresos
        ws_dash.write_formula(
            r, 3,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Ingreso",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,B{excel_r},Movimientos!$Q$6:$Q$5000,$H$3)',
            fmt_cell_clp
        )
        # Gastos
        ws_dash.write_formula(
            r, 4,
            f'=SUMIFS(Movimientos!$I$6:$I$5000,Movimientos!$E$6:$E$5000,"Gasto",Movimientos!$N$6:$N$5000,"Pagado",Movimientos!$P$6:$P$5000,B{excel_r},Movimientos!$Q$6:$Q$5000,$H$3)',
            fmt_cell_clp
        )
        # Saldo Neto
        ws_dash.write_formula(r, 5, f'=D{excel_r}-E{excel_r}', fmt_cell_clp)
        # Saldo Acumulado
        if m_i == 1:
            ws_dash.write_formula(r, 6, f'=F{excel_r}', fmt_cell_clp)
        else:
            ws_dash.write_formula(r, 6, f'=G{excel_r-1}+F{excel_r}', fmt_cell_clp)

    # -------------------------------------------------------------
    # CHARTS INTEGRATION (6 Mandatory Charts)
    # -------------------------------------------------------------
    # CHART 1: Donut Chart - Gastos por Categoría (B13:D27)
    chart_donut = wb.add_chart({'type': 'doughnut'})
    chart_donut.add_series({
        'name': 'Distribución de Gastos',
        'categories': '=Presupuesto!$A$6:$A$17',
        'values': '=Presupuesto!$D$6:$D$17',
        'hole_size': 55,
    })
    chart_donut.set_title({'name': '1. Distribución de Gastos por Categoría'})
    chart_donut.set_style(10)
    chart_donut.set_size({'width': 450, 'height': 280})
    ws_dash.insert_chart('B13', chart_donut)

    # CHART 2: Column Chart - Ingresos vs Gastos Mensuales (E13:H27)
    chart_bar_monthly = wb.add_chart({'type': 'column'})
    chart_bar_monthly.add_series({
        'name': 'Ingresos',
        'categories': '=Dashboard!$C$50:$C$61',
        'values': '=Dashboard!$D$50:$D$61',
        'fill': {'color': GREEN_ACCENT}
    })
    chart_bar_monthly.add_series({
        'name': 'Gastos',
        'categories': '=Dashboard!$C$50:$C$61',
        'values': '=Dashboard!$E$50:$E$61',
        'fill': {'color': RED_ACCENT}
    })
    chart_bar_monthly.set_title({'name': '2. Evolución Mensual: Ingresos vs Gastos'})
    chart_bar_monthly.set_y_axis({'name': 'CLP ($)', 'major_gridlines': {'visible': True}})
    chart_bar_monthly.set_size({'width': 580, 'height': 280})
    ws_dash.insert_chart('E13', chart_bar_monthly)

    # CHART 3: Line Chart - Evolución del Patrimonio / Saldo Acumulado (B28:D42)
    chart_line_patrimonio = wb.add_chart({'type': 'line'})
    chart_line_patrimonio.add_series({
        'name': 'Saldo Neto Acumulado',
        'categories': '=Dashboard!$C$50:$C$61',
        'values': '=Dashboard!$G$50:$G$61',
        'line': {'color': NAVY_ACCENT, 'width': 2.75},
        'marker': {'type': 'circle', 'size': 6, 'fill': {'color': NAVY_DARK}}
    })
    chart_line_patrimonio.set_title({'name': '3. Evolución del Patrimonio Disponible'})
    chart_line_patrimonio.set_y_axis({'name': 'CLP ($)', 'major_gridlines': {'visible': True}})
    chart_line_patrimonio.set_size({'width': 450, 'height': 280})
    ws_dash.insert_chart('B28', chart_line_patrimonio)

    # CHART 4: Horizontal Bar Chart - Categorías con Mayor Gasto (E28:H42)
    chart_hbar_cat = wb.add_chart({'type': 'bar'})
    chart_hbar_cat.add_series({
        'name': 'Gasto Real',
        'categories': '=Presupuesto!$A$6:$A$17',
        'values': '=Presupuesto!$D$6:$D$17',
        'fill': {'color': '#6366F1'}
    })
    chart_hbar_cat.set_title({'name': '4. Categorías que Consumen Mayor Presupuesto'})
    chart_hbar_cat.set_x_axis({'name': 'CLP ($)'})
    chart_hbar_cat.set_size({'width': 580, 'height': 280})
    ws_dash.insert_chart('E28', chart_hbar_cat)

    # CHART 5: Progress Bar / Metas de Ahorro (B43:D57)
    chart_metas = wb.add_chart({'type': 'bar'})
    chart_metas.add_series({
        'name': '% Avance Meta',
        'categories': '=Metas!$A$6:$A$9',
        'values': '=Metas!$F$6:$F$9',
        'fill': {'color': GREEN_ACCENT}
    })
    chart_metas.set_title({'name': '5. Cumplimiento de Metas de Ahorro (%)'})
    chart_metas.set_x_axis({'max': 1.0, 'num_format': '0%'})
    chart_metas.set_size({'width': 450, 'height': 240})
    ws_dash.insert_chart('B43', chart_metas)

    # CHART 6: Column Chart - Presupuesto vs Real (E43:H57)
    chart_pres_vs_real = wb.add_chart({'type': 'column'})
    chart_pres_vs_real.add_series({
        'name': 'Presupuesto Asignado',
        'categories': '=Presupuesto!$A$6:$A$17',
        'values': '=Presupuesto!$C$6:$C$17',
        'fill': {'color': '#94A3B8'}
    })
    chart_pres_vs_real.add_series({
        'name': 'Gasto Real Ejecutado',
        'categories': '=Presupuesto!$A$6:$A$17',
        'values': '=Presupuesto!$D$6:$D$17',
        'fill': {'color': NAVY_ACCENT}
    })
    chart_pres_vs_real.set_title({'name': '6. Comparación: Presupuesto Asignado vs Gasto Real'})
    chart_pres_vs_real.set_y_axis({'name': 'CLP ($)'})
    chart_pres_vs_real.set_size({'width': 580, 'height': 240})
    ws_dash.insert_chart('E43', chart_pres_vs_real)

    # Close and save workbook
    wb.close()
    print(f"Successfully generated: {filename}")


if __name__ == '__main__':
    # 1. Clean Template for User Production Use
    build_workbook('Finanzas_Personales_Inteligente.xlsx', is_demo=False)
    # 2. Fully populated Demo version for immediate testing & QA inspection
    build_workbook('Finanzas_Personales_Demo.xlsx', is_demo=True)
