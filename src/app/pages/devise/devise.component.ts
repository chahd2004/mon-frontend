import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DevisService } from '../../core/services/devis.service';
import { Devis } from '../../models/devis.model';

@Component({
  selector: 'app-devise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devise.component.html',
  styleUrls: ['./devise.component.scss']
})
export class DeviseComponent implements OnInit {
  private readonly devisService = inject(DevisService);
  private readonly router = inject(Router);

  devis: Devis[] = [];
  loading = false;
  errorMessage = '';
  showStats = true;
  selectedDevis: Devis | null = null;

  ngOnInit(): void {
    this.loadDevis();
  }

  get totalDevis(): number {
    return this.devis.length;
  }

  get totalMontant(): number {
    return this.devis.reduce((sum, item) => sum + (item.totalTTC || 0), 0);
  }

  get acceptedCount(): number {
    return this.devis.filter(item => item.statut === 'ACCEPTED').length;
  }

  get pendingCount(): number {
    return this.devis.filter(item => item.statut === 'SENT').length;
  }

  get expiredCount(): number {
    return this.devis.filter(item => item.statut === 'EXPIRED').length;
  }

  get acceptanceRate(): number {
    if (!this.totalDevis) {
      return 0;
    }

    return (this.acceptedCount / this.totalDevis) * 100;
  }

  loadDevis(): void {
    this.loading = true;
    this.errorMessage = '';

    this.devisService.getAll().subscribe({
      next: (list) => {
        this.devis = Array.isArray(list) ? list : [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les devis depuis le backend.';
        this.loading = false;
      }
    });
  }

  toggleStats(): void {
    this.showStats = !this.showStats;
  }

  nouveauDevis(): void {
    this.router.navigate(['/factures', 'nouvelle'], { queryParams: { source: 'devis' } });
  }

  voirDevis(id: number): void {
    this.devisService.getById(id).subscribe({
      next: (data) => {
        this.selectedDevis = data;
      },
      error: () => {
        this.errorMessage = `Impossible de charger le devis #${id}.`;
      }
    });
  }

  modifierDevis(id: number): void {
    this.router.navigate(['/factures', id], { queryParams: { mode: 'edit', source: 'devis' } });
  }

  envoyerDevis(id: number): void {
    this.devisService.envoyer(id).subscribe({
      next: () => {
        this.loadDevis();
      },
      error: () => {
        this.errorMessage = `Impossible d'envoyer le devis #${id}.`;
      }
    });
  }

  exporterCsv(): void {
    if (!this.devis.length) {
      return;
    }

    const headers = [
      'Numero',
      'Client',
      'DateEmission',
      'DateValidite',
      'TotalTTC',
      'Statut'
    ];

    const rows = this.devis.map(item => [
      item.numDevis,
      item.acheteurNom,
      item.dateCreation,
      item.dateValidite ?? '',
      String(item.totalTTC ?? 0),
      item.statut
    ]);

    const csv = [headers, ...rows]
      .map(line => line.map(value => `"${String(value).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `devis-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      DRAFT: 'draft',
      SENT: 'sent',
      ACCEPTED: 'accepted',
      REJECTED: 'rejected',
      EXPIRED: 'expired',
      CONVERTED: 'converted'
    };

    return map[statut] || 'draft';
  }
}
