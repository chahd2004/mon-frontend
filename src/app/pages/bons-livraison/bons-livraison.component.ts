import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { CommandeService } from '../../core/services/commande.service';
import { BonCommandeService } from '../../core/services/bon-commande.service';
import { BonCommande } from '../../models/bon-commande.model';
import { AuthService } from '../../core/services/auth.service';
import { BonLivraisonService } from '../../core/services/bon-livraison.service';
import { BonLivraison } from '../../models/bon-livraison.model';
import { formatDocumentReference } from '../../shared/utils/reference-format.util';

interface BonLivraisonView {
  sourceId: number;
  numeroBL: string;
  commandeLiee: string;
  client: string;
  dateLivraison: string;
  statut: 'DRAFT' | 'DELIVERED' | 'SIGNED_CLIENT' | 'DISPUTE';
  disputeReason?: string;
}

@Component({
  selector: 'app-bons-livraison',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bons-livraison.component.html',
  styleUrls: ['./bons-livraison.component.scss']
})
export class BonsLivraisonComponent implements OnInit {
  private readonly commandeService = inject(CommandeService);
  private readonly bonCommandeService = inject(BonCommandeService);
  private readonly bonLivraisonService = inject(BonLivraisonService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  showStats = true;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  selectedStatus: 'ALL' | 'DRAFT' | 'DELIVERED' | 'SIGNED_CLIENT' | 'DISPUTE' = 'ALL';

  displayConvertModal = false;
  loadingConfirmedCommandes = false;
  converting = false;
  conversionSearch = '';
  conversionNotes = '';
  selectedCommandeId: number | null = null;

  rawBonsLivraison: BonLivraison[] = [];
  rawCommandes: BonCommande[] = [];

  readonly statusOptions: Array<'DRAFT' | 'DELIVERED' | 'SIGNED_CLIENT' | 'DISPUTE'> = [
    'DRAFT',
    'DELIVERED',
    'SIGNED_CLIENT',
    'DISPUTE'
  ];

  get isViewer(): boolean {
    return this.authService.hasRole('ENTREPRISE_VIEWER');
  }

  get bonsLivraison(): BonLivraisonView[] {
    return this.rawBonsLivraison.map(item => ({
      sourceId: item.id,
      numeroBL: item.numBonLivraison || this.formatBLReference(item),
      commandeLiee: item.commandeSourceRef || '-',
      client: item.acheteurNom || '-',
      dateLivraison: item.dateLivraison || item.dateCreation || '',
      statut: this.toLivraisonStatus(item.statut),
      disputeReason: item.disputeReason || undefined
    }));
  }

  get filteredBonsLivraison(): BonLivraisonView[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.bonsLivraison.filter(item => {
      const statusOk = this.selectedStatus === 'ALL' || item.statut === this.selectedStatus;
      if (!statusOk) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        item.numeroBL.toLowerCase().includes(term) ||
        item.commandeLiee.toLowerCase().includes(term) ||
        item.client.toLowerCase().includes(term)
      );
    });
  }

  get totalBL(): number {
    return this.filteredBonsLivraison.length;
  }

  get deliveredCount(): number {
    return this.filteredBonsLivraison.filter(item => item.statut === 'DELIVERED').length;
  }

  get signedCount(): number {
    return this.filteredBonsLivraison.filter(item => item.statut === 'SIGNED_CLIENT').length;
  }

  get disputeCount(): number {
    return this.filteredBonsLivraison.filter(item => item.statut === 'DISPUTE').length;
  }

  get draftCount(): number {
    return this.filteredBonsLivraison.filter(item => item.statut === 'DRAFT').length;
  }

  get disputes(): BonLivraisonView[] {
    return this.filteredBonsLivraison.filter(item => item.statut === 'DISPUTE');
  }

  get confirmedCommandes(): BonCommande[] {
    const term = this.conversionSearch.trim().toLowerCase();
    // Filter for LIVREE (DELIVERED) commandes
    const list = this.rawCommandes.filter(item => (item.statut || '').toUpperCase() === 'LIVREE' || (item.statut || '').toUpperCase() === 'DELIVERED');

    if (!term) {
      return list;
    }

    return list.filter(item => {
      const num = (item.numBonCommande || '').toLowerCase();
      const formattedNum = this.formatCommandeReference(item).toLowerCase();
      const client = (item.acheteurNom || '').toLowerCase();
      return num.includes(term) || formattedNum.includes(term) || client.includes(term);
    });
  }

  ngOnInit(): void {
    this.loadSourceLivraisons();
  }

  loadSourceLivraisons(): void {
    this.loading = true;
    this.errorMessage = '';

    this.bonLivraisonService.getAll().subscribe({
      next: (list) => {
        this.rawBonsLivraison = Array.isArray(list) ? list : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les bons de livraison depuis le backend.';
      }
    });
  }

  nouveauBL(): void {
    this.router.navigate(['/bons-livraison/nouveau']);
  }

  depuisCommande(): void {
    this.displayConvertModal = true;
    this.conversionSearch = '';
    this.conversionNotes = '';
    this.selectedCommandeId = null;
    this.loadingConfirmedCommandes = true;
    this.errorMessage = '';

    this.commandeService.getAll().subscribe({
      next: (list) => {
        this.rawCommandes = Array.isArray(list) ? list : [];
        this.loadingConfirmedCommandes = false;
      },
      error: () => {
        this.loadingConfirmedCommandes = false;
        this.errorMessage = 'Impossible de charger les commandes livrees.';
      }
    });
  }

  fermerConvertModal(): void {
    this.displayConvertModal = false;
    this.conversionSearch = '';
    this.conversionNotes = '';
    this.selectedCommandeId = null;
  }

  convertirCommandeSelectionnee(): void {
    if (!this.selectedCommandeId) {
      this.errorMessage = 'Veuillez selectionner une commande livree.';
      return;
    }

    this.converting = true;
    this.errorMessage = '';

    const dateDocument = new Date().toISOString().slice(0, 10);

    // Get the selected commande
    const selectedCommande = this.rawCommandes.find(c => c.id === this.selectedCommandeId);
    if (!selectedCommande) {
      this.errorMessage = 'Commande non trouvee.';
      this.converting = false;
      return;
    }

    // Verify there are lignes
    if (!selectedCommande.lignes || selectedCommande.lignes.length === 0) {
      this.errorMessage = 'La commande selectionnee n\'a pas de lignes.';
      this.converting = false;
      return;
    }

    // Build bon de livraison payload with commande data
    const bonLivraisonPayload = {
      dateCreation: dateDocument,
      acheteurId: selectedCommande.acheteurId,
      typeAcheteur: 'CLIENT',
      vendeurId: selectedCommande.vendeurId,
      modePaiement: selectedCommande.modePaiement || 'VIREMENT',
      statut: 'DRAFT',
      lignes: (selectedCommande.lignes || []).map(ligne => ({
        produitId: ligne.produitId,
        produitDesignation: ligne.produitDesignation,
        quantite: ligne.quantite
      })),
      notes: this.conversionNotes || null
    };

    this.bonLivraisonService.create(bonLivraisonPayload).subscribe({
      next: () => {
        this.converting = false;
        this.fermerConvertModal();
        this.successMessage = 'Commande convertie en bon de livraison avec succes.';
        this.loadSourceLivraisons();
      },
      error: (error) => {
        this.converting = false;
        console.error('Erreur complète:', error);
        console.error('Message backend:', error?.error);

        // Affiche le message d'erreur détaillé
        let messageErreur = 'Erreur lors de la conversion en bon de livraison.';
        if (error?.error?.message) {
          messageErreur = error.error.message;
        } else if (error?.error?.error) {
          messageErreur = error.error.error;
        } else if (error?.error?.errors) {
          messageErreur = Object.values(error.error.errors).join(', ');
        } else if (typeof error?.error === 'string') {
          messageErreur = error.error;
        }

        this.errorMessage = messageErreur;
      }
    });
  }

  toggleStats(): void {
    this.showStats = !this.showStats;
  }

  exporter(): void {
    const data = this.filteredBonsLivraison;
    if (!data.length) {
      return;
    }

    const headers = ['NumeroBL', 'CommandeLiee', 'Client', 'DateLivraison', 'Statut'];
    const rows = data.map(item => [item.numeroBL, item.commandeLiee, item.client, item.dateLivraison || '', item.statut]);

    const csv = [headers, ...rows]
      .map(line => line.map(value => `"${String(value).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bons-livraison-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  voirBL(item: BonLivraisonView): void {
    this.router.navigate(['/bons-livraison/view', item.sourceId]);
  }

  marquerLivre(item: BonLivraisonView): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.bonLivraisonService.marquerLivre(item.sourceId).subscribe({
      next: () => {
        this.successMessage = `Bon de livraison ${item.numeroBL} marque livre et email envoye au client.`;
        this.loadSourceLivraisons();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || `Impossible de marquer ${item.numeroBL} comme livre.`;
      }
    });
  }

  supprimerBL(item: BonLivraisonView): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.bonLivraisonService.delete(item.sourceId).subscribe({
      next: () => {
        this.successMessage = `Bon de livraison ${item.numeroBL} supprime.`;
        this.loadSourceLivraisons();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || `Suppression impossible pour ${item.numeroBL}.`;
      }
    });
  }

  resoudreLitige(item: BonLivraisonView): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.bonLivraisonService.resoudreLitige(item.sourceId).subscribe({
      next: () => {
        this.successMessage = `Litige resolu pour ${item.numeroBL}.`;
        this.loadSourceLivraisons();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || `Resolution du litige impossible pour ${item.numeroBL}.`;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'draft',
      DELIVERED: 'delivered',
      SIGNED_CLIENT: 'signed-client',
      DISPUTE: 'dispute'
    };

    return map[status] || 'draft';
  }

  private toLivraisonStatus(raw?: string | null): 'DRAFT' | 'DELIVERED' | 'SIGNED_CLIENT' | 'DISPUTE' {
    const value = (raw || '').toUpperCase();

    if (value === 'DRAFT') {
      return 'DRAFT';
    }

    if (value === 'SIGNED_CLIENT') {
      return 'SIGNED_CLIENT';
    }

    if (value === 'DELIVERED' || value === 'CONFIRMED' || value === 'CONVERTED' || value === 'SENT') {
      return 'DELIVERED';
    }

    if (value === 'DISPUTE' || value === 'CANCELLED') {
      return 'DISPUTE';
    }

    return 'DRAFT';
  }

  formatBonCommandeReference(item: BonCommande): string {
    return formatDocumentReference('BC', item.numBonCommande, item.dateCreation, item.id);
  }

  formatCommandeReference(item: BonCommande): string {
    return formatDocumentReference('CMD', item.numBonCommande, item.dateCreation, item.id);
  }

  private formatBLReference(item: BonLivraison): string {
    return formatDocumentReference('BL', item.numBonLivraison, item.dateCreation, item.id);
  }

}
