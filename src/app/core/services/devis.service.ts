import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Devis, DevisRequest } from '../../models/devis.model';

@Injectable({ providedIn: 'root' })
export class DevisService {
  private readonly apiUrl = `${environment.apiUrl}/devis`;
  private readonly conversionApiUrl = `${environment.apiUrl}/conversions`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Devis[]> {
    return this.http.get<Devis[]>(this.apiUrl);
  }

  getById(id: number): Observable<Devis> {
    return this.http.get<Devis>(`${this.apiUrl}/${id}`);
  }

  create(payload: DevisRequest): Observable<Devis> {
    return this.http.post<Devis>(this.apiUrl, payload);
  }

  update(id: number, payload: DevisRequest): Observable<Devis> {
    return this.http.put<Devis>(`${this.apiUrl}/${id}`, payload);
  }

  envoyer(id: number): Observable<Devis> {
    return this.http.put<Devis>(`${this.apiUrl}/${id}/envoyer`, {});
  }

  accepter(id: number): Observable<Devis> {
    return this.http.put<Devis>(`${this.apiUrl}/${id}/accepter`, {});
  }

  rejeter(id: number, raison: string): Observable<Devis> {
    return this.http.put<Devis>(`${this.apiUrl}/${id}/rejeter`, { raison });
  }

  convertirEnBonCommande(id: number, dateDocument: string): Observable<unknown> {
    return this.http.post(
      `${this.conversionApiUrl}/devis/${id}/vers-bon-commande`,
      { dateDocument }
    );
  }

  convertirEnFactureDirecte(
    id: number,
    dateDocument: string,
    modePaiement: 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'CARTE',
    datePaiement: string
  ): Observable<{ id?: number; numFact?: string }> {
    return this.http.post<{ id?: number; numFact?: string }>(
      `${this.conversionApiUrl}/devis/${id}/vers-facture`,
      { dateDocument, modePaiement, datePaiement }
    );
  }
}
