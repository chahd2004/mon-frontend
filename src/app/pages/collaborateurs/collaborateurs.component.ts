import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Collaborateur {
  nom: string;
  email: string;
  role: 'ENTREPRISE_VIEWER';
}

@Component({
  selector: 'app-collaborateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collaborateurs.component.html',
  styleUrl: './collaborateurs.component.scss'
})
export class CollaborateursComponent {
  nom = '';
  email = '';

  collaborateurs: Collaborateur[] = [
    { nom: 'Aymen', email: 'aymen@entreprise.tn', role: 'ENTREPRISE_VIEWER' }
  ];

  ajouter(): void {
    if (!this.nom.trim() || !this.email.trim()) return;
    this.collaborateurs.unshift({ nom: this.nom.trim(), email: this.email.trim(), role: 'ENTREPRISE_VIEWER' });
    this.nom = '';
    this.email = '';
  }
}
