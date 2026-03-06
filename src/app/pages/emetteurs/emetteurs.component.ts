// src/app/pages/emetteurs/emetteurs.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import { EmetteurService } from '../../core/services/emetteur.service';
import {
  Emetteur,
  EmetteurRequest,
  FormeJuridique,
  RegionTunisie
} from '../../models/emetteur.model';

@Component({
  selector: 'app-emetteurs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './emetteurs.component.html',
  styleUrls: ['./emetteurs.component.scss']
})
export class EmetteursComponent implements OnInit {
  private emetteurService = inject(EmetteurService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  emetteurs: Emetteur[] = [];
  emetteursFiltered: Emetteur[] = [];
  loading = false;

  page = 1;
  rowsPerPage = 10;
  searchText = '';

  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  selectedEmetteur: Emetteur | null = null;

  emetteurForm: Partial<EmetteurRequest> = {
    code: '',
    raisonSociale: '',
    matriculeFiscal: '',
    formeJuridique: 'SARL',
    adresseComplete: '',
    pays: 'TUNISIE',
    region: 'TUNIS',
    email: '',
    telephone: '',
    siteWeb: '',
    iban: '',
    banque: ''
  };

  regions: { label: string; value: RegionTunisie }[] = [
    { label: 'Tunis', value: 'TUNIS' },
    { label: 'Ariana', value: 'ARIANA' },
    { label: 'Ben Arous', value: 'BEN_AROUS' },
    { label: 'Manouba', value: 'MANOUBA' },
    { label: 'Nabeul', value: 'NABEUL' },
    { label: 'Zaghouan', value: 'ZAGHOUAN' },
    { label: 'Bizerte', value: 'BIZERTE' },
    { label: 'Béja', value: 'BEJA' },
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
    { label: 'Gabès', value: 'GABES' },
    { label: 'Medenine', value: 'MEDENINE' },
    { label: 'Tataouine', value: 'TATAOUINE' },
    { label: 'Gafsa', value: 'GAFSA' },
    { label: 'Tozeur', value: 'TOZEUR' },
    { label: 'Kebili', value: 'KEBILI' }
  ];

  formesJuridiques: { label: string; value: FormeJuridique }[] = [
    { label: 'SARL', value: 'SARL' },
    { label: 'SA', value: 'SA' },
    { label: 'SUARL', value: 'SUARL' },
    { label: 'SNC', value: 'SNC' },
    { label: 'SCS', value: 'SCS' },
    { label: 'SCA', value: 'SCA' },
    { label: 'EI', value: 'EI' },
    { label: 'Société Civile', value: 'SOCIETE_CIVILE' }
  ];

  ngOnInit(): void {
    this.loadEmetteurs();
  }

  loadEmetteurs(): void {
    this.loading = true;
    this.emetteurService.getEmetteurs().subscribe({
      next: (list) => {
        this.emetteurs = list ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error?.error?.message || 'Impossible de charger les émetteurs'
        });
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const search = (this.searchText || '').toLowerCase().trim();
    this.emetteursFiltered = search
      ? this.emetteurs.filter(
          (e) =>
            (e.code || '').toLowerCase().includes(search) ||
            (e.raisonSociale || '').toLowerCase().includes(search) ||
            (e.email || '').toLowerCase().includes(search) ||
            (e.matriculeFiscal || '').includes(search)
        )
      : [...this.emetteurs];
  }

  onPageChange(event: any): void {
    this.page = (event?.page ?? 0) + 1;
    this.rowsPerPage = event?.rows ?? this.rowsPerPage;
  }

  onSearch(): void {
    this.page = 1;
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchText = '';
    this.onSearch();
  }

  ajouterEmetteur(): void {
    this.dialogMode = 'add';
    this.selectedEmetteur = null;
    this.resetForm();
    this.displayDialog = true;
  }

  modifierEmetteur(emetteur: Emetteur): void {
    this.dialogMode = 'edit';
    this.selectedEmetteur = emetteur;
    this.emetteurForm = {
      code: emetteur.code,
      raisonSociale: emetteur.raisonSociale,
      matriculeFiscal: emetteur.matriculeFiscal,
      formeJuridique: (emetteur.formeJuridique as FormeJuridique) || 'SARL',
      adresseComplete: emetteur.adresseComplete,
      pays: emetteur.pays || 'TUNISIE',
      region: (emetteur.region as RegionTunisie) || 'TUNIS',
      email: emetteur.email,
      telephone: emetteur.telephone ?? '',
      siteWeb: emetteur.siteWeb ?? '',
      iban: emetteur.iban ?? '',
      banque: emetteur.banque ?? ''
    };
    this.displayDialog = true;
  }

  resetForm(): void {
    this.emetteurForm = {
      code: '',
      raisonSociale: '',
      matriculeFiscal: '',
      formeJuridique: 'SARL',
      adresseComplete: '',
      pays: 'TUNISIE',
      region: 'TUNIS',
      email: '',
      telephone: '',
      siteWeb: '',
      iban: '',
      banque: ''
    };
  }

  sauvegarderEmetteur(): void {
    const code = this.emetteurForm.code?.trim();
    const raisonSociale = this.emetteurForm.raisonSociale?.trim();
    const matriculeFiscal = this.emetteurForm.matriculeFiscal?.trim();
    const adresseComplete = this.emetteurForm.adresseComplete?.trim();
    const email = this.emetteurForm.email?.trim();
    const region = this.emetteurForm.region;
    const formeJuridique = this.emetteurForm.formeJuridique;

    if (!code || code.length < 3 || code.length > 20) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Le code doit contenir entre 3 et 20 caractères'
      });
      return;
    }
    if (!raisonSociale || raisonSociale.length < 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'La raison sociale est obligatoire (min. 2 caractères)'
      });
      return;
    }
    if (!matriculeFiscal) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Le matricule fiscal est obligatoire'
      });
      return;
    }
    if (!formeJuridique) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'La forme juridique est obligatoire'
      });
      return;
    }
    if (!adresseComplete) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: "L'adresse est obligatoire"
      });
      return;
    }
    if (!region) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'La région est obligatoire'
      });
      return;
    }
    if (!email) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: "L'email est obligatoire"
      });
      return;
    }
    const tel = this.emetteurForm.telephone?.replace(/\s/g, '') ?? '';
    if (tel && !/^[0-9]{8}$/.test(tel)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Le téléphone doit contenir exactement 8 chiffres'
      });
      return;
    }

    this.loading = true;
    const request: EmetteurRequest = {
      code,
      raisonSociale,
      matriculeFiscal,
      formeJuridique: formeJuridique!,
      adresseComplete,
      pays: this.emetteurForm.pays || 'TUNISIE',
      region,
      email,
      telephone: tel || undefined,
      siteWeb: this.emetteurForm.siteWeb?.trim() || undefined,
      iban: this.emetteurForm.iban?.trim() || undefined,
      banque: this.emetteurForm.banque?.trim() || undefined
    };

    if (this.dialogMode === 'add') {
      this.emetteurService.createEmetteur(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Émetteur ajouté'
          });
          this.displayDialog = false;
          this.loadEmetteurs();
        },
        error: (error) => {
          const msg =
            error?.error?.message ||
            error?.error?.error ||
            (error?.status === 403
              ? 'Accès refusé'
              : "Impossible d'ajouter l'émetteur");
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: msg
          });
          this.loading = false;
        }
      });
    } else if (this.selectedEmetteur) {
      this.emetteurService
        .updateEmetteur(this.selectedEmetteur.id, request)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Émetteur modifié'
            });
            this.displayDialog = false;
            this.loadEmetteurs();
          },
          error: (error) => {
            const msg =
              error?.error?.message ||
              error?.error?.error ||
              "Impossible de modifier l'émetteur";
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: msg
            });
            this.loading = false;
          }
        });
    }
  }

  supprimerEmetteur(id: number): void {
    this.confirmationService.confirm({
      message: 'Supprimer cet émetteur ?',
     
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.emetteurService.deleteEmetteur(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Émetteur supprimé'
            });
            this.loadEmetteurs();
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer'
            });
          }
        });
      }
    });
  }
}
