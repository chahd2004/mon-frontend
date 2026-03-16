import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FactureService } from './facture.service';
import { ClientService } from './client.service';
import { BaseService } from './base.service';

export interface DashboardStats {
  factures: {
    total: number;
    enAttente: number;
    payees: number;
    enRetard: number;
  };
  clients: {
    total: number;
  };
  chiffreAffaires: {
    actuel: number;
    evolution: number;
    exercice: string;
    parAnnee: {
      annee: number;
      montant: number;
      debut: string;
      fin: string;
    }[];
  };
  graphiques: {
    caMensuel: {
      mois: string[];
      valeurs: number[];
    };
  };
}

export interface FactureRecente {
  id: number;
  num_fact: string;
  nom_client: string;
  totalttc: number;
  statut: string;
  date_emission: Date;
}

export interface FactureBatch {
  nom: string;
  dateCreation: string;
  montant: string;
}

export interface SuperAdminStatsResponse {
  totalUsers: number;
  totalClients: number;
  totalEmetteurs: number;
  totalFactures: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private factureService: FactureService,
    private clientService: ClientService
  ) { super(); }

  getStats(): Observable<DashboardStats> {
    return forkJoin({
      factures: this.factureService.getFactures(1, 1000),
      clients: this.clientService.getClients()
    }).pipe(
      map(({ factures, clients }) => this.calculerStats(factures.data, clients))
    );
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.getStats();
  }

  getDernieresFactures(limit: number = 5): Observable<FactureRecente[]> {
    return this.factureService.getFactures(1, limit).pipe(
      map(response => response.data.map((f: any) => ({
        id: f.id,
        num_fact: f.num_fact,
        nom_client: f.nom_client,
        totalttc: f.totalttc,
        statut: f.statut,
        date_emission: f.date_emission
      })))
    );
  }

  getFactureBatches(): Observable<FactureBatch[]> {
    return this.http.get<FactureBatch[]>(
      `${this.apiUrl}/factures/batches`,
      this.getHeaders()
    );
  }

  getDashboardStatsFromAPI(): Observable<DashboardStats> {
    // Le backend actuel n'expose pas /dashboard/stats.
    // On calcule les stats à partir des endpoints existants.
    return this.getStats();
  }

  getSuperAdminStatistics(): Observable<SuperAdminStatsResponse> {
    return this.http.get<SuperAdminStatsResponse>(
      `${this.apiUrl}/super-admin/statistiques`,
      this.getHeaders()
    );
  }

  private calculerStats(factures: any[], clients: any[]): DashboardStats {
    const anneeActuelle = new Date().getFullYear();
    const caParAnneeMap = new Map<number, number>();

    factures.forEach(f => {
      if (f.date_emission && f.totalttc) {
        const annee = new Date(f.date_emission).getFullYear();
        caParAnneeMap.set(annee, (caParAnneeMap.get(annee) || 0) + f.totalttc);
      }
    });

    const caParAnnee = Array.from(caParAnneeMap.entries())
      .map(([annee, montant]) => ({
        annee,
        montant,
        debut: `01/01/${annee}`,
        fin: `31/12/${annee}`
      }))
      .sort((a, b) => a.annee - b.annee);

    const caActuel = caParAnnee.find(ca => ca.annee === anneeActuelle)?.montant || 0;
    const caPrecedent = caParAnnee.find(ca => ca.annee === anneeActuelle - 1)?.montant || 0;
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    return {
      factures: {
        total: factures.length,
        enAttente: factures.filter(f => f.statut === 'EN_ATTENTE').length,
        payees: factures.filter(f => f.statut === 'PAYEE').length,
        enRetard: factures.filter(f => f.statut === 'EN_RETARD').length
      },
      clients: {
        total: clients.length
      },
      chiffreAffaires: {
        actuel: caActuel,
        evolution: caPrecedent > 0
          ? ((caActuel - caPrecedent) / caPrecedent) * 100
          : 0,
        exercice: anneeActuelle.toString(),
        parAnnee: caParAnnee
      },
      graphiques: {
        caMensuel: {
          mois,
          valeurs: mois.map((_, i) =>
            factures
              .filter(f =>
                f.date_emission &&
                new Date(f.date_emission).getFullYear() === anneeActuelle &&
                new Date(f.date_emission).getMonth() === i
              )
              .reduce((sum, f) => sum + (f.totalttc || 0), 0)
          )
        }
      }
    };
  }
}