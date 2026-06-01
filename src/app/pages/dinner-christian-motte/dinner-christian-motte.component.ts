import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../disconnection/interfaces/solar-form.interface';

@Component({
  selector: 'app-dinner-christian-motte',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dinner-christian-motte.component.html',
  styleUrl: './dinner-christian-motte.component.scss',
})
export class DinnerChristianMotteComponent {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

  private fb = inject(FormBuilder);
  solarService = inject(SolarService);
  isLoading = signal<boolean>(false);
  completed = signal<boolean>(false);
  step = signal<number>(1);
  videoStarted = signal<boolean>(false);
  videoEnded = signal<boolean>(false);

  form = this.fb.group({
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    birthday: ['', [Validators.required]],
    favoriteDrink: [''],
  });

  startVideo() {
    this.videoStarted.set(true);
    const video = this.videoEl.nativeElement;
    video.play().catch(() => {
      // Fallback: browser blocked audio despite gesture — play muted
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
      local: 'dinner-christian-motte',
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
