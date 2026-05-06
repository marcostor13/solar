import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../strega/interfaces/solar-form.interface';

@Component({
  selector: 'app-casa-garbo-chandon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './casa-garbo-chandon.component.html',
  styleUrl: './casa-garbo-chandon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CasaGarboChandonComponent {
  private readonly fb = inject(FormBuilder);
  private readonly solarService = inject(SolarService);

  showForm = signal(false);
  isLoading = signal(false);
  isSubmitted = signal(false);
  form!: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required],
      favoriteDrink: ['']
    });
  }

  goToForm(): void {
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  submitForm(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      const data: ISolarForm = {
        name: this.form.value.name || '',
        email: this.form.value.email || '',
        phone: this.form.value.phone || '',
        address: this.form.value.address || '',
        dateOfBirth: this.form.value.dateOfBirth || '',
        local: 'chandon',
        favoriteDrink: this.form.value.favoriteDrink || ''
      };

      this.solarService.saveSolar(data).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSubmitted.set(true);
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
