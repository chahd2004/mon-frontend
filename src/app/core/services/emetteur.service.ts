// src/app/core/services/emetteur.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Emetteur, EmetteurRequest } from '../../models/emetteur.model';

@Injectable({
  providedIn: 'root'
})
export class EmetteurService {
  private apiUrl = `${environment.apiUrl}/emetteurs`;

  constructor(private http: HttpClient) {}

  getEmetteurs(): Observable<Emetteur[]> {
    return this.http.get<Emetteur[]>(this.apiUrl);
  }

  getEmetteurById(id: number): Observable<Emetteur> {
    return this.http.get<Emetteur>(`${this.apiUrl}/${id}`);
  }

  createEmetteur(emetteur: EmetteurRequest): Observable<Emetteur> {
    return this.http.post<Emetteur>(this.apiUrl, emetteur);
  }

  updateEmetteur(id: number, emetteur: EmetteurRequest): Observable<Emetteur> {
    return this.http.put<Emetteur>(`${this.apiUrl}/${id}`, emetteur);
  }

  deleteEmetteur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
