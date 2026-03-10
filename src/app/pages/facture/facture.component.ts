// src/app/pages/facture/facture.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

// QR Code
import { QRCodeComponent } from 'angularx-qrcode';

import { environment } from '../../../environments/environment';

const DEFAULT_VENDEUR_ID = 1;

// =====================================================
// ⚙️  URL DU QR CODE — CHANGER ICI QUAND TU AS NGROK
// =====================================================

const QR_BASE_URL = 'https://mon-app.com';
// =====================================================

interface Emetteur {
  id: number;
  raisonSociale: string;
  email?: string;
  telephone?: string;
  adresseComplete?: string;
  matriculeFiscal?: string;
  code?: string;
}

interface Client {
  id: number;
  raisonSociale: string;
  email?: string;
  telephone?: string;
  adresseComplete?: string;
}

interface Produit {
  id: number;
  reference: string;
  designation: string;
  prixUnitaire: number;
  tauxTVA: number;
}

interface LigneFacture {
  produitId: number;
  produitLabel: string;
  quantite: number;
  prixUnitaire: number;
  tauxTVA: number;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
}

@Component({
  selector: 'app-facture',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CardModule, ToastModule,
    InputTextModule, InputNumberModule,
    DropdownModule, CalendarModule,
    TooltipModule, TableModule, TagModule, DividerModule,
    QRCodeComponent
  ],
  providers: [MessageService],
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.scss']
})
export class FactureComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  // ===== MODE =====
  mode: 'view' | 'edit' | 'create' = 'create';
  factureId: number | null = null;

  get isViewMode():   boolean { return this.mode === 'view'; }
  get isEditMode():   boolean { return this.mode === 'edit'; }
  get isCreateMode(): boolean { return this.mode === 'create'; }

  get pageTitle(): string {
    if (this.mode === 'view') return 'Détail de la facture';
    if (this.mode === 'edit') return 'Modifier la facture';
    return 'Nouvelle facture';
  }

  // ===== QR CODE =====
  get qrUrl(): string {
    const id = this.factureId ?? this.numFact ?? 'UNKNOWN';
    return `${QR_BASE_URL}/factures/status/${id}`;
  }

  // ===== DONNÉES =====
  emetteurs: Emetteur[] = [];
  clients: Client[] = [];
  produits: Produit[] = [];
  vendeurSelectionne: Emetteur | null = null;
  acheteurSelectionne: Client | Emetteur | null = null;

  // ===== FORMULAIRE =====
  dateEmission: Date = new Date();
  datePaiement: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  numFact: string = '';
  vendeurId: number = DEFAULT_VENDEUR_ID;
  acheteurId: number | null = null;
  typeAcheteur: 'CLIENT' | 'EMETTEUR' = 'CLIENT';
  modePaiement: string = 'VIREMENT';
  statut: string = 'BROUILLON';
  lignes: LigneFacture[] = [];

  produitSelectionne: Produit | null = null;
  quantiteAjout: number = 1;

  // ===== OPTIONS =====
  typeAcheteurOptions = [
    { label: 'Client',   value: 'CLIENT' },
    { label: 'Émetteur', value: 'EMETTEUR' }
  ];
  modePaiementOptions = [
    { label: 'Virement bancaire', value: 'VIREMENT' },
    { label: 'Chèque',           value: 'CHEQUE' },
    { label: 'Espèces',          value: 'ESPECES' },
    { label: 'Carte bancaire',   value: 'CARTE' }
  ];
  statutOptions = [
    { label: 'Brouillon', value: 'BROUILLON' },
    { label: 'Émise',     value: 'EMISE' },
    { label: 'Payée',     value: 'PAYEE' },
    { label: 'Annulée',   value: 'ANNULEE' }
  ];

  loading = false;
  minDatePaiement: Date = new Date();

  ngOnInit(): void {
    const idParam   = this.route.snapshot.paramMap.get('id');
    const modeParam = this.route.snapshot.queryParamMap.get('mode');

    if (!idParam || idParam === 'nouvelle') {
      this.mode = 'create';
    } else {
      this.factureId = Number(idParam);
      this.mode = modeParam === 'edit' ? 'edit' : 'view';
    }

    this.loadEmetteurs();
    this.loadClients();
    this.loadProduits();
  }

  // ===== CHARGEMENTS =====

  loadEmetteurs(): void {
    this.http.get<Emetteur[]>(`${environment.apiUrl}/emetteurs`).subscribe({
      next: (data) => {
        this.emetteurs = data;
        const vendeur = data.find(e => e.id === DEFAULT_VENDEUR_ID);
        if (vendeur) this.vendeurSelectionne = vendeur;
        if ((this.isEditMode || this.isViewMode) && this.factureId) {
          this.loadFacture(this.factureId);
        }
      },
      error: () => this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Impossible de charger les émetteurs' })
    });
  }

  loadClients(): void {
    this.http.get<Client[]>(`${environment.apiUrl}/clients`).subscribe({
      next: (data) => { this.clients = data; this.onAcheteurChange(); },
      error: () => this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Impossible de charger les clients' })
    });
  }

  loadProduits(): void {
    this.http.get<Produit[]>(`${environment.apiUrl}/produits`).subscribe({
      next: (data) => this.produits = data,
      error: () => this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Impossible de charger les produits' })
    });
  }

  loadFacture(id: number): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/factures/${id}`).subscribe({
      next: (facture) => {
        this.numFact      = facture.numFact ?? '';
        this.statut       = facture.statut ?? 'BROUILLON';
        this.modePaiement = facture.modePaiement ?? 'VIREMENT';
        this.typeAcheteur = facture.typeAcheteur ?? 'CLIENT';
        this.vendeurId    = facture.vendeurId ?? DEFAULT_VENDEUR_ID;
        this.acheteurId   = facture.acheteurId ?? null;

        if (facture.dateEmission) this.dateEmission = new Date(facture.dateEmission);
        if (facture.datePaiement) this.datePaiement = new Date(facture.datePaiement);

        this.vendeurSelectionne = this.emetteurs.find(e => e.id === this.vendeurId) ?? null;
        this.onAcheteurChange();

        if (facture.lignes && Array.isArray(facture.lignes)) {
          this.lignes = facture.lignes.map((l: any) => this.mapLigne(l));
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger la facture' });
        console.error(err);
      }
    });
  }

  private mapLigne(l: any): LigneFacture {
    const produit  = this.produits.find(p => p.id === (l.produitId ?? l.produit?.id));
    const prixUnit = this.safeNum(l.prixUnitaire ?? l.prix_unitaire ?? produit?.prixUnitaire);
    const quantite = this.safeNum(l.quantite ?? l.qte ?? 1);
    const tauxTVA  = this.safeNum(l.tauxTVA  ?? l.taux_tva ?? produit?.tauxTVA ?? 0);
    const ht  = prixUnit * quantite;
    const tva = ht * (tauxTVA / 100);
    const ttc = ht + tva;
    const label = produit
      ? `${produit.reference} — ${produit.designation}`
      : (l.produitLabel ?? l.designation ?? l.libelle ?? `Produit #${l.produitId}`);
    return {
      produitId:    l.produitId ?? l.produit?.id ?? 0,
      produitLabel: label,
      quantite,
      prixUnitaire: prixUnit,
      tauxTVA,
      montantHT:    this.safeNum(l.montantHT  ?? l.montant_ht)  || ht,
      montantTVA:   this.safeNum(l.montantTVA ?? l.montant_tva) || tva,
      montantTTC:   this.safeNum(l.montantTTC ?? l.montant_ttc) || ttc,
    };
  }

  private safeNum(val: any): number {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }

  // ===== SÉLECTIONS =====

  onVendeurChange(): void {
    this.vendeurSelectionne = this.emetteurs.find(e => e.id === this.vendeurId) ?? null;
  }

  onAcheteurChange(): void {
    if (!this.acheteurId) return;
    if (this.typeAcheteur === 'CLIENT') {
      this.acheteurSelectionne = this.clients.find(c => c.id === this.acheteurId) ?? null;
    } else {
      this.acheteurSelectionne = this.emetteurs.find(e => e.id === this.acheteurId) ?? null;
    }
  }

  onTypeAcheteurChange(): void {
    this.acheteurId = null;
    this.acheteurSelectionne = null;
  }

  onDateEmissionChange(): void {
    this.minDatePaiement = new Date(this.dateEmission);
    if (this.datePaiement < this.dateEmission) {
      this.datePaiement = new Date(this.dateEmission.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  // ===== LIGNES =====

  get acheteurOptions(): { label: string; value: number }[] {
    if (this.typeAcheteur === 'CLIENT') return this.clients.map(c => ({ label: c.raisonSociale, value: c.id }));
    return this.emetteurs.map(e => ({ label: e.raisonSociale, value: e.id }));
  }

  get produitOptions(): { label: string; value: number }[] {
    return this.produits.map(p => ({
      label: `${p.reference} — ${p.designation} (${p.prixUnitaire.toFixed(3)} TND)`,
      value: p.id
    }));
  }

  ajouterLigne(): void {
    if (!this.acheteurId) {
      this.messageService.add({ severity: 'warn', summary: 'Acheteur requis', detail: "Sélectionnez un acheteur avant d'ajouter des lignes" });
      return;
    }
    if (!this.produitSelectionne) {
      this.messageService.add({ severity: 'warn', summary: 'Produit requis', detail: 'Sélectionnez un produit' });
      return;
    }
    const p   = this.produitSelectionne;
    const ht  = this.safeNum(p.prixUnitaire) * this.safeNum(this.quantiteAjout);
    const tva = ht * (this.safeNum(p.tauxTVA) / 100);
    this.lignes.push({
      produitId:    p.id,
      produitLabel: `${p.reference} — ${p.designation}`,
      quantite:     this.quantiteAjout,
      prixUnitaire: p.prixUnitaire,
      tauxTVA:      p.tauxTVA,
      montantHT:    ht,
      montantTVA:   tva,
      montantTTC:   ht + tva
    });
    this.produitSelectionne = null;
    this.quantiteAjout = 1;
  }

  supprimerLigne(index: number): void {
    this.lignes.splice(index, 1);
  }

  onProduitSelect(produitId: number): void {
    this.produitSelectionne = this.produits.find(p => p.id === produitId) ?? null;
  }

  // ===== TOTAUX =====
  get totalHT():     number { return this.lignes.reduce((s, l) => s + this.safeNum(l.montantHT),  0); }
  get totalTVA():    number { return this.lignes.reduce((s, l) => s + this.safeNum(l.montantTVA), 0); }
  get totalTTC():    number { return this.lignes.reduce((s, l) => s + this.safeNum(l.montantTTC), 0); }
  get droitTimbre(): number { return 0.500; }

  // ===== SAUVEGARDE =====

  sauvegarder(): void {
    if (!this.acheteurId) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Sélectionnez un acheteur' });
      return;
    }
    if (this.lignes.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ajoutez au moins une ligne de produit' });
      return;
    }
    this.loading = true;
    const payload = {
      dateEmission: this.formatDate(this.dateEmission),
      datePaiement: this.formatDate(this.datePaiement),
      acheteurId:   this.acheteurId,
      typeAcheteur: this.typeAcheteur,
      vendeurId:    this.vendeurId,
      modePaiement: this.modePaiement,
      statut:       this.statut,
      lignes:       this.lignes.map(l => ({ produitId: l.produitId, quantite: l.quantite }))
    };

    const request$ = this.isEditMode && this.factureId
      ? this.http.put(`${environment.apiUrl}/factures/${this.factureId}`, payload)
      : this.http.post(`${environment.apiUrl}/factures`, payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success', summary: 'Succès',
          detail: this.isEditMode ? 'Facture modifiée avec succès' : 'Facture créée avec succès'
        });
        setTimeout(() => this.router.navigate(['/factures']), 1500);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message ?? err?.error?.detail ?? 'Erreur lors de la sauvegarde';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
      }
    });
  }

  passerEnModeEdition(): void {
    this.mode = 'edit';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: 'edit' },
      replaceUrl: true
    });
  }

  imprimer(): void { window.print(); }

  // ===== HELPERS =====

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatPrix(v: any): string {
    const n = this.safeNum(v);
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(n) + ' TND';
  }

  formatModePaiement(mode: string): string {
    return this.modePaiementOptions.find(o => o.value === mode)?.label ?? mode;
  }

  formatStatut(statut: string): string {
    const map: Record<string, string> = {
      BROUILLON: 'Brouillon', EMISE: 'Émise',     PAYEE: 'Payée',
      ANNULEE:   'Annulée',   EN_ATTENTE: 'En attente', EN_RETARD: 'En retard'
    };
    return map[statut] ?? statut;
  }

  getStatutSeverity(statut: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
    const map: Record<string, any> = {
      PAYEE:      'success', EN_ATTENTE: 'warning', BROUILLON: 'warning',
      EN_RETARD:  'danger',  ANNULEE:    'secondary', EMISE:   'info'
    };
    return map[statut] ?? 'info';
  }

  retourListe(): void { this.router.navigate(['/factures']); }

  // =====================================================
  // ===== MONTANT EN LETTRES (français / TND) =====
  // =====================================================

  montantEnLettres(valeur: number): string {
    if (isNaN(valeur) || valeur < 0) return '';
    const dinars   = Math.floor(valeur);
    const millimes = Math.round((valeur - dinars) * 1000);
    const dinarStr   = dinars   > 0 ? `${this._nombreEnLettres(dinars)} ${dinars === 1 ? 'dinar' : 'dinars'}` : '';
    const millimeStr = millimes > 0 ? `${this._nombreEnLettres(millimes)} ${millimes === 1 ? 'millime' : 'millimes'}` : '';
    if (dinarStr && millimeStr) return `${dinarStr} et ${millimeStr}`;
    if (dinarStr)               return dinarStr;
    if (millimeStr)             return millimeStr;
    return 'zéro dinar';
  }

  private _nombreEnLettres(n: number): string {
    if (n === 0) return 'zéro';
    const unites = [
      '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
      'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
      'dix-sept', 'dix-huit', 'dix-neuf'
    ];
    const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

    const _dizaine = (n: number): string => {
      if (n < 20) return unites[n];
      const d = Math.floor(n / 10); const u = n % 10;
      if (d === 7) return u === 1 ? 'soixante et onze' : `soixante-${unites[10 + u]}`;
      if (d === 9) return u === 0 ? 'quatre-vingt-dix' : `quatre-vingt-${unites[10 + u]}`;
      if (d === 8) return u === 0 ? 'quatre-vingts' : `quatre-vingt-${unites[u]}`;
      const liaison = (u === 1 && d !== 8) ? ' et ' : '-';
      return u === 0 ? dizaines[d] : `${dizaines[d]}${liaison}${unites[u]}`;
    };

    const _centaine = (n: number): string => {
      const c = Math.floor(n / 100); const r = n % 100;
      if (c === 0) return _dizaine(r);
      const centStr = c === 1 ? 'cent' : `${unites[c]} cent${r === 0 && c > 1 ? 's' : ''}`;
      return r === 0 ? centStr : `${centStr} ${_dizaine(r)}`;
    };

    const _millier = (n: number): string => {
      const m = Math.floor(n / 1000); const r = n % 1000;
      let result = '';
      if (m > 0) result = m === 1 ? 'mille' : `${_centaine(m)} mille`;
      if (r > 0) result = result ? `${result} ${_centaine(r)}` : _centaine(r);
      return result;
    };

    const _million = (n: number): string => {
      const m = Math.floor(n / 1_000_000); const r = n % 1_000_000;
      let result = '';
      if (m > 0) result = `${_centaine(m)} million${m > 1 ? 's' : ''}`;
      if (r > 0) result = result ? `${result} ${_millier(r)}` : _millier(r);
      return result || _millier(n);
    };

    const lettres = n >= 1_000_000 ? _million(n) : _millier(n);
    return lettres.charAt(0).toUpperCase() + lettres.slice(1);
  }
}