import qrcode
import os

# --- INGRESA AQUÍ TU TEXTO ---
# Cambia el texto de esta variable por lo que quieras que contenga el QR.
texto_para_qr = "https://payasoloco.gruposolar.pe/payaso-loco"

# --- NOMBRE DEL ARCHIVO DE SALIDA ---
# El archivo se guardará con este nombre en la misma carpeta que el script.
nombre_del_archivo = "regs.png"

# --- GENERACIÓN DEL CÓDIGO QR ---
try:
    # Crear una instancia del generador de QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )

    # Añadir los datos
    qr.add_data(texto_para_qr)
    qr.make(fit=True)

    # Crear la imagen del QR
    img = qr.make_image(fill_color="black", back_color="white")

    # Guardar la imagen en la misma carpeta donde se ejecuta el script
    img.save(nombre_del_archivo)

    # Obtiene la ruta absoluta del archivo para mostrarla
    ruta_completa = os.path.abspath(nombre_del_archivo)
    
    print(f"🎉 ¡Éxito! Tu código QR ha sido guardado en:")
    print(f"   {ruta_completa}")

except Exception as e:
    print(f"😕 ¡Error! No se pudo generar el código QR. Razón: {e}")