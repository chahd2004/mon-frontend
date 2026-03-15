import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../shared';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  kpiData: any[] = [];
  chartData: any = null;
  chartOptions: any = null;

  ngOnInit(): void {
    this.initKpis();
    this.initCharts();
  }

  private initKpis(): void {
    this.kpiData = [
      { value: 45, title: 'Collaborateurs', icon: 'pi pi-users', color: 'blue', trend: '+3' },
      { value: 328, title: 'Produits', icon: 'pi pi-box', color: 'purple', trend: '+12' },
      { value: 152, title: 'Clients', icon: 'pi pi-shopping-cart', color: 'green', trend: '+8' },
      { value: '2.5M TND', title: 'CA Ce Mois', icon: 'pi pi-money-bill', color: 'orange', trend: '+18%' },
      { value: 89, title: 'Factures', icon: 'pi pi-file', color: 'red', trend: '+22' },
      { value: '1.8M TND', title: 'Encaissements', icon: 'pi pi-check-circle', color: 'green', trend: '+15%' }
    ];
  }

  private initCharts(): void {
    this.chartData = {
      labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
      datasets: [
        {
          label: 'Factures Émises',
          data: [12, 19, 8, 15, 22, 18],
          borderColor: '#667eea',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Factures Payées',
          data: [10, 15, 6, 12, 18, 14],
          borderColor: '#764ba2',
          fill: false,
          tension: 0.4
        }
      ]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#e0e0e0',
            drawBorder: false
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          }
        }
      }
    };
  }
}
