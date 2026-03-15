import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mon-profil.component.html',
  styleUrl: './mon-profil.component.scss'
})
export class MonProfilComponent {
  nom = 'Client';
  prenom = 'Demo';
  email = 'client@exemple.tn';

  enregistrer(): void {
    // Hook API update profile
  }
}
