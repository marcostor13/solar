import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ISolarForm } from '../../interfaces/solar-form.interface';
import { IRegistration } from '../../../lila-takeover-dashboard/interfaces/registration.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolarService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.api.solarUrl;

  saveSolar(data: ISolarForm): Observable<unknown> {
    return this.http.post(this.apiUrl, data);
  }

  getRegistrations(local: string, key: string): Observable<IRegistration[]> {
    return this.http.get<IRegistration[]>(`${this.apiUrl}?local=${local}&key=${encodeURIComponent(key)}`);
  }

  sendBlastEmail(local: string, key: string): Observable<{ sent: number; failed: number; total: number }> {
    return this.http.post<{ sent: number; failed: number; total: number }>(
      this.apiUrl,
      { action: 'blast-email', local, key }
    );
  }
}
