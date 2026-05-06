
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SolarService } from '../strega/services/solar/solar.service';
import { ISolarForm } from '../disconnection/interfaces/solar-form.interface';
@Component({
  selector: 'app-disco-pilsen2',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './disco-pilsen2.component.html',
  styleUrl: './disco-pilsen2.component.scss',
})
export class DiscoPilsen2Component {
  private fb = inject(FormBuilder);
  solarService = inject(SolarService);
  isLoading = signal<boolean>(false);
  completed = signal<boolean>(false);
  step = signal<number>(1);
  @ViewChild('reserva') reserva!: ElementRef;
  @ViewChild('audio') audio!: ElementRef;
  @ViewChild('birthday2') birthday2!: ElementRef;
  muted = signal<boolean>(true);

  form = this.fb.group({
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required]],
    birthday: ['', [Validators.required]],
    favoriteDrink: [''],
  });

  ngOnInit() {
    console.log('init');
    console.log('init2');
  }

  saveSolar() {
    this.isLoading.set(true);
    const data: ISolarForm = {
      ...this.form.value as ISolarForm,
      dateOfBirth: this.form.value.birthday || '',
      local: 'disco-pilsen2',
    };
    this.solarService.saveSolar(data).subscribe((res) => {
      this.isLoading.set(false);
      this.completed.set(true);
    });
  }

  audioPlay() {
    //play desde  0:47
    this.audio.nativeElement.play();
  }

  toggleMuted() {
    this.muted.set(!this.muted());
    if (this.muted()) {
      this.audio.nativeElement.pause();
    } else {
      this.audioPlay();
    }
  }

  changeType() {
    this.birthday2.nativeElement.type = 'date';
  }

  goToReserva() {
    this.reserva.nativeElement.scrollIntoView({ behavior: 'smooth' });
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

  get favoriteDrink() {
    return this.form.get('favoriteDrink');
  }
}
