import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { BonCommandeService } from '../../core/services/bon-commande.service';
import { BonCommande } from '../../models/bon-commande.model';
import { AuthService } from '../../core/services/auth.service';
import { DevisService } from '../../core/services/devis.service';
import { Devis } from '../../models/devis.model';
import { formatDocumentReference } from '../../shared/utils/reference-format.util';

@Component({
  selector: 'app-bon-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bon-commandes.component.html',
  styleUrls: ['./bon-commandes.component.scss']
})
export class BonCommandesComponent implements OnInit {
  private readonly bonCommandeService = inject(BonCommandeService);
  private readonly devisService = inject(DevisService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  bonCommandes: BonCommande[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  showStats = true;
  selectedStatus: 'ALL' | string = 'ALL';

  readonly statusOptions: string[] = ['DRAFT', 'SENT', 'SIGNED_CLIENT', 'CONFIRMED', 'CONVERTED', 'CANCELLED'];

  get filteredBonCommandes(): BonCommande[] {
    if (this.selectedStatus === 'ALL') {
      return this.bonCommandes;
    }

    return this.bonCommandes.filter(item => item.statut === this.selectedStatus);
  }

  displayConvertModal = false;
  loadingAcceptedDevis = false;
  converting = false;
  conversionSearch = '';
  conversionNotes = '';
  selectedDevisId: number | null = null;
  acceptedDevis: Devis[] = [];

  get isViewer(): boolean {
    return this.authService.hasRole('ENTREPRISE_VIEWER');
  }

  ngOnInit(): void {
    this.loadBonCommandes();
  }

  loadBonCommandes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.bonCommandeService.getAll().subscribe({
      next: (list) => {
        this.bonCommandes = Array.isArray(list) ? list : [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les bons de commande depuis le backend.';
        this.loading = false;
      }
    });
  }

  nouveauBC(): void {
    this.router.navigate(['/bons-commandes/nouveau']);
  }

  depuisDevis(): void {
    this.openConvertModal();
  }

  toggleStats(): void {
    this.showStats = !this.showStats;
  }

  voirBC(id: number): void {
    this.router.navigate(['/bons-commandes', 'view', id]);
  }

  modifierBC(id: number): void {
    this.router.navigate(['/bons-commandes/nouveau'], { queryParams: { editId: id } });
  }

  envoyerBC(id: number): void {
    this.bonCommandeService.envoyer(id).subscribe({
      next: () => {
        this.loadBonCommandes();
      },
      error: () => {
        this.errorMessage = `Impossible d'envoyer le bon de commande #${id}.`;
      }
    });
  }

  openConvertModal(): void {
    this.displayConvertModal = true;
    this.conversionSearch = '';
    this.conversionNotes = '';
    this.selectedDevisId = null;
    this.loadingAcceptedDevis = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.devisService.getAll().subscribe({
      next: (list) => {
        const devis = Array.isArray(list) ? list : [];
        this.acceptedDevis = devis.filter(item => item.statut === 'ACCEPTED');
        this.loadingAcceptedDevis = false;
      },
      error: () => {
        this.loadingAcceptedDevis = false;
        this.errorMessage = 'Impossible de charger les devis acceptes.';
      }
    });
  }

  closeConvertModal(): void {
    this.displayConvertModal = false;
    this.conversionSearch = '';
    this.conversionNotes = '';
    this.selectedDevisId = null;
  }

  get filteredAcceptedDevis(): Devis[] {
    const term = this.conversionSearch.trim().toLowerCase();
    if (!term) {
      return this.acceptedDevis;
    }

    return this.acceptedDevis.filter(item => {
      const num = item.numDevis?.toLowerCase() || '';
      const formattedNum = this.formatDevisReference(item).toLowerCase();
      const client = item.acheteurNom?.toLowerCase() || '';
      return num.includes(term) || formattedNum.includes(term) || client.includes(term);
    });
  }

  convertirDevisSelectionne(): void {
    if (!this.selectedDevisId) {
      this.errorMessage = 'Veuillez selectionner un devis accepte a convertir.';
      return;
    }

    this.converting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const dateDocument = new Date().toISOString().slice(0, 10);

    this.devisService.convertirEnBonCommande(this.selectedDevisId, dateDocument).subscribe({
      next: () => {
        this.converting = false;
        this.closeConvertModal();
        this.successMessage = 'Devis converti en bon de commande avec succes.';
        this.loadBonCommandes();
      },
      error: (error) => {
        this.converting = false;
        this.errorMessage = error?.error?.message || 'Erreur lors de la conversion du devis en bon de commande.';
      }
    });
  }

  totalByStatut(statut: string): number {
    return this.filteredBonCommandes.filter(item => item.statut === statut).length;
  }

  get statusStats(): Array<{ status: string; count: number }> {
    const counts = new Map<string, number>();
    for (const item of this.filteredBonCommandes) {
      const status = item.statut || 'DRAFT';
      counts.set(status, (counts.get(status) || 0) + 1);
    }

    const order: Record<string, number> = {
      DRAFT: 1,
      SENT: 2,
      SIGNED_CLIENT: 3,
      CONFIRMED: 4,
      CONVERTED: 5,
      CANCELLED: 6
    };

    return Array.from(counts.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => (order[a.status] || 99) - (order[b.status] || 99));
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      DRAFT: 'DRAFT',
      SENT: 'SENT',
      SIGNED_CLIENT: 'SIGNED',
      CONFIRMED: 'CONFIRMED',
      CONVERTED: 'CONVERTED',
      CANCELLED: 'CANCELLED'
    };

    return map[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      DRAFT: 'draft',
      SENT: 'sent',
      SIGNED_CLIENT: 'signed',
      CONFIRMED: 'confirmed',
      CONVERTED: 'converted',
      CANCELLED: 'cancelled'
    };

    return map[statut] || 'draft';
  }

  formatBonCommandeReference(item: BonCommande): string {
    return formatDocumentReference('BC', item.numBonCommande, item.dateCreation, item.id);
  }

  formatDevisReference(item: Devis): string {
    return formatDocumentReference('DEVIS', item.numDevis, item.dateCreation, item.id);
  }
}
