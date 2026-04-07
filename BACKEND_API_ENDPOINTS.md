# Complete Java Backend API Endpoints

**Base URL:** `http://localhost:8080/api`

---

## 1. Authentication (`/api/auth`)
**Controller:** `AuthController`

| Method | Endpoint | Role | Returns |

|--------|----------|------|---------|
| POST | `/auth/register` | PUBLIC | `AuthResponse` (JWT Token) |
| POST | `/auth/login` | PUBLIC | `AuthResponse` (JWT Token) |
| GET | `/auth/me` | AUTHENTICATED | `UserDTO` |
| POST | `/auth/change-password` | AUTHENTICATED | `{message, status}` |

---

## 2. Bon de Commandes (`/api/bon-commandes`)
**Controller:** `BonCommandeController`

### Read Endpoints (GET)
| Method | Endpoint | Auth Required | Authorized Roles |
|--------|----------|---|------------------|
| GET | `/bon-commandes` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/bon-commandes/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, CLIENT, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/bon-commandes/mes-bons-commandes` | Yes | AUTHENTICATED (any role) |

### Write Endpoints (POST/PUT/DELETE)
| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| POST | `/bon-commandes` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Create new bon de commande |
| PUT | `/bon-commandes/{id}` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Update bon de commande |
| DELETE | `/bon-commandes/{id}` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Delete bon de commande |
| PUT | `/bon-commandes/{id}/envoyer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Send bon de commande |
| PUT | `/bon-commandes/{id}/signer-client` | **NO** | PUBLIC (token in link) | Client signature |
| PUT | `/bon-commandes/{id}/confirmer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Confirm bon de commande |

---

## 3. Commandes (`/api/commandes`)
**Controller:** `CommandeController`

### Read Endpoints (GET)
| Method | Endpoint | Auth Required | Authorized Roles |
|--------|----------|---|------------------|
| GET | `/commandes` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/commandes/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/commandes/mes-commandes` | Yes | AUTHENTICATED (any role) |

### Write Endpoints (POST/PUT/DELETE)
| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| POST | `/commandes` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Create new commande |
| PUT | `/commandes/{id}` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Update commande |
| DELETE | `/commandes/{id}` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Delete commande |
| PUT | `/commandes/{id}/confirmer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Confirm commande |
| PUT | `/commandes/{id}/demarrer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Start commande |
| PUT | `/commandes/{id}/livrer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Mark as delivered |

---

## 4. Clients (`/api/clients`)
**Controller:** `ClientController`

### CRUD Operations
| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| POST | `/clients` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN | Create new client |
| GET | `/clients` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER | List all clients |
| GET | `/clients/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER | Get client by ID |
| PUT | `/clients/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR | Update client |
| DELETE | `/clients/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN | Delete client |

### Client Profile (Current User)
| Method | Endpoint | Auth Required | Authorized Roles |
|--------|----------|---|------------------|
| GET | `/clients/profile/me` | Yes | CLIENT |
| PUT | `/clients/profile/me` | Yes | CLIENT |

---

## 5. Bons de Livraison (`/api/bon-livraisons`)
**Controller:** `BonLivraisonController`

### Read Endpoints (GET)
| Method | Endpoint | Auth Required | Authorized Roles |
|--------|----------|---|------------------|
| GET | `/bon-livraisons` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/bon-livraisons/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/bon-livraisons/mes-livraisons` | Yes | AUTHENTICATED (any role) |

### Write Endpoints (POST/PUT/DELETE)
| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| POST | `/bon-livraisons` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Create new bon de livraison |
| DELETE | `/bon-livraisons/{id}` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Delete bon de livraison |
| PUT | `/bon-livraisons/{id}/livrer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Mark as delivered |
| PUT | `/bon-livraisons/{id}/signer-client` | **NO** | PUBLIC (token in link) | Client signature |
| PUT | `/bon-livraisons/{id}/litige` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Report dispute |
| PUT | `/bon-livraisons/{id}/resoudre-litige` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Resolve dispute |

---

## 6. Factures (`/api/factures`)
**Controller:** `FactureController`

### Read Endpoints (GET)
| Method | Endpoint | Auth Required | Authorized Roles |
|--------|----------|---|------------------|
| GET | `/factures` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/factures/{id}` | Yes | AUTHENTICATED (with ownership check) |
| GET | `/factures/mes-achats` | Yes | AUTHENTICATED (CLIENT or EMETTEUR) |
| GET | `/factures/mes-ventes` | Yes | ENTREPRISE_ADMIN, EMETTEUR |

### Write Endpoints (POST/PUT/DELETE)
| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| POST | `/factures` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Create new facture |
| PUT | `/factures/{id}` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Update facture |
| DELETE | `/factures/{id}` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Delete facture |
| PUT | `/factures/{id}/signer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Sign facture |
| PUT | `/factures/{id}/envoyer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Send facture |

---

## 7. Devis (`/api/devis`)
**Controller:** `DevisController`

### Read Endpoints (GET)
| Method | Endpoint | Auth Required | Authorized Roles |
|--------|----------|---|------------------|
| GET | `/devis` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/devis/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, CLIENT, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/devis/mes-devis` | Yes | AUTHENTICATED (any role) |

### Write Endpoints (POST/PUT/DELETE)
| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| POST | `/devis` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Create new devis |
| PUT | `/devis/{id}` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Update devis |
| DELETE | `/devis/{id}` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Delete devis |
| PUT | `/devis/{id}/envoyer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Send devis |
| PUT | `/devis/{id}/accepter` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Accept devis |
| PUT | `/devis/{id}/rejeter` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Reject devis (requires reason in body) |
| PUT | `/devis/{id}/expirer` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR | Mark as expired |

---

## 8. Produits (`/api/produits`)
**Controller:** `ProduitController`

### CRUD Operations
| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| POST | `/produits` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN | Create new product |
| PUT | `/produits/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN | Update product |
| DELETE | `/produits/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN | Delete product |
| GET | `/produits` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, ENTREPRISE_VIEWER | List all products |

### Stock Management
| Method | Endpoint | Auth Required | Authorized Roles |
|--------|----------|---|------------------|
| PUT | `/produits/{id}/stock` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN |

---

## 9. Avoirs (`/api/avoirs`)
**Controller:** `AvoirController`

### Read Endpoints (GET)
| Method | Endpoint | Auth Required | Authorized Roles |
|--------|----------|---|------------------|
| GET | `/avoirs` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/avoirs/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| GET | `/avoirs/facture/{factureId}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |

### Write Endpoints (PUT)
| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| PUT | `/avoirs/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR | Update avoir |
| PUT | `/avoirs/{id}/valider` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR | Validate avoir |
| PUT | `/avoirs/{id}/envoyer` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR | Send avoir |
| PUT | `/avoirs/{id}/appliquer` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR | Apply avoir |

---

## 10. Émetteurs (`/api/emetteurs`)
**Controller:** `EmetteurController`

### CRUD Operations
| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| POST | `/emetteurs` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN | Create new emetteur |
| GET | `/emetteurs` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER | List all emetteurs |
| GET | `/emetteurs/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER | Get emetteur by ID |
| PUT | `/emetteurs/{id}` | Yes | SUPER_ADMIN, ENTREPRISE_ADMIN | Update emetteur |
| DELETE | `/emetteurs/{id}` | Yes | SUPER_ADMIN | Delete emetteur |

### Emetteur Profile (Current User - EMETTEUR role only)
| Method | Endpoint | Auth Required | Authorized Roles |
|--------|----------|---|------------------|
| GET | `/emetteurs/profile/me` | Yes | EMETTEUR |
| PUT | `/emetteurs/profile/me` | Yes | EMETTEUR |
| GET | `/emetteurs/dashboard` | Yes | EMETTEUR |
| GET | `/emetteurs/mes-factures` | Yes | EMETTEUR |
| GET | `/emetteurs/mes-produits` | Yes | EMETTEUR |

---

## 11. Conversions (Document Generation) (`/api/conversions`)
**Controller:** `ConversionController`

| Method | Endpoint | Auth Required | Authorized Roles | Notes |
|--------|----------|---|------------------|-------|
| POST | `/conversions/devis/{id}/vers-facture` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN | Convert Devis → Invoice |
| POST | `/conversions/devis/{id}/vers-bon-commande` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN | Convert Devis → PO |
| POST | `/conversions/bon-commande/{id}/vers-commande` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN | Convert PO → Order |
| POST | `/conversions/commande/{id}/vers-bon-livraison` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN | Convert Order → Delivery Note |
| POST | `/conversions/commande/{id}/vers-facture` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN | Convert Order → Invoice (direct) |
| POST | `/conversions/bon-livraison/{id}/vers-facture` | Yes | ENTREPRISE_ADMIN, SUPER_ADMIN | Convert Delivery Note → Invoice |

---

## 12. Enterprise Admin Panel (`/api/entreprise-admin`)
**Controller:** `EntrepriseAdminController`
**Auth Required:** Yes | **Authorized Roles:** ENTREPRISE_ADMIN

### Collaborators Management
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/entreprise-admin/collaborateurs` | List all collaborators of the company |
| POST | `/entreprise-admin/collaborateurs` | Create new collaborator (VIEWER role only) |
| PATCH | `/entreprise-admin/collaborateurs/{id}/desactiver` | Deactivate collaborator |

### Products Management
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/entreprise-admin/produits` | List company products |
| POST | `/entreprise-admin/produits` | Create new product for company |

---

## 13. Super Admin Panel (`/api/super-admin`)
**Controller:** `SuperAdminController`
**Auth Required:** Yes | **Authorized Roles:** SUPER_ADMIN

### User Management
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/super-admin/users` | List all users |
| GET | `/super-admin/users/{id}` | Get user details |
| PUT | `/super-admin/users/{id}` | Update user |
| PATCH | `/super-admin/users/{id}/status` | Change user account status |
| DELETE | `/super-admin/users/{id}` | Delete user |

### Data Access (Read-only)
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/super-admin/clients` | List all clients |
| GET | `/super-admin/emetteurs` | List all emetteurs |
| GET | `/super-admin/factures` | List all invoices |
| GET | `/super-admin/statistiques` | Get overall statistics |

---

## 14. Super Admin Requests Management (`/api/super-admin/demandes`)
**Controller:** `SuperAdminDemandeController`
**Auth Required:** Yes | **Authorized Roles:** SUPER_ADMIN

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/super-admin/demandes/en-attente` | List pending requests |
| GET | `/super-admin/demandes/{id}` | Get request details |
| POST | `/super-admin/demandes/{id}/approuver` | Approve request |
| POST | `/super-admin/demandes/{id}/rejeter` | Reject request (requires comment) |
| GET | `/super-admin/demandes/statistiques` | Get request statistics |

---

## 15. Public Requests (`/api/public/demandes`)
**Controller:** `PublicDemandeController`
**Auth Required:** NO (Public endpoints)

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/public/demandes/emetteur` | Submit new company creation request |
| GET | `/public/demandes/statut` | Check request status by email |
| GET | `/public/demandes/existe` | Check if request exists for email |

---

## 16. Viewer Panel (`/api/viewer`)
**Controller:** `ViewController`
**Auth Required:** Yes | **Authorized Roles:** ENTREPRISE_VIEWER

### Invoices
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/viewer/factures` | List all company invoices |
| GET | `/viewer/factures/{id}` | Get invoice details |

### Clients
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/viewer/clients` | List all clients |
| GET | `/viewer/clients/{id}` | Get client details |

### Products
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/viewer/produits` | List all products |
| GET | `/viewer/produits/{id}` | Get product details |

---

## Security Notes

### CORS Configuration
- **Allowed Origin:** `http://localhost:4200`

### Authentication
- Uses JWT tokens in request headers: `Authorization: Bearer <token>`
- Tokens obtained from `/api/auth/login` or `/api/auth/register`

### Role Hierarchy
- **SUPER_ADMIN:** Full system access
- **ENTREPRISE_ADMIN:** Admin for their company
- **EMETTEUR:** Seller/Company employee
- **ENTREPRISE_VIEWER:** Read-only viewer for company
- **CLIENT:** Client user (limited access)

### Special Notes
- `PUT /bon-commandes/{id}/signer-client` and `PUT /bon-livraisons/{id}/signer-client` do NOT require authentication (use token in URL)
- Some endpoints check resource ownership to ensure users only access their own data
- ENTREPRISE_VIEWER role is read-only for writing operations

---

## Usage Tips

### Common Frontend Calls
1. **Login:** `POST /api/auth/login` → Get JWT token
2. **Get Current User:** `GET /api/auth/me` → Verify session
3. **List Bons de Commandes:** `GET /api/bon-commandes` → Returns filtered by user role
4. **Create Invoice from Devis:** `POST /api/conversions/devis/{id}/vers-facture`
5. **Check Public Request Status:** `GET /api/public/demandes/statut?email=user@example.com`

### Backend Response Format
All endpoints return:
- **Success (2xx):** `{ data: {...} }` or `{ message: "success" }`
- **Error (4xx/5xx):** `{ error: "Error message" }` or `{ message: "Error description" }`

---

## Document Generation Workflow

The `/api/conversions` endpoints enable document transformation flows:

```
Devis (Quote)
├─→ [Conversion 1] → Facture (Invoice) - Direct
└─→ [Conversion 2] → Bon de Commande (PO)
                    └─→ [Conversion 3] → Commande (Order)
                                        ├─→ [Conversion 4a] → Bon de Livraison (Delivery Note)
                                        │                    └─→ [Conversion 6] → Facture
                                        └─→ [Conversion 4b] → Facture (Direct, no Delivery Note)
```

