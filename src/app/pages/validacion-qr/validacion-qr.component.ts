import { Component, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import jsQR from 'jsqr';

@Component({
  selector: 'app-validacion-qr',
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './validacion-qr.component.html',
  styleUrl: './validacion-qr.component.scss'
})
export class ValidacionQrComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  codigo = signal('');
  isValidating = signal(false);
  validationResult = signal('');
  validationMessage = signal('');
  showResult = signal(false);
  isScanning = signal(false);
  showScanner = signal(false);
  showManualInput = signal(false);
  manualCode = signal('');
  stream: MediaStream | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    // Ya no obtenemos el código de la URL, ahora se escanea
    this.showScanner.set(true);
  }

  async startScanning() {
    try {
      this.isScanning.set(true);
      this.showResult.set(false);

      // Verificar si getUserMedia está disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia no está disponible en este navegador');
      }

      // Configuración específica para móviles
      const constraints = {
        video: {
          facingMode: 'environment', // Cámara trasera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      // Solicitar acceso a la cámara
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;

        // Esperar a que el video esté listo antes de iniciar detección
        this.videoElement.nativeElement.onloadedmetadata = () => {
          this.videoElement.nativeElement.play().then(() => {
            // Iniciar detección de códigos QR después de que el video esté reproduciéndose
            setTimeout(() => this.detectQRCode(), 1000);
          }).catch(error => {
            console.error('Error reproduciendo video:', error);
            this.validationMessage.set('Error iniciando la cámara');
            this.showResult.set(true);
            this.isScanning.set(false);
          });
        };

        // Manejar errores del video
        this.videoElement.nativeElement.onerror = (error) => {
          console.error('Error en el elemento video:', error);
          this.validationMessage.set('Error en la cámara');
          this.showResult.set(true);
          this.isScanning.set(false);
        };
      }
    } catch (error: any) {
      console.error('Error accediendo a la cámara:', error);

      // Mensajes de error específicos para diferentes casos
      let errorMessage = 'Error accediendo a la cámara. ';

      if (error.name === 'NotAllowedError') {
        errorMessage += 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración del navegador.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No se encontró cámara en el dispositivo.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'El navegador no soporta acceso a la cámara.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'La cámara está siendo usada por otra aplicación.';
      } else {
        errorMessage += 'Verifica los permisos y configuración del navegador.';
      }

      this.validationMessage.set(errorMessage);
      this.showResult.set(true);
      this.isScanning.set(false);
    }
  }

  stopScanning() {
    this.isScanning.set(false);
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  detectQRCode() {
    if (!this.isScanning() || !this.videoElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Verificar que el video tenga dimensiones válidas
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      // El video aún no está listo, reintentar en 100ms
      setTimeout(() => this.detectQRCode(), 100);
      return;
    }

    // Configurar canvas con el tamaño del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar frame actual en canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Verificar que el canvas tenga dimensiones válidas
    if (canvas.width === 0 || canvas.height === 0) {
      setTimeout(() => this.detectQRCode(), 100);
      return;
    }

    try {
      // Obtener datos de imagen para análisis
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Detectar código QR usando jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        this.stopScanning();
        this.codigo.set(code.data);
        this.validateCode(code.data);
      } else {
        // Continuar escaneando
        setTimeout(() => this.detectQRCode(), 100);
      }
    } catch (error) {
      console.error('Error en detección QR:', error);
      // Reintentar después de un breve delay
      setTimeout(() => this.detectQRCode(), 200);
    }
  }

  validateCode(code: string) {
    this.isValidating.set(true);
    this.showResult.set(false);

    // Llamar al endpoint de validación con POST
    // const validationUrl = `http://localhost:3004/garbo-cris-codes/validate/${code}`;
    const validationUrl = `https://landings-back.marcostorresalarcon.com/garbo-cris-codes/validate/${code}`;

    this.http.post(validationUrl, {}).subscribe({
      next: (response: any) => {
        this.isValidating.set(false);

        if (response.data.isActive === true) {
          this.validationResult.set('active');
          this.validationMessage.set('Código Activo');
        } else {
          this.validationResult.set('inactive');
          this.validationMessage.set('El código ya fue utilizado o no existe');
        }

        this.showResult.set(true);
      },
      error: (error) => {
        console.error('Error validando código:', error);
        this.isValidating.set(false);
        this.validationResult.set('error');
        this.validationMessage.set('Error al validar el código');
        this.showResult.set(true);
      }
    });
  }

  showManualCodeInput() {
    this.showManualInput.set(true);
    this.showScanner.set(false);
  }

  hideManualCodeInput() {
    this.showManualInput.set(false);
    this.showScanner.set(true);
  }

  validateManualCode() {
    const code = this.manualCode();
    if (code.trim()) {
      this.codigo.set(code);
      this.validateCode(code);
      this.showManualInput.set(false);
    }
  }

  goBack() {
    this.stopScanning();
    this.router.navigate(['/casagarbo-cris']);
  }

  shareEvent() {
    const shareData = {
      title: 'CRIS BDAY PARTY - Invitación',
      text: '¡Te invito a CRIS BDAY PARTY! Únete a la celebración y disfruta de cortesías especiales en la barra.',
      url: window.location.origin + '/casagarbo-cris'
    };

    if (navigator.share) {
      // Usar Web Share API nativa en móviles
      navigator.share(shareData).then(() => {
        console.log('Contenido compartido exitosamente');
      }).catch((error) => {
        console.error('Error al compartir:', error);
        this.fallbackShare(shareData);
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      this.fallbackShare(shareData);
    }
  }

  fallbackShare(shareData: any) {
    // Crear texto para compartir
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;

    // Copiar al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('¡Enlace copiado al portapapeles! Puedes pegarlo en WhatsApp, email, etc.');
      }).catch(() => {
        this.showShareModal(shareText);
      });
    } else {
      this.showShareModal(shareText);
    }
  }

  showShareModal(shareText: string) {
    // Mostrar modal con opciones de compartir
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 15px;
      max-width: 400px;
      width: 90%;
      text-align: center;
    `;

    content.innerHTML = `
      <h3 style="margin: 0 0 1rem 0; color: #1c54a3; font-family: 'Mars Extended', sans-serif;">Compartir Evento</h3>
      <p style="margin: 0 0 1rem 0; color: #666;">Copia el siguiente texto y compártelo:</p>
      <textarea readonly style="width: 100%; height: 120px; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; font-family: monospace; font-size: 0.9rem; resize: none;">${shareText}</textarea>
      <div style="margin-top: 1rem;">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #1c54a3; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 25px; cursor: pointer; font-family: 'Mars Extended', sans-serif;">Cerrar</button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  ngOnDestroy() {
    this.stopScanning();
  }
}