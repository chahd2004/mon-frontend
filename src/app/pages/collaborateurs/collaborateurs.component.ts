import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CollaborateurService } from '../../core/services/collaborateur.service';
import { HttpErrorResponse } from '@angular/common/http';

interface Collaborateur {
  prenom: string;
  nom: string;
  email: string;
  role: 'ENTREPRISE_VIEWER';
  fonction: string;
  telephone?: string;
}

@Component({
  selector: 'app-collaborateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collaborateurs.component.html',
  styleUrl: './collaborateurs.component.scss'
})
export class CollaborateursComponent {
  constructor(private collaborateurService: CollaborateurService) {
    this.loadCollaborateurs();
  }

  showForm = false;

  email = '';
  prenom = '';
  nom = '';
  role: 'ENTREPRISE_VIEWER' = 'ENTREPRISE_VIEWER';
  fonction = '';
  telephone = '';

  collaborateurs: Collaborateur[] = [];

  isLoading = false;
  errorMessage = '';

  private loadCollaborateurs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.collaborateurService.getCollaborateurs().subscribe({
      next: (response) => {
        const items = Array.isArray(response) ? response : response?.content ?? [];
        this.collaborateurs = items.map((item: any) => ({
          prenom: item.prenom ?? '',
          nom: item.nom ?? '',
          email: item.email ?? '',
          role: 'ENTREPRISE_VIEWER',
          fonction: item.fonction ?? '',
          telephone: item.telephone ?? ''
        }));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = "Impossible de charger les collaborateurs depuis la base.";
        this.isLoading = false;
      }
    });
  }

  ouvrirFormulaire(): void {
    this.showForm = true;
  }

  annulerFormulaire(): void {
    this.resetForm();
    this.showForm = false;
  }

  creerCollaborateur(): void {
    if (!this.email.trim() || !this.prenom.trim() || !this.nom.trim() || !this.fonction.trim()) return;

    this.errorMessage = '';

    const payload = {
      email: this.email.trim(),
      prenom: this.prenom.trim(),
      nom: this.nom.trim(),
      role: this.role,
      fonction: this.fonction.trim(),
      telephone: this.telephone.trim() || undefined
    };

    this.collaborateurService.createCollaborateur(payload).subscribe({
      next: (created: any) => {
        this.collaborateurs.unshift({
          email: created.email ?? payload.email,
          prenom: created.prenom ?? payload.prenom,
          nom: created.nom ?? payload.nom,
          role: 'ENTREPRISE_VIEWER',
          fonction: created.fonction ?? payload.fonction,
          telephone: created.telephone ?? payload.telephone
        });
        this.resetForm();
        this.showForm = false;
      },
      error: (error: HttpErrorResponse) => {
        const backendMessage = error?.error?.message || error?.error?.error || error?.message;
        this.errorMessage = backendMessage
          ? `Échec de création: ${backendMessage}`
          : "Échec de création: le collaborateur n'a pas été enregistré en base.";
      }
    });
  }

  private resetForm(): void {
    this.email = '';
    this.prenom = '';
    this.nom = '';
    this.role = 'ENTREPRISE_VIEWER';
    this.fonction = '';
    this.telephone = '';
  }
}
