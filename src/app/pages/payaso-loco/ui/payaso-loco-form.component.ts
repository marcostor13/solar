import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

type PayasoLocoFormModel = FormGroup<{
  name: import('@angular/forms').FormControl<string>;
  email: import('@angular/forms').FormControl<string>;
  address: import('@angular/forms').FormControl<string>;
  phone: import('@angular/forms').FormControl<string>;
  dateOfBirth: import('@angular/forms').FormControl<string>;
  local: import('@angular/forms').FormControl<string>;
}>;

@Component({
  selector: 'app-payaso-loco-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="space-y-4" [formGroup]="form" (ngSubmit)="submitForm.emit()">
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="mb-1 block text-sm font-semibold tracking-wide text-white/70">
            Nombre completo
          </label>
          <input
            class="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-base text-white placeholder:text-white/30 shadow-inner shadow-black/40 outline-none transition focus:border-orange-400/50 focus:ring-2 focus:ring-orange-500/20"
            placeholder="Tu nombre"
            type="text"
            formControlName="name"
            autocomplete="name"
          />
          @if (isInvalid('name')) {
            <p class="mt-1 text-sm text-orange-300">Este campo es obligatorio.</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-semibold tracking-wide text-white/70">
            Email
          </label>
          <input
            class="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-base text-white placeholder:text-white/30 shadow-inner shadow-black/40 outline-none transition focus:border-orange-400/50 focus:ring-2 focus:ring-orange-500/20"
            placeholder="tucorreo@dominio.com"
            type="email"
            formControlName="email"
            autocomplete="email"
            inputmode="email"
          />
          @if (isInvalid('email')) {
            <p class="mt-1 text-sm text-orange-300">Ingresa un email válido.</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-semibold tracking-wide text-white/70">
            Dirección
          </label>
          <input
            class="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-base text-white placeholder:text-white/30 shadow-inner shadow-black/40 outline-none transition focus:border-orange-400/50 focus:ring-2 focus:ring-orange-500/20"
            placeholder="Tu dirección"
            type="text"
            formControlName="address"
            autocomplete="street-address"
          />
          @if (isInvalid('address')) {
            <p class="mt-1 text-sm text-orange-300">Este campo es obligatorio.</p>
          }
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-semibold tracking-wide text-white/70">
              Teléfono
            </label>
            <input
              class="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-base text-white placeholder:text-white/30 shadow-inner shadow-black/40 outline-none transition focus:border-orange-400/50 focus:ring-2 focus:ring-orange-500/20"
              placeholder="+56 9 1234 5678"
              type="tel"
              formControlName="phone"
              autocomplete="tel"
              inputmode="tel"
            />
            @if (isInvalid('phone')) {
              <p class="mt-1 text-sm text-orange-300">Este campo es obligatorio.</p>
            }
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold tracking-wide text-white/70">
              Fecha de nacimiento
            </label>
            <input
              class="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-base text-white placeholder:text-white/30 shadow-inner shadow-black/40 outline-none transition focus:border-orange-400/50 focus:ring-2 focus:ring-orange-500/20"
              type="date"
              formControlName="dateOfBirth"
              autocomplete="bday"
            />
            @if (isInvalid('dateOfBirth')) {
              <p class="mt-1 text-sm text-orange-300">Este campo es obligatorio.</p>
            }
          </div>
        </div>
      </div>

      <input type="hidden" formControlName="local" />

      @if (errorMessage) {
        <div class="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
          {{ errorMessage }}
        </div>
      }

      <button
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-base font-extrabold text-black shadow-lg shadow-orange-500/20 transition will-change-transform hover:-translate-y-0.5 hover:bg-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        [disabled]="isLoading"
      >
        @if (isLoading) {
          <span
            class="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"
            aria-hidden="true"
          ></span>
          Enviando...
        } @else {
          Enviar
        }
      </button>

      <p class="text-center text-sm text-white/50">
        Al enviar, aceptas que te contactemos con la información proporcionada.
      </p>
    </form>
  `,
})
export class PayasoLocoFormComponent {
  @Input({ required: true }) form!: PayasoLocoFormModel;
  @Input({ required: true }) isLoading!: boolean;
  @Input() errorMessage: string | null = null;

  @Output() submitForm = new EventEmitter<void>();

  isInvalid(controlName: keyof PayasoLocoFormModel['controls']): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }
}


