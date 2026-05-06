#!/usr/bin/env python3
"""
Script para generar códigos QR
Instalar dependencias: pip install qrcode[pil]
"""

import qrcode
import sys
import os
from PIL import Image

def generate_qr_code(data, filename=None, size=200):
    """
    Genera un código QR y lo guarda como imagen
    
    Args:
        data (str): Datos a codificar en el QR
        filename (str): Nombre del archivo (opcional)
        size (int): Tamaño de la imagen QR
    
    Returns:
        str: Ruta del archivo generado
    """
    # Crear instancia del generador QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    # Agregar datos
    qr.add_data(data)
    qr.make(fit=True)
    
    # Crear imagen
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Redimensionar si es necesario
    if size != 200:
        img = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Generar nombre de archivo si no se proporciona
    if not filename:
        # Crear directorio qr-codes si no existe
        os.makedirs('qr-codes', exist_ok=True)
        filename = f"qr-codes/qr_{hash(data) % 10000}.png"
    
    # Guardar imagen
    img.save(filename)
    
    return filename

def generate_qr_for_url(base_url, code):
    """
    Genera QR para URL de validación
    
    Args:
        base_url (str): URL base de la plataforma
        code (str): Código único
    
    Returns:
        str: Ruta del archivo QR generado
    """
    url = f"{base_url}/validacion-qr?codigo={code}"
    filename = f"qr-codes/qr_validation_{code}.png"
    return generate_qr_code(url, filename)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python generate_qr.py <datos> [archivo] [tamaño]")
        print("Ejemplo: python generate_qr.py 'http://localhost:4200/validacion-qr?codigo=12345' qr_12345.png 300")
        sys.exit(1)
    
    data = sys.argv[1]
    filename = sys.argv[2] if len(sys.argv) > 2 else None
    size = int(sys.argv[3]) if len(sys.argv) > 3 else 200
    
    try:
        result_file = generate_qr_code(data, filename, size)
        print(f"QR generado exitosamente: {result_file}")
    except Exception as e:
        print(f"Error generando QR: {e}")
        sys.exit(1)
