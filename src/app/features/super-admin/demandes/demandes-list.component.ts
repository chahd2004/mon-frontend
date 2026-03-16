import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DemandeService } from '../../../core/services/demande.service';

@Component({
  selector: 'app-demandes-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    TableModule, TagModule, DropdownModule, ToastModule, RouterModule
  ],
  providers: [MessageService],
  templateUrl: './demandes-list.component.html',
  styleUrl: './demandes-list.component.scss'
})
export class DemandesListComponent implements OnInit {
  private demandeService = inject(DemandeService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  demandes: any[] = [];
  filteredDemandes: any[] = [];
  isLoading = false;
  searchTerm = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Toutes', value: null },
    { label: 'En attente', value: 'REQUESTED' },
    { label: 'Approuvées', value: 'APPROVED' },
    { label: 'Rejetées', value: 'REJECTED' }
  ];

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.isLoading = true;
    this.demandeService.getDemandesEnAttente().subscribe({
      next: (data) => {
        this.demandes = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les demandes.'
        });
      }
    });
  }

  applyFilters(): void {
    this.filteredDemandes = this.demandes.filter(d => {
      const matchesSearch = !this.searchTerm ||
        d.raisonSociale?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.selectedStatus || d.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  viewDetails(id: number): void {
    this.router.navigate(['/super-admin/demandes', id]);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      REQUESTED: 'En attente',
      APPROVED: 'Approuvée',
      REJECTED: 'Rejetée'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'warning' | 'success' | 'danger' | 'info' {
    const map: Record<string, 'warning' | 'success' | 'danger' | 'info'> = {
      REQUESTED: 'warning',
      APPROVED: 'success',
      REJECTED: 'danger'
    };
    return map[status] || 'info';
  }

  isPending(status: string): boolean {
    return status === 'REQUESTED' || status === 'PENDING';
  }
}
