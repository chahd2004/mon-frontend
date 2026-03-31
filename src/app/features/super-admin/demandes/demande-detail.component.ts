import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DemandeService } from '../../../core/services/demande.service';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, CardModule, TagModule,
    InputTextareaModule, ToastModule, ConfirmDialogModule, ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './demande-detail.component.html',
  styleUrl: './demande-detail.component.scss'
})
export class DemandeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private demandeService = inject(DemandeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  demande: any = null;
  isLoading = false;
  actionLoading = false;
  rejectionReason = '';
  showRejectionForm = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetail(+id);
    }
  }

  loadDetail(id: number): void {
    this.isLoading = true;
    this.demandeService.getDemandeDetails(id).subscribe({
      next: (data) => {
        this.demande = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error', summary: 'Erreur',
          detail: 'Impossible de charger les détails de cette demande.'
        });
      }
    });
  }

  confirmerApprobation(): void {
    this.confirmationService.confirm({
      message: `Approuver la demande de "${this.demande?.raisonSociale}" ? Un email avec les identifiants sera envoyé automatiquement.`,
      header: 'Confirmation d\'approbation',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Approuver',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.approuver()
    });
  }

  approuver(): void {
    this.actionLoading = true;
    this.demandeService.approuverDemande(this.demande.id).subscribe({
      next: () => {
        this.actionLoading = false;
        this.demande.status = 'APPROVED';
        this.messageService.add({
          severity: 'success', summary: 'Demande approuvée',
          detail: 'Le compte a été créé et un email envoyé au responsable.'
        });
        setTimeout(() => this.router.navigate(['/super-admin/demandes']), 2500);
      },
      error: (err) => {
        this.actionLoading = false;
        const msg = this.extractApiError(err, 'Erreur lors de l\'approbation.');
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
      }
    });
  }

  ouvrirRejet(): void {
    this.showRejectionForm = true;
    this.rejectionReason = '';
  }

  annulerRejet(): void {
    this.showRejectionForm = false;
    this.rejectionReason = '';
  }

  rejeter(): void {
    if (!this.rejectionReason.trim()) {
      this.messageService.add({
        severity: 'warn', summary: 'Validation',
        detail: 'Veuillez entrer une raison de rejet.'
      });
      return;
    }
    this.actionLoading = true;
    this.demandeService.rejeterDemande(this.demande.id, this.rejectionReason).subscribe({
      next: () => {
        this.actionLoading = false;
        this.demande.status = 'REJECTED';
        this.showRejectionForm = false;
        this.messageService.add({
          severity: 'info', summary: 'Demande rejetée',
          detail: 'La demande a été rejetée et un email a été envoyé.'
        });
        setTimeout(() => this.router.navigate(['/super-admin/demandes']), 2500);
      },
      error: (err) => {
        this.actionLoading = false;
        const msg = this.extractApiError(err, 'Erreur lors du rejet.');
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
      }
    });
  }

  retourListe(): void {
    this.router.navigate(['/super-admin/demandes']);
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      REQUESTED: '⏳ En attente',
      APPROVED: '✅ Approuvée',
      REJECTED: '❌ Rejetée'
    };
    return labels[this.demande?.status] || this.demande?.status || '';
  }

  getStatusSeverity(): 'warning' | 'success' | 'danger' | 'info' {
    const map: Record<string, 'warning' | 'success' | 'danger' | 'info'> = {
      REQUESTED: 'warning', APPROVED: 'success', REJECTED: 'danger'
    };
    return map[this.demande?.status] || 'info';
  }

  isPending(): boolean {
    return this.demande?.status === 'REQUESTED' || this.demande?.status === 'PENDING';
  }

  private extractApiError(err: any, fallback: string): string {
    const payload = err?.error;
    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }
    if (payload?.message) {
      return payload.message;
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
