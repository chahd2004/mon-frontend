import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AccueilComponent } from './pages/dashboard/accueil/accueil.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { FacturesComponent } from './pages/factures/factures.component';
import { FactureComponent } from './pages/facture/facture.component';
import { ProduitsComponent } from './pages/produits/produits.component';
import { EmetteursComponent } from './pages/emetteurs/emetteurs.component';
import { ParametresComponent } from './pages/parametres/parametres.component';
import { DeviseComponent } from './pages/devise/devise.component';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── Publiques (redirige vers dashboard si déjà connecté) ──────
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  // ── Protégées : faut être connecté ────────────────────────────
  {
    path: '',
    component: AccueilComponent,
    canActivate: [authGuard],   // ← Toutes les pages enfants protégées
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'factures', component: FacturesComponent },
      { path: 'factures/:id', component: FactureComponent },
      { path: 'devise', component: DeviseComponent },
      { path: 'parametres', component: ParametresComponent },

      // ── Admin seulement ───────────────────────────────────────
      { path: 'clients', component: ClientsComponent, canActivate: [adminGuard] },
      { path: 'emetteurs', component: EmetteursComponent, canActivate: [adminGuard] },
      { path: 'produits', component: ProduitsComponent, canActivate: [adminGuard] },
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];