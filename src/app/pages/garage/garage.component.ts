import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../disconnection/interfaces/solar-form.interface';

@Component({
  selector: 'app-garage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GarageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly solarService = inject(SolarService);

  showForm = signal(false);
  isLoading = signal(false);
  completed = signal(false);
  form!: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      reference: ['']
    });
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
        dateOfBirth: '',
        name: this.form.value.name || '',
        email: this.form.value.email || '',
        address: this.form.value.address || '',
        phone: this.form.value.phone || '',
        local: 'garage',
        favoriteDrink: this.form.value.reference || ''
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

  get reference() {
    return this.form.get('reference');
  }
}
