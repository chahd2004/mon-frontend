import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Produit } from '../../../models/produit.model';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  selector: 'app-produits-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './produits-view.component.html',
  styleUrls: ['./produits-view.component.scss']
})
export class ProduitsViewComponent implements OnInit {

  produits: Produit[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private produitService: ProduitService) { }

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.error = '';
    this.produitService.getProduits().subscribe({
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
