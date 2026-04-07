import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { AccountStatus, ADMIN_ROLES, UserDTO, UserResponseDTO, normalizeUserRole } from '../../../models';
import { RoleLabelPipe } from '../../../shared';
import { SuperAdminUserService } from '../../../core/services/super-admin-user.service';
import { EmetteurService } from '../../../core/services/emetteur.service';
import { Emetteur } from '../../../models/emetteur.model';

@Component({
  selector: 'app-utilisateurs-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule,
    TableModule, TagModule, TooltipModule, DropdownModule, SkeletonModule, RoleLabelPipe
  ],
  templateUrl: './utilisateurs-list.component.html',
  styleUrl: './utilisateurs-list.component.scss'
})
export class UtilisateursListComponent implements OnInit {
  private readonly superAdminUserService = inject(SuperAdminUserService);
  private readonly emetteurService = inject(EmetteurService);
  private readonly router = inject(Router);

  utilisateurs: UserDTO[] = [];
  filteredUtilisateurs: UserDTO[] = [];
  emetteursMap: Map<number, string> = new Map();
  isLoading = false;
  searchTerm = '';
  
  // Filtres
  selectedRole: string | null = null;
  selectedStatus: string | null = null;

  // Options de filtres
  roleOptions = [
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
    { label: 'Admin Entreprise', value: 'ENTREPRISE_ADMIN' },
    { label: 'Lecteur Entreprise', value: 'ENTREPRISE_VIEWER' },
    { label: 'Client', value: 'CLIENT' },
    { label: 'Émetteur', value: 'EMETTEUR' }
  ];

  statusOptions = [
    { label: 'Actif', value: 'ACTIVE' },
    { label: 'Inactif', value: 'DISABLED' },
    { label: 'En attente', value: 'PENDING' }
  ];

  ngOnInit(): void {
    this.loadEmetteurs();
    this.loadUtilisateurs();
  }

  loadEmetteurs(): void {
    this.emetteurService.getEmetteurs().subscribe({
      next: (emetteurs) => {
        emetteurs.forEach(e => this.emetteursMap.set(e.id, e.raisonSociale));
      },
      error: (err) => console.error('Erreur chargement émetteurs:', err)
    });
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
      // Vérifier le rôle (afficher que les admins par défaut)
      if (!ADMIN_ROLES.includes(u.role)) {
        return false;
      }

      // Vérifier le filtre de rôle sélectionné
      if (this.selectedRole && u.role !== this.selectedRole) {
        return false;
      }

      // Vérifier le filtre de statut sélectionné
      if (this.selectedStatus && u.accountStatus !== this.selectedStatus) {
        return false;
      }

      // Vérifier la recherche par texte
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

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = null;
    this.selectedStatus = null;
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
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }

  // Méthodes utilitaires pour l'affichage
  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      'SUPER_ADMIN': 'pi pi-crown',
      'ENTREPRISE_ADMIN': 'pi pi-building',
      'ENTREPRISE_VIEWER': 'pi pi-eye',
      'CLIENT': 'pi pi-shopping-cart',
      'EMETTEUR': 'pi pi-send'
    };
    return icons[role] || 'pi pi-user';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'ACTIVE': 'pi pi-check-circle',
      'DISABLED': 'pi pi-times-circle',
      'PENDING': 'pi pi-clock'
    };
    return icons[status] || 'pi pi-info-circle';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'active',
      'DISABLED': 'disabled',
      'PENDING': 'pending'
    };
    return classes[status] || 'unknown';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Actif',
      'DISABLED': 'Inactif',
      'PENDING': 'En attente'
    };
    return labels[status] || status;
  }

  getEntrepriseName(user: UserDTO): string {
    if (!user.emetteurId) return '';
    return this.emetteursMap.get(user.emetteurId) || `ID: ${user.emetteurId}`;
  }
}
