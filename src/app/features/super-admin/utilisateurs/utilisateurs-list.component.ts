import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { UserDTO } from '../../../models';
import { RoleLabelPipe, StatusBadgePipe } from '../../../shared';

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
  utilisateurs: UserDTO[] = [];
  filteredUtilisateurs: UserDTO[] = [];
  isLoading = false;
  searchTerm = '';

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.isLoading = true;
    // Simulé - remplacer par appel service réel
    this.utilisateurs = [
      {
        id: 1,
        nom: 'Ahmed',
        prenom: 'Ali',
        email: 'admin@techcorp.tn',
        telephone: '+216 20 123 456',
        role: 'ENTREPRISE_ADMIN',
        typeUser: undefined,
        accountStatus: 'ACTIVE',
        enabled: true,
        firstLogin: false
      },
      {
        id: 2,
        nom: 'Salah',
        prenom: 'Mohamed',
        email: 'viewer@techcorp.tn',
        telephone: '+216 71 456 789',
        role: 'ENTREPRISE_VIEWER',
        typeUser: undefined,
        accountStatus: 'ACTIVE',
        enabled: true,
        firstLogin: true
      }
    ];
    this.applyFilters();
    this.isLoading = false;
  }

  applyFilters(): void {
    this.filteredUtilisateurs = this.utilisateurs.filter(u => {
      return !this.searchTerm ||
        u.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  editUser(id: number): void {
    // Navigation vers édition
  }

  disableUser(id: number): void {
    const user = this.utilisateurs.find(u => u.id === id);
    if (user) {
      user.enabled = false;
      user.accountStatus = 'DISABLED';
    }
  }

  enableUser(id: number): void {
    const user = this.utilisateurs.find(u => u.id === id);
    if (user) {
      user.enabled = true;
      user.accountStatus = 'ACTIVE';
    }
  }
}
