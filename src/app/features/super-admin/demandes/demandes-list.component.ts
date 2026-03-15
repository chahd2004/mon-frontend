import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { DemandeItem } from '../../../models';
// Services will be added when implemented
import { StatusBadgePipe } from '../../../shared';

@Component({
  selector: 'app-demandes-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule,
    TableModule, TagModule, DropdownModule, StatusBadgePipe
  ],
  templateUrl: './demandes-list.component.html',
  styleUrl: './demandes-list.component.scss'
})
export class DemandesListComponent implements OnInit {
  demandes: any[] = [];
  filteredDemandes: any[] = [];
  isLoading = false;
  searchTerm = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Toutes', value: null },
    { label: 'En attente', value: 'PENDING' },
    { label: 'Approuvées', value: 'APPROVED' },
    { label: 'Rejetées', value: 'REJECTED' }
  ];

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.isLoading = true;
    // Simulé - remplacer par appel service réel
    this.demandes = [
      {
        id: 1,
        raisonSociale: 'TechCorp Tunisia',
        email: 'admin@techcorp.tn',
        telephone: '+216 20 123 456',
        region: 'TUNIS',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        raisonSociale: 'Innovation Ltd',
        email: 'info@innovation.tn',
        telephone: '+216 70 456 789',
        region: 'SFAX',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.applyFilters();
    this.isLoading = false;
  }

  applyFilters(): void {
    this.filteredDemandes = this.demandes.filter(d => {
      const matchesSearch = !this.searchTerm ||
        d.raisonSociale.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.selectedStatus || d.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  onStatusChange(status: string | null): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  viewDetails(id: number): void {
    // Navigation vers détail
  }
}
