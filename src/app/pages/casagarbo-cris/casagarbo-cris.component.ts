import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../strega/interfaces/solar-form.interface';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-casagarbo-cris',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './casagarbo-cris.component.html',
  styleUrl: './casagarbo-cris.component.scss'
})
export class CasagarboCrisComponent {
  showForm = signal(false);
  showConfirmation = signal(false);
  isLoading = signal(false);
  qrCode = signal('');
  qrUrl = signal('');
  qrImageData = signal('');
  form!: FormGroup;

  constructor(private fb: FormBuilder, private solarService: SolarService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  toggleForm() {
    this.showForm.update(value => !value);
  }

  closeConfirmation() {
    this.showConfirmation.set(false);
  }

  async shareEvent() {
    const shareData = {
      title: 'CRIS BDAY PARTY - Invitación',
      text: '¡Te invito a CRIS BDAY PARTY! Únete a la celebración y disfruta de cortesías especiales en la barra.',
      url: window.location.origin + '/casagarbo-cris'
    };

    // Si tenemos imagen QR, intentar compartir con imagen
    if (this.qrImageData()) {
      try {
        // Convertir data URL a blob
        const response = await fetch(this.qrImageData());
        const blob = await response.blob();
        const file = new File([blob], 'cris-bday-qr.png', { type: 'image/png' });

        // Intentar compartir con archivo (solo funciona en algunos navegadores móviles)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            ...shareData,
            files: [file]
          });
          console.log('QR compartido exitosamente con imagen');
          return;
        }
      } catch (error) {
        console.log('No se pudo compartir con imagen, usando método alternativo');
      }
    }

    // Fallback: compartir solo texto o mostrar modal con QR
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Contenido compartido exitosamente');
      } catch (error) {
        console.error('Error al compartir:', error);
        this.showShareModalWithQR(shareData);
      }
    } else {
      this.showShareModalWithQR(shareData);
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
        this.showShareModalWithQR(shareData);
      });
    } else {
      this.showShareModalWithQR(shareData);
    }
  }

  showShareModalWithQR(shareData: any) {
    // Crear texto para compartir
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;

    // Mostrar modal con opciones de compartir incluyendo la imagen QR
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
      padding: 1rem;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
      color: white;
      padding: 2rem;
      border-radius: 15px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
    `;

    let qrImageHtml = '';
    if (this.qrImageData()) {
      qrImageHtml = `
        <div style="margin: 1rem 0;">
          <h4 style="margin: 0 0 0.5rem 0; color: white; font-family: 'Mars Extended', sans-serif;">Tu Código QR:</h4>
          <img src="${this.qrImageData()}" alt="QR Code" style="max-width: 200px; width: 100%; height: auto; border-radius: 8px; border: 2px solid rgba(255, 255, 255, 0.2);" />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: rgba(255, 255, 255, 0.7);">Guarda esta imagen para compartirla</p>
        </div>
      `;
    }

    content.innerHTML = `
      <h3 style="margin: 0 0 1rem 0; color: white; font-family: 'Mars Extended', sans-serif;">Compartir Evento</h3>
      <p style="margin: 0 0 1rem 0; color: rgba(255, 255, 255, 0.8);">Copia el siguiente texto y compártelo:</p>
      <textarea readonly style="width: 100%; height: 120px; padding: 1rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; font-family: monospace; font-size: 0.9rem; resize: none; background: rgba(255, 255, 255, 0.05); color: white;">${shareText}</textarea>
      ${qrImageHtml}
      <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 50%, #2c2c2c 100%); color: white; border: 1px solid rgba(255, 255, 255, 0.2); padding: 0.8rem 1.5rem; border-radius: 25px; cursor: pointer; font-family: 'Mars Extended', sans-serif; text-transform: uppercase; letter-spacing: 1px;">Cerrar</button>
        ${this.qrImageData() ? `<button onclick="this.downloadQR()" style="background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 50%, #2c2c2c 100%); color: white; border: 1px solid rgba(255, 255, 255, 0.2); padding: 0.8rem 1.5rem; border-radius: 25px; cursor: pointer; font-family: 'Mars Extended', sans-serif; text-transform: uppercase; letter-spacing: 1px;">Descargar QR</button>` : ''}
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Agregar funcionalidad de descarga
    if (this.qrImageData()) {
      const downloadBtn = content.querySelector('button[onclick*="downloadQR"]');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          this.downloadQRImage();
        });
      }
    }

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  downloadQRImage() {
    if (this.qrImageData()) {
      const link = document.createElement('a');
      link.href = this.qrImageData();
      link.download = 'cris-bday-party-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async generateQRCode(code: string): Promise<string> {
    const qrUrl = code;
    this.qrUrl.set(qrUrl);

    try {
      // Generar QR como data URL (imagen)
      const qrDataURL = await QRCode.toDataURL(qrUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      this.qrImageData.set(qrDataURL);
      return qrUrl;
    } catch (error) {
      console.error('Error generando QR:', error);
      return qrUrl;
    }
  }

  async submitForm() {
    if (this.form.valid) {
      this.isLoading.set(true);
      const data: ISolarForm = {
        name: this.form.value.name || '',
        email: this.form.value.email || '',
        phone: this.form.value.phone || '',
        address: this.form.value.address || '',
        dateOfBirth: this.form.value.dateOfBirth || '',
        local: 'garbo-cris',
        favoriteDrink: 'N/A'
      };

      this.solarService.saveSolar(data).subscribe({
        next: async (response: any) => {
          console.log('Registro exitoso:', response);
          this.isLoading.set(false);
          this.showForm.set(false);

          // Generar código QR con el código retornado por el servicio
          this.qrCode.set(response.garboCrisCode);
          await this.generateQRCode(response.garboCrisCode);

          // Mostrar confirmación
          this.showConfirmation.set(true);
          this.form.reset();
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          this.isLoading.set(false);
          alert('Hubo un error al registrarte. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }
}
