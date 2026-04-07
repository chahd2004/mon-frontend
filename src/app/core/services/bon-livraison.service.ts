import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BonLivraison } from '../../models/bon-livraison.model';

@Injectable({ providedIn: 'root' })
export class BonLivraisonService {
  private readonly apiUrl = `${environment.apiUrl}/bon-livraisons`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<BonLivraison[]> {
    return this.http.get<BonLivraison[]>(this.apiUrl);
  }

  getById(id: number): Observable<BonLivraison> {
    return this.http.get<BonLivraison>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<BonLivraison> {
    return this.http.post<BonLivraison>(this.apiUrl, data);
  }

  creerDepuisCommande(payload: any): Observable<BonLivraison> {
    // Use the standard POST endpoint with commande data
    return this.http.post<BonLivraison>(this.apiUrl, {
      commandeId: payload.commandeId,
      dateCreation: payload.dateDocument,
      notes: payload.notes
    });
  }

  marquerLivre(id: number): Observable<BonLivraison> {
    return this.http.put<BonLivraison>(`${this.apiUrl}/${id}/livrer`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resoudreLitige(id: number): Observable<BonLivraison> {
    return this.http.put<BonLivraison>(`${this.apiUrl}/${id}/resoudre-litige`, {});
  }
}
