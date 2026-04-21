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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, SkeletonModule, TableModule, TagModule, TranslateModule],
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.scss'
})
export class StatistiquesComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private superAdminUserService = inject(SuperAdminUserService);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  isLoading = true;

  // Current user
  currentUser = this.authService.currentUser;
  userFullName = computed(() => {
    const user = this.currentUser();
    const fallback = this.translate.instant('ROLES.ENTREPRISE_ADMIN'); // Or just 'Administrator'
    if (!user) return fallback;
    const firstName = user.prenom || '';
    const lastName = user.nom || '';
    return `${firstName} ${lastName}`.trim() || fallback;
  });

  // KPI Data
  usersCount = 0;
  clientsCount = 0;
  emetteursCount = 0;
  facturesCount = 0;

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.isLoading = true;

    this.dashboardService.getSuperAdminStatistics().subscribe({
      next: (adminStats: SuperAdminStatsResponse) => {
        this.usersCount = adminStats.totalUsers ?? 0;
        this.clientsCount = adminStats.totalClients ?? 0;
        this.emetteursCount = adminStats.totalEmetteurs ?? 0;
        this.facturesCount = adminStats.totalFactures ?? 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.isLoading = false;
      }
    });
  }
}
