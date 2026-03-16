import { Routes } from '@angular/router';

// ✅ PHASE 1 - Public Pages
import { HomeComponent } from './features/public/home/home.component';
import { LoginComponent } from './features/public/login/login.component';
import { RegisterComponent } from './features/public/register/register.component';
import { DemandeFormComponent } from './features/public/demande-form/demande-form.component';
import { DemandeStatutComponent } from './features/public/demande-statut/demande-statut.component';

// ✅ PHASE 3 - SUPER_ADMIN Pages
import { SuperAdminLayoutComponent } from './features/super-admin/layout/super-admin-layout.component';
import { DemandesListComponent } from './features/super-admin/demandes/demandes-list.component';
import { DemandeDetailComponent as DemandeDetailAdminComponent } from './features/super-admin/demandes/demande-detail.component';
import { UtilisateursListComponent } from './features/super-admin/utilisateurs/utilisateurs-list.component';
import { UtilisateurEditComponent } from './features/super-admin/utilisateurs/utilisateur-edit.component';
import { StatistiquesComponent } from './features/super-admin/statistiques/statistiques.component';

// ✅ PHASE 4 - ENTREPRISE_ADMIN Pages
import { EntrepriseLayoutComponent } from './features/entreprise-admin/layout/entreprise-layout.component';
import { DashboardComponent as EntrepriseDashboardComponent } from './features/entreprise-admin/dashboard/dashboard.component';
import { CollaborateursListComponent } from './features/entreprise-admin/collaborateurs/collaborateurs-list.component';
import { CollaborateurFormComponent } from './features/entreprise-admin/collaborateurs/collaborateur-form.component';
import { ProduitsListComponent } from './features/entreprise-admin/produits/produits-list.component';
import { ProduitFormComponent } from './features/entreprise-admin/produits/produit-form.component';
import { ProduitEditComponent } from './features/entreprise-admin/produits/produit-edit.component';
import { ClientsListComponent } from './features/entreprise-admin/clients/clients-list.component';
import { ClientFormComponent } from './features/entreprise-admin/clients/client-form.component';
import { ClientEditComponent } from './features/entreprise-admin/clients/client-edit.component';
import { FacturesListComponent } from './features/entreprise-admin/factures/factures-list.component';
import { FactureFormComponent } from './features/entreprise-admin/factures/facture-form.component';
import { FactureDetailComponent } from './features/entreprise-admin/factures/facture-detail.component';
import { FactureEditComponent } from './features/entreprise-admin/factures/facture-edit.component';

// ✅ PHASE 5 - VIEWER Pages
import { ViewerLayoutComponent } from './features/viewer/layout/viewer-layout.component';
import { FacturesViewComponent } from './features/viewer/factures/factures-view.component';
import { FactureDetailComponent as FactureDetailViewComponent } from './features/viewer/factures/facture-detail.component';
import { ClientsViewComponent } from './features/viewer/clients/clients-view.component';
import { ProduitsViewComponent } from './features/viewer/produits/produits-view.component';

// ✅ PHASE 6 - CLIENT Pages
import { ClientLayoutComponent } from './features/client/layout/client-layout.component';
import { AchatsListComponent } from './features/client/achats/achats-list.component';
import { ProfilComponent } from './features/client/profil/profil.component';

// ✅ PHASE 7 - EMETTEUR Pages
import { EmetteurLayoutComponent } from './features/emetteur/layout/emetteur-layout.component';
import { EmetteurDashboardComponent } from './features/emetteur/dashboard/dashboard.component';
import { EmetteurProfilComponent } from './features/emetteur/profil/profil.component';
import { EmetteurProduitsListComponent } from './features/emetteur/produits/produits-list.component';
import { EmetteurFacturesListComponent } from './features/emetteur/factures/factures-list.component';

import { AccueilComponent } from './pages/dashboard/accueil/accueil.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { FacturesComponent } from './pages/factures/factures.component';
import { FactureComponent } from './pages/facture/facture.component';
import { ProduitsComponent } from './pages/produits/produits.component';
import { EmetteursComponent } from './pages/emetteurs/emetteurs.component';
import { ParametresComponent } from './pages/parametres/parametres.component';
import { DeviseComponent } from './pages/devise/devise.component';
import { DemandesComponent } from './pages/demandes/demandes.component';
import { DemandeDetailComponent } from './pages/demandes/demande-detail.component';
import { UsersComponent } from './pages/users/users.component';
import { CollaborateursComponent } from './pages/collaborateurs/collaborateurs.component';
import { MesAchatsComponent } from './pages/mes-achats/mes-achats.component';
import { MonProfilComponent } from './pages/mon-profil/mon-profil.component';
import { DashboardEmetteurComponent } from './pages/dashboard-emetteur/dashboard-emetteur.component';
import { ProfilEmetteurComponent } from './pages/profil-emetteur/profil-emetteur.component';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── PHASE 1: PAGES PUBLIQUES (Sans authentification) ───────────
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'demande', component: DemandeFormComponent },
  { path: 'demande/statut', component: DemandeStatutComponent },

  // ── Protégées : faut être connecté ─────────────────────────────
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
      {
        path: 'clients',
        component: ClientsComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'emetteurs',
        component: EmetteursComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'produits',
        component: ProduitsComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ENTREPRISE_ADMIN'] }
      },
      {
        path: 'demandes',
        component: DemandesComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'demandes/:id',
        component: DemandeDetailComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'collaborateurs',
        component: CollaborateursComponent,
        canActivate: [roleGuard],
        data: { roles: ['ENTREPRISE_ADMIN'] }
      },
      {
        path: 'mes-achats',
        component: MesAchatsComponent,
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
      },
      {
        path: 'mon-profil',
        component: MonProfilComponent,
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
      },
      {
        path: 'dashboard-emetteur',
        component: DashboardEmetteurComponent,
        canActivate: [roleGuard],
        data: { roles: ['EMETTEUR'] }
      },
      {
        path: 'profil-emetteur',
        component: ProfilEmetteurComponent,
        canActivate: [roleGuard],
        data: { roles: ['EMETTEUR'] }
      },
    ]
  },

  // ── PHASE 3: SUPER_ADMIN PAGES ───────────────────────────────
  {
    path: 'super-admin',
    component: SuperAdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
    children: [
      { path: '', redirectTo: 'statistiques', pathMatch: 'full' },
      { path: 'statistiques', component: StatistiquesComponent },
      { path: 'demandes', component: DemandesListComponent },
      { path: 'demandes/:id', component: DemandeDetailAdminComponent },
      { path: 'utilisateurs', component: UtilisateursListComponent },
      { path: 'utilisateurs/new', component: UtilisateurEditComponent },
      { path: 'utilisateurs/:id/edit', component: UtilisateurEditComponent },
      { path: 'parametres', component: ParametresComponent }
    ]
  },

  // ── PHASE 4: ENTREPRISE_ADMIN PAGES ──────────────────────────
  {
    path: 'entreprise-admin',
    component: EntrepriseLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ENTREPRISE_ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EntrepriseDashboardComponent },
      
      { path: 'collaborateurs', component: CollaborateursListComponent },
      { path: 'collaborateurs/ajouter', component: CollaborateurFormComponent },
      
      { path: 'produits', component: ProduitsListComponent },
      { path: 'produits/ajouter', component: ProduitFormComponent },
      { path: 'produits/:id', component: ProduitEditComponent },
      
      { path: 'clients', component: ClientsListComponent },
      { path: 'clients/ajouter', component: ClientFormComponent },
      { path: 'clients/:id', component: ClientEditComponent },
      
      { path: 'factures', component: FacturesListComponent },
      { path: 'factures/ajouter', component: FactureFormComponent },
      { path: 'factures/:id', component: FactureDetailComponent },
      { path: 'factures/:id/edit', component: FactureEditComponent }
    ]
  },

  // ── PHASE 5: VIEWER PAGES ────────────────────────────────────
  {
    path: 'viewer',
    component: ViewerLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'factures', pathMatch: 'full' },
      { path: 'factures', component: FacturesViewComponent },
      { path: 'factures/:id', component: FactureDetailViewComponent },
      { path: 'clients', component: ClientsViewComponent },
      { path: 'produits', component: ProduitsViewComponent }
    ]
  },

  // ── PHASE 6: CLIENT PAGES ────────────────────────────────────
  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] },
    children: [
      { path: '', redirectTo: 'achats', pathMatch: 'full' },
      { path: 'achats', component: AchatsListComponent },
      { path: 'profil', component: ProfilComponent }
    ]
  },

  // ── PHASE 7: EMETTEUR PAGES ──────────────────────────────────
  {
    path: 'emetteur',
    component: EmetteurLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMETTEUR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EmetteurDashboardComponent },
      { path: 'factures', component: EmetteurFacturesListComponent },
      { path: 'produits', component: EmetteurProduitsListComponent },
      { path: 'profil', component: EmetteurProfilComponent }
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];