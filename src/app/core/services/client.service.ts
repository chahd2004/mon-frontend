import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, ClientRequest } from '../../models/client.model';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class ClientService extends BaseService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) { super(); }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, this.getHeaders());
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  createClient(client: ClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client, this.getHeaders());
  }

  updateClient(id: number, client: ClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client, this.getHeaders());
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}