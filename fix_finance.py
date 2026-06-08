import os

filepath = 'src/pages/Finance.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'report.summary.': 'report.resumen.',
    'total_personnel': 'total_personal',
    'total_shifts': 'total_turnos',
    'total_hours': 'total_horas',
    'total_gross': 'total_bruto',
    'report.month': 'report.mes',
    'report.year': 'report.anio',
    'report.period': 'report.periodo',
    'report.payroll': 'report.prenomina',
    'person.shift_count': 'person.cant_turnos',
    'person.breakdown': 'person.desglose',
    'line.date': 'line.fecha',
    'line.hours': 'line.horas',
    'line.rate': 'line.tarifa',
    'line.gross': 'line.bruto',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finance.tsx corregido.")
