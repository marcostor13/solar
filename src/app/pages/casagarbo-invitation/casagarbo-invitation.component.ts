import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../strega/interfaces/solar-form.interface';

@Component({
  selector: 'app-casagarbo-invitation',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './casagarbo-invitation.component.html',
  styleUrl: './casagarbo-invitation.component.scss'
})
export class CasagarboInvitationComponent {
  showForm = signal(false);
  isLoading = signal(false);
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

  submitForm() {
    if (this.form.valid) {
      this.isLoading.set(true);
      const data: ISolarForm = {
        name: this.form.value.name || '',
        email: this.form.value.email || '',
        phone: this.form.value.phone || '',
        address: this.form.value.address || '',
        dateOfBirth: this.form.value.dateOfBirth || '',
        local: 'garbo-invitation',
        favoriteDrink: 'N/A'
      };

      this.solarService.saveSolar(data).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.isLoading.set(false);
          this.showForm.set(false);
          this.form.reset();
          alert('¡Gracias por registrarte! Te esperamos.');
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
