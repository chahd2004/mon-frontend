import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../models';

interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, MenuModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  authService = inject(AuthService);
  
  isCollapsed = false;
  sidebarItems = computed<SidebarMenuItem[]>(() => {
    const userRole = this.authService.currentUser()?.role;

    const allItems: SidebarMenuItem[] = [
      {
        label: 'Tableau de bord',
        icon: 'pi pi-home',
        route: userRole === 'SUPER_ADMIN' ? '/super-admin/statistiques' : '/accueil',
        roles: ['SUPER_ADMIN', 'ENTREPRISE_ADMIN', 'ENTREPRISE_VIEWER', 'CLIENT', 'EMETTEUR']
      },
      {
        label: 'Clients',
        icon: 'pi pi-users',
        route: '/clients',
        roles: ['ENTREPRISE_ADMIN', 'ENTREPRISE_VIEWER', 'EMETTEUR']
      },
      {
        label: 'Produits',
        icon: 'pi pi-shopping-bag',
        route: '/produits',
        roles: ['ENTREPRISE_ADMIN', 'ENTREPRISE_VIEWER', 'EMETTEUR']
      },
      {
        label: 'Factures',
        icon: 'pi pi-file',
        route: '/factures',
        roles: ['ENTREPRISE_ADMIN', 'ENTREPRISE_VIEWER', 'CLIENT', 'EMETTEUR'],
        badge: 5
      },
      {
        label: 'Demandes',
        icon: 'pi pi-inbox',
        route: userRole === 'SUPER_ADMIN' ? '/super-admin/demandes' : '/demandes',
        roles: ['SUPER_ADMIN', 'ENTREPRISE_ADMIN']
      },
      {
        label: 'Users',
        icon: 'pi pi-id-card',
        route: '/super-admin/users',
        roles: ['SUPER_ADMIN']
      },
      {
        label: 'Collaborateurs',
        icon: 'pi pi-users-alt',
        route: '/collaborateurs',
        roles: ['ENTREPRISE_ADMIN', 'EMETTEUR']
      },
      {
        label: 'Paramètres',
        icon: 'pi pi-cog',
        route: this.getParametresRoute(userRole),
        roles: ['SUPER_ADMIN', 'ENTREPRISE_ADMIN', 'EMETTEUR', 'CLIENT']
      }
    ];

    return allItems.filter(item =>
      !!userRole && item.roles.includes(userRole)
    );
  });

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  private getParametresRoute(userRole: UserRole | undefined | null): string {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return '/super-admin/parametres';
      case 'EMETTEUR':
        return '/emetteur/profil';
      case 'CLIENT':
        return '/client/profil';
      default:
        return '/parametres';
    }
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.authService.hasAnyRole(roles);
  }
}
