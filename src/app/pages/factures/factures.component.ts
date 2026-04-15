// src/app/pages/factures/factures.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import { FactureService } from '../../core/services/facture.service';
import { AuthService } from '../../core/services/auth.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { Facture, StatutFacture, StatutFactureLabel } from '../../models/facture.model';

@Component({
  selector: 'app-factures',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, CardModule,
    ToastModule, ConfirmDialogModule, TagModule, TooltipModule,
    DropdownModule, CalendarModule, InputTextModule, ChartModule,
    ProgressSpinnerModule, TranslateModule, DialogModule, FileUploadModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './factures.component.html',
  styleUrls: ['./factures.component.scss']
})
export class FacturesComponent implements OnInit {
  private factureService = inject(FactureService);
  private authService = inject(AuthService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  get isViewer(): boolean {
    return this.authService.hasRole('ENTREPRISE_VIEWER');
  }

  factures: Facture[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  loadingStats: boolean = false;

  page: number = 1;
  rowsPerPage: number = 10;

  statutFilter: string = '';
  searchText: string = '';
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  statuts = Object.values(StatutFacture);
  stats: any = {};

  // Signature Modal
  showSignatureModal = false;
  signatureSuccess = false;
  selectedP12File: File | null = null;
  signaturePassword = '';
  isSigning = false;
  currentFactureId: number | null = null;

  ngOnInit(): void {
    this.loadFactures();
    this.loadStatistiques();
  }



  loadFactures(): void {
    this.loading = true;
    this.factureService.getFactures(this.page, this.rowsPerPage, this.statutFilter, this.searchText).subscribe({
      next: (response) => {
        this.factures = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.errorHandler.extractErrorMessage(err) });
        this.loading = false;
      }
    });
  }

  loadStatistiques(): void {
    this.loadingStats = true;
    this.factureService.getStatistiques().subscribe({
      next: (stats) => { this.stats = stats; this.loadingStats = false; },
      error: () => { this.loadingStats = false; }
    });
  }



  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.rowsPerPage = event.rows;
    this.loadFactures();
  }

  onSearch(): void { this.page = 1; this.loadFactures(); }
  applyFilters(): void { this.page = 1; this.loadFactures(); }

  resetFilters(): void {
    this.statutFilter = '';
    this.searchText = '';
    this.dateDebut = null;
    this.dateFin = null;
    this.page = 1;
    this.loadFactures();
  }

  getStatutSeverity(statut: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      [StatutFacture.PAID]: 'success',
      [StatutFacture.SIGNED]: 'success',
      [StatutFacture.SENT]: 'info',
      [StatutFacture.DRAFT]: 'warning',
      [StatutFacture.REJECTED]: 'danger',
      [StatutFacture.CANCELLED]: 'secondary'
    };
    return map[statut] ?? 'info';
  }

  formatStatut(statut: string): string {
    return StatutFactureLabel[statut] ?? statut;
  }

  // ===== NAVIGATION CORRIGÉE =====
  voirFacture(id: number): void {
    this.router.navigate(['/factures', id]);
  }

  modifierFacture(id: number): void {
    this.router.navigate(['/factures', id], { queryParams: { mode: 'edit' } });
  }

  nouvelleFacture(): void {
    this.router.navigate(['/factures', 'nouvelle']);
  }

  signerFacture(id: number): void {
    this.currentFactureId = id;
    this.showSignatureModal = true;
    this.signatureSuccess = false;
    this.selectedP12File = null;
    this.signaturePassword = '';
  }

  onFileSelect(event: any): void {
    this.selectedP12File = event.files[0];
  }

  confirmSignature(): void {
    if (!this.currentFactureId || !this.selectedP12File || !this.signaturePassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner un fichier .p12 et saisir le mot de passe'
      });
      return;
    }

    this.isSigning = true;
    this.factureService.signerFactureWithCertificate(
      this.currentFactureId,
      this.selectedP12File,
      this.signaturePassword
    ).subscribe({
      next: (response) => {
        this.isSigning = false;
        this.signatureSuccess = true;
        this.loadFactures();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Facture signée avec succès' });
      },
      error: (err) => {
        this.isSigning = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.errorHandler.extractErrorMessage(err)
        });
      }
    });
  }

  closeSignatureModal(): void {
    this.showSignatureModal = false;
    this.signatureSuccess = false;
    this.selectedP12File = null;
    this.signaturePassword = '';
    this.currentFactureId = null;
  }

  supprimerFacture(id: number): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette facture ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.factureService.deleteFacture(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Facture supprimée avec succès' });
            this.loadFactures();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer la facture' });
          }
        });
      }
    });
  }
}