import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

interface Produit {
  id: string;
  libelle: string;
  code: string;
  prix: number;
  tva: number;
  quantiteStock: number;
  categorie: string;
  dateAjout: string;
}

@Component({
  selector: 'app-produits-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TableModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './produits-list.component.html',
  styleUrl: './produits-list.component.scss'
})
export class ProduitsListComponent implements OnInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  isLoading = false;
  searchTerm = '';

  ngOnInit(): void {
    this.loadProduits();
  }

  private loadProduits(): void {
    this.isLoading = true;
    // Mock data
    this.produits = [
      {
        id: '1',
        libelle: 'Logiciel Comptabilité Pro',
        code: 'SOFT-001',
        prix: 500,
        tva: 19,
        quantiteStock: 100,
        categorie: 'Logiciels',
        dateAjout: '2024-01-10'
      },
      {
        id: '2',
        libelle: 'Support Technique 1 An',
        code: 'SUPP-001',
        prix: 200,
        tva: 19,
        quantiteStock: 500,
        categorie: 'Services',
        dateAjout: '2024-02-05'
      },
      {
        id: '3',
        libelle: 'License Cloud',
        code: 'CLOUD-001',
        prix: 150,
        tva: 19,
        quantiteStock: 250,
        categorie: 'Cloud',
        dateAjout: '2024-03-15'
      }
    ];
    this.filteredProduits = [...this.produits];
    this.isLoading = false;
  }

  onSearch(): void {
    this.filteredProduits = this.produits.filter(
      prod =>
        prod.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        prod.code.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  editProduit(id: string): void {
    console.log('Edit produit:', id);
  }

  deleteProduit(id: string): void {
    this.produits = this.produits.filter(p => p.id !== id);
    this.onSearch();
  }

  getPrixTTC(prix: number, tva: number): number {
    return Math.round(prix * (1 + tva / 100) * 100) / 100;
  }
}
