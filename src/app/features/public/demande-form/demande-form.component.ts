import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { CreateDemandeRequest, REGIONS_TUNISIE } from '../../../models';
import { DemandeService } from '../../../core/services/demande.service';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    ToastModule,
    DropdownModule
  ],
  providers: [MessageService],
  templateUrl: './demande-form.component.html',
  styleUrls: ['./demande-form.component.scss']
})
export class DemandeFormComponent {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private demandeService = inject(DemandeService);

  // Informations entreprise
  code: string = '';
  raisonSociale: string = '';
  matriculeFiscal: string = '';
  formeJuridique: string = '';
  email: string = '';
  telephone: string = '';
  adresseComplete: string = '';
  region: string = '';
  siteWeb: string = '';
  iban: string = '';
  banque: string = '';

  // Informations responsable
  nomResponsable: string = '';
  prenomResponsable: string = '';
  fonctionResponsable: string = '';


  loading: boolean = false;
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly telephoneRegex = /^[0-9+\s-]{8,20}$/;

  regions = REGIONS_TUNISIE.map(r => ({
    label: r.replace(/_/g, ' ').toUpperCase(), // Formate: SIDI_BOUZID -> SIDI BOUZID
    value: r
  }));

  formeJuridiqueOptions = [
    { label: 'SARL - Société à Responsabilité Limitée', value: 'SARL' },
    { label: 'SA - Société Anonyme', value: 'SA' },
    { label: 'SUARL - Société Unipersonnelle à Responsabilité Limitée', value: 'SUARL' },
    { label: 'SNC - Société en Nom Collectif', value: 'SNC' },
    { label: 'SCS - Société en Commandite Simple', value: 'SCS' },
    { label: 'SCA - Société en Commandite par Actions', value: 'SCA' },
    { label: 'EI - Entreprise Individuelle', value: 'EI' },
    { label: 'Société Civile', value: 'SOCIETE_CIVILE' }
  ];

  submitDemande(): void {
    // Validation
    if (!this.code?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez entrer le code de l\'entreprise.'
      });
      return;
    }

    if (!this.raisonSociale?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez entrer la raison sociale.'
      });
      return;
    }

    if (!this.matriculeFiscal?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez entrer le matricule fiscal.'
      });
      return;
    }

    if (!this.adresseComplete?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez entrer l\'adresse complète.'
      });
      return;
    }

    if (!this.region) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez sélectionner une région.'
      });
      return;
    }

    if (!this.email?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez entrer votre email.'
      });
      return;
    }

    if (!this.emailRegex.test(this.email.trim())) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Le format de l\'email est invalide.'
      });
      return;
    }

    if (!this.formeJuridique) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez sélectionner la forme juridique.'
      });
      return;
    }

    const cleanedPhone = this.telephone?.trim();
    if (cleanedPhone && !this.telephoneRegex.test(cleanedPhone)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Le numéro de téléphone est invalide.'
      });
      return;
    }

    if (!this.nomResponsable?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez entrer le nom du responsable.'
      });
      return;
    }

    if (!this.prenomResponsable?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez entrer le prénom du responsable.'
      });
      return;
    }

    if (!this.fonctionResponsable?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez entrer la fonction du responsable.'
      });
      return;
    }

    this.loading = true;

    const request: CreateDemandeRequest = {
      code: this.code.trim(),
      raisonSociale: this.raisonSociale.trim(),
      matriculeFiscal: this.matriculeFiscal.trim(),
      email: this.email.trim(),
      adresseComplete: this.adresseComplete.trim(),
      region: this.region,
      nomResponsable: this.nomResponsable.trim(),
      prenomResponsable: this.prenomResponsable.trim(),
      fonctionResponsable: this.fonctionResponsable.trim(),
      formeJuridique: this.formeJuridique,
      telephone: cleanedPhone || undefined,
      siteWeb: this.siteWeb?.trim() || undefined,
      iban: this.iban?.trim() || undefined,
      banque: this.banque?.trim() || undefined
    };

    // Compatibilite backend: certains endpoints attendent encore des noms de champs legacy.
    const requestCompat: any = {
      ...request,
      pays: 'TUNISIE',
      nomRepresentant: request.nomResponsable,
      prenomRepresentant: request.prenomResponsable,
      fonctionRepresentant: request.fonctionResponsable
    };

    this.demandeService.soumettreDemande(requestCompat).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Demande soumise',
          detail: 'Votre demande d\'entreprise a été reçue. Vous serez notifié de sa décision par email.'
        });

        setTimeout(() => {
          this.router.navigate(['/demande/statut'], {
            queryParams: { email: this.email }
          });
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        const message = this.extractApiError(err, 'Une erreur est survenue lors de la soumission.');
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de soumission',
          detail: message
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  private extractApiError(err: any, fallback: string): string {
    const payload = err?.error;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      const first = payload.errors[0];
      if (typeof first === 'string') {
        return first;
      }
      if (first?.defaultMessage) {
        return first.defaultMessage;
      }
      if (first?.message) {
        return first.message;
      }
      if (first?.field && (first?.defaultMessage || first?.message)) {
        return `${first.field}: ${first.defaultMessage || first.message}`;
      }
    }

    if (Array.isArray(payload?.violations) && payload.violations.length > 0) {
      const firstViolation = payload.violations[0];
      if (typeof firstViolation === 'string') {
        return firstViolation;
      }
      if (firstViolation?.message) {
        return firstViolation.message;
      }
    }

    if (payload?.message) {
      return payload.message;
    }

    if (payload && typeof payload === 'object') {
      const firstKey = Object.keys(payload)[0];
      if (firstKey) {
        const firstValue = payload[firstKey];
        if (Array.isArray(firstValue) && firstValue.length > 0) {
          return `${firstKey}: ${String(firstValue[0])}`;
        }
        if (typeof firstValue === 'string' && firstValue.trim()) {
          return `${firstKey}: ${firstValue}`;
        }
      }
    }

    if (payload?.error) {
      return payload.error;
    }

    if (err?.message) {
      return err.message;
    }

    return fallback;
  }
}
