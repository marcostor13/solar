# Sistema QR para CRIS BDAY PARTY

## Descripción

Sistema completo de registro y validación QR para el evento CRIS BDAY PARTY en Casa Garbo.

## Flujo del Sistema

### 1. Registro de Usuario

- Usuario accede a `/casagarbo-cris`
- Completa formulario de registro
- Servicio retorna código único
- Se genera QR automáticamente

### 2. Confirmación

- Pantalla de confirmación muestra:
  - "CRIS BDAY PARTY"
  - Mensaje de agradecimiento
  - QR Code generado
  - Descripción de beneficios

### 3. Validación QR

- Usuario accede a `/validacion-qr`
- Presiona botón "Escanear Código QR"
- Sistema accede a la cámara del dispositivo
- Escanea código QR automáticamente
- Valida código llamando a: `POST http://localhost:3004/garbo-cris-codes/validate/12345`

## Respuestas de Validación

### Código Activo

- Mensaje: "Código Activo"
- Color: Verde
- Icono: ✓

### Código Inactivo

- Mensaje: "El código ya fue utilizado o no existe"
- Color: Rojo
- Icono: ✗

### Error de Validación

- Mensaje: "Error al validar el código"
- Color: Amarillo
- Icono: ⚠

## Instalación y Configuración

### Frontend (Angular)

```bash
# Instalar dependencias QR
npm install qrcode jsqr
npm install @types/qrcode --save-dev
```

### Backend (Python - Opcional)

```bash
# Instalar dependencias Python
pip install qrcode[pil]
```

## Scripts Disponibles

### Generar QR desde Python

```bash
# Generar QR para código específico
python generate_qr_cris.py ABC123

# Generar QR genérico
python generate_qr.py "http://localhost:4200/validacion-qr?codigo=12345" qr_12345.png 300
```

### Generar QR desde JavaScript/TypeScript

```typescript
import { generateQRCode, generateValidationQR } from "./utils/qr-generator";

// Generar QR para validación
const qrDataURL = await generateValidationQR("http://localhost:4200", "ABC123");

// Generar QR genérico
const qrDataURL = await generateQRCode("http://localhost:4200/validacion-qr?codigo=ABC123");
```

## Endpoints Requeridos

### Servicio de Registro

- **URL:** Configurado en `SolarService`
- **Respuesta esperada:** `{ code: "ABC123", ... }`

### Servicio de Validación

- **URL:** `http://localhost:3004/garbo-cris-codes/validate/ABC123`
- **Método:** POST
- **Payload:** `{}` (vacío)
- **Respuesta esperada:** `{ active: true/false }`

## Archivos del Sistema

### Componentes Angular

- `src/app/pages/casagarbo-cris/` - Registro y confirmación
- `src/app/pages/validacion-qr/` - Validación de códigos
- `src/app/utils/qr-generator.ts` - Utilidades QR

### Scripts Python

- `generate_qr_cris.py` - Generador específico para CRIS
- `generate_qr.py` - Generador genérico

### Rutas

- `/casagarbo-cris` - Página de registro
- `/validacion-qr?codigo=ABC123` - Validación de código

## Características

### Diseño Responsivo

- Optimizado para móviles
- Diseño minimalista
- Fondo con imagen `party2.png`

### Generación QR

- QR automático después del registro
- Imagen visual del código QR
- URL de validación integrada

### Validación en Tiempo Real

- Escaneo automático con cámara del dispositivo
- Detección QR usando librería jsQR
- Estados visuales claros
- Manejo de errores
- Interfaz optimizada para móviles

## Beneficios del QR

- Shot de bienvenida
- Cerveza de bienvenida
- Cocktail de bienvenida

## Notas Técnicas

- Usa librería `qrcode` para generación
- Usa librería `jsQR` para detección y escaneo
- Signals de Angular para reactividad
- HttpClient para validación
- API de cámara del navegador (getUserMedia)
- Diseño con Tailwind CSS y fuentes personalizadas
- Optimizado para dispositivos móviles
