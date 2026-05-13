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
    if (this.form.invalid) return;
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
      error: () => {
        this.isLoading.set(false);
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
