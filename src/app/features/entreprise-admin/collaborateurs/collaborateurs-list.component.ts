import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/services/auth.service';
import { EmetteurService } from '../../../core/services/emetteur.service';

interface Collaborateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  dateAjout: string;
}

@Component({
  selector: 'app-collaborateurs-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TableModule, ButtonModule, InputTextModule, DropdownModule, TooltipModule, TagModule],
  templateUrl: './collaborateurs-list.component.html',
  styleUrl: './collaborateurs-list.component.scss'
})
export class CollaborateursListComponent implements OnInit {
  private authService = inject(AuthService);
  private emetteurService = inject(EmetteurService);

  collaborateurs: Collaborateur[] = [];
  filteredCollaborateurs: Collaborateur[] = [];
  isLoading = false;
  searchTerm = '';
  selectedRole = '';
  enterpriseName = 'Entreprise';

  roleOptions = [
    { label: 'Tous', value: '' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'Comptable', value: 'COMPTABLE' },
    { label: 'Commercial', value: 'COMMERCIAL' },
    { label: 'Viewer', value: 'VIEWER' }
  ];

  ngOnInit(): void {
    this.loadEnterpriseName();
    this.loadCollaborateurs();
  }

  private loadEnterpriseName(): void {
    try {
      const currentUser = this.authService.currentUser();
      console.log('🔍 Current user (Collaborateurs):', currentUser);
      
      if (!currentUser) {
        console.log('❌ No current user found');
        this.enterpriseName = 'Entreprise';
        return;
      }
      
      if (!currentUser.emetteurId) {
        console.log('⚠️  No emetteurId found in user:', { 
          id: currentUser.id, 
          email: currentUser.email,
          role: currentUser.role
        });
        this.enterpriseName = 'Entreprise';
        return;
      }

      console.log('📡 Fetching emetteur with ID:', currentUser.emetteurId);
      this.emetteurService.getEmetteurById(currentUser.emetteurId).subscribe({
        next: (emetteur) => {
          console.log('✅ Emetteur loaded:', emetteur);
          this.enterpriseName = emetteur?.raisonSociale || 'Entreprise';
          console.log('📝 Enterprise name set to:', this.enterpriseName);
        },
        error: (err) => {
          console.error('❌ Error fetching emetteur:', err);
          this.enterpriseName = 'Entreprise';
        },
        complete: () => {
          console.log('✔️  Emetteur subscription completed');
        }
      });
    } catch (error) {
      console.error('❌ Exception in loadEnterpriseName:', error);
      this.enterpriseName = 'Entreprise';
    }
  }

  private loadCollaborateurs(): void {
    this.isLoading = true;
    // Mock data
    this.collaborateurs = [
      {
        id: '1',
        prenom: 'Ahmed',
        nom: 'Ben Ali',
        email: 'ahmed.benali@company.tn',
        telephone: '+216 99 123 456',
        role: 'MANAGER',
        status: 'ACTIVE',
        dateAjout: '2024-01-15'
      },
      {
        id: '2',
        prenom: 'Fatima',
        nom: 'Trabelsi',
        email: 'fatima.trabelsi@company.tn',
        telephone: '+216 98 234 567',
        role: 'COMPTABLE',
        status: 'ACTIVE',
        dateAjout: '2024-02-20'
      },
      {
        id: '3',
        prenom: 'Mohamed',
        nom: 'Souissi',
        email: 'mohamed.souissi@company.tn',
        telephone: '+216 97 345 678',
        role: 'COMMERCIAL',
        status: 'INACTIVE',
        dateAjout: '2024-03-10'
      }
    ];
    this.filteredCollaborateurs = [...this.collaborateurs];
    this.isLoading = false;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onRoleChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredCollaborateurs = this.collaborateurs.filter(collab => {
      const matchesSearch =
        collab.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        collab.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        collab.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.selectedRole || collab.role === this.selectedRole;

      return matchesSearch && matchesRole;
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'SUSPENDED':
        return 'danger';
      default:
        return 'info';
    }
  }

  editCollaborateur(id: string): void {
    console.log('Edit collaborateur:', id);
  }

  deleteCollaborateur(id: string): void {
    this.collaborateurs = this.collaborateurs.filter(c => c.id !== id);
    this.applyFilters();
  }
}
