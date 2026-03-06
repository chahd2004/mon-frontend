// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { FactureService } from './facture.service';
import { ClientService } from './client.service';

// Interface pour les statistiques du dashboard
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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private factureService: FactureService,
    private clientService: ClientService
  ) { }

  /**
   * Récupère toutes les statistiques pour le dashboard
   */
  getStats(): Observable<DashboardStats> {
    return forkJoin({
      factures: this.factureService.getFactures(1, 1000),
      clients: this.clientService.getClients()
    }).pipe(
      map(({ factures, clients }) => {
        return this.calculerStats(factures.data, clients);
      })
    );
  }

  /**
   * Calcule les statistiques à partir des données
   */
  private calculerStats(factures: any[], clients: any[]): DashboardStats {
    const anneeActuelle = new Date().getFullYear();
    
    // Statistiques factures
    const totalFactures = factures.length;
    const facturesEnAttente = factures.filter(f => f.statut === 'EN_ATTENTE').length;
    const facturesPayees = factures.filter(f => f.statut === 'PAYEE').length;
    const facturesEnRetard = factures.filter(f => f.statut === 'EN_RETARD').length;
    
    // Statistiques clients
    const totalClients = clients.length;
    
    // Calcul du chiffre d'affaires par année
    const caParAnneeMap = new Map<number, number>();
    
    factures.forEach(facture => {
      if (facture.date_emission && facture.totalttc) {
        const annee = new Date(facture.date_emission).getFullYear();
        const montantActuel = caParAnneeMap.get(annee) || 0;
        caParAnneeMap.set(annee, montantActuel + facture.totalttc);
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
    
    // Chiffre d'affaires actuel (année en cours)
    const caActuel = caParAnnee.find(ca => ca.annee === anneeActuelle)?.montant || 0;
    
    // Chiffre d'affaires année précédente
    const caPrecedent = caParAnnee.find(ca => ca.annee === anneeActuelle - 1)?.montant || 0;
    
    // Évolution en pourcentage
    const evolution = caPrecedent > 0 ? ((caActuel - caPrecedent) / caPrecedent) * 100 : 0;
    
    // Mois de l'année
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    // Données du graphique mensuel
    const valeursMensuelles = mois.map((_, index) => {
      const facturesMois = factures.filter(f => {
        if (!f.date_emission) return false;
        const date = new Date(f.date_emission);
        return date.getFullYear() === anneeActuelle && date.getMonth() === index;
      });
      return facturesMois.reduce((sum, f) => sum + (f.totalttc || 0), 0);
    });

    return {
      factures: {
        total: totalFactures,
        enAttente: facturesEnAttente,
        payees: facturesPayees,
        enRetard: facturesEnRetard
      },
      clients: {
        total: totalClients
      },
      chiffreAffaires: {
        actuel: caActuel,
        evolution: evolution,
        exercice: anneeActuelle.toString(),
        parAnnee: caParAnnee
      },
      graphiques: {
        caMensuel: {
          mois: mois,
          valeurs: valeursMensuelles
        }
      }
    };
  }

  /**
   * Récupère les dernières factures
   */
  getDernieresFactures(limit: number = 5): Observable<FactureRecente[]> {
    return this.factureService.getFactures(1, limit).pipe(
      map(response => {
        return response.data.map((f: any) => ({
          id: f.id,
          num_fact: f.num_fact,
          nom_client: f.nom_client,
          totalttc: f.totalttc,
          statut: f.statut,
          date_emission: f.date_emission
        }));
      })
    );
  }

  /**
   * Récupère les lots de factures
   */
  getFactureBatches(): Observable<FactureBatch[]> {
    return this.http.get<FactureBatch[]>(`${this.apiUrl}/factures/batches`);
  }

  /**
   * Version avec API dédiée (si tu préfères un endpoint spécifique)
   */
  getDashboardStatsFromAPI(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }
  // src/app/core/services/dashboard.service.ts
// Ajoute cette méthode dans la classe DashboardService

/**
 * Récupère les statistiques du dashboard
 */
getDashboardStats(): Observable<DashboardStats> {
  return this.getStats(); // Ou appelle directement l'API
}
}