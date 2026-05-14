import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolarService } from '../strega/services/solar/solar.service';
import { IRegistration } from './interfaces/registration.interface';

@Component({
  selector: 'app-lila-takeover-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './lila-takeover-dashboard.component.html',
  styleUrl: './lila-takeover-dashboard.component.scss',
})
export class LilaTakeoverDashboardComponent {
  private solarService = inject(SolarService);

  registrations = signal<IRegistration[]>([]);
  isLoading = signal(false);
  error = signal('');
  adminKey = signal('');
  searchTerm = signal('');
  filterDrink = signal('');
  authenticated = signal(false);

  drinkOptions = computed(() => {
    const values = this.registrations()
      .map((r) => r.favoriteDrink?.trim())
      .filter((v): v is string => !!v);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  });

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const drink = this.filterDrink();
    return this.registrations().filter((r) => {
      const matchesTerm =
        !term ||
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.phone.toLowerCase().includes(term) ||
        (r.favoriteDrink || '').toLowerCase().includes(term);
      const matchesDrink = !drink || (r.favoriteDrink?.trim() === drink);
      return matchesTerm && matchesDrink;
    });
  });

  load() {
    if (!this.adminKey()) return;
    this.isLoading.set(true);
    this.error.set('');
    this.solarService.getRegistrations('lila-takeover', this.adminKey()).subscribe({
      next: (data) => {
        this.registrations.set(data);
        this.authenticated.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.error.set('Clave incorrecta. Verifica e intenta de nuevo.');
        } else if (err.status === 503) {
          this.error.set('Sin conexión a la base de datos. Revisa el IP Whitelist en MongoDB Atlas.');
        } else {
          this.error.set('Error al cargar los datos. Intenta de nuevo.');
        }
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  exportCsv() {
    const headers = [
      'Nombre',
      'Email',
      'Teléfono',
      'Dirección',
      'Cumpleaños',
      'Invitado por',
      'Fecha de registro',
    ];
    const rows = this.filtered().map((r) => [
      r.name,
      r.email,
      r.phone,
      r.address,
      r.dateOfBirth,
      r.favoriteDrink || '—',
      this.formatDateTime(r.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lila-takeover-registros-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
