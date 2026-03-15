```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                    ARCHITECTURE DES MODÈLES - VUE COMPLÈTE                            ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 1: CORE (ENUMS & TYPES)                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                                   enums.ts                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ • USER_ROLES: SUPER_ADMIN, ENTREPRISE_ADMIN, ENTREPRISE_VIEWER, CLIENT, ...  │    │
│  │ • ACCOUNT_STATUSES: PENDING, ACTIVE, DISABLED, EXPIRED, REQUESTED, REJECTED  │    │
│  │ • DEMANDE_STATUSES: REQUESTED, APPROVED, REJECTED, PENDING                   │    │
│  │ • FACTURE_STATUSES: DRAFT, SEND, PARTIALLY_PAID, FULLY_PAID, ...             │    │
│  │ • REGIONS_TUNISIE: 24 régions                                                 │    │
│  │ • Type Guards: isUserRole(), isAccountStatus(), normalizeUserRole(), ...      │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      LAYER 2: AUTHENTICATION & SESSION                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│              auth.models.ts                            user.models.ts                 │
│  ┌──────────────────────────────┐        ┌──────────────────────────────┐           │
│  │ LoginRequest                 │        │ UserDTO                      │           │
│  │ RegisterRequest              │        │ └─ id, nom, prenom, email    │           │
│  │ AuthResponse                 │        │ └─ role, accountStatus       │           │
│  │ └─ token, role, accountStatus│   ←→   │ └─ firstLogin, enabled       │           │
│  │ └─ firstLogin, requireChange │        │ └─ clientId, emetteurId      │           │
│  │ AuthToken                    │        │                              │           │
│  └──────────────────────────────┘        │ UserResponseDTO (extends)    │           │
│                                           │ UpdateUserRequest            │           │
│                                           │ UpdateProfileRequest         │           │
│                                           │ UpdatePasswordRequest        │           │
│                                           │ CreateUserRequest            │           │
│                                           │ UserListResponse             │           │
│                                           └──────────────────────────────┘           │
│                                                                                        │
│                    ⬆️  Utilisé par: auth.service, auth.guard, login component          │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    LAYER 3: MÉTIER (DOMAINE-SPECIFIC MODELS)                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────┐ │
│  │  demande.models.ts      │  │  collaborateur.models   │  │  client.models.ts    │ │
│  ├─────────────────────────┤  ├─────────────────────────┤  ├──────────────────────┤ │
│  │ DemandeItem             │  │ CollaborateurItem       │  │ ClientItem           │ │
│  │ DemandeDetailResponse   │  │ CollaborateurDetail...  │  │ ClientDetailResponse │ │
│  │ DemandeListResponse     │  │ CreateCollaborateur...  │  │ CreateClientRequest  │ │
│  │ CreateDemandeRequest    │  │ UpdateCollaborateur...  │  │ UpdateClientRequest  │ │
│  │ ApproveDemandeRequest   │  │ InviteCollaborateur...  │  │ ClientListResponse   │ │
│  │ RejectDemandeRequest    │  │ CollaborateurFilter     │  │ ClientFilter         │ │
│  │ DemandeStatistics       │  │ CollaborateurListResp   │  │ ClientStats          │ │
│  │                         │  │                         │  │                      │ │
│  │ ✅ SUPER_ADMIN only     │  │ ✅ ENTREPRISE_ADMIN     │  │ ✅ ENTREPRISE_ADMIN  │ │
│  └─────────────────────────┘  └─────────────────────────┘  └──────────────────────┘ │
│                                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────┐ │
│  │  produit.models.ts      │  │  facture.models.ts      │  │  emetteur.models.ts  │ │
│  ├─────────────────────────┤  ├─────────────────────────┤  ├──────────────────────┤ │
│  │ ProduitItem             │  │ FactureItem             │  │ EmetteurItem         │ │
│  │ ProduitDetailResponse   │  │ FactureDetailResponse   │  │ EmetteurResponseDTO  │ │
│  │ CreateProduitRequest    │  │ LigneFactureResponse    │  │ EmetteurDetailResp   │ │
│  │ UpdateProduitRequest    │  │ LigneFactureRequestDTO  │  │ CreateEmetteurReq    │ │
│  │ ProduitListResponse     │  │ CreateFactureRequest    │  │ UpdateEmetteurReq    │ │
│  │ ProduitFilter           │  │ UpdateFactureRequest    │  │ EmetteurListResponse │ │
│  │ ProduitStats            │  │ SendFactureRequest      │  │ EmetteurProfile      │ │
│  │ LigneFactureInfo        │  │ FactureFilter           │  │ EmetteurFilter       │ │
│  │                         │  │ FactureStatistics       │  │                      │ │
│  │ ✅ ENTREPRISE_ADMIN     │  │ FacturePrintData        │  │ ✅ EMETTEUR          │ │
│  └─────────────────────────┘  └─────────────────────────┘  └──────────────────────┘ │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      LAYER 4: KPI & ANALYTICS (DASHBOARDS)                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                              dashboard.models.ts                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐   │
│  │ SuperAdminDashboard                                                            │   │
│  │ ├─ totalEntreprises, totalUtilisateurs, demandesPendantes, totalFactures      │   │
│  │                                                                                 │   │
│  │ EntrepriseAdminDashboard                                                       │   │
│  │ ├─ totalVentes, totalAchats, chiffreAffairesMois, totalClients, ...           │   │
│  │                                                                                 │   │
│  │ ClientDashboard                                                                │   │
│  │ ├─ totalAchats, montantJour, montantMois, facturesNonPayees, ...              │   │
│  │                                                                                 │   │
│  │ ViewerDashboard                                                                │   │
│  │ ├─ totalFactures, totalClients, totalProduits, lectureSeule: true             │   │
│  │                                                                                 │   │
│  │ EmetteurDashboard                                                              │   │
│  │ ├─ totalVentes, totalAchats, chiffreAffairesMois, nombreClients, ...          │   │
│  │                                                                                 │   │
│  │ KPICard { title, value, icon, color, trend }                                  │   │
│  │ ChartData, PieChartData, RecentActivity                                       │   │
│  └───────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│        ⬆️  Utilisé par: Services dashboard, Components de statistiques                  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          LAYER 5: CENTRAL EXPORTS                                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                           index.ts (Central Hub)                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐      │
│  │ export * from './enums';                                                  │      │
│  │ export * from './auth.models';                                            │      │
│  │ export * from './user.models';                                            │      │
│  │ export * from './demande.models';                                         │      │
│  │ export * from './collaborateur.models';                                   │      │
│  │ export * from './client.models';                                          │      │
│  │ export * from './produit.models';                                         │      │
│  │ export * from './facture.models';                                         │      │
│  │ export * from './emetteur.models';                                        │      │
│  │ export * from './dashboard.models';                                       │      │
│  │                                                                            │      │
│  │ ⛔ Usage Simplifié:                                                        │      │
│  │    import { UserDTO, AuthResponse, DemandeItem } from '@app/models';       │      │
│  │ ✅ NON:                                                                    │      │
│  │    import { DemandeItem } from '@app/models/demande.models.ts';            │      │
│  └────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════════════════════════╗
║                           DATA FLOW PAR RÔLE                                           ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 👑 SUPER_ADMIN                                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  Login(email, password) → AuthResponse                                                 │
│         ↓                                                                               │
│  currentUser: UserDTO { role: 'SUPER_ADMIN', ... }                                     │
│         ↓                                                                               │
│  Pages Disponibles:                                                                     │
│  • /super-admin/demandes → DemandeItem[] → DemandeDetailResponse                       │
│  • /super-admin/utilisateurs → UserDTO[] → UpdateUserRequest                          │
│  • /super-admin/statistiques → SuperAdminDashboard                                     │
│  • /super-admin/entreprises → ...                                                      │
│                                                                                         │
│  Actions: Approve/Reject Demandes, Manage Users, View Stats                           │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏢 ENTREPRISE_ADMIN                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  Login(email, password) → AuthResponse                                                 │
│         ↓                                                                               │
│  currentUser: UserDTO { role: 'ENTREPRISE_ADMIN', ... }                                │
│         ↓                                                                               │
│  Pages Disponibles:                                                                     │
│  • /entreprise/dashboard → EntrepriseAdminDashboard                                    │
│  • /entreprise/collaborateurs → CollaborateurItem[]                                    │
│  • /entreprise/clients → ClientItem[] ← CreateClientRequest, UpdateClientRequest      │
│  • /entreprise/produits → ProduitItem[] ← CreateProduitRequest, UpdateProduitRequest   │
│  • /entreprise/factures → FactureItem[] ← CreateFactureRequest                        │
│                 ├─ LigneFactureResponse[]                                             │
│                 └─ FactureDetailResponse                                              │
│                                                                                         │
│  Actions: CRUD Clients, CRUD Produits, Create/Send Factures, Manage Team              │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 👁️ ENTREPRISE_VIEWER (Lecture seule)                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  Login(email, password) → AuthResponse                                                 │
│         ↓                                                                               │
│  currentUser: UserDTO { role: 'ENTREPRISE_VIEWER', ... }                               │
│         ↓                                                                               │
│  Pages Disponibles (Lecture seule):                                                    │
│  • Voir factures ✅ (pas de création/édition)                                         │
│  • Voir clients ✅ (pas de création/édition/suppression)                              │
│  • Voir produits ✅ (pas de création/édition/suppression)                             │
│  • ViewerDashboard { lectureSeule: true }                                             │
│                                                                                         │
│  ⚠️ Tous les boutons Nouveau/Modifier/Supprimer sont désactivés                       │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🛒 CLIENT (Acheteur)                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  Login(email, password) → AuthResponse                                                 │
│         ↓                                                                               │
│  currentUser: UserDTO { role: 'CLIENT', typeUser: 'CLIENT', clientId: 5 }             │
│         ↓                                                                               │
│  Pages Disponibles:                                                                     │
│  • /client/mes-achats → FactureItem[] (mes achats uniquement)                         │
│  • /client/profil → ClientDTO ← UpdateProfileRequest                                  │
│  • /client/dashboard → ClientDashboard { totalAchats, montantMois, ... }              │
│                                                                                         │
│  Actions: View Invoices, Edit Profile                                                  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏭 EMETTEUR (Vendeur)                                                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  Login(email, password) → AuthResponse                                                 │
│         ↓                                                                               │
│  currentUser: UserDTO { role: 'EMETTEUR', typeUser: 'EMETTEUR', emetteurId: 3 }      │
│         ↓                                                                               │
│  Pages Disponibles:                                                                     │
│  • /emetteur/dashboard → EmetteurDashboard { totalVentes, CA, ... }                   │
│  • /emetteur/profil → EmetteurResponseDTO ← UpdateEmetteurRequest                     │
│  • /emetteur/mes-produits → ProduitItem[] ← CreateProduitRequest                      │
│  • /emetteur/mes-factures → FactureItem[] (mes ventes uniquement)                     │
│                                                                                         │
│  Actions: Manage Products, View Sales (Invoices), Edit Profile, See Stats             │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════════════════════════╗
║                          TYPES & VALIDATIONS                                          ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

UserRole Type Union:
  'SUPER_ADMIN' | 'ENTREPRISE_ADMIN' | 'ENTREPRISE_VIEWER' | 'CLIENT' | 'EMETTEUR'

AccountStatus Type Union:
  'PENDING' | 'ACTIVE' | 'DISABLED' | 'EXPIRED' | 'REQUESTED' | 'REJECTED'

DemandeStatus Type Union:
  'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PENDING'

FactureStatus Type Union:
  'DRAFT' | 'SEND' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'CANCELLED' | 'OVERDUE'

Type Guards (Validation au runtime):
  ✅ isUserRole(value) → value is UserRole
  ✅ isAccountStatus(value) → value is AccountStatus
  ✅ isDemandeStatus(value) → value is DemandeStatus
  ✅ isFactureStatus(value) → value is FactureStatus

Normalización (Hanle legacy backend values):
  ✅ normalizeUserRole('ADMIN') → 'SUPER_ADMIN'
  ✅ normalizeUserRole('USER') → 'CLIENT'
  ✅ normalizeUserRole('SUPER_ADMIN') → 'SUPER_ADMIN' (no change)

╔════════════════════════════════════════════════════════════════════════════════════════╗
║                              BUILD STATUS                                             ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

✅ npm run build: SUCCESS
   - Main bundle: 1.84 MB
   - Styles: 522.23 kB
   - Total transfer: 457.81 kB
   - No TypeScript errors
   - Compile time: 6.979 seconds

✅ All models properly typed
✅ All enums exported
✅ Central index.ts working
✅ Ready for service integration

```
