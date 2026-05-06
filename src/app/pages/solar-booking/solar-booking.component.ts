import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { CalendarModule } from 'primeng/calendar';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../disconnection/interfaces/solar-form.interface';

@Component({
    selector: 'app-solar-booking',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        SelectModule,
        InputTextModule,
        DatePickerModule,
        CalendarModule
    ],
    templateUrl: './solar-booking.component.html',
    styleUrl: './solar-booking.component.scss'
})
export class SolarBookingComponent {
    private solarService = inject(SolarService);
    private fb = inject(FormBuilder);

    isLoading = signal<boolean>(false);
    showConfirmation = signal<boolean>(false);

    // Opciones de locales
    localOptions = [
        { label: 'Elephant rooftop', value: 'elephant-rooftop' },
        { label: 'Capone', value: 'capone' },
        { label: 'Szimpla Kert', value: 'szimpla-kert' },
        { label: 'Strega rooftop', value: 'strega-rooftop' },
        { label: 'Sarita Colonia', value: 'sarita-colonia' },
        { label: 'Chupitos', value: 'chupitos' },
        { label: 'La combi', value: 'la-combi' },
        { label: 'Graffitería', value: 'graffiteria' },
        { label: 'Disconnection', value: 'disconnection' },
        { label: 'Casa Garbo', value: 'casa-garbo' },
        { label: 'Lúpulo', value: 'lupulo' },
        { label: 'La Patria', value: 'la-patria' }
    ];

    form = this.fb.group({
        local: ['', Validators.required],
        name: ['', [Validators.required, Validators.minLength(2)]],
        address: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
        email: ['', [Validators.required, Validators.email]],
        dateOfBirth: [null as Date | null, Validators.required],
        favoriteDrink: ['', Validators.required]
    });

    today = new Date();
    maxDate = new Date();

    constructor() {
        // Establecer fecha máxima como hoy
        this.maxDate.setFullYear(this.today.getFullYear() - 18);
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        const formData: ISolarForm = {
            name: this.form.value.name || '',
            email: this.form.value.email || '',
            address: this.form.value.address || '',
            phone: this.form.value.phone || '',
            dateOfBirth: this.form.value.dateOfBirth?.toISOString().split('T')[0] || '',
            local: this.form.value.local || '',
            favoriteDrink: this.form.value.favoriteDrink || ''
        };

        this.solarService.saveSolar(formData).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.showConfirmation.set(true);
            },
            error: (error) => {
                console.error('Error al enviar formulario:', error);
                this.isLoading.set(false);
                // Aquí podrías mostrar un mensaje de error
            }
        });
    }

    closeConfirmation(): void {
        this.showConfirmation.set(false);
        this.form.reset();
    }

    // Helper para obtener mensajes de error
    getFieldError(fieldName: string): string {
        const field = this.form.get(fieldName);
        if (field?.errors && field.touched) {
            if (field.errors['required']) {
                return 'Este campo es obligatorio';
            }
            if (field.errors['email']) {
                return 'Ingresa un email válido';
            }
            if (field.errors['minlength']) {
                return 'El nombre debe tener al menos 2 caracteres';
            }
            if (field.errors['pattern']) {
                return 'Ingresa un teléfono válido';
            }
        }
        return '';
    }
}
