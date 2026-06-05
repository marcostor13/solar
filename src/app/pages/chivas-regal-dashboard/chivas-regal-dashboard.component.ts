import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Workbook } from 'exceljs';
import { SolarService } from '../strega/services/solar/solar.service';
import { IRegistration } from './interfaces/registration.interface';

@Component({
  selector: 'app-chivas-regal-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './chivas-regal-dashboard.component.html',
  styleUrl: './chivas-regal-dashboard.component.scss',
})
export class ChivasRegalDashboardComponent {
  private solarService = inject(SolarService);

  registrations = signal<IRegistration[]>([]);
  isLoading = signal(false);
  error = signal('');
  adminKey = signal('');
  searchTerm = signal('');
  filterReferido = signal('');
  authenticated = signal(false);

  isSendingBlast = signal(false);
  blastResult = signal<{ sent: number; failed: number; total: number } | null>(null);
  blastError = signal('');

  referidoOptions = computed(() => {
    const values = this.registrations()
      .map((r) => r.favoriteDrink?.trim())
      .filter((v): v is string => !!v);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  });

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const ref = this.filterReferido();
    return this.registrations().filter((r) => {
      const matchesTerm =
        !term ||
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.phone.toLowerCase().includes(term) ||
        (r.favoriteDrink || '').toLowerCase().includes(term);
      const matchesRef = !ref || (r.favoriteDrink?.trim() === ref);
      return matchesTerm && matchesRef;
    });
  });

  load() {
    if (!this.adminKey()) return;
    this.isLoading.set(true);
    this.error.set('');
    this.solarService.getRegistrations('chivas-regal', this.adminKey()).subscribe({
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

  sendBlastEmail() {
    const total = this.registrations().length;
    if (!total) return;
    const confirmed = window.confirm(
      `¿Enviar el correo de invitación a los ${total} invitados registrados?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    this.isSendingBlast.set(true);
    this.blastResult.set(null);
    this.blastError.set('');

    this.solarService.sendBlastEmail('chivas-regal', this.adminKey()).subscribe({
      next: (res) => {
        this.blastResult.set(res);
        this.isSendingBlast.set(false);
      },
      error: (err) => {
        this.blastError.set(err.status === 401 ? 'No autorizado.' : 'Error al enviar correos.');
        this.isSendingBlast.set(false);
      },
    });
  }

  async exportExcel() {
    const mod = await import('exceljs');
    const ExcelJS = (mod as any).default ?? mod;
    const wb: Workbook = new ExcelJS.Workbook();
    wb.creator = 'CHIVAS REGAL — Garbo Dinner';
    wb.created = new Date();

    const ws = wb.addWorksheet('Registros', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
    });

    const GOLD        = 'FFB8860B';
    const GOLD_MID    = 'FFD4A017';
    const GOLD_LIGHT  = 'FFFFF8E1';
    const WHITE       = 'FFFFFFFF';
    const GRAY_TEXT   = 'FF6B7280';
    const BORDER      = 'FFFDE68A';

    ws.getColumn(1).width = 6;
    ws.getColumn(2).width = 28;
    ws.getColumn(3).width = 32;
    ws.getColumn(4).width = 16;
    ws.getColumn(5).width = 35;
    ws.getColumn(6).width = 14;
    ws.getColumn(7).width = 28;
    ws.getColumn(8).width = 20;

    // Row 1: Título
    ws.mergeCells('A1:H1');
    const title = ws.getCell('A1');
    title.value = 'CHIVAS REGAL 18 — Garbo Dinner';
    title.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD } };
    title.font   = { name: 'Calibri', bold: true, size: 20, color: { argb: WHITE } };
    title.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 48;

    // Row 2: Subtítulo
    ws.mergeCells('A2:H2');
    const sub = ws.getCell('A2');
    sub.value = `Exportado el ${new Date().toLocaleString('es-PE')}  ·  Total: ${this.filtered().length} registros`;
    sub.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_LIGHT } };
    sub.font  = { name: 'Calibri', size: 10, italic: true, color: { argb: GRAY_TEXT } };
    sub.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 22;

    // Row 3: Separador
    ws.mergeCells('A3:H3');
    ws.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_MID } };
    ws.getRow(3).height = 4;

    // Row 4: Encabezados
    const COLS = ['#', 'Nombre', 'Email', 'Teléfono', 'Dirección', 'Cumpleaños', 'Referido por', 'Registrado'];
    const headerRow = ws.addRow(COLS);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD } };
      cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: WHITE } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top:    { style: 'medium', color: { argb: GOLD } },
        left:   { style: 'medium', color: { argb: GOLD } },
        bottom: { style: 'medium', color: { argb: GOLD } },
        right:  { style: 'medium', color: { argb: GOLD } },
      };
    });

    // Rows 5+: Datos
    this.filtered().forEach((r, i) => {
      const row = ws.addRow([
        i + 1,
        r.name,
        r.email,
        r.phone,
        r.address || '—',
        this.formatDate(r.dateOfBirth),
        r.favoriteDrink || '—',
        this.formatDateTime(r.createdAt),
      ]);
      row.height = 22;
      const bg = i % 2 === 0 ? WHITE : GOLD_LIGHT;
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.border = {
          top:    { style: 'thin', color: { argb: BORDER } },
          left:   { style: 'thin', color: { argb: BORDER } },
          bottom: { style: 'thin', color: { argb: BORDER } },
          right:  { style: 'thin', color: { argb: BORDER } },
        };
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'center' : 'left' };
      });
    });

    ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: 8 } };
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chivas-regal-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
