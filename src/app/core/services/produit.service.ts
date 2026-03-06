// src/app/core/services/produit.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produit, ProduitRequest } from '../../models/produit.model';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les produits.
   * Backend: GET /api/produits (tous) ou GET /api/produits/emetteur/{emetteurId} (par émetteur).
   * On n'utilise le path emetteur que si emetteurId est un nombre > 0 (évite /emetteur/undefined ou /emetteur/0).
   */
  getProduits(emetteurId?: number | null): Observable<Produit[]> {
    const id = typeof emetteurId === 'number' && emetteurId > 0 ? emetteurId : null;
    if (id !== null) {
      return this.http.get<Produit[]>(`${this.apiUrl}/emetteur/${id}`);
    }
    return this.http.get<Produit[]>(this.apiUrl);
  }

  /**
   * Récupère un produit par son ID
   */
  getProduitById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau produit
   */
  createProduit(produit: ProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  /**
   * Met à jour un produit
   */
  updateProduit(id: number, produit: ProduitRequest): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit);
  }

  /**
   * Supprime un produit
   */
  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
