import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { StatCardComponent, type KPIData } from '../../../shared';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, ChartModule, StatCardComponent],
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.scss'
})
export class StatistiquesComponent implements OnInit {
  isLoading = false;

  // KPIs
  kpiCards: KPIData[] = [];

  // Charts
  chartDataUsers: any;
  chartDataRequests: any;
  chartOptions: any;

  ngOnInit(): void {
    this.loadStatistics();
    this.initCharts();
  }

  private loadStatistics(): void {
    this.isLoading = true;

    this.kpiCards = [
      {
        title: 'Utilisateurs Totaux',
        value: 1234,
        icon: 'pi pi-users',
        color: 'blue',
        trend: 'up',
        trendValue: 12
      },
      {
        title: 'Entreprises Actives',
        value: 456,
        icon: 'pi pi-briefcase',
        color: 'purple',
        trend: 'up',
        trendValue: 8
      },
      {
        title: 'Demandes en Attente',
        value: 23,
        icon: 'pi pi-inbox',
        color: 'orange',
        trend: 'down',
        trendValue: 5
      },
      {
        title: 'Factures Ce Mois',
        value: 890,
        icon: 'pi pi-file',
        color: 'green',
        trend: 'up',
        trendValue: 15
      },
      {
        title: 'Total Collecté',
        value: '1.2M TND',
        icon: 'pi pi-wallet',
        color: 'green',
        trend: 'up',
        trendValue: 22
      },
      {
        title: 'Taux d\'Activation',
        value: '87.3%',
        icon: 'pi pi-percentage',
        color: 'blue',
        trend: 'stable',
        trendValue: 0
      }
    ];

    this.isLoading = false;
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

    // Chart Utilisateurs par rôle
    this.chartDataUsers = {
      labels: ['Super Admin', 'Admin Ent.', 'Lecteur', 'Clients', 'Émetteurs'],
      datasets: [
        {
          label: 'Nombre d\'utilisateurs',
          data: [5, 45, 89, 234, 567],
          backgroundColor: ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444'],
          borderColor: 'white',
          borderWidth: 2
        }
      ]
    };

    // Chart Demandes par statut
    this.chartDataRequests = {
      labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
      datasets: [
        {
          label: 'Approuvées',
          data: [12, 19, 23, 18, 25, 30],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Rejetées',
          data: [3, 5, 2, 4, 3, 2],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'En attente',
          data: [8, 6, 5, 7, 4, 3],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    this.chartOptions = chartOptions;
  }

  onKpiCardClick(kpi: KPIData): void {
    console.log('KPI clicked:', kpi);
  }
}
