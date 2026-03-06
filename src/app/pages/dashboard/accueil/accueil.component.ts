// src/app/pages/dashboard/accueil/accueil.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { FactureService } from '../../../core/services/facture.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule, ToastModule],
  providers: [MessageService],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent {
  private factureService = inject(FactureService);
  private authService    = inject(AuthService);
  private messageService = inject(MessageService);

  totalFactures: number = 0;

  constructor() {
    this.loadTotalFactures();
  }

  loadTotalFactures(): void {
    this.factureService.getFactures(1, 1).subscribe({
      next: (response: any) => { this.totalFactures = response.total || 0; },
      error: () => { this.totalFactures = 0; }
    });
  }

  logout(): void {
    this.messageService.add({ severity: 'info', summary: 'Déconnexion', detail: 'Vous êtes déconnecté' });
    this.authService.logout();
  }
}