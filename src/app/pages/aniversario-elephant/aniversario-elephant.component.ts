import { Component, ChangeDetectionStrategy, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, signal, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../disconnection/interfaces/solar-form.interface';

@Component({
  selector: 'app-aniversario-elephant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './aniversario-elephant.component.html',
  styleUrl: './aniversario-elephant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AniversarioElephantComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('audioElement', { static: false }) audioElement!: ElementRef<HTMLAudioElement>;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  private readonly solarService = inject(SolarService);

  showForm = signal(false);
  isLoading = signal(false);
  completed = signal(false);
  isPlaying = signal(false);
  songName = 'Es un Secreto';
  form!: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      birthday: ['', [Validators.required]],
      favoriteDrink: ['']
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      if (this.audioElement?.nativeElement) {
        const audio = this.audioElement.nativeElement;
        
        audio.addEventListener('play', () => {
          this.isPlaying.set(true);
        });
        
        audio.addEventListener('pause', () => {
          this.isPlaying.set(false);
        });
        
        audio.addEventListener('ended', () => {
          this.isPlaying.set(false);
        });
      }
    });
  }

  ngAfterViewInit(): void {
    // Solo ejecutar en el navegador, no en SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Configurar video para reproducción automática en móviles
    if (this.videoElement?.nativeElement) {
      const video = this.videoElement.nativeElement;

      // Verificar que el video tiene el método play
      if (typeof video.play === 'function') {
        // Configuraciones para móviles
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.muted = true; // Necesario para autoplay en móviles

        // Intentar reproducir
        video.play().catch((error) => {
          console.log('Autoplay no permitido, se reproducirá al interactuar:', error);
        });
      }
    }
  }

  ngOnDestroy(): void {
    // Solo ejecutar en el navegador, no en SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Pausar video al destruir el componente
    if (this.videoElement?.nativeElement && typeof this.videoElement.nativeElement.pause === 'function') {
      this.videoElement.nativeElement.pause();
    }
  }

  toggleAudio(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.audioElement?.nativeElement) {
      const audio = this.audioElement.nativeElement;
      
      if (audio.paused) {
        audio.play().catch((error) => {
          console.log('Error al reproducir audio:', error);
        });
      } else {
        audio.pause();
      }
    }
  }

  openForm(): void {
    this.showForm.set(true);
  }

  changeType(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.type = 'date';
  }

  saveSolar(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      const data: ISolarForm = {
        name: this.form.value.name || '',
        email: this.form.value.email || '',
        address: this.form.value.address || '',
        phone: this.form.value.phone || '',
        dateOfBirth: this.form.value.birthday || '',
        local: 'elephant-3-aniversario',
        favoriteDrink: this.form.value.favoriteDrink || ''
      };

      this.solarService.saveSolar(data).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.completed.set(true);
          this.showForm.set(false);
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

  get name() {
    return this.form.get('name');
  }

  get address() {
    return this.form.get('address');
  }

  get phone() {
    return this.form.get('phone');
  }

  get email() {
    return this.form.get('email');
  }

  get birthday() {
    return this.form.get('birthday');
  }

  get favoriteDrink() {
    return this.form.get('favoriteDrink');
  }
}

