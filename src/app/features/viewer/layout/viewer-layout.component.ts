import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EmetteurService } from '../../../core/services/emetteur.service';
import { inject, signal, effect } from '@angular/core';

@Component({
  selector: 'app-viewer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './viewer-layout.component.html',
  styleUrls: ['./viewer-layout.component.scss']
})
export class ViewerLayoutComponent {
  private authService = inject(AuthService);
  private emetteurService = inject(EmetteurService);

  currentUser = this.authService.currentUser;
  raisonSociale = signal<string | null>(null);

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user?.emetteurId) {
        this.emetteurService.getEmetteurById(user.emetteurId).subscribe({
          next: (emetteur) => {
            this.raisonSociale.set(emetteur?.raisonSociale || null);
          },
          error: () => this.raisonSociale.set(null)
        });
      } else {
        this.raisonSociale.set(null);
      }
    });
  }

}
