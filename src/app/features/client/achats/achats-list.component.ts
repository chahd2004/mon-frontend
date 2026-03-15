import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Facture } from '../../../models/facture.model';
import { FactureService } from '../../../core/services/facture.service';

@Component({
  selector: 'app-achats-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './achats-list.component.html',
  styleUrls: ['./achats-list.component.scss']
})
export class AchatsListComponent implements OnInit {

  achats: Facture[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private factureService: FactureService) { }

  ngOnInit(): void {
    this.loadAchats();
  }

  loadAchats(): void {
    this.loading = true;
    this.error = '';
    this.factureService.getMesAchats().subscribe({
      next: (data: Facture[]) => {
        this.achats = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement de vos achats';
        console.error(err);
        this.loading = false;
      }
    });
  }

  getStatutClass(statut: string): string {
    return `statut-${statut.toLowerCase()}`;
  }

}
