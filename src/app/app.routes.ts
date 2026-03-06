// src/app/app.routes.ts
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

export const routes: Routes = [
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    // AccueilComponent = layout sidebar + router-outlet
    path: '',
    component: AccueilComponent,
    children: [
      { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',  component: DashboardComponent },  // ← stats/tableau de bord
      { path: 'clients',    component: ClientsComponent },
      { path: 'emetteurs',  component: EmetteursComponent },
      { path: 'produits',   component: ProduitsComponent },
      { path: 'factures',   component: FacturesComponent },
      { path: 'factures/:id', component: FactureComponent },
      { path: 'devise',     component: DeviseComponent },
      { path: 'parametres', component: ParametresComponent },
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];