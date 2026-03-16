import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    const prenom = user.prenom?.[0] || '';
    const nom = user.nom?.[0] || '';
    return (prenom + nom).toUpperCase();
  }
}
