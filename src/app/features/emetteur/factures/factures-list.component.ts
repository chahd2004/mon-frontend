import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Facture } from '../../../models/facture.model';
import { FactureService } from '../../../core/services/facture.service';

@Component({
  selector: 'app-emetteur-factures-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './factures-list.component.html',
  styleUrls: ['./factures-list.component.scss']
})
export class EmetteurFacturesListComponent implements OnInit {

  factures: Facture[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private factureService: FactureService) { }

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.loading = true;
    this.error = '';
    this.factureService.getMesVentes().subscribe({
      next: (data: Facture[]) => {
        this.factures = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement de vos factures';
        console.error(err);
        this.loading = false;
      }
    });
  }

  getStatutClass(statut: string): string {
    return `statut-${statut.toLowerCase()}`;
  }

}
