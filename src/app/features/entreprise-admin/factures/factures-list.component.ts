import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

interface Facture {
  id: string;
  numero: string;
  client: string;
  dateEmission: string;
  dateEcheance: string;
  montantHT: number;
  montantTTC: number;
  statut: 'DRAFT' | 'ENVOYEE' | 'ACCEPTEE' | 'PAYEE' | 'ANNULEE';
  modePaiement: string;
}

@Component({
  selector: 'app-factures-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TableModule, ButtonModule, InputTextModule, DropdownModule, TooltipModule, TagModule],
  templateUrl: './factures-list.component.html',
  styleUrl: './factures-list.component.scss'
})
export class FacturesListComponent implements OnInit {
  factures: Facture[] = [];
  filteredFactures: Facture[] = [];
  isLoading = false;
  searchTerm = '';
  selectedStatut = '';

  statutOptions = [
    { label: 'Tous', value: '' },
    { label: 'Brouillon', value: 'DRAFT' },
    { label: 'Envoyée', value: 'ENVOYEE' },
    { label: 'Acceptée', value: 'ACCEPTEE' },
    { label: 'Payée', value: 'PAYEE' },
    { label: 'Annulée', value: 'ANNULEE' }
  ];

  ngOnInit(): void {
    this.loadFactures();
  }

  private loadFactures(): void {
    this.isLoading = true;
    // Mock data
    this.factures = [
      {
        id: '1',
        numero: 'FAC-2024-001',
        client: 'Société ABC SARL',
        dateEmission: '2024-01-15',
        dateEcheance: '2024-02-14',
        montantHT: 5000,
        montantTTC: 5950,
        statut: 'PAYEE',
        modePaiement: 'Virement'
      },
      {
        id: '2',
        numero: 'FAC-2024-002',
        client: 'Entreprise XYZ Ltée',
        dateEmission: '2024-02-10',
        dateEcheance: '2024-03-10',
        montantHT: 7500,
        montantTTC: 8925,
        statut: 'ACCEPTEE',
        modePaiement: 'Chèque'
      },
      {
        id: '3',
        numero: 'FAC-2024-003',
        client: 'Société Commerce TN',
        dateEmission: '2024-03-05',
        dateEcheance: '2024-04-04',
        montantHT: 3000,
        montantTTC: 3570,
        statut: 'DRAFT',
        modePaiement: 'À sélectionner'
      }
    ];
    this.filteredFactures = [...this.factures];
    this.isLoading = false;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatutChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredFactures = this.factures.filter(fact => {
      const matchesSearch =
        fact.numero.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        fact.client.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatut = !this.selectedStatut || fact.statut === this.selectedStatut;

      return matchesSearch && matchesStatut;
    });
  }

  getStatutSeverity(statut: string): string {
    switch (statut) {
      case 'DRAFT':
        return 'info';
      case 'ENVOYEE':
        return 'warning';
      case 'ACCEPTEE':
        return 'info';
      case 'PAYEE':
        return 'success';
      case 'ANNULEE':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'DRAFT':
        return 'Brouillon';
      case 'ENVOYEE':
        return 'Envoyée';
      case 'ACCEPTEE':
        return 'Acceptée';
      case 'PAYEE':
        return 'Payée';
      case 'ANNULEE':
        return 'Annulée';
      default:
        return statut;
    }
  }

  viewDetail(id: string): void {
    console.log('View detail:', id);
  }

  deleteFacture(id: string): void {
    this.factures = this.factures.filter(f => f.id !== id);
    this.applyFilters();
  }
}
