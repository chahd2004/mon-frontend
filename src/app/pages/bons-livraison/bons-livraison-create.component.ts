import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { BonCommandeService } from '../../core/services/bon-commande.service';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/services/auth.service';
import { BonCommande, LigneBonCommande } from '../../models/bon-commande.model';
import { Client, ClientRequest, RegionTunisie } from '../../models/client.model';

interface LivraisonLigneForm {
  index: number;
  produit: string;
  quantiteCommandee: number;
  quantiteLivree: number;
}

@Component({
  selector: 'app-bons-livraison-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bons-livraison-create.component.html',
  styleUrls: ['./bons-livraison-create.component.scss']
})
export class BonsLivraisonCreateComponent implements OnInit {
  private readonly bonCommandeService = inject(BonCommandeService);
  private readonly clientService = inject(ClientService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  clients: Client[] = [];
  commandes: BonCommande[] = [];
  lignes: LivraisonLigneForm[] = [];

  selectedClientId: number | null = null;
  selectedCommandeId: number | null = null;
  dateLivraison: string = new Date().toISOString().slice(0, 10);
  adresseLivraison = '';
  transporteur = 'DHL';
  numeroSuivi = '';
  notes = '';

  transporteurs = ['DHL', 'Aramex', 'FedEx', 'UPS', 'Chronopost', 'GLS'];

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

  ngOnInit(): void {
    this.loadInitialData();
  }

  retourAuxBL(): void {
    this.router.navigate(['/bons-livraison']);
  }

  onCommandeChange(): void {
    const commande = this.commandes.find(c => c.id === this.selectedCommandeId);
    if (!commande) {
      this.lignes = [];
      return;
    }

    this.selectedClientId = commande.acheteurId || null;
    this.lignes = this.toLivraisonLignes(commande.lignes || []);
  }

  getReste(ligne: LivraisonLigneForm): number {
    return Math.max(0, ligne.quantiteCommandee - (ligne.quantiteLivree || 0));
  }

  isComplete(ligne: LivraisonLigneForm): boolean {
    return this.getReste(ligne) === 0;
  }

  clampQuantite(ligne: LivraisonLigneForm): void {
    if (ligne.quantiteLivree < 0) {
      ligne.quantiteLivree = 0;
      return;
    }

    if (ligne.quantiteLivree > ligne.quantiteCommandee) {
      ligne.quantiteLivree = ligne.quantiteCommandee;
    }
  }

  enregistrerBrouillon(): void {
    if (!this.validateMandatoryFields()) {
      return;
    }

    this.successMessage = 'Brouillon BL enregistre localement. Finalisez avec "Creer et marquer livre".';
    this.errorMessage = '';
  }

  creerEtMarquerLivre(): void {
    if (!this.validateMandatoryFields()) {
      return;
    }

    if (!this.selectedCommandeId) {
      this.errorMessage = 'Veuillez selectionner une commande liee.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.bonCommandeService
      .convertirEnBonLivraison(this.selectedCommandeId, this.dateLivraison, this.notes || undefined)
      .subscribe({
        next: () => {
          this.saving = false;
          this.successMessage = 'Bon de livraison cree avec succes.';
          this.router.navigate(['/bons-livraison']);
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error?.error?.message || 'Erreur lors de la creation du bon de livraison.';
        }
      });
  }

  ouvrirNouveauClientModal(): void {
    this.displayClientModal = true;
    this.clientModalError = '';
  }

  fermerNouveauClientModal(): void {
    this.displayClientModal = false;
    this.clientModalError = '';
    this.resetClientForm();
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
        this.selectedClientId = created.id;
        this.fermerNouveauClientModal();
      },
      error: (error) => {
        this.clientSaving = false;
        this.clientModalError = error?.error?.message || 'Impossible de creer le client.';
      }
    });
  }

  get commandeOptions(): BonCommande[] {
    return this.commandes.filter(c => (c.statut || '').toUpperCase() === 'CONFIRMED');
  }

  private loadInitialData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = Array.isArray(clients) ? clients : [];
        this.bonCommandeService.getAll().subscribe({
          next: (commandes) => {
            this.commandes = Array.isArray(commandes) ? commandes : [];
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.errorMessage = 'Impossible de charger les commandes.';
          }
        });
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les clients.';
      }
    });
  }

  private toLivraisonLignes(lignes: LigneBonCommande[]): LivraisonLigneForm[] {
    return lignes.map((ligne, index) => {
      const quantite = Math.max(0, Number(ligne.quantite || 0));
      return {
        index: index + 1,
        produit: ligne.produitDesignation || 'Produit sans designation',
        quantiteCommandee: quantite,
        quantiteLivree: quantite
      };
    });
  }

  private validateMandatoryFields(): boolean {
    if (!this.selectedClientId) {
      this.errorMessage = 'Veuillez selectionner un client.';
      return false;
    }

    if (!this.selectedCommandeId) {
      this.errorMessage = 'Veuillez selectionner une commande liee.';
      return false;
    }

    if (!this.dateLivraison) {
      this.errorMessage = 'La date de livraison est obligatoire.';
      return false;
    }

    if (!this.adresseLivraison.trim()) {
      this.errorMessage = 'L adresse de livraison est obligatoire.';
      return false;
    }

    return true;
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

  private generateClientCode(): string {
    return `CL-${Date.now().toString().slice(-8)}`;
  }
}
