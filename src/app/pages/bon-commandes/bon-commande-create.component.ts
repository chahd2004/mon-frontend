import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { ClientService } from '../../core/services/client.service';
import { ProduitService } from '../../core/services/produit.service';
import { BonCommandeService } from '../../core/services/bon-commande.service';
import { AuthService } from '../../core/services/auth.service';
import { Client, ClientRequest, RegionTunisie } from '../../models/client.model';
import { Produit } from '../../models/produit.model';
import { BonCommande, BonCommandeRequest } from '../../models/bon-commande.model';

interface BonCommandeLineForm {
  produitId: number | null;
  quantite: number;
  remisePercent: number;
}

@Component({
  selector: 'app-bon-commande-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bon-commande-create.component.html',
  styleUrls: ['./bon-commande-create.component.scss']
})
export class BonCommandeCreateComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly produitService = inject(ProduitService);
  private readonly bonCommandeService = inject(BonCommandeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @Input() isCommandeMode = false;

  clients: Client[] = [];
  produits: Produit[] = [];

  clientId: number | null = null;
  dateEmission: Date | string = new Date();
  modePaiement: 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'CARTE' = 'VIREMENT';
  conditionPaiement = '30 jours net';
  editId: number | null = null;

  lignes: BonCommandeLineForm[] = [{ produitId: null, quantite: 1, remisePercent: 0 }];

  notes = '';
  fraisPort = 0;

  loading = false;
  errorMessage = '';
  displayClientModal = false;
  clientSaving = false;
  clientModalError = '';

  clientForm: Partial<ClientRequest> = {
    raisonSociale: '',
    email: '',
    telephone: '',
    adresseComplete: '',
    pays: 'TUNISIE',
    region: 'TUNIS'
  };

  regions: { label: string; value: RegionTunisie }[] = [
    { label: 'Tunis', value: 'TUNIS' },
    { label: 'Ariana', value: 'ARIANA' },
    { label: 'Ben Arous', value: 'BEN_AROUS' },
    { label: 'Manouba', value: 'MANOUBA' },
    { label: 'Nabeul', value: 'NABEUL' },
    { label: 'Zaghouan', value: 'ZAGHOUAN' },
    { label: 'Bizerte', value: 'BIZERTE' },
    { label: 'Beja', value: 'BEJA' },
    { label: 'Jendouba', value: 'JENDOUBA' },
    { label: 'Kef', value: 'KEF' },
    { label: 'Siliana', value: 'SILIANA' },
    { label: 'Sousse', value: 'SOUSSE' },
    { label: 'Monastir', value: 'MONASTIR' },
    { label: 'Mahdia', value: 'MAHDIA' },
    { label: 'Sfax', value: 'SFAX' },
    { label: 'Kairouan', value: 'KAIROUAN' },
    { label: 'Kasserine', value: 'KASSERINE' },
    { label: 'Sidi Bouzid', value: 'SIDI_BOUZID' },
    { label: 'Gabes', value: 'GABES' },
    { label: 'Medenine', value: 'MEDENINE' },
    { label: 'Tataouine', value: 'TATAOUINE' },
    { label: 'Gafsa', value: 'GAFSA' },
    { label: 'Tozeur', value: 'TOZEUR' },
    { label: 'Kebili', value: 'KEBILI' }
  ];

  modePaiementOptions = [
    { value: 'VIREMENT', label: 'Virement bancaire' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'ESPECES', label: 'Especes' },
    { value: 'CARTE', label: 'Carte bancaire' }
  ] as const;

  conditionsOptions = [
    '30 jours net',
    '15 jours net',
    'Paiement a reception',
    '50% avance / 50% livraison'
  ];

  get isEditMode(): boolean {
    return this.editId !== null;
  }

  ngOnInit(): void {
    const editIdParam = this.route.snapshot.queryParamMap.get('editId');
    const parsedId = Number(editIdParam || 0);
    this.editId = parsedId > 0 ? parsedId : null;

    this.loadData();
  }

  retourAuxBC(): void {
    this.router.navigate([this.isCommandeMode ? '/commandes' : '/bons-commandes']);
  }

  ouvrirNouveauClientModal(): void {
    this.clientModalError = '';
    this.displayClientModal = true;
  }

  fermerNouveauClientModal(): void {
    this.displayClientModal = false;
    this.clientModalError = '';
    this.resetClientForm();
  }

  private resetClientForm(): void {
    this.clientForm = {
      raisonSociale: '',
      email: '',
      telephone: '',
      adresseComplete: '',
      pays: 'TUNISIE',
      region: 'TUNIS'
    };
  }

  sauvegarderNouveauClient(): void {
    const raisonSociale = this.clientForm.raisonSociale?.trim();
    const email = this.clientForm.email?.trim();
    const telephone = this.clientForm.telephone?.trim();
    const adresseComplete = this.clientForm.adresseComplete?.trim();
    const pays = this.clientForm.pays?.trim() || 'TUNISIE';
    const region = this.clientForm.region;

    if (!raisonSociale || !email || !telephone || !adresseComplete || !region) {
      this.clientModalError = 'Veuillez renseigner tous les champs obligatoires.';
      return;
    }

    if (!/^[0-9]{8}$/.test(telephone)) {
      this.clientModalError = 'Le telephone doit contenir exactement 8 chiffres.';
      return;
    }

    const payload: ClientRequest = {
      code: this.generateClientCode(),
      raisonSociale,
      email,
      telephone,
      adresseComplete,
      pays,
      region
    };

    this.clientSaving = true;
    this.clientModalError = '';

    this.clientService.createClient(payload).subscribe({
      next: (created) => {
        this.clientSaving = false;
        this.clients = [...this.clients, created];
        this.clientId = created.id;
        this.fermerNouveauClientModal();
      },
      error: (error) => {
        this.clientSaving = false;
        this.clientModalError = error?.error?.message || 'Impossible de creer le client.';
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients || [];
        this.produitService.getProduits().subscribe({
          next: (produits) => {
            this.produits = produits || [];
            if (this.editId) {
              this.loadBonCommandeForEdit(this.editId);
            } else {
              this.loading = false;
            }
          },
          error: () => {
            this.loading = false;
            this.errorMessage = 'Impossible de charger les produits.';
          }
        });
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les clients.';
      }
    });
  }

  ajouterLigne(): void {
    this.lignes.push({ produitId: null, quantite: 1, remisePercent: 0 });
  }

  supprimerLigne(index: number): void {
    this.lignes.splice(index, 1);
    if (!this.lignes.length) {
      this.ajouterLigne();
    }
  }

  getProduit(line: BonCommandeLineForm): Produit | null {
    if (!line.produitId) {
      return null;
    }

    return this.produits.find(p => p.id === line.produitId) ?? null;
  }

  getLigneMontantHTBrut(line: BonCommandeLineForm): number {
    const produit = this.getProduit(line);
    if (!produit) {
      return 0;
    }

    return (produit.prixUnitaire || 0) * (line.quantite || 0);
  }

  getLigneRemise(line: BonCommandeLineForm): number {
    const brut = this.getLigneMontantHTBrut(line);
    return (brut * (line.remisePercent || 0)) / 100;
  }

  getLigneMontantHT(line: BonCommandeLineForm): number {
    return Math.max(0, this.getLigneMontantHTBrut(line) - this.getLigneRemise(line));
  }

  getLigneTauxTVA(line: BonCommandeLineForm): number {
    return this.getProduit(line)?.tauxTVA || 0;
  }

  getLigneMontantTVA(line: BonCommandeLineForm): number {
    return this.getLigneMontantHT(line) * (this.getLigneTauxTVA(line) / 100);
  }

  getLigneMontantTTC(line: BonCommandeLineForm): number {
    return this.getLigneMontantHT(line) + this.getLigneMontantTVA(line);
  }

  get totalHTBrut(): number {
    return this.lignes.reduce((sum, line) => sum + this.getLigneMontantHTBrut(line), 0);
  }

  get totalRemise(): number {
    return this.lignes.reduce((sum, line) => sum + this.getLigneRemise(line), 0);
  }

  get totalHT(): number {
    return Math.max(0, this.totalHTBrut - this.totalRemise);
  }

  get totalTVA(): number {
    return this.lignes.reduce((sum, line) => sum + this.getLigneMontantTVA(line), 0);
  }

  get totalTTC(): number {
    return this.totalHT + this.totalTVA + (this.fraisPort || 0);
  }

  enregistrerBrouillon(): void {
    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const request$ = this.editId
      ? this.bonCommandeService.update(this.editId, payload)
      : this.bonCommandeService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        const redirectPath = this.isCommandeMode ? '/commandes' : '/bons-commandes';
        this.router.navigate([redirectPath]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Erreur lors de l\'enregistrement du bon de commande.';
      }
    });
  }

  creerEtEnvoyer(): void {
    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const request$ = this.editId
      ? this.bonCommandeService.update(this.editId, payload)
      : this.bonCommandeService.create(payload);

    request$
      .pipe(switchMap((saved: BonCommande) => this.bonCommandeService.envoyer(saved.id)))
      .subscribe({
        next: () => {
          this.loading = false;
          const redirectPath = this.isCommandeMode ? '/commandes' : '/bons-commandes';
          this.router.navigate([redirectPath]);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Erreur lors de la creation/envoi du bon de commande.';
        }
      });
  }

  private buildPayload(): BonCommandeRequest | null {
    const currentUser = this.authService.currentUser();
    const vendeurId = currentUser?.emetteurId;

    if (!this.clientId) {
      this.errorMessage = 'Veuillez selectionner un client.';
      return null;
    }

    if (!vendeurId) {
      this.errorMessage = 'Aucun emetteur associe au compte connecte.';
      return null;
    }

    const lignes = this.lignes
      .filter(line => !!line.produitId && line.quantite > 0)
      .map(line => ({
        produitId: Number(line.produitId),
        quantite: Number(line.quantite)
      }));

    if (!lignes.length) {
      this.errorMessage = 'Ajoutez au moins une ligne produit valide.';
      return null;
    }

    const noteParts = [
      this.notes?.trim() || '',
      `Conditions: ${this.conditionPaiement}`,
      `Remise totale: ${this.totalRemise.toFixed(3)} TND`,
      `Frais de port: ${(this.fraisPort || 0).toFixed(3)} TND`
    ].filter(Boolean);

    return {
      dateCreation: this.toDateOnly(this.dateEmission),
      acheteurId: this.clientId,
      typeAcheteur: 'CLIENT',
      vendeurId,
      modePaiement: this.modePaiement,
      notes: noteParts.join(' | '),
      lignes
    };
  }

  private loadBonCommandeForEdit(id: number): void {
    this.bonCommandeService.getById(id).subscribe({
      next: (bc) => {
        this.clientId = bc.acheteurId ?? null;
        this.dateEmission = bc.dateCreation || this.toDateOnly(new Date());
        this.modePaiement = (bc.modePaiement as any) || 'VIREMENT';

        const extractedCondition = this.extractConditionPaiement(bc.notes || '');
        this.conditionPaiement = extractedCondition || '30 jours net';
        this.notes = this.extractMainNotes(bc.notes || '');

        this.lignes = (bc.lignes || []).map(line => ({
          produitId: line.produitId ?? null,
          quantite: Math.max(1, Number(line.quantite || 1)),
          remisePercent: 0
        }));

        if (!this.lignes.length) {
          this.lignes = [{ produitId: null, quantite: 1, remisePercent: 0 }];
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger le bon de commande a modifier.';
      }
    });
  }

  private extractConditionPaiement(notes: string): string | null {
    if (!notes) {
      return null;
    }

    const match = notes.match(/Conditions:\s*([^|]+)/i);
    return match?.[1]?.trim() || null;
  }

  private extractMainNotes(notes: string): string {
    if (!notes) {
      return '';
    }

    return notes
      .split('|')
      .map(item => item.trim())
      .filter(item => !!item && !/^Conditions:/i.test(item) && !/^Remise totale:/i.test(item) && !/^Frais de port:/i.test(item))
      .join(' | ');
  }

  private toDateOnly(date: Date | string): string {
    if (typeof date === 'string') {
      return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : this.toDateOnly(new Date(date));
    }

    if (Number.isNaN(date.getTime())) {
      return this.toDateOnly(new Date());
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private generateClientCode(): string {
    return `CL-${Date.now().toString().slice(-8)}`;
  }
}
