import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DemandeService } from '../../core/services/demande.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule, ProgressSpinnerModule, TranslateModule],
  providers: [MessageService],
  templateUrl: './demandes.component.html',
  styleUrl: './demandes.component.scss'
})
export class DemandesComponent implements OnInit {
  private demandeService = inject(DemandeService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  demandes: any[] = [];
  isLoading = false;
  actionLoadingId: number | null = null;

  get pendingCount(): number {
    return this.demandes.filter(d =>
      d.status === 'REQUESTED' || d.status === 'PENDING'
    ).length;
  }

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.isLoading = true;
    this.demandeService.getDemandesEnAttente().subscribe({
      next: (data) => {
        this.demandes = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error', summary: this.translate.instant('TOAST.ERROR'),
          detail: this.translate.instant('DEMANDES.MSGS.LOAD_ERROR') || 'Impossible de charger les demandes.'
        });
      }
    });
  }

  voirDetail(id: number): void {
    this.router.navigate(['/super-admin/demandes', id]);
  }

  approuver(demande: any): void {
    this.actionLoadingId = demande.id;
    this.demandeService.approuverDemande(demande.id).subscribe({
      next: () => {
        demande.status = 'APPROVED';
        this.actionLoadingId = null;
        this.messageService.add({
          severity: 'success', summary: this.translate.instant('STATUS.APPROVED'),
          detail: this.translate.instant('DEMANDES.MSGS.APPROVE_SUCCESS')
        });
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.messageService.add({
          severity: 'error', summary: this.translate.instant('TOAST.ERROR'),
          detail: this.extractApiError(err, this.translate.instant('DEMANDES.MSGS.APPROVE_ERROR'))
        });
      }
    });
  }

  rejeter(demande: any): void {
    const raison = prompt(this.translate.instant('DEMANDES.PROMPT_REASON') || 'Raison du rejet (obligatoire) :');
    if (!raison?.trim()) return;

    this.actionLoadingId = demande.id;
    this.demandeService.rejeterDemande(demande.id, raison).subscribe({
      next: () => {
        demande.status = 'REJECTED';
        this.actionLoadingId = null;
        this.messageService.add({
          severity: 'info', summary: this.translate.instant('STATUS.REJECTED'),
          detail: this.translate.instant('DEMANDES.MSGS.REJECT_SUCCESS')
        });
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.messageService.add({
          severity: 'error', summary: this.translate.instant('TOAST.ERROR'),
          detail: this.extractApiError(err, this.translate.instant('DEMANDES.MSGS.REJECT_ERROR'))
        });
      }
    });
  }

  isPending(status: string): boolean {
    return status === 'REQUESTED' || status === 'PENDING';
  }

  getStatutLabel(status: string): string {
    const s = (status === 'REQUESTED' || status === 'PENDING') ? 'PENDING' : status;
    return this.translate.instant('STATUS.' + s);
  }

  getStatutClass(status: string): string {
    if (status === 'APPROVED') return 'ok';
    if (status === 'REJECTED') return 'ko';
    return 'pending';
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
