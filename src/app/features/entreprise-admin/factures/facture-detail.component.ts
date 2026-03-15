import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-facture-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, TagModule, TableModule, TabViewModule],
  templateUrl: './facture-detail.component.html',
  styleUrl: './facture-detail.component.scss'
})
export class FactureDetailComponent {
  facture: any = {
    id: '1',
    numero: 'FAC-2024-001',
    client: 'Société ABC SARL',
    dateEmission: '2024-01-15',
    dateEcheance: '2024-02-14',
    montantHT: 5000,
    montantTTC: 5950,
    statut: 'PAYEE',
    modePaiement: 'Virement',
    lignes: [
      { produit: 'Logiciel Comptabilité Pro', quantite: 1, prixUnitaire: 5000, tva: 19, montant: 5950 }
    ],
    dateReglement: '2024-01-20'
  };

  getStatusTag(): { label: string; severity: string } {
    const statusMap: any = {
      DRAFT: { label: 'Brouillon', severity: 'info' },
      ENVOYEE: { label: 'Envoyée', severity: 'warning' },
      ACCEPTEE: { label: 'Acceptée', severity: 'info' },
      PAYEE: { label: 'Payée', severity: 'success' },
      ANNULEE: { label: 'Annulée', severity: 'danger' }
    };
    return statusMap[this.facture.statut] || { label: this.facture.statut, severity: 'secondary' };
  }

  downloadPDF(): void {
    console.log('Download PDF');
  }

  sendEmail(): void {
    console.log('Send email');
  }

  goBack(): void {
    console.log('Go back');
  }
}
