import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DashboardService, DashboardStats, SuperAdminStatsResponse } from '../../../core/services/dashboard.service';
import { SuperAdminUserService } from '../../../core/services/super-admin-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserDTO, normalizeUserRole } from '../../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, SkeletonModule, TableModule, TagModule],
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.scss'
})
export class StatistiquesComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private superAdminUserService = inject(SuperAdminUserService);
  private authService = inject(AuthService);
  
  isLoading = true;

  // Current user
  currentUser = this.authService.currentUser;
  userFullName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Administrateur';
    const firstName = user.prenom || '';
    const lastName = user.nom || '';
    return `${firstName} ${lastName}`.trim() || 'Administrateur';
  });

  // KPI Data
  usersCount = 0;
  clientsCount = 0;
  emetteursCount = 0;
  facturesCount = 0;
  caTotalCount = '0 TND';

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.isLoading = true;

    forkJoin({
      adminStats: this.dashboardService.getSuperAdminStatistics(),
      dashboardStats: this.dashboardService.getDashboardStatsFromAPI()
    }).subscribe({
      next: ({ adminStats, dashboardStats }: { adminStats: SuperAdminStatsResponse; dashboardStats: DashboardStats }) => {
        this.usersCount = adminStats.totalUsers ?? 0;
        this.clientsCount = adminStats.totalClients ?? 0;
        this.emetteursCount = adminStats.totalEmetteurs ?? 0;
        this.facturesCount = adminStats.totalFactures ?? 0;
        this.caTotalCount = this.formatCurrency(dashboardStats.chiffreAffaires.actuel);
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
}
