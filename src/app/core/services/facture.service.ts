import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Facture, FactureRequest } from '../../models/facture.model';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class FactureService extends BaseService {
  private apiUrl = `${environment.apiUrl}/factures`;

  constructor(private http: HttpClient) { super(); }

  getAll(): Observable<Facture[]> {
    return this.http.get<Facture[]>(this.apiUrl, this.getHeaders());
  }

  getMesVentes(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}/mes-ventes`, this.getHeaders());
  }

  getMesAchats(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}/mes-achats`, this.getHeaders());
  }

  getFactureById(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  createFacture(facture: FactureRequest): Observable<Facture> {
    return this.http.post<Facture>(this.apiUrl, facture, this.getHeaders());
  }

  updateFacture(id: number, facture: FactureRequest): Observable<Facture> {
    return this.http.put<Facture>(`${this.apiUrl}/${id}`, facture, this.getHeaders());
  }

  deleteFacture(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  getFactures(page: number = 1, limit: number = 10, statut?: string, search?: string): Observable<{ data: Facture[]; total: number }> {
    return new Observable(observer => {
      this.http.get<Facture[]>(this.apiUrl, this.getHeaders()).subscribe({
        next: (list) => {
          const filtered = this.filterFactures(Array.isArray(list) ? list : [], statut, search);
          const start = (page - 1) * limit;
          observer.next({ data: filtered.slice(start, start + limit), total: filtered.length });
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getStatistiques(): Observable<any> {
    return new Observable(observer => {
      this.http.get<Facture[]>(this.apiUrl, this.getHeaders()).subscribe({
        next: (list) => {
          const arr = Array.isArray(list) ? list : [];
          observer.next({
            totalFactures: arr.length,
            facturesPayees: arr.filter(f => f.statut === 'PAYEE').length,
            facturesEnAttente: arr.filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'BROUILLON').length,
            chiffreAffaires: arr.filter(f => f.statut === 'PAYEE').reduce((s, f) => s + (f.totalTTC || 0), 0)
          });
          observer.complete();
        },
        error: () => {
          observer.next({ totalFactures: 0, facturesPayees: 0, facturesEnAttente: 0, chiffreAffaires: 0 });
          observer.complete();
        }
      });
    });
  }

  private filterFactures(list: Facture[], statut?: string, search?: string): Facture[] {
    let result = list;
    if (statut) result = result.filter(f => f.statut === statut);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(f =>
        (f.numFact || '').toLowerCase().includes(s) ||
        (f.acheteurNom || '').toLowerCase().includes(s) ||
        (f.vendeurNom || '').toLowerCase().includes(s));
    }
    return result;
  }
}