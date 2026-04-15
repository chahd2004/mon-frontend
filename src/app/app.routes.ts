import { Routes } from '@angular/router';

// ✅ PHASE 1 - Public Pages
import { HomeComponent } from './features/public/home/home.component';
import { LoginComponent } from './features/public/login/login.component';
import { RegisterComponent } from './features/public/register/register.component';
import { RegisterEntrepriseComponent } from './features/public/register-entreprise/register-entreprise.component';
import { RegisterComponent as SuperAdminRegisterComponent } from './pages/register/register.component';
import { ChangePasswordComponent } from './features/public/change-password/change-password.component';
import { DemandeFormComponent } from './features/public/demande-form/demande-form.component';
import { DemandeStatutComponent } from './features/public/demande-statut/demande-statut.component';
import { BonCommandeSignatureComponent } from './features/public/bon-commande-signature/bon-commande-signature.component';
import { BonsLivraisonSignatureComponent } from './features/public/bons-livraison-signature/bons-livraison-signature.component';

// ✅ PHASE 3 - SUPER_ADMIN Pages
import { SuperAdminLayoutComponent } from './features/super-admin/layout/super-admin-layout.component';
import { DemandesListComponent } from './features/super-admin/demandes/demandes-list.component';
import { DemandeDetailComponent as DemandeDetailAdminComponent } from './features/super-admin/demandes/demande-detail.component';
import { UtilisateursListComponent } from './features/super-admin/utilisateurs/utilisateurs-list.component';
import { UtilisateurEditComponent } from './features/super-admin/utilisateurs/utilisateur-edit.component';
import { SuperAdminCreateComponent } from './features/super-admin/utilisateurs/super-admin-create.component';
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

import { AccueilComponent } from './pages/dashboard/accueil/accueil.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { FacturesComponent } from './pages/factures/factures.component';
import { FactureComponent } from './pages/facture/facture.component';
import { AvoirsComponent } from './pages/avoirs/avoirs.component';
import { AvoirDetailComponent } from './pages/avoirs/avoir-detail.component';
import { ProduitsComponent } from './pages/produits/produits.component';
import { ParametresComponent } from './pages/parametres/parametres.component';
import { DevisComponent } from './pages/devis/devis.component';
import { DevisDetailComponent } from './pages/devis/devis-detail.component';
import { DevisCreateComponent } from './pages/devis/devis-create.component';
import { BonCommandesComponent } from './pages/bon-commandes/bon-commandes.component';
import { BonCommandeDetailComponent } from './pages/bon-commandes/bon-commande-detail.component';
import { CommandesComponent } from './pages/commandes/commandes.component';
import { BonsLivraisonComponent } from './pages/bons-livraison/bons-livraison.component';
import { BonsLivraisonDetailComponent } from './pages/bons-livraison/bons-livraison-detail.component';
import { DemandesComponent } from './pages/demandes/demandes.component';
import { DemandeDetailComponent } from './pages/demandes/demande-detail.component';
import { UsersComponent } from './pages/users/users.component';
import { CollaborateursComponent } from './pages/collaborateurs/collaborateurs.component';
import { MonProfilComponent } from './pages/mon-profil/mon-profil.component';
import { authGuard, firstLoginGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── PHASE 1: PAGES PUBLIQUES (Sans authentification) ───────────
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'registerclient',
    component: RegisterComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN', 'ENTREPRISE_ADMIN'] }
  },
  { path: 'register-entreprise', component: RegisterEntrepriseComponent, canActivate: [guestGuard] },
  { path: 'super-admin/register', component: SuperAdminRegisterComponent, canActivate: [guestGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [firstLoginGuard] },
  { path: 'demande', component: DemandeFormComponent },
  { path: 'demande/statut', component: DemandeStatutComponent },
  // Route publique accessible depuis le lien email du bon de commande
  { path: 'bon-commande/:ref', component: BonCommandeSignatureComponent },
  { path: 'bon-livraison-signature/:ref', component: BonsLivraisonSignatureComponent },

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
      { path: 'avoirs', component: AvoirsComponent },
      { path: 'avoirs/view/:id', component: AvoirDetailComponent },
      { path: 'avoirs/edit/:id', component: AvoirDetailComponent }, // Reusing Detail for now or placeholder
      { path: 'devis', component: DevisComponent },
      { path: 'devis/nouveau', component: DevisCreateComponent },
      { path: 'devis/view/:id', component: DevisDetailComponent },
      { path: 'devis/:ref', component: DevisDetailComponent },
      { path: 'bons-commandes', component: BonCommandesComponent },
      { path: 'bons-commandes/view/:id', component: BonCommandeDetailComponent },
      { path: 'bon-commande/:ref', component: BonCommandeDetailComponent },
      { path: 'commandes', component: CommandesComponent },
      { path: 'bons-livraison', component: BonsLivraisonComponent },
      { path: 'bons-livraison/view/:id', component: BonsLivraisonDetailComponent },
      { path: 'bon-livraison/:ref', component: BonsLivraisonDetailComponent },
      {
        path: 'commandes/view/:id',
        loadComponent: () => import('./pages/commandes/commande-detail.component').then(m => m.CommandeDetailComponent)
      },
      { path: 'parametres', component: ParametresComponent },

      // ── Admin seulement ───────────────────────────────────────
      {
        path: 'clients',
        component: ClientsComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ENTREPRISE_ADMIN', 'ENTREPRISE_VIEWER', 'EMETTEUR'] }
      },
      {
        path: 'produits',
        component: ProduitsComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ENTREPRISE_ADMIN', 'ENTREPRISE_VIEWER', 'EMETTEUR'] }
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
        redirectTo: '/super-admin/users'
      },
      {
        path: 'collaborateurs',
        component: CollaborateursComponent,
        canActivate: [roleGuard],
        data: { roles: ['ENTREPRISE_ADMIN'] }
      },
      {
        path: 'mon-profil',
        component: MonProfilComponent,
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
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
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'statistiques', component: StatistiquesComponent },
      { path: 'demandes', component: DemandesListComponent },
      { path: 'demandes/:id', component: DemandeDetailAdminComponent },
      { path: 'users', component: UtilisateursListComponent },
      { path: 'utilisateurs', component: UtilisateursListComponent },
      { path: 'utilisateurs/nouveau', component: SuperAdminCreateComponent },
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

  { path: '**', redirectTo: '/dashboard' }
];