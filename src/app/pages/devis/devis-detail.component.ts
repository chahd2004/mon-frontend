import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DevisService } from '../../core/services/devis.service';
import { ClientService } from '../../core/services/client.service';
import { ProduitService } from '../../core/services/produit.service';
import { Devis, LigneDevis } from '../../models/devis.model';
import { Client } from '../../models/client.model';
import { Emetteur } from '../../models/emetteur.model';
import { Produit } from '../../models/produit.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { formatDocumentReference } from '../../shared/utils/reference-format.util';

@Component({
  selector: 'app-devis-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './devis-detail.component.html',
  styleUrls: ['./devis-detail.component.scss']
})
export class DevisDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly devisService = inject(DevisService);
  private readonly clientService = inject(ClientService);
  private readonly produitService = inject(ProduitService);
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);

  devisId = 0;
  devis: Devis | null = null;
  client: Client | null = null;
  vendeur: Emetteur | null = null;
  produitsMap: Record<number, Produit> = {};
  loading = false;
  convertingDirect = false;
  errorMessage = '';

  get lignes(): LigneDevis[] {
    return this.devis?.lignes ?? [];
  }


  ngOnInit(): void {
    const rawParam = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('ref') || '';
    const maybeId = Number(rawParam);

    if (Number.isFinite(maybeId) && maybeId > 0) {
      this.devisId = maybeId;
      this.loadDevisDetail();
      return;
    }

    this.resolveDevisIdFromReference(rawParam);
  }

  retourAuxDevis(): void {
    this.router.navigate(['/devis']);
  }

  loadDevisDetail(): void {
    this.loading = true;
    this.errorMessage = '';

    this.devisService.getById(this.devisId).subscribe({
      next: (devis) => {
        this.devis = devis;
        this.loadParties();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger le détail du devis.';
      }
    });
  }

  private resolveDevisIdFromReference(reference: string): void {
    const target = this.normalizeRef(reference);
    if (!target) {
      this.errorMessage = 'Reference de devis invalide.';
      return;
    }

    this.loading = true;
    this.devisService.getAll().subscribe({
      next: (list) => {
        const items = Array.isArray(list) ? list : [];
        const match = items.find((d) => this.normalizeRef(d.numDevis) === target);

        if (!match?.id) {
          this.loading = false;
          this.errorMessage = `Devis introuvable pour la reference ${reference}.`;
          return;
        }

        this.devisId = match.id;
        this.router.navigate(['/devis/view', this.devisId], { replaceUrl: true });
        this.loadDevisDetail();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de resoudre la reference du devis.';
      }
    });
  }

  private normalizeRef(value?: string | null): string {
    return (value || '').trim().toUpperCase();
  }

  private loadParties(): void {
    if (!this.devis) {
      this.loading = false;
      return;
    }

    const client$ = this.devis.acheteurId
      ? this.clientService.getClientById(this.devis.acheteurId).pipe(catchError(() => of(null)))
      : of(null);

    const vendeur$ = this.devis.vendeurId
      ? this.http.get<Emetteur>(`${environment.apiUrl}/emetteurs/${this.devis.vendeurId}`).pipe(catchError(() => of(null)))
      : of(null);

    const produits$ = this.produitService
      .getProduits(this.devis.vendeurId)
      .pipe(catchError(() => of([] as Produit[])));

    forkJoin([client$, vendeur$, produits$]).subscribe({
      next: ([client, vendeur, produits]) => {
        this.client = client;
        this.vendeur = vendeur;
        this.produitsMap = (produits || []).reduce<Record<number, Produit>>((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  envoyerAuClient(): void {
    if (!this.devis) {
      return;
    }

    this.devisService.envoyer(this.devis.id).subscribe({
      next: (updated) => {
        this.devis = updated;
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'envoi au client.';
      }
    });
  }

  accepterDevis(): void {
    if (!this.devis) {
      return;
    }

    this.devisService.accepter(this.devis.id).subscribe({
      next: (updated) => {
        this.devis = updated;
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'acceptation du devis.';
      }
    });
  }

  rejeterDevis(): void {
    if (!this.devis) {
      return;
    }

    const raison = window.prompt('Saisir la raison du rejet:');
    if (!raison || !raison.trim()) {
      return;
    }

    this.devisService.rejeter(this.devis.id, raison.trim()).subscribe({
      next: (updated) => {
        this.devis = updated;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du rejet du devis.';
      }
    });
  }

  convertirEnBonCommande(): void {
    if (!this.devis) {
      return;
    }

    const dateDocument = new Date().toISOString().slice(0, 10);
    this.devisService.convertirEnBonCommande(this.devis.id, dateDocument).subscribe({
      next: () => {
        this.loadDevisDetail();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la conversion en bon de commande.';
      }
    });
  }

  convertirEnFactureDirecte(): void {
    if (!this.devis) {
      return;
    }

    if (!this.canConvertirDirectement()) {
      this.errorMessage = 'Conversion directe possible uniquement pour un devis au statut ACCEPTED.';
      return;
    }

    const dateDocument = this.toDateOnly(new Date());
    const datePaiement = this.toDateOnly(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const modePaiement = this.normalizeModePaiement(this.devis.modePaiement);
    this.convertingDirect = true;
    this.errorMessage = '';

    this.devisService
      .convertirEnFactureDirecte(this.devis.id, dateDocument, modePaiement, datePaiement)
      .subscribe({
        next: (facture) => {
          this.convertingDirect = false;
          const anyFacture = facture as any;
          const factureId = Number(
            anyFacture?.id ??
            anyFacture?.factureId ??
            anyFacture?.data?.id ??
            anyFacture?.result?.id ??
            0
          );

          if (factureId > 0) {
            this.router.navigate(['/factures', factureId]);
            return;
          }

          this.errorMessage = 'Facture creee, mais identifiant introuvable pour ouvrir le detail.';
          this.router.navigate(['/factures']);
        },
        error: (error) => {
          this.convertingDirect = false;
          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Erreur lors de la conversion en facture directe.';
        }
      });
  }

  canEnvoyer(): boolean {
    return this.getEffectiveStatut() === 'DRAFT';
  }

  canAccepterOuRejeter(): boolean {
    return this.getEffectiveStatut() === 'SENT';
  }

  canConvertir(): boolean {
    return this.getEffectiveStatut() === 'ACCEPTED';
  }

  canConvertirDirectement(): boolean {
    return this.getEffectiveStatut() === 'ACCEPTED';
  }

  formatModePaiement(value?: string | null): string {
    if (!value) return '-';
    return this.translate.instant('FACTURE.PAYMENT_METHODS.' + value);
  }

  getStatutLabel(statut?: string): string {
    if (!statut) {
      return '-';
    }

    return this.getEffectiveStatut();
  }

  getEffectiveStatut(): string {
    if (!this.devis) {
      return '-';
    }

    return this.devis.statut || 'DRAFT';
  }

  getLigneTauxTVA(ligne: LigneDevis): number {
    const inlineTaux = Number((ligne as any)?.tauxTVA);
    if (Number.isFinite(inlineTaux) && inlineTaux >= 0) {
      return inlineTaux;
    }

    const produitId = Number(ligne.produitId || 0);
    if (produitId > 0) {
      const tauxProduit = this.produitsMap[produitId]?.tauxTVA;
      if (typeof tauxProduit === 'number' && Number.isFinite(tauxProduit) && tauxProduit >= 0) {
        return tauxProduit;
      }
    }

    return 0;
  }

  getLigneMontantTVA(ligne: LigneDevis): number {
    const ht = Number(ligne.montantHT || 0);
    const taux = this.getLigneTauxTVA(ligne);
    return ht * (taux / 100);
  }

  getLigneMontantTTC(ligne: LigneDevis): number {
    return Number(ligne.montantHT || 0) + this.getLigneMontantTVA(ligne);
  }

  private toDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  private toValidDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }

    // Accept YYYY-MM-DD, full ISO, and DD/MM/YYYY.
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/').map(Number);
      const localDate = new Date(year, month - 1, day);
      return Number.isNaN(localDate.getTime()) ? null : localDate;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  formatDevisReference(): string {
    if (!this.devis) {
      return '-';
    }

    return formatDocumentReference('DEVIS', this.devis.numDevis, this.devis.dateCreation, this.devis.id);
  }

  private normalizeModePaiement(value?: string | null): 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'CARTE' {
    if (value === 'CHEQUE' || value === 'ESPECES' || value === 'CARTE' || value === 'VIREMENT') {
      return value;
    }

    return 'VIREMENT';
  }
}
