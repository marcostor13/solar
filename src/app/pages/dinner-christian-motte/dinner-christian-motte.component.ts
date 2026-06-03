import { Component, inject, signal, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../disconnection/interfaces/solar-form.interface';

const PROMOTERS: Record<string, string> = {
  AZ01: 'Afi Zuñiga',
  DR02: 'Daniela Roda',
  TR03: 'Tatiana Rodríguez',
  XP04: 'Ximena Piaggio',
  FL05: 'Francesca Lertora',
  PC06: 'Pierina Cavagnari',
  CC07: 'Cynthia Castillo',
  GD08: 'Gisella Diaz',
  PM09: 'Paola Mendiola',
  CG10: 'Charo Garcia',
  GS11: 'Ghya Sifuentes',
  EB12: 'Eliana Berendson',
  PP13: 'Paola Parodi',
  BC14: 'Barbara Canseco',
  AS15: 'Arianne Strobach',
  JC16: 'Johana Chanamé',
  JT17: 'Javi Tolmos',
  CG18: 'Carolina Guerra',
  VT19: 'Vivian Távara',
  KT20: 'Karla Toledo',
  CM21: 'Christian Motte',
  AR22: 'Andrea Roman',
  JO23: 'Julio Olcese',
  SV24: 'Sandra Valdez',
  PM25: 'Paola Mendiola',
  CR26: 'Carmen Rivera-Schreiber',
  JU27: 'Julio',
  HA28: 'Hans',
};

@Component({
  selector: 'app-dinner-christian-motte',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dinner-christian-motte.component.html',
  styleUrl: './dinner-christian-motte.component.scss',
})
export class DinnerChristianMotteComponent implements OnInit {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  solarService = inject(SolarService);
  isLoading = signal<boolean>(false);
  completed = signal<boolean>(false);
  step = signal<number>(1);
  videoStarted = signal<boolean>(false);
  videoEnded = signal<boolean>(false);
  promoLocked = signal<string>('');

  form = this.fb.group({
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    birthday: ['', [Validators.required]],
    favoriteDrink: [''],
  });

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('promo')?.toUpperCase();
    if (code && PROMOTERS[code]) {
      const name = PROMOTERS[code];
      this.promoLocked.set(name);
      this.form.get('favoriteDrink')?.setValue(`Referido por: ${name}`);
    }
  }

  startVideo() {
    this.videoStarted.set(true);
    const video = this.videoEl.nativeElement;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => this.videoEnded.set(true));
    });
  }

  onVideoEnded() {
    this.videoEnded.set(true);
  }

  onVideoError() {
    this.videoEnded.set(true);
  }

  skipVideo() {
    this.videoEnded.set(true);
  }

  saveSolar() {
    if (this.form.invalid) {
      const invalidFields = Object.entries(this.form.controls)
        .filter(([, ctrl]) => ctrl.invalid)
        .map(([key]) => key)
        .join(', ');
      alert(`Formulario inválido. Campos con error: ${invalidFields}`);
      return;
    }
    this.isLoading.set(true);
    const data: ISolarForm = {
      ...this.form.value as ISolarForm,
      dateOfBirth: this.form.value.birthday || '',
      local: 'chivas-regal',
    };
    this.solarService.saveSolar(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.completed.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        const backendMsg = err?.error?.error;
        if (err?.status === 409) {
          alert('Ya existe un registro con este email para este evento.');
        } else {
          alert(backendMsg ?? 'Error al registrar. Intenta de nuevo.');
        }
      },
    });
  }

  get name() { return this.form.get('name'); }
  get address() { return this.form.get('address'); }
  get phone() { return this.form.get('phone'); }
  get email() { return this.form.get('email'); }
  get birthday() { return this.form.get('birthday'); }
  get favoriteDrink() { return this.form.get('favoriteDrink'); }
}
