import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Produit } from '../../../models/produit.model';
import { ProduitService } from '../../../core/services/produit.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-emetteur-produits-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './produits-list.component.html',
  styleUrls: ['./produits-list.component.scss']
})
export class EmetteurProduitsListComponent implements OnInit {

  produits: Produit[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private produitService: ProduitService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.error = '';

    const currentUser = this.authService.currentUser();
    const emetteurId = currentUser?.emetteurId;

    if (!emetteurId) {
      this.error = 'Erreur: ID émetteur non trouvé';
      this.loading = false;
      return;
    }

    this.produitService.getProduits(emetteurId).subscribe({
      next: (data: Produit[]) => {
        this.produits = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement des produits';
        console.error(err);
        this.loading = false;
      }
    });
  }

}
