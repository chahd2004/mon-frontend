import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { BonLivraisonService } from '../../core/services/bon-livraison.service';
import { ClientService } from '../../core/services/client.service';
import { BonLivraison } from '../../models/bon-livraison.model';
import { Client } from '../../models/client.model';
import { formatDocumentReference } from '../../shared/utils/reference-format.util';

interface LigneLivraisonView {
  index: number;
  designation: string;
  quantiteCommandee: number;
  quantiteLivree: number;
  reste: number;
}

@Component({
  selector: 'app-bons-livraison-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bons-livraison-detail.component.html',
  styleUrls: ['./bons-livraison-detail.component.scss']
})
export class BonsLivraisonDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bonLivraisonService = inject(BonLivraisonService);
  private readonly clientService = inject(ClientService);

  livraisonId = 0;
  livraison: BonLivraison | null = null;
  client: Client | null = null;

  loading = false;
  actionLoading = false;
  errorMessage = '';
  infoMessage = '';

  transporteur = 'DHL';
  numeroSuivi = '-';
  adresseLivraison = '-';
  matriculeFiscalClient = '-';

  ngOnInit(): void {
    const rawParam = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('ref') || '';
    const maybeId = Number(rawParam);

    if (Number.isFinite(maybeId) && maybeId > 0) {
      this.livraisonId = maybeId;
      this.loadDetail();
      return;
    }

    this.resolveLivraisonIdFromReference(rawParam);
  }

  retourAuxBL(): void {
    this.router.navigate(['/bons-livraison']);
  }

  get statusLabel(): string {
    const map: Record<string, string> = {
      DRAFT: 'DRAFT',
      DELIVERED: 'DELIVERED',
      SIGNED_CLIENT: 'SIGNED_CLIENT',
      DISPUTE: 'DISPUTE'
    };

    return map[this.statusValue] || this.statusValue;
  }

  get currentStatusText(): string {
    const map: Record<string, string> = {
      DRAFT: 'Brouillon',
      DELIVERED: 'Livre',
      SIGNED_CLIENT: 'Signe client',
      DISPUTE: 'Litige'
    };

    return map[this.statusValue] || this.statusValue;
  }

  get statusValue(): 'DRAFT' | 'DELIVERED' | 'SIGNED_CLIENT' | 'DISPUTE' {
    const value = (this.livraison?.statut || '').toUpperCase();

    if (value === 'SIGNED_CLIENT') {
      return 'SIGNED_CLIENT';
    }

    if (value === 'DELIVERED' || value === 'CLOSED') {
      return 'DELIVERED';
    }

    if (value === 'DISPUTE') {
      return 'DISPUTE';
    }

    return 'DRAFT';
  }

  get statusClass(): string {
    const map: Record<string, string> = {
      DRAFT: 'draft',
      DELIVERED: 'delivered',
      SIGNED_CLIENT: 'signed-client',
      DISPUTE: 'dispute'
    };

    return map[this.statusValue] || 'draft';
  }

  get lignes(): LigneLivraisonView[] {
    const source = this.livraison?.lignes || [];

    return source.map((ligne, idx) => {
      const qteCmd = Math.max(0, Number(ligne.quantite || 0));
      const qteLiv = qteCmd;
      return {
        index: idx + 1,
        designation: ligne.produitDesignation || '-',
        quantiteCommandee: qteCmd,
        quantiteLivree: qteLiv,
        reste: Math.max(0, qteCmd - qteLiv)
      };
    });
  }

  get commandeReference(): string {
    if (!this.livraison) {
      return '-';
    }

    return this.livraison.commandeSourceRef || '-';
  }

  get commandeDate(): string {
    return this.livraison?.dateCreation || '';
  }

  get totalCommandeArticles(): number {
    return this.lignes.reduce((sum, ligne) => sum + ligne.quantiteCommandee, 0);
  }

  get totalLivresArticles(): number {
    return this.lignes.reduce((sum, ligne) => sum + ligne.quantiteLivree, 0);
  }

  get totalResteArticles(): number {
    return this.lignes.reduce((sum, ligne) => sum + ligne.reste, 0);
  }

  get referenceBL(): string {
    if (!this.livraison) {
      return '-';
    }

    return formatDocumentReference(
      'BL',
      this.livraison.numBonLivraison,
      this.livraison.dateCreation,
      this.livraison.id
    );
  }

  modifierBL(): void {
    this.infoMessage = 'Modification BL non disponible pour le moment.';
    this.errorMessage = '';
  }

  supprimerBL(): void {
    this.infoMessage = 'Suppression BL non disponible: endpoint backend absent.';
    this.errorMessage = '';
  }

  marquerCommeLivre(): void {
    this.actionLoading = true;
    this.infoMessage = '';
    this.errorMessage = '';

    this.bonLivraisonService.marquerLivre(this.livraisonId).subscribe({
      next: () => {
        this.actionLoading = false;
        this.infoMessage = 'Bon de livraison marque livre. Email envoye au client.';
        this.loadDetail();
      },
      error: (error) => {
        this.actionLoading = false;
        this.errorMessage = error?.error?.message || 'Impossible de marquer ce bon de livraison comme livre.';
      }
    });
  }

  envoyerParEmail(): void {
    if (this.statusValue !== 'DRAFT') {
      this.infoMessage = 'Email deja envoye ou BL deja traite.';
      this.errorMessage = '';
      return;
    }
    this.marquerCommeLivre();
  }

  dupliquerBL(): void {
    this.infoMessage = 'Duplication BL non disponible pour le moment.';
    this.errorMessage = '';
  }

  actionSelonStatut(): void {
    if (this.statusValue === 'DRAFT') {
      this.marquerCommeLivre();
      return;
    }

    if (this.statusValue === 'DELIVERED') {
      this.infoMessage = 'Validation client non disponible pour le moment.';
      this.errorMessage = '';
      return;
    }

    if (this.statusValue === 'SIGNED_CLIENT') {
      this.infoMessage = 'BL deja signe par le client.';
      this.errorMessage = '';
      return;
    }

    this.infoMessage = 'Resolution litige non disponible pour le moment.';
    this.errorMessage = '';
  }

  get actionStatutLabel(): string {
    if (this.statusValue === 'DRAFT') {
      return 'LIVRER';
    }

    if (this.statusValue === 'DELIVERED') {
      return 'ATTENDRE SIGNATURE CLIENT';
    }

    if (this.statusValue === 'SIGNED_CLIENT') {
      return 'DEJA SIGNE';
    }

    return 'RESOUDRE LITIGE';
  }

  isComplet(ligne: LigneLivraisonView): boolean {
    return ligne.reste === 0;
  }

  private loadDetail(): void {
    this.loading = true;
    this.errorMessage = '';

    this.bonLivraisonService.getById(this.livraisonId).subscribe({
      next: (livraison) => {
        this.livraison = livraison;
        this.loadClientEtMeta();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger le detail du bon de livraison.';
      }
    });
  }

  private loadClientEtMeta(): void {
    if (!this.livraison) {
      this.loading = false;
      return;
    }

    const client$ = this.livraison.acheteurId
      ? this.clientService.getClientById(this.livraison.acheteurId).pipe(catchError(() => of(null)))
      : of(null);

    forkJoin([client$]).subscribe({
      next: ([client]) => {
        this.client = client;
        this.adresseLivraison = this.livraison?.adresseLivraison || client?.adresseComplete || '-';
        this.matriculeFiscalClient = client?.code || '-';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private resolveLivraisonIdFromReference(reference: string): void {
    const target = this.normalizeRef(reference);
    if (!target) {
      this.errorMessage = 'Reference de bon de livraison invalide.';
      return;
    }

    this.loading = true;
    this.bonLivraisonService.getAll().subscribe({
      next: (list) => {
        const items = Array.isArray(list) ? list : [];
        const match = items.find((bl) => this.normalizeRef(bl.numBonLivraison) === target);

        if (!match?.id) {
          this.loading = false;
          this.errorMessage = `Bon de livraison introuvable pour la reference ${reference}.`;
          return;
        }

        this.livraisonId = match.id;
        this.router.navigate(['/bons-livraison/view', this.livraisonId], { replaceUrl: true });
        this.loadDetail();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de resoudre la reference du bon de livraison.';
      }
    });
  }

  private normalizeRef(value?: string | null): string {
    return (value || '').trim().toUpperCase();
  }
}
