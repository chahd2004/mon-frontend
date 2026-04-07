import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CollaborateurService } from '../../core/services/collaborateur.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

interface Collaborateur {
  id?: number | string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
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
  constructor(
    private collaborateurService: CollaborateurService,
    private authService: AuthService
  ) {
    this.loadCollaborateurs();
  }

  showForm = false;

  email = '';
  prenom = '';
  nom = '';
  role: string = 'ENTREPRISE_VIEWER';
  fonction = '';
  telephone = '';

  collaborateurs: Collaborateur[] = [];

  isLoading = false;
  errorMessage = '';
  get canSubmit(): boolean {
    return !!(
      this.email.trim() &&
      this.prenom.trim() &&
      this.nom.trim() &&
      this.fonction.trim()
    );
  }

  private loadCollaborateurs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.collaborateurService.getCollaborateurs().subscribe({
      next: (response) => {
        const items = Array.isArray(response) ? response : response?.content ?? [];
        
        // Convert API items to local format
        this.collaborateurs = items.map((item: any) => ({
          id: item.id,
          prenom: item.prenom ?? item.firstName ?? '',
          nom: item.nom ?? item.lastName ?? '',
          email: item.email ?? '',
          role: this.normalizeRole(item.role),
          fonction: item.fonction ?? '',
          telephone: item.telephone ?? ''
        }));

        // ADDITION FRONTEND: Inclure l'admin actuel s'il n'est pas dans la liste
        const currentUser = this.authService.currentUser();
        if (currentUser && currentUser.role === 'ENTREPRISE_ADMIN') {
          const alreadyInList = this.collaborateurs.some(c => c.email.toLowerCase() === currentUser.email.toLowerCase());
          if (!alreadyInList) {
            this.collaborateurs.unshift({
              id: currentUser.id,
              prenom: currentUser.prenom || '',
              nom: currentUser.nom || '',
              email: currentUser.email,
              role: 'ENTREPRISE_ADMIN',
              fonction: 'Administrateur',
              telephone: currentUser.telephone || ''
            });
          }
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des collaborateurs:', err);
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
    if (!this.canSubmit) {
      this.errorMessage = 'Veuillez remplir Email, Prenom, Nom et Fonction.';
      return;
    }

    this.errorMessage = '';

    const payload = {
      email: this.email.trim(),
      prenom: this.prenom.trim(),
      nom: this.nom.trim(),
      role: 'ENTREPRISE_VIEWER' as const,
      fonction: this.fonction.trim(),
      telephone: this.telephone.trim() || undefined
    };

    this.collaborateurService.createCollaborateur(payload).subscribe({
      next: (created: any) => {
        this.resetForm();
        this.showForm = false;
        // Recharger la liste complète du backend pour s'assurer que le nouvel ajout s'affiche
        this.loadCollaborateurs();
      },
      error: (error: HttpErrorResponse) => {
        const backendMessage =
          error?.error?.message ||
          error?.error?.error ||
          error?.message ||
          '';
        const rawErrorPayload =
          typeof error?.error === 'string'
            ? error.error
            : JSON.stringify(error?.error ?? {});
        const searchableMessage = `${backendMessage} ${rawErrorPayload}`.toLowerCase();
        const isDuplicateEmail =
          error?.status === 409 ||
          searchableMessage.includes('un utilisateur avec cet email existe deja') ||
          searchableMessage.includes('un utilisateur avec cet email existe déjà') ||
          searchableMessage.includes('email existe deja') ||
          searchableMessage.includes('email existe déjà') ||
          searchableMessage.includes('already exists') ||
          searchableMessage.includes('duplicate');
        const isGenericInternalError =
          error?.status === 500 &&
          (searchableMessage.includes('une erreur interne est survenue') ||
            searchableMessage.includes('internal server error'));

        this.errorMessage = (isDuplicateEmail || isGenericInternalError)
          ? 'Email deja utilise.'
          : backendMessage
            ? `Echec de creation: ${backendMessage}`
            : "Echec de creation: le collaborateur n'a pas ete enregistre en base.";
      }
    });
  }

  supprimerCollaborateur(collaborateur: Collaborateur): void {
    if (!collaborateur.id) {
      this.errorMessage = "Impossible de supprimer: identifiant collaborateur manquant.";
      return;
    }

    const confirmed = window.confirm(
      `Supprimer le collaborateur ${collaborateur.prenom} ${collaborateur.nom} ?`
    );
    if (!confirmed) return;

    this.errorMessage = '';
    this.collaborateurService.deleteCollaborateur(collaborateur.id).subscribe({
      next: () => {
        this.collaborateurs = this.collaborateurs.filter((c) => c.id !== collaborateur.id);
      },
      error: (error: HttpErrorResponse) => {
        const backendMessage = error?.error?.message || error?.error?.error || error?.message;
        this.errorMessage = backendMessage
          ? `Échec de suppression: ${backendMessage}`
          : "Échec de suppression: le collaborateur n'a pas été supprimé.";
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

  private normalizeRole(rawRole: unknown): string {
    if (typeof rawRole !== 'string') return '';
    return rawRole.trim().toUpperCase().replace(/^ROLE_/, '');
  }
}
