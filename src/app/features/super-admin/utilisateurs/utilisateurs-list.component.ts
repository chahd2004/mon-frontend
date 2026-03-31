import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AccountStatus, ADMIN_ROLES, UserDTO, UserResponseDTO, normalizeUserRole } from '../../../models';
import { RoleLabelPipe, StatusBadgePipe } from '../../../shared';
import { SuperAdminUserService } from '../../../core/services/super-admin-user.service';

@Component({
  selector: 'app-utilisateurs-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule,
    TableModule, TagModule, TooltipModule, RoleLabelPipe, StatusBadgePipe
  ],
  templateUrl: './utilisateurs-list.component.html',
  styleUrl: './utilisateurs-list.component.scss'
})
export class UtilisateursListComponent implements OnInit {
  private readonly superAdminUserService = inject(SuperAdminUserService);
  private readonly router = inject(Router);

  utilisateurs: UserDTO[] = [];
  filteredUtilisateurs: UserDTO[] = [];
  isLoading = false;
  searchTerm = '';

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.isLoading = true;
    this.superAdminUserService.getAllUsers().subscribe({
      next: (users: UserResponseDTO[]) => {
        this.utilisateurs = users.map((u) => ({
          ...u,
          role: normalizeUserRole(u.role),
          createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.utilisateurs = [];
        this.filteredUtilisateurs = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const normalizedSearchTerm = this.searchTerm.trim().toLowerCase();

    this.filteredUtilisateurs = this.utilisateurs.filter(u => {
      if (!ADMIN_ROLES.includes(u.role)) {
        return false;
      }

      return !normalizedSearchTerm ||
        u.nom?.toLowerCase().includes(normalizedSearchTerm) ||
        u.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
        u.email?.toLowerCase().includes(normalizedSearchTerm);
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  editUser(id: number): void {
    this.router.navigate(['/super-admin/utilisateurs', id, 'edit']);
  }

  disableUser(id: number): void {
    this.updateUserStatus(id, 'DISABLED');
  }

  enableUser(id: number): void {
    this.updateUserStatus(id, 'ACTIVE');
  }

  private updateUserStatus(id: number, status: AccountStatus): void {
    this.superAdminUserService.changeUserStatus(id, status).subscribe({
      next: (updatedUser) => {
        const index = this.utilisateurs.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.utilisateurs[index] = {
            ...this.utilisateurs[index],
            accountStatus: updatedUser.accountStatus,
            enabled: updatedUser.enabled
          };
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise a jour du statut utilisateur:', error);
      }
    });
  }
}
