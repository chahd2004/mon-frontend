# Frontend vs Backend API Mapping Tool

This document helps you compare what your Angular frontend **is calling** against what the Java backend **actually provides**.

---

## How to Use This Document

1. **List all HTTP calls** your Angular frontend makes (check services)
2. **Find each endpoint** in the sections below
3. **Identify gaps** - endpoints frontend calls that backend doesn't have
4. **Identify orphans** - endpoints backend has that frontend doesn't use

### Example Angular Service Call
```typescript
// In your-service.ts
this.http.get('/api/bon-commandes')
// ✓ IMPLEMENTED - Check BON_COMMANDES section below
// ✗ NOT FOUND - Backend doesn't have it
```

---

## A. BON-COMMANDES Endpoints

### Created From Devis

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Get all | `GET /api/bon-commandes` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Get by ID | `GET /api/bon-commandes/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, CLIENT, EMETTEUR, ENTREPRISE_VIEWER |
| My list | `GET /api/bon-commandes/mes-bons-commandes` | ✓ IMPLEMENTED | Auth: AUTHENTICATED |
| Create | `POST /api/bon-commandes` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Update | `PUT /api/bon-commandes/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Delete | `DELETE /api/bon-commandes/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Send to Client | `PUT /api/bon-commandes/{id}/envoyer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Client Signs | `PUT /api/bon-commandes/{id}/signer-client` | ✓ IMPLEMENTED | Auth: PUBLIC (no login needed) |
| Confirm | `PUT /api/bon-commandes/{id}/confirmer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |

### Expected Frontend Calls (Check Your Services)
- [ ] Do you call all of these endpoints?
- [ ] Missing any custom actions?
- [ ] Using a different endpoint path?

---

## B. COMMANDES Endpoints

### Created From Bon de Commande

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Get all | `GET /api/commandes` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Get by ID | `GET /api/commandes/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| My list | `GET /api/commandes/mes-commandes` | ✓ IMPLEMENTED | Auth: AUTHENTICATED |
| Create | `POST /api/commandes` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Update | `PUT /api/commandes/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Delete | `DELETE /api/commandes/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Confirm | `PUT /api/commandes/{id}/confirmer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Start Process | `PUT /api/commandes/{id}/demarrer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Mark Delivered | `PUT /api/commandes/{id}/livrer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |

---

## C. Document Conversion Endpoints

### Used in Document Generation Workflow

| Frontend Call | Backend Endpoint | Status | Required For |
|---------------|------------------|--------|--------------|
| Quote to Invoice | `POST /api/conversions/devis/{id}/vers-facture` | ✓ IMPLEMENTED | Direct invoice from quote |
| Quote to PO | `POST /api/conversions/devis/{id}/vers-bon-commande` | ✓ IMPLEMENTED | Bon de commande flow |
| PO to Order | `POST /api/conversions/bon-commande/{id}/vers-commande` | ✓ IMPLEMENTED | Commande flow |
| Order to Delivery Note | `POST /api/conversions/commande/{id}/vers-bon-livraison` | ✓ IMPLEMENTED | Delivery tracking |
| Order to Invoice | `POST /api/conversions/commande/{id}/vers-facture` | ✓ IMPLEMENTED | Direct invoice (skip delivery) |
| Delivery Note to Invoice | `POST /api/conversions/bon-livraison/{id}/vers-facture` | ✓ IMPLEMENTED | Final invoice from delivery |

### Usage Pattern
```typescript
// Example: Convert devis to bon-commande
this.http.post('/api/conversions/devis/10/vers-bon-commande', {
  notes: "Order from quote",
  additionalItems: []
})

// Expected response: BonCommandeResponseDTO
```

---

## D. Invoice Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Get all | `GET /api/factures` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Get by ID | `GET /api/factures/{id}` | ✓ IMPLEMENTED | Auth: AUTHENTICATED (with ownership check) |
| My purchases | `GET /api/factures/mes-achats` | ✓ IMPLEMENTED | Auth: AUTHENTICATED (CLIENT or EMETTEUR) |
| My sales | `GET /api/factures/mes-ventes` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, EMETTEUR |
| Create | `POST /api/factures` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Update | `PUT /api/factures/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Delete | `DELETE /api/factures/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Sign | `PUT /api/factures/{id}/signer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Send | `PUT /api/factures/{id}/envoyer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |

---

## E. Quote (Devis) Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Get all | `GET /api/devis` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Get by ID | `GET /api/devis/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, CLIENT, EMETTEUR, ENTREPRISE_VIEWER |
| My quotes | `GET /api/devis/mes-devis` | ✓ IMPLEMENTED | Auth: AUTHENTICATED |
| Create | `POST /api/devis` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Update | `PUT /api/devis/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Delete | `DELETE /api/devis/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Send | `PUT /api/devis/{id}/envoyer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Accept | `PUT /api/devis/{id}/accepter` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Reject | `PUT /api/devis/{id}/rejeter` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR (requires reason) |
| Expire | `PUT /api/devis/{id}/expirer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |

---

## F. Product & Inventory Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Get all | `GET /api/produits` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, ENTREPRISE_VIEWER |
| Create | `POST /api/produits` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN |
| Update | `PUT /api/produits/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN |
| Delete | `DELETE /api/produits/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN |
| Update Stock | `PUT /api/produits/{id}/stock` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN |

---

## G. Client Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Get all | `GET /api/clients` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Get by ID | `GET /api/clients/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Create | `POST /api/clients` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN |
| Update | `PUT /api/clients/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR |
| Delete | `DELETE /api/clients/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN |
| My Profile | `GET /api/clients/profile/me` | ✓ IMPLEMENTED | Auth: CLIENT |
| Update Profile | `PUT /api/clients/profile/me` | ✓ IMPLEMENTED | Auth: CLIENT |

---

## H. Company/Emetteur Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Get all | `GET /api/emetteurs` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Get by ID | `GET /api/emetteurs/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Create | `POST /api/emetteurs` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN |
| Update | `PUT /api/emetteurs/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN |
| Delete | `DELETE /api/emetteurs/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| My Profile | `GET /api/emetteurs/profile/me` | ✓ IMPLEMENTED | Auth: EMETTEUR |
| Update Profile | `PUT /api/emetteurs/profile/me` | ✓ IMPLEMENTED | Auth: EMETTEUR |
| Dashboard | `GET /api/emetteurs/dashboard` | ✓ IMPLEMENTED | Auth: EMETTEUR |
| My Invoices | `GET /api/emetteurs/mes-factures` | ✓ IMPLEMENTED | Auth: EMETTEUR |
| My Products | `GET /api/emetteurs/mes-produits` | ✓ IMPLEMENTED | Auth: EMETTEUR |

---

## I. Delivery Notes (Bon de Livraison) Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Get all | `GET /api/bon-livraisons` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Get by ID | `GET /api/bon-livraisons/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| My list | `GET /api/bon-livraisons/mes-livraisons` | ✓ IMPLEMENTED | Auth: AUTHENTICATED |
| Create | `POST /api/bon-livraisons` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Delete | `DELETE /api/bon-livraisons/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Mark Delivered | `PUT /api/bon-livraisons/{id}/livrer` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Client Signs | `PUT /api/bon-livraisons/{id}/signer-client` | ✓ IMPLEMENTED | Auth: PUBLIC (no login) |
| Report Dispute | `PUT /api/bon-livraisons/{id}/litige` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |
| Resolve Dispute | `PUT /api/bon-livraisons/{id}/resoudre-litige` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR |

---

## J. Credit Notes (Avoirs) Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Get all | `GET /api/avoirs` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Get by ID | `GET /api/avoirs/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| By Invoice | `GET /api/avoirs/facture/{factureId}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER |
| Update | `PUT /api/avoirs/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR |
| Validate | `PUT /api/avoirs/{id}/valider` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR |
| Send | `PUT /api/avoirs/{id}/envoyer` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR |
| Apply | `PUT /api/avoirs/{id}/appliquer` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR |

---

## K. Authentication Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Register | `POST /api/auth/register` | ✓ IMPLEMENTED | Auth: PUBLIC |
| Login | `POST /api/auth/login` | ✓ IMPLEMENTED | Auth: PUBLIC - Returns JWT |
| Get Current User | `GET /api/auth/me` | ✓ IMPLEMENTED | Auth: AUTHENTICATED |
| Change Password | `POST /api/auth/change-password` | ✓ IMPLEMENTED | Auth: AUTHENTICATED |

---

## L. Enterprise Admin Panel Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| List Collaborators | `GET /api/entreprise-admin/collaborateurs` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN |
| Add Collaborator | `POST /api/entreprise-admin/collaborateurs` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN (VIEWER role only) |
| Deactivate Collaborator | `PATCH /api/entreprise-admin/collaborateurs/{id}/desactiver` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN |
| List Products | `GET /api/entreprise-admin/produits` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN |
| Create Product | `POST /api/entreprise-admin/produits` | ✓ IMPLEMENTED | Auth: ENTREPRISE_ADMIN |

---

## M. Super Admin Panel Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| List Users | `GET /api/super-admin/users` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| Get User | `GET /api/super-admin/users/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| Update User | `PUT /api/super-admin/users/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| Change Status | `PATCH /api/super-admin/users/{id}/status` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| Delete User | `DELETE /api/super-admin/users/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| List Clients | `GET /api/super-admin/clients` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| List Companies | `GET /api/super-admin/emetteurs` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| List Invoices | `GET /api/super-admin/factures` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| Statistics | `GET /api/super-admin/statistiques` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |

---

## N. Request Management (Admin) Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Pending Requests | `GET /api/super-admin/demandes/en-attente` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| Get Request | `GET /api/super-admin/demandes/{id}` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| Approve Request | `POST /api/super-admin/demandes/{id}/approuver` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |
| Reject Request | `POST /api/super-admin/demandes/{id}/rejeter` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN (requires comment) |
| Statistics | `GET /api/super-admin/demandes/statistiques` | ✓ IMPLEMENTED | Auth: SUPER_ADMIN |

---

## O. Public Request Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| Submit Request | `POST /api/public/demandes/emetteur` | ✓ IMPLEMENTED | Auth: PUBLIC |
| Check Status | `GET /api/public/demandes/statut` | ✓ IMPLEMENTED | Auth: PUBLIC |
| Exists Check | `GET /api/public/demandes/existe` | ✓ IMPLEMENTED | Auth: PUBLIC |

---

## P. Viewer Panel Endpoints

| Frontend Call | Backend Endpoint | Status | Notes |
|---------------|------------------|--------|-------|
| List Invoices | `GET /api/viewer/factures` | ✓ IMPLEMENTED | Auth: ENTREPRISE_VIEWER |
| Get Invoice | `GET /api/viewer/factures/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_VIEWER |
| List Clients | `GET /api/viewer/clients` | ✓ IMPLEMENTED | Auth: ENTREPRISE_VIEWER |
| Get Client | `GET /api/viewer/clients/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_VIEWER |
| List Products | `GET /api/viewer/produits` | ✓ IMPLEMENTED | Auth: ENTREPRISE_VIEWER |
| Get Product | `GET /api/viewer/produits/{id}` | ✓ IMPLEMENTED | Auth: ENTREPRISE_VIEWER |

---

## Summary Statistics

| Category | Total Endpoints |
|----------|-----------------|
| Bon-Commandes | 9 |
| Commandes | 10 |
| Document Conversion | 6 |
| Invoices | 9 |
| Quotes/Devis | 10 |
| Products | 5 |
| Clients | 7 |
| Companies/Emetteurs | 10 |
| Delivery Notes | 9 |
| Credit Notes | 7 |
| Authentication | 4 |
| Enterprise Admin | 5 |
| Super Admin | 9 |
| Requests Management | 5 |
| Public Requests | 3 |
| Viewer Panel | 6 |
| **TOTAL** | **~114** |

---

## Integration Verification Checklist

### Critical Features to Verify

- [ ] **Authentication:** Login/Register working with JWT tokens
- [ ] **Bon-Commandes:** Create, list, send, client signature working
- [ ] **Commandes:** Create from Bon-Commandes, workflow states working
- [ ] **Document Conversion:** All 6 conversion flows working
- [ ] **Invoices:** Create, list, send, sign working
- [ ] **Quotes:** Full lifecycle (create → send → accept/reject)
- [ ] **Products:** Create, list, update stock
- [ ] **Clients:** Create, list, update
- [ ] **Companies:** Create, list, profile management
- [ ] **Role-Based Access:** Verify permissions for each role
- [ ] **Public Endpoints:** Company request submission working
- [ ] **Admin Panels:** Super admin and enterprise admin functions

---

## Troubleshooting Common Issues

### 1. Endpoint Returns 404
- **Possible Causes:**
  - Wrong HTTP method (GET vs POST)
  - Wrong URL path
  - Resource doesn't exist
  - Backend not started

- **Verification:**
  - Check exact endpoint path in tables above
  - Verify HTTP method
  - Test with Postman/curl first

### 2. Endpoint Returns 403 Forbidden
- **Possible Causes:**
  - User lacks required role
  - Resource doesn't belong to user
  - Writing to read-only resource

- **Solution:**
  - Verify user role matches required roles
  - Check ownership validation logic
  - Use SUPER_ADMIN for testing

### 3. Endpoint Returns 401 Unauthorized
- **Possible Causes:**
  - Missing JWT token
  - Token expired
  - Token not in Authorization header

- **Solution:**
  - Ensure JWT is returned from `/api/auth/login`
  - Include token in: `Authorization: Bearer <token>`
  - Check token expiration

### 4. Document Conversion Fails
- **Possible Causes:**
  - Source document doesn't exist
  - Document in wrong status
  - Missing required fields

- **Solution:**
  - Verify source document ID is correct
  - Check document current status in backend
  - Ensure all required fields are populated

---

## Development Tips

### Testing Flow

```typescript
// 1. Register
POST /api/auth/register
→ Get JWT

// 2. Login
POST /api/auth/login
→ Get fresh JWT

// 3. Test Bon-Commande flow
POST /api/bon-commandes (create)
PUT /api/bon-commandes/{id}/envoyer (send)
PUT /api/bon-commandes/{id}/signer-client (no auth - use link)
PUT /api/bon-commandes/{id}/confirmer (confirm)

// 4. Convert to Commande
POST /api/conversions/bon-commande/{id}/vers-commande

// 5. Process Commande
PUT /api/commandes/{id}/confirmer
PUT /api/commandes/{id}/demarrer
PUT /api/commandes/{id}/livrer

// 6. Generate Invoice
POST /api/conversions/commande/{id}/vers-facture
```

