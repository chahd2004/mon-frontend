import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DemandeService } from '../../core/services/demande.service';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './demandes.component.html',
  styleUrl: './demandes.component.scss'
})
export class DemandesComponent implements OnInit {
  private demandeService = inject(DemandeService);
  private messageService = inject(MessageService);
  private router = inject(Router);

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
          severity: 'error', summary: 'Erreur',
          detail: 'Impossible de charger les demandes.'
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
          severity: 'success', summary: 'Approuvée',
          detail: `La demande de "${demande.raisonSociale}" a été approuvée.`
        });
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.messageService.add({
          severity: 'error', summary: 'Erreur',
          detail: this.extractApiError(err, 'Erreur lors de l\'approbation.')
        });
      }
    });
  }

  rejeter(demande: any): void {
    const raison = prompt('Raison du rejet (obligatoire) :');
    if (!raison?.trim()) return;

    this.actionLoadingId = demande.id;
    this.demandeService.rejeterDemande(demande.id, raison).subscribe({
      next: () => {
        demande.status = 'REJECTED';
        this.actionLoadingId = null;
        this.messageService.add({
          severity: 'info', summary: 'Rejetée',
          detail: `La demande de "${demande.raisonSociale}" a été rejetée.`
        });
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.messageService.add({
          severity: 'error', summary: 'Erreur',
          detail: this.extractApiError(err, 'Erreur lors du rejet.')
        });
      }
    });
  }

  isPending(status: string): boolean {
    return status === 'REQUESTED' || status === 'PENDING';
  }

  getStatutLabel(status: string): string {
    const labels: Record<string, string> = {
      REQUESTED: 'EN ATTENTE',
      PENDING: 'EN ATTENTE',
      APPROVED: 'APPROUVÉE',
      REJECTED: 'REJETÉE'
    };
    return labels[status] || status;
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
