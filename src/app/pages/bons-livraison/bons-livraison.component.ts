import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { CommandeService } from '../../core/services/commande.service';
import { BonCommandeService } from '../../core/services/bon-commande.service';
import { BonCommande } from '../../models/bon-commande.model';
import { AuthService } from '../../core/services/auth.service';
import { BonLivraisonService } from '../../core/services/bon-livraison.service';
import { BonLivraison } from '../../models/bon-livraison.model';
import { formatDocumentReference } from '../../shared/utils/reference-format.util';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface BonLivraisonView {
  sourceId: number;
  numeroBL: string;
  commandeLiee: string;
  client: string;
  dateLivraison: string;
  statut: 'DRAFT' | 'DELIVERED' | 'SIGNED_CLIENT' | 'DISPUTE' | 'CLOSED';
  disputeReason?: string;
  factureRef?: string;
}

@Component({
  selector: 'app-bons-livraison',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, DialogModule, ButtonModule, DropdownModule, CalendarModule, ToastModule],
  providers: [MessageService],
  templateUrl: './bons-livraison.component.html',
  styleUrls: ['./bons-livraison.component.scss']
})
export class BonsLivraisonComponent implements OnInit {
  private readonly commandeService = inject(CommandeService);
  private readonly bonCommandeService = inject(BonCommandeService);
  private readonly bonLivraisonService = inject(BonLivraisonService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  loading = false;
  showStats = true;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  selectedStatus: 'ALL' | 'DRAFT' | 'DELIVERED' | 'SIGNED_CLIENT' | 'DISPUTE' | 'CLOSED' = 'ALL';

  displayConvertModal = false;
  loadingConfirmedCommandes = false;
  converting = false;
  conversionSearch = '';
  conversionNotes = '';
  selectedCommandeId: number | null = null;

  displayFactureModal = false;
  selectedBLForFacture: BonLivraisonView | null = null;
  conversionForm!: FormGroup;
  generatingFacture = false;

  paymentModes = [
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Espèces', value: 'ESPECES' },
    { label: 'Carte bancaire', value: 'CARTE_BANCAIRE' },
    { label: 'Traite', value: 'TRAITE' }
  ];

  rawBonsLivraison: BonLivraison[] = [];
  rawCommandes: BonCommande[] = [];

  readonly statusOptions: Array<'DRAFT' | 'DELIVERED' | 'SIGNED_CLIENT' | 'DISPUTE' | 'CLOSED'> = [
    'DRAFT',
    'DELIVERED',
    'SIGNED_CLIENT',
    'DISPUTE',
    'CLOSED'
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
      disputeReason: item.disputeReason || undefined,
      factureRef: item.factureRef || undefined
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

  get closedCount(): number {
    return this.filteredBonsLivraison.filter(item => item.statut === 'CLOSED').length;
  }

  get disputes(): BonLivraisonView[] {
    return this.filteredBonsLivraison.filter(item => item.statut === 'DISPUTE');
  }

  get confirmedCommandes(): BonCommande[] {
    const term = this.conversionSearch.trim().toLowerCase();
    // Filter for IN_PROGRESS commandes
    const list = this.rawCommandes.filter(item => (item.statut || '').toUpperCase() === 'IN_PROGRESS');

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
    this.initConversionForm();
    this.loadSourceLivraisons();
  }

  private initConversionForm(): void {
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    this.conversionForm = this.fb.group({
      dateDocument: [new Date(), Validators.required],
      modePaiement: ['VIREMENT', Validators.required],
      datePaiement: [in30Days, Validators.required]
    });
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
        this.errorMessage = this.translate.instant('BL.MSGS.LOADING_ERROR') || 'Impossible de charger les bons de livraison.';
      }
    });
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
        this.errorMessage = this.translate.instant('BL.CONVERT_MODAL.LOAD_ERROR') || 'Impossible de charger les commandes livrées.';
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
      this.errorMessage = this.translate.instant('BL.CONVERT_MODAL.SELECT_REQUIRED');
      return;
    }

    this.converting = true;
    this.errorMessage = '';

    const dateDocument = new Date().toISOString().slice(0, 10);

    // Get the selected commande
    const selectedCommande = this.rawCommandes.find(c => c.id === this.selectedCommandeId);
    if (!selectedCommande) {
      this.errorMessage = this.translate.instant('BL.CONVERT_MODAL.NOT_FOUND');
      this.converting = false;
      return;
    }

    // Verify there are lignes
    if (!selectedCommande.lignes || selectedCommande.lignes.length === 0) {
      this.errorMessage = this.translate.instant('BL.CONVERT_MODAL.NO_LINES');
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
      commandeSourceRef: this.formatCommandeReference(selectedCommande),
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
        this.successMessage = this.translate.instant('BL.CONVERT_MODAL.SUCCESS');
        this.loadSourceLivraisons();
      },
      error: (error: any) => {
        this.converting = false;
        let messageErreur = this.translate.instant('BL.CONVERT_MODAL.ERROR');
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
        this.successMessage = this.translate.instant('BL.MSGS.DELIVER_SUCCESS', { num: item.numeroBL });
        this.loadSourceLivraisons();
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.message || this.translate.instant('BL.MSGS.DELIVER_ERROR', { num: item.numeroBL });
      }
    });
  }

  ouvrirFactureModal(item: BonLivraisonView): void {
    this.selectedBLForFacture = item;

    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    this.conversionForm.patchValue({
      dateDocument: new Date(),
      modePaiement: 'VIREMENT',
      datePaiement: in30Days
    });

    this.displayFactureModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  fermerFactureModal(): void {
    this.displayFactureModal = false;
    this.selectedBLForFacture = null;
    this.generatingFacture = false;
  }

  genererFactureDepuiBL(): void {
    if (!this.selectedBLForFacture || this.conversionForm.invalid) return;

    this.generatingFacture = true;
    this.errorMessage = '';

    const formVal = this.conversionForm.value;

    // Format dates to YYYY-MM-DD for backend
    const payload = {
      dateDocument: this.formatDate(formVal.dateDocument),
      datePaiement: this.formatDate(formVal.datePaiement),
      modePaiement: formVal.modePaiement
    };

    this.bonLivraisonService.versFacture(this.selectedBLForFacture.sourceId, payload).subscribe({
      next: () => {
        this.generatingFacture = false;
        this.fermerFactureModal();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Facture générée avec succès.' });
        this.loadSourceLivraisons();
      },
      error: (err: any) => {
        this.generatingFacture = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de la génération de la facture.';
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  supprimerBL(item: BonLivraisonView): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.bonLivraisonService.delete(item.sourceId).subscribe({
      next: () => {
        this.successMessage = this.translate.instant('BL.MSGS.DELETE_SUCCESS', { num: item.numeroBL });
        this.loadSourceLivraisons();
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.message || this.translate.instant('BL.MSGS.DELETE_ERROR', { num: item.numeroBL });
      }
    });
  }

  resoudreLitige(item: BonLivraisonView): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.bonLivraisonService.resoudreLitige(item.sourceId).subscribe({
      next: () => {
        this.successMessage = this.translate.instant('BL.MSGS.RESOLVE_SUCCESS', { num: item.numeroBL });
        this.loadSourceLivraisons();
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.message || this.translate.instant('BL.MSGS.RESOLVE_ERROR', { num: item.numeroBL });
      }
    });
  }

  signalerLitige(item: BonLivraisonView): void {
    const motif = prompt(this.translate.instant('BL.MSGS.DISPUTE_PROMPT'));
    if (!motif || motif.trim() === '') return;

    this.errorMessage = '';
    this.successMessage = '';
    this.bonLivraisonService.signalerLitige(item.sourceId, motif).subscribe({
      next: () => {
        this.successMessage = this.translate.instant('BL.MSGS.DISPUTE_SUCCESS', { num: item.numeroBL });
        this.loadSourceLivraisons();
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.message || this.translate.instant('BL.MSGS.DISPUTE_ERROR', { num: item.numeroBL });
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'draft',
      DELIVERED: 'delivered',
      SIGNED_CLIENT: 'signed-client',
      DISPUTE: 'dispute',
      CLOSED: 'closed'
    };

    return map[status] || 'draft';
  }

  private toLivraisonStatus(raw?: string | null): 'DRAFT' | 'DELIVERED' | 'SIGNED_CLIENT' | 'DISPUTE' | 'CLOSED' {
    const value = (raw || '').toUpperCase();

    if (value === 'DRAFT') {
      return 'DRAFT';
    }

    if (value === 'SIGNED_CLIENT') {
      return 'SIGNED_CLIENT';
    }

    if (value === 'CLOSED') {
      return 'CLOSED';
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

  formatCommandeReference(item: any): string {
    const raw = item.numBonCommande || item.numCommande || item.numero;
    return formatDocumentReference('CMD', raw, item.dateCreation, item.id);
  }

  private formatBLReference(item: BonLivraison): string {
    return formatDocumentReference('BL', item.numBonLivraison, item.dateCreation, item.id);
  }

}
