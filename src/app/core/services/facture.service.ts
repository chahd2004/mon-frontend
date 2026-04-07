import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Facture, FactureRequest } from '../../models/facture.model';

@Injectable({ providedIn: 'root' })
export class FactureService {
  private apiUrl = `${environment.apiUrl}/factures`; // ← corrigé

  constructor(private http: HttpClient) { }

  getAll(): Observable<Facture[]> {
    return this.http.get<Facture[]>(this.apiUrl);
  }

  getMesVentes(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}/mes-ventes`);
  }

  getMesAchats(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}/mes-achats`);
  }

  getFactureById(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}/${id}`);
  }

  createFacture(facture: FactureRequest): Observable<Facture> {
    return this.http.post<Facture>(this.apiUrl, facture);
  }

  updateFacture(id: number, facture: FactureRequest): Observable<Facture> {
    return this.http.put<Facture>(`${this.apiUrl}/${id}`, facture);
  }

  deleteFacture(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  signerFacture(id: number): Observable<Facture> {
    return this.http.put<Facture>(`${this.apiUrl}/${id}/signer`, {});
  }

  getFactures(
    page: number = 1,
    limit: number = 10,
    statut?: string,
    search?: string
  ): Observable<{ data: Facture[]; total: number }> {
    return this.http.get<Facture[]>(this.apiUrl).pipe(
      map(list => {
        const filtered = this.filterFactures(
          Array.isArray(list) ? list : [],
          statut,
          search
        );
        const start = (page - 1) * limit;
        return {
          data: filtered.slice(start, start + limit),
          total: filtered.length
        };
      })
    );
  }

  getStatistiques(): Observable<any> {
    return this.http.get<Facture[]>(this.apiUrl).pipe(
      map(list => {
        const arr = Array.isArray(list) ? list : [];
        return {
          totalFactures: arr.length,
          facturesPayees: arr.filter(f => f.statut === 'PAYEE').length,
          facturesEnAttente: arr.filter(
            f => f.statut === 'EN_ATTENTE' || f.statut === 'BROUILLON'
          ).length,
          chiffreAffaires: arr
            .filter(f => f.statut === 'PAYEE')
            .reduce((s, f) => s + (f.totalTTC || 0), 0)
        };
      })
    );
  }

  private filterFactures(
    list: Facture[],
    statut?: string,
    search?: string
  ): Facture[] {
    let result = list;
    if (statut) result = result.filter(f => f.statut === statut);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        f =>
          (f.numFact || '').toLowerCase().includes(s) ||
          (f.acheteurNom || '').toLowerCase().includes(s) ||
          (f.vendeurNom || '').toLowerCase().includes(s)
      );
    }
    return result;
  }
}