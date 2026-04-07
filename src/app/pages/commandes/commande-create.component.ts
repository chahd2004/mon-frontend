import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { CommandeService } from '../../core/services/commande.service';
import { ClientService } from '../../core/services/client.service';
import { ProduitService } from '../../core/services/produit.service';
import { AuthService } from '../../core/services/auth.service';
import { Client, RegionTunisie } from '../../models/client.model';
import { Produit } from '../../models/produit.model';

interface CommandeLineForm {
  produitId: number | null;
  quantite: number;
}

/**
 * Commande Create Component
 * - Creates a new Commande directly to `/api/commandes`
 * - Different from BonCommande creation
 */
@Component({
  selector: 'app-commande-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commande-create.component.html',
  styleUrls: ['./commande-create.component.scss']
})
export class CommandeCreateComponent implements OnInit {
  private readonly commandeService = inject(CommandeService);
  private readonly clientService = inject(ClientService);
  private readonly produitService = inject(ProduitService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  clients: Client[] = [];
  produits: Produit[] = [];

  clientId: number | null = null;
  dateEmission = this.formatDate(new Date());
  modePaiement: 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'CARTE' = 'VIREMENT';
  conditionPaiement = '30 jours net';

  lignes: CommandeLineForm[] = [{ produitId: null, quantite: 1 }];
  notes = '';

  loading = false;
  errorMessage = '';

  // Enum mappings for backend
  private readonly modePaiementEnum: Record<string, string> = {
    'VIREMENT': 'VIREMENT',
    'CHEQUE': 'CHEQUE',
    'ESPECES': 'ESPECES',
    'CARTE': 'CARTE'
  };

  ngOnInit(): void {
    this.loadClients();
    this.loadProduits();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (list) => {
        this.clients = list;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des clients.';
      }
    });
  }

  loadProduits(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser?.emetteurId) {
      return;
    }

    this.produitService.getProduits(currentUser.emetteurId).subscribe({
      next: (list) => {
        this.produits = list;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des produits.';
      }
    });
  }

  ajouterLigne(): void {
    this.lignes.push({ produitId: null, quantite: 1 });
  }

  supprimerLigne(index: number): void {
    if (this.lignes.length > 1) {
      this.lignes.splice(index, 1);
    }
  }

  retourAuxCommandes(): void {
    this.router.navigate(['/commandes']);
  }

  enregistrerBrouillon(): void {
    const currentUser = this.authService.currentUser();
    const vendeurId = currentUser?.emetteurId;

    if (!this.clientId) {
      this.errorMessage = 'Veuillez selectionner un client.';
      return;
    }

    if (!vendeurId) {
      this.errorMessage = 'Aucun emetteur associe au compte connecte.';
      return;
    }

    // Validate at least one line with all required fields
    const validLignes = this.lignes.filter(ligne => ligne.produitId && ligne.quantite > 0);
    if (!validLignes.length) {
      this.errorMessage = 'Veuillez ajouter au moins une ligne de commande avec un produit et une quantite.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      acheteurId: this.clientId,
      vendeurId: vendeurId,
      typeAcheteur: 'CLIENT', // Assuming client type for now
      dateCreation: this.dateEmission,
      modePaiement: this.modePaiement,
      lignes: validLignes.map(ligne => ({
        produitId: ligne.produitId,
        quantite: ligne.quantite
      })),
      notes: this.notes || undefined
    };

    console.log('Sending payload:', payload);

    this.commandeService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        console.log('Commande created successfully');
        this.router.navigate(['/commandes']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating commande:', error);
        this.errorMessage = error?.error?.message || 'Erreur lors de l\'enregistrement de la commande.';
      }
    });
  }
}
