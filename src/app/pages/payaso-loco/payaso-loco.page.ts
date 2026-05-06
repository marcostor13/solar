import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../strega/interfaces/solar-form.interface';
import { PayasoLocoFormComponent } from './ui/payaso-loco-form.component';

type SubmitPayload = Pick<
  ISolarForm,
  'name' | 'email' | 'address' | 'phone' | 'dateOfBirth' | 'local'
> & { favoriteDrink: ISolarForm['favoriteDrink'] };

@Component({
  selector: 'app-payaso-loco-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PayasoLocoFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-dvh bg-black text-white selection:bg-orange-500/30">
      <div class="mx-auto w-full max-w-xl px-4 pb-10 pt-10 sm:pt-14">
        <header class="flex flex-col items-center text-center">
          <img
            class="h-28 w-28 select-none drop-shadow-[0_0_22px_rgba(249,115,22,0.25)] sm:h-32 sm:w-32"
            src="/payaso-loco/payaso%20loco%20naranja.png"
            alt="Payaso Loco"
            width="128"
            height="128"
            loading="eager"
            decoding="async"
          />

          <h1 class="mt-5 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Payaso Loco
          </h1>
          <p class="mt-2 text-pretty text-sm text-white/70 sm:text-base">
            Completa el formulario y te contactaremos.
          </p>
        </header>

        <section class="mt-8">
          @if (isCompleted()) {
            <div
              class="rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/10 to-black p-6 text-center shadow-[0_0_0_1px_rgba(249,115,22,0.08)]"
            >
              <p class="text-lg font-semibold">
                Gracias, estaremos en contacto contigo
              </p>

              <a
                class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-black shadow-lg shadow-orange-500/20 transition will-change-transform hover:-translate-y-0.5 hover:bg-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-0"
                href="https://www.instagram.com/payasolocobar?igsh=cWd0b2lteTUxZDV1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Seguir en Instagram
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  class="h-5 w-5"
                  fill="currentColor"
                >
                  <path
                    d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm4.75-.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z"
                  />
                </svg>
              </a>
            </div>
          } @else {
            <div
              class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)] sm:p-6"
            >
              <app-payaso-loco-form
                [form]="form"
                [isLoading]="isLoading()"
                [errorMessage]="errorMessage()"
                (submitForm)="onSubmit()"
              />
            </div>

            <a
              class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/35 bg-orange-500/10 px-4 py-3.5 text-base font-bold text-orange-100 shadow-[0_0_0_1px_rgba(249,115,22,0.08)] transition hover:bg-orange-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              href="https://www.instagram.com/payasolocobar?igsh=cWd0b2lteTUxZDV1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Seguir en Instagram
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                class="h-5 w-5"
                fill="currentColor"
              >
                <path
                  d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm4.75-.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z"
                />
              </svg>
            </a>
          }
        </section>

        
      </div>
    </main>
  `,
})
export class PayasoLocoPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly solarService = inject(SolarService);

  readonly isLoading = signal(false);
  readonly isCompleted = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    address: this.fb.control('', [Validators.required]),
    phone: this.fb.control('', [Validators.required]),
    dateOfBirth: this.fb.control('', [Validators.required]),
    local: this.fb.control('payaso-loco', [Validators.required]),
  });

  private readonly payload = computed<SubmitPayload>(() => ({
    ...this.form.getRawValue(),
    favoriteDrink: '',
  }));

  onSubmit(): void {
    this.errorMessage.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.solarService
      .saveSolar(this.payload())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.isCompleted.set(true),
        error: () => this.errorMessage.set('Ocurrió un error. Intenta nuevamente.'),
      });
  }
}


