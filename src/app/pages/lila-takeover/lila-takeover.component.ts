import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../disconnection/interfaces/solar-form.interface';

@Component({
  selector: 'app-lila-takeover',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lila-takeover.component.html',
  styleUrl: './lila-takeover.component.scss',
})
export class LilaTakeoverComponent {
  private fb = inject(FormBuilder);
  solarService = inject(SolarService);
  isLoading = signal<boolean>(false);
  completed = signal<boolean>(false);
  step = signal<number>(1);

  form = this.fb.group({
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    birthday: ['', [Validators.required]],
    favoriteDrink: [''],
  });

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
      local: 'lila-takeover',
    };
    this.solarService.saveSolar(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.completed.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        const status = err?.status ?? 'desconocido';
        const message = err?.message ?? 'sin mensaje';
        const errorDetail = err?.error ? JSON.stringify(err.error) : 'sin detalle';
        alert(`Error al registrar.\nStatus: ${status}\nMensaje: ${message}\nDetalle: ${errorDetail}`);
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
