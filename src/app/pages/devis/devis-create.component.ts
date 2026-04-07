import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { ClientService } from '../../core/services/client.service';
import { ProduitService } from '../../core/services/produit.service';
import { DevisService } from '../../core/services/devis.service';
import { AuthService } from '../../core/services/auth.service';
import { Client, ClientRequest, RegionTunisie } from '../../models/client.model';
import { Produit } from '../../models/produit.model';
import { Devis, DevisRequest } from '../../models/devis.model';

interface DevisLineForm {
  produitId: number | null;
  quantite: number;
}

@Component({
  selector: 'app-devis-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devis-create.component.html',
  styleUrls: ['./devis-create.component.scss']
})
export class DevisCreateComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly produitService = inject(ProduitService);
  private readonly devisService = inject(DevisService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  clients: Client[] = [];
  produits: Produit[] = [];

  clientId: number | null = null;
  dateEmission: Date | string = new Date();
  modePaiement: 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'CARTE' = 'VIREMENT';
  editId: number | null = null;

  lignes: DevisLineForm[] = [{ produitId: null, quantite: 1 }];

  remiseGlobalePercent = 0;
  fraisPort = 0;
  notes = '';

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

  get isEditMode(): boolean {
    return this.editId !== null;
  }

  ngOnInit(): void {
    const editIdParam = this.route.snapshot.queryParamMap.get('editId');
    const parsedId = Number(editIdParam || 0);
    this.editId = parsedId > 0 ? parsedId : null;

    this.loadData();
  }

  retourAuxDevis(): void {
    this.router.navigate(['/devis']);
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
              this.loadDevisForEdit(this.editId);
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
    this.lignes.push({ produitId: null, quantite: 1 });
  }

  supprimerLigne(index: number): void {
    this.lignes.splice(index, 1);
    if (!this.lignes.length) {
      this.ajouterLigne();
    }
  }

  getProduit(line: DevisLineForm): Produit | null {
    if (!line.produitId) {
      return null;
    }

    return this.produits.find(p => p.id === line.produitId) ?? null;
  }

  getLigneMontantHT(line: DevisLineForm): number {
    const produit = this.getProduit(line);
    if (!produit) {
      return 0;
    }

    return (produit.prixUnitaire || 0) * (line.quantite || 0);
  }

  getLigneMontantTVA(line: DevisLineForm): number {
    const produit = this.getProduit(line);
    if (!produit) {
      return 0;
    }

    return this.getLigneMontantHT(line) * ((produit.tauxTVA || 0) / 100);
  }

  getLigneMontantTTC(line: DevisLineForm): number {
    return this.getLigneMontantHT(line) + this.getLigneMontantTVA(line);
  }

  get totalHT(): number {
    const base = this.lignes.reduce((sum, line) => sum + this.getLigneMontantHT(line), 0);
    return Math.max(0, base);
  }

  get totalTVA(): number {
    const baseTVA = this.lignes.reduce((sum, line) => sum + this.getLigneMontantTVA(line), 0);
    const ratio = this.lignes.reduce((sum, line) => sum + this.getLigneMontantHT(line), 0);
    if (ratio <= 0) {
      return 0;
    }
    const totalAfterGlobalDiscount = this.totalHT;
    return (baseTVA * totalAfterGlobalDiscount) / ratio;
  }

  get totalTTC(): number {
    return this.totalHT + this.totalTVA + 0.5;
  }

  private loadDevisForEdit(id: number): void {
    this.devisService.getById(id).subscribe({
      next: (devis) => {
        this.clientId = devis.acheteurId ?? null;
        this.dateEmission = devis.dateCreation || this.toDateOnly(new Date());
        this.modePaiement = (devis.modePaiement as any) || 'VIREMENT';
        this.notes = this.extractMainNotes(devis.notes || '');

        this.lignes = (devis.lignes || []).map(line => ({
          produitId: line.produitId ?? null,
          quantite: Math.max(1, Number(line.quantite || 1))
        }));

        if (!this.lignes.length) {
          this.lignes = [{ produitId: null, quantite: 1 }];
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger le devis a modifier.';
      }
    });
  }

  private buildPayload(): DevisRequest | null {
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

    return {
      dateCreation: this.toDateOnly(this.dateEmission),
      acheteurId: this.clientId,
      typeAcheteur: 'CLIENT',
      vendeurId,
      modePaiement: this.modePaiement,
      notes: this.notes?.trim() || undefined,
      lignes
    };
  }

  enregistrerBrouillon(): void {
    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const request$ = this.editId
      ? this.devisService.update(this.editId, payload)
      : this.devisService.create(payload);

    request$.subscribe({
      next: (created) => {
        this.loading = false;
        this.router.navigate(['/devis']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Erreur lors de l\'enregistrement du devis.';
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
      ? this.devisService.update(this.editId, payload)
      : this.devisService.create(payload);

    request$
      .pipe(switchMap((saved: Devis) => this.devisService.envoyer(saved.id)))
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/devis']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Erreur lors de la mise a jour/envoi du devis.';
        }
      });
  }

  private extractMainNotes(notes: string): string {
    if (!notes) {
      return '';
    }

    return notes
      .split('|')
      .map(item => item.trim())
      .filter(item => !!item && !/^Date validite:/i.test(item))
      .join(' | ');
  }

  private toDateOnly(date: Date | string): string {
    if (typeof date === 'string') {
      // input[type=date] returns YYYY-MM-DD
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
