import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, ChartModule, SkeletonModule],
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.scss'
})
export class StatistiquesComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  isLoading = true;

  // KPI Data
  usersCount = 0;
  clientsCount = 0;
  emetteursCount = 0;
  facturesCount = 0;
  caTotalCount = '0 TND';

  // Charts
  chartDataRequests: any;
  chartOptions: any;

  ngOnInit(): void {
    this.loadStatistics();
    this.initCharts();
  }

  private loadStatistics(): void {
    this.isLoading = true;
    
    this.dashboardService.getDashboardStatsFromAPI().subscribe({
      next: (stats: DashboardStats) => {
        // Récupérer les données réelles
        this.facturesCount = stats.factures.total;
        this.clientsCount = stats.clients.total;
        this.caTotalCount = this.formatCurrency(stats.chiffreAffaires.actuel);
        
        // Les données pour Users et Emetteurs peuvent nécessiter des appels API additionnels
        // Pour l'instant, on met à jour avec les données disponibles
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.isLoading = false;
      }
    });
  }

  private formatCurrency(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M TND';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K TND';
    }
    return value + ' TND';
  }

  private initCharts(): void {
    const chartOptions = {
      plugins: {
        legend: {
          display: true,
          labels: {
            usePointStyle: true
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#e5e7eb'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    };

    this.chartOptions = chartOptions;

    // Chart Évolution des inscriptions par mois
    this.chartDataRequests = {
      labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      datasets: [
        {
          label: 'Inscriptions',
          data: [150, 120, 100, 95, 50, 55, 60, 70, 65, 75, 80, 90],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }
      ]
    };
  }
}
