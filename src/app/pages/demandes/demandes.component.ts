import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Demande {
  id: number;
  entreprise: string;
  email: string;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';
  date: string;
}

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './demandes.component.html',
  styleUrl: './demandes.component.scss'
})
export class DemandesComponent {
  demandes: Demande[] = [
    { id: 101, entreprise: 'NovaTech', email: 'admin@novatech.tn', statut: 'EN_ATTENTE', date: '2026-03-10' },
    { id: 102, entreprise: 'Atlas Consulting', email: 'contact@atlas.tn', statut: 'EN_ATTENTE', date: '2026-03-12' },
    { id: 103, entreprise: 'Sahara Trade', email: 'hello@sahara.tn', statut: 'EN_ATTENTE', date: '2026-03-13' }
  ];

  get pendingCount(): number {
    return this.demandes.filter(d => d.statut === 'EN_ATTENTE').length;
  }

  approuver(demande: Demande): void {
    demande.statut = 'APPROUVEE';
  }

  rejeter(demande: Demande): void {
    demande.statut = 'REJETEE';
  }
}
