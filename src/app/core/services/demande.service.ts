import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDemandeRequest } from '../../models/demande.models';

export interface DemandeResponse {
  id: number;
  code: string;
  raisonSociale: string;
  email: string;
  status: string;
  dateSoumission: string;
  message?: string;
}

export interface DemandeStatusResponse {
  email: string;
  statut: string;
}

@Injectable({ providedIn: 'root' })
export class DemandeService {
  private readonly API_URL = 'http://localhost:8080/api/public/demandes';

  constructor(private http: HttpClient) {}

  /**
   * Soumettre une demande de création d'entreprise
   */
  soumettreDemande(request: CreateDemandeRequest): Observable<DemandeResponse> {
    return this.http.post<DemandeResponse>(`${this.API_URL}/emetteur`, request);
  }

  /**
   * Vérifier le statut d'une demande par email
   */
  verifierStatut(email: string): Observable<DemandeStatusResponse> {
    return this.http.get<DemandeStatusResponse>(`${this.API_URL}/statut`, {
      params: { email }
    });
  }

  /**
   * Vérifier si une ​demande existe déjà pour cet email
   */
  existeDemande(email: string): Observable<{ existe: boolean }> {
    return this.http.get<{ existe: boolean }>(`${this.API_URL}/existe`, {
      params: { email }
    });
  }
}
