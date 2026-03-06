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
import { MessageService, ConfirmationService } from 'primeng/api';

import { FactureService } from '../../core/services/facture.service';
import { Facture, StatutFacture } from '../../models/facture.model';

@Component({
  selector: 'app-factures',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, CardModule,
    ToastModule, ConfirmDialogModule, TagModule, TooltipModule,
    DropdownModule, CalendarModule, InputTextModule, ChartModule, ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './factures.component.html',
  styleUrls: ['./factures.component.scss']
})
export class FacturesComponent implements OnInit {
  private factureService       = inject(FactureService);
  private router               = inject(Router);
  private messageService       = inject(MessageService);
  private confirmationService  = inject(ConfirmationService);

  factures: Facture[]  = [];
  totalRecords: number = 0;
  loading: boolean     = false;
  loadingStats: boolean = false;

  page: number        = 1;
  rowsPerPage: number = 10;

  statutFilter: string  = '';
  searchText: string    = '';
  dateDebut: Date | null = null;
  dateFin: Date | null   = null;

  statuts = Object.values(StatutFacture);
  stats: any   = {};
  chartData: any;
  chartOptions: any;

  ngOnInit(): void {
    this.loadFactures();
    this.loadStatistiques();
    this.initChart();
  }

  initChart(): void {
    this.chartOptions = {
      plugins: { legend: { labels: { color: '#495057' } } },
      scales: {
        x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
        y: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } }
      }
    };
  }

  loadFactures(): void {
    this.loading = true;
    this.factureService.getFactures(this.page, this.rowsPerPage, this.statutFilter, this.searchText).subscribe({
      next: (response) => {
        this.factures     = response.data;
        this.totalRecords = response.total;
        this.loading      = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger la liste des factures' });
        this.loading = false;
      }
    });
  }

  loadStatistiques(): void {
    this.loadingStats = true;
    this.factureService.getStatistiques().subscribe({
      next: (stats) => { this.stats = stats; this.updateChartData(); this.loadingStats = false; },
      error: () => { this.loadingStats = false; }
    });
  }

  updateChartData(): void {
    this.chartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        { label: 'Factures émises', data: [65,59,80,81,56,55,40,45,38,50,60,70], fill: false, borderColor: '#3b82f6', tension: 0.4 },
        { label: 'Factures payées', data: [45,40,60,70,45,40,30,35,28,40,45,55], fill: false, borderColor: '#10b981', tension: 0.4 }
      ]
    };
  }

  onPageChange(event: any): void {
    this.page        = event.page + 1;
    this.rowsPerPage = event.rows;
    this.loadFactures();
  }

  onSearch():     void { this.page = 1; this.loadFactures(); }
  applyFilters(): void { this.page = 1; this.loadFactures(); }

  resetFilters(): void {
    this.statutFilter = '';
    this.searchText   = '';
    this.dateDebut    = null;
    this.dateFin      = null;
    this.page         = 1;
    this.loadFactures();
  }

  getStatutSeverity(statut: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      [StatutFacture.PAYEE]: 'success', [StatutFacture.EN_ATTENTE]: 'warning',
      [StatutFacture.EN_RETARD]: 'danger', [StatutFacture.ANNULEE]: 'secondary',
      [StatutFacture.BROUILLON]: 'info'
    };
    return map[statut] ?? 'info';
  }

  formatStatut(statut: string): string {
    const map: Record<string, string> = {
      [StatutFacture.PAYEE]: 'Payée', [StatutFacture.EN_ATTENTE]: 'En attente',
      [StatutFacture.EN_RETARD]: 'En retard', [StatutFacture.ANNULEE]: 'Annulée',
      [StatutFacture.BROUILLON]: 'Brouillon'
    };
    return map[statut] ?? statut;
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