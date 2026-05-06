import { afterNextRender, ChangeDetectionStrategy, Component, inject, NgZone, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common';
import { ISolarForm } from '../disconnection/interfaces/solar-form.interface';
import { SolarService } from '../strega/services/solar/solar.service';

@Component({
  selector: 'app-booking-en',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './booking-en.component.html',
  styleUrl: './booking-en.component.scss'
})
export class BookingEnComponent {

  lang = signal('en')
  solarService = inject(SolarService);
  isLoading = signal<boolean>(false);
  completed = signal<boolean>(false);
  private route = inject(ActivatedRoute)
  date = signal(null)
  brand: string = this.route.snapshot.params['brand']

  step = signal(1)

  private fb = inject(FormBuilder)

  form = this.fb.group({
    brand: [this.brand, Validators.required],
    zone: ['' as string, Validators.required],
    name: ['', Validators.required],
    email: ['', Validators.required],
    phone: ['', Validators.required],
    date: [null as string | null, Validators.required],
    time: ['' as string, Validators.required],
    guests: [0 as number | null, Validators.required],
    authorizeCommunications: [false]
  })

  private router = inject(Router)

  public images: string[] = [
    '/gallery-garbo/1.png',
    '/gallery-garbo/2.jpg',
    '/gallery-garbo/3.jpg',
    '/gallery-garbo/4.jpg',
    '/gallery-garbo/5.jpg',
    '/gallery-garbo/6.png',
    '/gallery-garbo/7.jpg',
  ];

  optionInvites = this.generateOptionsInvites(20)
  optionTime: Array<{ label: string; value: string }> = []

  zoneOptions: Array<{ label: string; value: string; capacity: number }> = [
    { label: 'Main lounge (38 pax)', value: 'salon_principal', capacity: 38 },
    { label: 'Main bar (8 pax)', value: 'barra_principal', capacity: 8 },
    { label: 'Cave (40 pax)', value: 'cueva', capacity: 40 },
    { label: 'Terrace (12 pax)', value: 'terraza', capacity: 12 },
    { label: 'Terrace bar (3 pax)', value: 'barra_terraza', capacity: 3 },
    { label: 'Ultis zone (50 pax)', value: 'zona_ultis', capacity: 50 },
  ]


  selectedInvites = signal(1)
  selectedTime = signal<string>('')

  // DatePicker helpers
  today: Date = new Date()
  todayStr: string = this.formatDateForInput(this.today)
  // Enable only Wed(3) to Sat(6) ⇒ disable Sun(0), Mon(1), Tue(2)
  disabledDays: number[] = [0, 1, 2]

  get selectedZoneCapacity(): number {
    const zone = this.zoneOptions.find(z => z.value === this.form.controls.zone.value)
    return zone ? Math.floor(zone.capacity * 1.2) : 20
  }


  public currentIndex: number = 0;
  private intervalId?: number;

  // 2. Inyecta NgZone en el constructor
  constructor(private zone: NgZone) {
    afterNextRender(() => {
      // 3. Ejecuta el setInterval DENTRO de la zona de Angular
      this.zone.runOutsideAngular(() => {
        this.intervalId = window.setInterval(() => {
          // 4. Para la parte que MODIFICA la propiedad, vuelve a entrar a la zona
          this.zone.run(() => {
            console.log('Intervalo: Cambiando imagen.');
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
          });
        }, 6000);
      });
    });

    // React to date changes to update valid times
    this.form.controls.date.valueChanges.subscribe((dateStr: string | null) => {
      const date = this.toDateFromInput(dateStr)
      this.optionTime = this.generateOptionTime(date)
      if (!this.optionTime.some(opt => opt.value === this.form.controls.time.value)) {
        this.form.controls.time.setValue('')
      }
    })

    // React to zone changes to update guests (+20%)
    this.form.controls.zone.valueChanges.subscribe(() => {
      const maxGuests = this.selectedZoneCapacity
      this.optionInvites = this.generateOptionsInvites(maxGuests)
      const currentGuests = this.form.controls.guests.value as number | null
      if (currentGuests && currentGuests > maxGuests) {
        this.form.controls.guests.setValue(maxGuests)
      }
    })
  }

  generateOptionTime(selectedDate: Date | null) {
    // Opening rules:
    // Wed 17:00-01:00, Thu 18:00-03:00, Fri 18:00-03:00, Sat 13:00-03:00
    // Reservation limit: until 23:30
    const options: Array<{ label: string; value: string }> = []
    if (!selectedDate) {
      return options
    }

    const day = selectedDate.getDay()
    let startHour = 17
    if (day === 4 || day === 5) {
      startHour = 18
    } else if (day === 6) {
      startHour = 13
    } else if (day === 3) {
      startHour = 17
    } else {
      return options
    }

    const endHour = 23
    const endMinute = 30

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === endHour && min > endMinute) {
          break
        }
        const label = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        options.push({ label, value: label })
      }
    }
    return options
  }

  generateOptionsInvites(max: number) {
    const options: Array<{ label: string; value: number }> = []
    const upper = Math.max(1, max)
    for (let i = 1; i <= upper; i++) {
      options.push({ label: i.toString(), value: i })
    }
    return options
  }

  private formatDateForInput(date: Date): string {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  private toDateFromInput(value: string | null): Date | null {
    if (!value) return null
    const [y, m, d] = value.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  changeLang(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.lang.set(target.value);
  }

  openInstagram() {
    window.open('https://www.instagram.com/casagarbo.lima/?hl=es', '_blank');
  }

  openWhatsapp() {
    window.open('https://wa.me/987654321', '_blank');
  }

  openPhone() {
    window.open('tel:3178234567', '_blank');
  }

  openCarta() {
    window.open('/carta garbo.pdf', '_blank');
  }

  reserve() {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    console.log(this.form.value)
    this.saveBookin()
  }

  goToSpanish() {
    this.router.navigate(['/reserva']);
  }

  saveBookin() {
    this.isLoading.set(true);
    const data: ISolarForm = {
      name: this.form.value.name || '',
      email: this.form.value.email || '',
      address: this.form.value.zone || '',
      phone: this.form.value.phone || '',
      dateOfBirth: (this.form.value.date || '') + ' ' + (this.form.value.time || ''),
      local: 'garbo',
      favoriteDrink: this.form.value.guests?.toString() || '',
    };
    this.solarService.saveSolar(data).subscribe((res) => {
      this.isLoading.set(false);
      this.completed.set(true);
      this.step.set(2)
    });
  }

  // Helpers for UI validation
  get noTimeAvailability(): boolean {
    const date: Date | null = this.toDateFromInput(this.form.controls.date.value as string | null)
    return !!date && this.optionTime.length === 0
  }

  get guestsExceedCapacity(): boolean {
    const guests = this.form.controls.guests.value as number | null
    return !!guests && guests > this.selectedZoneCapacity
  }
}

// Helpers
export interface __Internal__ { }

