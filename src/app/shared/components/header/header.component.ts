import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  userMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.initializeMenu();
  }

  private initializeMenu(): void {
    this.userMenuItems = [
      {
        label: 'Profil',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/profil'])
      },
      {
        label: 'Paramètres',
        icon: 'pi pi-cog',
        command: () => this.router.navigate(['/parametres'])
      },
      { separator: true },
      {
        label: 'Déconnexion',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    const prenom = user.prenom?.[0] || '';
    const nom = user.nom?.[0] || '';
    return (prenom + nom).toUpperCase();
  }
}
