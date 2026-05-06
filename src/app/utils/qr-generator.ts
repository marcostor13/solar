/**
 * Script para generar códigos QR en el frontend
 * Requiere la librería qrcode.js
 * Instalar con: npm install qrcode
 */

// Función para generar QR usando la librería qrcode
export function generateQRCode(data: string, canvasId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Importar dinámicamente la librería qrcode
        import('qrcode').then(QRCode => {
            const canvas = document.createElement('canvas');

            QRCode.toCanvas(canvas, data, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    // Convertir canvas a data URL
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                }
            });
        }).catch(reject);
    });
}

// Función para generar QR y mostrarlo en un elemento
export async function displayQRCode(data: string, elementId: string): Promise<void> {
    try {
        const dataURL = await generateQRCode(data);
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<img src="${dataURL}" alt="QR Code" style="max-width: 100%; height: auto;" />`;
        }
    } catch (error) {
        console.error('Error generando QR:', error);
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<p>Error generando QR: ${error}</p>`;
        }
    }
}

// Función para generar QR para validación
export function generateValidationQR(baseUrl: string, code: string): Promise<string> {
    const url = `${baseUrl}/validacion-qr?codigo=${code}`;
    return generateQRCode(url);
}

// Función para descargar QR como imagen
export async function downloadQRCode(data: string, filename: string = 'qr-code.png'): Promise<void> {
    try {
        const dataURL = await generateQRCode(data);
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error descargando QR:', error);
    }
}
