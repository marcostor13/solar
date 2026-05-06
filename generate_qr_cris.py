#!/usr/bin/env python3
"""
Script para generar códigos QR para CRIS BDAY PARTY
Uso: python generate_qr_cris.py <codigo>
"""

import qrcode
import sys
import os
from PIL import Image

def generate_cris_qr(code):
    """
    Genera un QR específico para CRIS BDAY PARTY
    
    Args:
        code (str): Código único para el QR
    
    Returns:
        str: Ruta del archivo generado
    """
    # URL de validación
    url = f"http://localhost:4200/validacion-qr?codigo={code}"
    
    # Configuración del QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    # Agregar datos
    qr.add_data(url)
    qr.make(fit=True)
    
    # Crear imagen
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Crear directorio si no existe
    os.makedirs('qr-codes', exist_ok=True)
    
    # Nombre del archivo
    filename = f"qr-codes/cris_qr_{code}.png"
    
    # Guardar imagen
    img.save(filename)
    
    print(f"QR generado para código {code}: {filename}")
    print(f"URL: {url}")
    
    return filename

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python generate_qr_cris.py <codigo>")
        print("Ejemplo: python generate_qr_cris.py ABC123")
        sys.exit(1)
    
    code = sys.argv[1]
    
    try:
        generate_cris_qr(code)
    except Exception as e:
        print(f"Error generando QR: {e}")
        sys.exit(1)
