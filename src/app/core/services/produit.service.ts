import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produit, ProduitRequest } from '../../models/produit.model';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class ProduitService extends BaseService {
  private apiUrl = `${environment.apiUrl}/produits`; // ← corrigé

  constructor(private http: HttpClient) { super(); }

  getProduits(emetteurId?: number | null): Observable<Produit[]> {
    const id = typeof emetteurId === 'number' && emetteurId > 0 ? emetteurId : null;
    const url = id !== null ? `${this.apiUrl}/emetteur/${id}` : this.apiUrl;
    return this.http.get<Produit[]>(url);
  }

  getProduitById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  createProduit(produit: ProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  updateProduit(id: number, produit: ProduitRequest): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit);
  }

  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}