import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

interface Client {
  id: string;
  raisonSociale: string;
  email: string;
  telephone: string;
  region: string;
  totalAchats: number;
  solde: number;
  status: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
  dateAjout: string;
}

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TableModule, ButtonModule, InputTextModule, TooltipModule, TagModule],
  templateUrl: './clients-list.component.html',
  styleUrl: './clients-list.component.scss'
})
export class ClientsListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  isLoading = false;
  searchTerm = '';

  ngOnInit(): void {
    this.loadClients();
  }

  private loadClients(): void {
    this.isLoading = true;
    // Mock data
    this.clients = [
      {
        id: '1',
        raisonSociale: 'Société ABC SARL',
        email: 'contact@abc.tn',
        telephone: '+216 71 123 456',
        region: 'Tunis',
        totalAchats: 50000,
        solde: 5000,
        status: 'ACTIF',
        dateAjout: '2024-01-10'
      },
      {
        id: '2',
        raisonSociale: 'Entreprise XYZ Ltée',
        email: 'info@xyz.tn',
        telephone: '+216 72 234 567',
        region: 'Ariana',
        totalAchats: 75000,
        solde: 0,
        status: 'ACTIF',
        dateAjout: '2024-02-15'
      },
      {
        id: '3',
        raisonSociale: 'Société Commerce TN',
        email: 'support@commerce.tn',
        telephone: '+216 73 345 678',
        region: 'Sfax',
        totalAchats: 25000,
        solde: 2000,
        status: 'INACTIF',
        dateAjout: '2024-03-20'
      }
    ];
    this.filteredClients = [...this.clients];
    this.isLoading = false;
  }

  onSearch(): void {
    this.filteredClients = this.clients.filter(
      client =>
        client.raisonSociale.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'ACTIF':
        return 'success';
      case 'INACTIF':
        return 'warning';
      case 'SUSPENDU':
        return 'danger';
      default:
        return 'info';
    }
  }

  editClient(id: string): void {
    console.log('Edit client:', id);
  }

  deleteClient(id: string): void {
    this.clients = this.clients.filter(c => c.id !== id);
    this.onSearch();
  }
}
