import os
import glob

# Diccionario de reemplazo
replacements = {
    "first_name": "nombres",
    "last_name": "apellidos",
    "dni": "cedula",
    "specialty": "especialidad",
    "max_weekly_hours": "horas_max_semanales",
    "apt_for_night_shifts": "apto_nocturno",
    "photo": "foto",
    "personnel_details": "detalles_personal",
    "consulting_room": "consultorio",
    "start_time": "hora_inicio",
    "end_time": "hora_fin",
    "service_details": "detalles_servicio"
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for old, new in replacements.items():
        # Reemplazar considerando límites de palabras para evitar reemplazos parciales
        import re
        # Reemplazo seguro considerando que son propiedades
        new_content = re.sub(r'\b' + old + r'\b', new, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Modificado: {filepath}")

# Buscar archivos .tsx y .ts
for file in glob.glob("src/**/*.tsx", recursive=True) + glob.glob("src/**/*.ts", recursive=True):
    process_file(file)

print("Proceso de reemplazo finalizado.")
