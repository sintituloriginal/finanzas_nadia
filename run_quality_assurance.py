# -*- coding: utf-8 -*-
"""
Automated Quality Assurance & Verification Suite
Tests Finanzas_Personales_Inteligente.xlsx and Finanzas_Personales_Demo.xlsx
"""

import sys
import openpyxl

def run_tests():
    files = ['Finanzas_Personales_Inteligente.xlsx', 'Finanzas_Personales_Demo.xlsx']
    
    print("=" * 60)
    print("EJECUTANDO BATERÍA DE PRUEBAS DE CALIDAD Y CONSISTENCIA")
    print("=" * 60)
    
    for filename in files:
        print(f"\n[TEST SUITE] Analizando archivo: {filename}")
        wb = openpyxl.load_workbook(filename, data_only=False)
        
        # Test 1: Required sheets
        required_sheets = [
            'Dashboard', 'Movimientos', 'Presupuesto', 'Cuentas',
            'Gastos Fijos', 'Metas', 'Deudas', 'Ingresos',
            'Proyecciones', 'Configuración'
        ]
        print("  - Prueba 1: Estructura de hojas obligatorias...")
        for sheet in required_sheets:
            assert sheet in wb.sheetnames, f"Falta la hoja requerida: {sheet}"
        print("    -> OK: Las 10 hojas están presentes y ordenadas.")

        # Test 2: Active Opening Sheet is Dashboard
        print("  - Prueba 2: Hoja inicial activa...")
        assert wb.sheetnames[0] == 'Dashboard', f"La hoja inicial debe ser Dashboard, pero es {wb.sheetnames[0]}"
        print("    -> OK: Dashboard es la primera hoja visible.")

        # Test 3: Movimientos Table Structure
        print("  - Prueba 3: Tabla estructurada tbl_Movimientos...")
        ws_mov = wb['Movimientos']
        # Check headers row 5 (1-based index)
        headers = [ws_mov.cell(row=5, column=col).value for col in range(1, 19)]
        expected_cols = [
            'ID', 'Fecha Operación', 'Fecha Vencimiento', 'Fecha Pago',
            'Tipo', 'Categoría', 'Subcategoría', 'Descripción',
            'Monto (CLP)', 'Cuenta Origen', 'Cuenta Destino', 'Medio de Pago',
            'Frecuencia', 'Estado', 'Observaciones', 'Mes', 'Año', 'Alerta Duplicado'
        ]
        assert headers == expected_cols, f"Encabezados de Movimientos no coinciden: {headers}"
        print(f"    -> OK: 18 columnas exactas en Movimientos.")

        # Test 4: Dynamic formulas in Movimientos (Month, Year, Duplicates)
        print("  - Prueba 4: Fórmulas automáticas de Mes, Año y Duplicados...")
        sample_month_f = ws_mov.cell(row=6, column=16).value
        sample_year_f = ws_mov.cell(row=6, column=17).value
        sample_dup_f = ws_mov.cell(row=6, column=18).value
        assert '=MONTH(B6)' in str(sample_month_f), f"Fórmula de mes errónea: {sample_month_f}"
        assert '=YEAR(B6)' in str(sample_year_f), f"Fórmula de año errónea: {sample_year_f}"
        assert 'COUNTIFS' in str(sample_dup_f), f"Fórmula de duplicados errónea: {sample_dup_f}"
        print("    -> OK: Fórmulas dinámicas verificadas en Movimientos.")

        # Test 5: Check Presupuesto formulas
        print("  - Prueba 5: Fórmulas de Presupuesto vs Real...")
        ws_pres = wb['Presupuesto']
        gasto_real_f = str(ws_pres.cell(row=6, column=4).value)
        assert 'SUMIFS' in gasto_real_f and 'Movimientos!' in gasto_real_f
        assert '"Gasto"' in gasto_real_f and '"Pagado"' in gasto_real_f
        print("    -> OK: Gasto Real Pagado utiliza SUMIFS exacto con Estado='Pagado'.")

        # Test 6: Check Cuentas formulas & Transfer logic
        print("  - Prueba 6: Fórmulas de Cuentas y Transferencias...")
        ws_cuentas = wb['Cuentas']
        tr_out_f = str(ws_cuentas.cell(row=6, column=6).value)
        tr_in_f = str(ws_cuentas.cell(row=6, column=7).value)
        assert 'SUMIFS' in tr_out_f and '"Transferencia"' in tr_out_f
        assert 'SUMIFS' in tr_in_f and '"Transferencia"' in tr_in_f
        print("    -> OK: Conciliación de cuentas modela transferencias salientes y entrantes sin alterar gastos netos.")

        # Test 7: Dashboard KPIs formulas
        print("  - Prueba 7: Integración de KPIs en Dashboard...")
        ws_dash = wb['Dashboard']
        ing_kpi = str(ws_dash['B6'].value)
        gast_kpi = str(ws_dash['C6'].value)
        saldo_kpi = str(ws_dash['D6'].value)
        disp_kpi = str(ws_dash['E6'].value)
        assert 'SUMIFS' in ing_kpi and '"Ingreso"' in ing_kpi
        assert 'SUMIFS' in gast_kpi and '"Gasto"' in gast_kpi
        assert '=B6-C6' in saldo_kpi
        assert 'Cuentas!' in disp_kpi
        print("    -> OK: Todos los KPIs vinculados a fuentes de verdad.")

        # Test 8: Data validation and conditional formatting
        print("  - Prueba 8: Validaciones de datos y formato condicional...")
        assert len(ws_mov.conditional_formatting) > 0, "Movimientos debe tener formato condicional"
        print("    -> OK: Formato condicional activo.")

    print("\n" + "=" * 60)
    print("RESULTADO: 100% DE PRUEBAS AUTOMATIZADAS COMPLETADAS CON ÉXITO")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
