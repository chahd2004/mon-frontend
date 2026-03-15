import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Facture } from '../../../models/facture.model';
import { Produit } from '../../../models/produit.model';
import { FactureService } from '../../../core/services/facture.service';
import { ProduitService } from '../../../core/services/produit.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-emetteur-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class EmetteurDashboardComponent implements OnInit {

  stats = {
    totalVentes: 0,
    montantTotal: 0,
    nombreFactures: 0,
    nombreProduits: 0,
    facturesPayees: 0,
    facturesEnAttente: 0
  };

  loading: boolean = false;
  error: string = '';

  constructor(
    private factureService: FactureService,
    private produitService: ProduitService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    const currentUser = this.authService.currentUser();
    const emetteurId = currentUser?.emetteurId;

    if (!emetteurId) {
      this.error = 'Erreur lors du chargement des données';
      this.loading = false;
      return;
    }

    // Load factures de vente
    this.factureService.getMesVentes().subscribe({
      next: (ventes: Facture[]) => {
        this.stats.nombreFactures = ventes.length;
        this.stats.montantTotal = ventes.reduce((sum, f) => sum + f.totalTTC, 0);
        this.stats.facturesPayees = ventes.filter(f => f.statut === 'PAYEE' || f.statut === 'PAYÉE').length;
        this.stats.facturesEnAttente = ventes.filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'BROUILLON').length;
        this.stats.totalVentes = ventes.length;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des factures', err);
      }
    });

    // Load produits
    this.produitService.getProduits(emetteurId).subscribe({
      next: (produits: Produit[]) => {
        this.stats.nombreProduits = produits.length;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des produits', err);
        this.loading = false;
      }
    });
  }

}
