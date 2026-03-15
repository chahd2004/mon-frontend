import { Component, OnInit, inject } from '@angular/core';
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
export class SidebarComponent implements OnInit {
  authService = inject(AuthService);
  
  isCollapsed = false;
  sidebarItems: SidebarMenuItem[] = [];

  ngOnInit(): void {
    this.initializeMenu();
  }

  private initializeMenu(): void {
    const userRole = this.authService.currentUser()?.role;

    const allItems: SidebarMenuItem[] = [
      {
        label: 'Tableau de bord',
        icon: 'pi pi-home',
        route: '/accueil',
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
        route: '/demandes',
        roles: ['SUPER_ADMIN', 'ENTREPRISE_ADMIN']
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
        route: '/parametres',
        roles: ['SUPER_ADMIN', 'ENTREPRISE_ADMIN', 'EMETTEUR']
      }
    ];

    this.sidebarItems = allItems.filter(item =>
      userRole && item.roles.includes(userRole)
    );
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.authService.hasAnyRole(roles);
  }
}
