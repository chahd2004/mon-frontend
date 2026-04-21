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
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DemandeService } from '../../../core/services/demande.service';

@Component({
  selector: 'app-demandes-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    TableModule, TagModule, DropdownModule, ToastModule, RouterModule, TranslateModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './demandes-list.component.html',
  styleUrl: './demandes-list.component.scss'
})
export class DemandesListComponent implements OnInit {
  private demandeService = inject(DemandeService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  demandes: any[] = [];
  filteredDemandes: any[] = [];
  isLoading = false;
  searchTerm = '';
  selectedStatus: string | null = null;

  statusOptions = [];

  ngOnInit(): void {
    this.initStatusOptions();
    this.loadDemandes();
  }

  private initStatusOptions(): void {
    this.statusOptions = [
      { label: this.translate.instant('AVOIRS.STATUS.ALL'), value: null },
      { label: this.translate.instant('STATUS.PENDING'), value: 'REQUESTED' },
      { label: this.translate.instant('STATUS.APPROVED'), value: 'APPROVED' },
      { label: this.translate.instant('STATUS.REJECTED'), value: 'REJECTED' }
    ] as any;
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
          summary: this.translate.instant('TOAST.ERROR'),
          detail: this.translate.instant('SUPER_ADMIN.REQUESTS.MSGS.LOAD_ERROR') || 'Impossible de charger les demandes.'
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
    const key = `STATUS.${status === 'REQUESTED' ? 'PENDING' : status}`;
    return this.translate.instant(key);
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
