// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { FactureService } from '../../core/services/facture.service';
import { ClientService } from '../../core/services/client.service';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, ChartModule,
    TableModule, TagModule, ProgressSpinnerModule, TooltipModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private factureService   = inject(FactureService);
  private clientService    = inject(ClientService);
  private dashboardService = inject(DashboardService);
  private router           = inject(Router);
  private messageService   = inject(MessageService);

  totalFactures: number    = 0;
  totalClients: number     = 0;
  chiffreAffaires: number  = 0;
  facturesImpayees: number = 0;
  loading: boolean         = true;
  dernieresFactures: any[] = [];

  chartData: any = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Chiffre d\'affaires (TND)',
        data: [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Factures payées',
        data: [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  };

  chartOptions: any;

  stats: any = {
    evolution: 0,
    exercice: new Date().getFullYear().toString(),
    annees: []
  };

  ngOnInit(): void {
    this.initChartOptions();
    this.loadData();
  }

  initChartOptions(): void {
    this.chartOptions = {
      plugins: {
        legend: { labels: { color: '#495057' } },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) label += this.formatMontant(context.parsed.y);
              return label;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
        y: {
          ticks: { color: '#495057', callback: (v: any) => this.formatMontant(v, true) },
          grid: { color: '#ebedef' }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  loadData(): void {
    this.loading = true;

    this.dashboardService.getStats().subscribe({
      next: (data: any) => {
        this.totalFactures    = data.factures?.total         || 0;
        this.totalClients     = data.clients?.total          || 0;
        this.chiffreAffaires  = data.chiffreAffaires?.actuel || 0;
        this.facturesImpayees = data.factures?.enRetard      || 0;
        this.stats.evolution  = data.chiffreAffaires?.evolution || 0;
        this.stats.annees     = data.chiffreAffaires?.parAnnee  || [];
        if (data.graphiques?.caMensuel) {
          this.chartData.datasets[0].data = data.graphiques.caMensuel.valeurs || [];
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les statistiques' });
        this.loading = false;
      }
    });

    this.dashboardService.getDernieresFactures(5).subscribe({
      next: (f: any[]) => { this.dernieresFactures = f || []; },
      error: () => { this.dernieresFactures = []; }
    });

    this.clientService.getClients().subscribe({
      next: (clients) => { this.totalClients = clients.length; },
      error: () => {}
    });
  }

  formatMontant(montant: number, abrege: boolean = false): string {
    if (!montant && montant !== 0) return '0 TND';
    if (abrege && montant >= 1000000) return (montant / 1000000).toFixed(1) + ' M TND';
    return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(montant) + ' TND';
  }

  getStatutSeverity(statut: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      PAYEE: 'success', EN_ATTENTE: 'warning', EN_RETARD: 'danger', ANNULEE: 'secondary', BROUILLON: 'info'
    };
    return map[statut] ?? 'info';
  }

  formatStatut(statut: string): string {
    const map: Record<string, string> = {
      PAYEE: 'Payée', EN_ATTENTE: 'En attente', EN_RETARD: 'En retard', ANNULEE: 'Annulée', BROUILLON: 'Brouillon'
    };
    return map[statut] ?? statut;
  }

  naviguerVersFactures(): void  { this.router.navigate(['/factures']); }
  naviguerVersClients():  void  { this.router.navigate(['/clients']);  }
  voirFacture(id: number): void { this.router.navigate(['/factures', id]); }
  retourAccueil():        void  { this.router.navigate(['/']); }

  rafraichir(): void {
    this.loadData();
    this.messageService.add({ severity: 'info', summary: 'Rafraîchi', detail: 'Données mises à jour' });
  }
}