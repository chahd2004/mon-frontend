# Quick Reference: All Backend API Endpoints

## Executive Summary

The Java backend provides **16 REST controllers** with **85+ endpoints** across multiple domains. Below is a quick reference organized by business domain.

---

## Core Endpoints by Domain

### Authentication & Security (4 endpoints)
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/me` - Get current user
- **POST** `/api/auth/change-password` - Change password

### Purchase Orders & Orders (15 endpoints)
**Bon de Commandes (`/api/bon-commandes`)**
- GET `/bon-commandes` - List all
- GET `/bon-commandes/{id}` - Get one
- GET `/bon-commandes/mes-bons-commandes` - User's POs
- POST `/bon-commandes` - Create
- PUT `/bon-commandes/{id}` - Update
- DELETE `/bon-commandes/{id}` - Delete
- PUT `/bon-commandes/{id}/envoyer` - Send
- PUT `/bon-commandes/{id}/signer-client` - Client signature (PUBLIC)
- PUT `/bon-commandes/{id}/confirmer` - Confirm

**Commandes (`/api/commandes`)**
- GET `/commandes` - List all
- GET `/commandes/{id}` - Get one
- GET `/commandes/mes-commandes` - User's orders
- POST `/commandes` - Create
- PUT `/commandes/{id}` - Update
- DELETE `/commandes/{id}` - Delete
- PUT `/commandes/{id}/confirmer` - Confirm
- PUT `/commandes/{id}/demarrer` - Start
- PUT `/commandes/{id}/livrer` - Mark delivered

### Document Conversion (6 endpoints)
- **POST** `/api/conversions/devis/{id}/vers-facture` - Quote → Invoice
- **POST** `/api/conversions/devis/{id}/vers-bon-commande` - Quote → PO
- **POST** `/api/conversions/bon-commande/{id}/vers-commande` - PO → Order
- **POST** `/api/conversions/commande/{id}/vers-bon-livraison` - Order → Delivery Note
- **POST** `/api/conversions/commande/{id}/vers-facture` - Order → Invoice
- **POST** `/api/conversions/bon-livraison/{id}/vers-facture` - Delivery Note → Invoice

### Invoices & Financial (7 endpoints)
- GET `/api/factures` - List invoices
- GET `/api/factures/{id}` - Get invoice
- GET `/api/factures/mes-achats` - My purchases
- GET `/api/factures/mes-ventes` - My sales
- POST `/api/factures` - Create invoice
- PUT `/api/factures/{id}` - Update invoice
- DELETE `/api/factures/{id}` - Delete invoice
- PUT `/api/factures/{id}/signer` - Sign
- PUT `/api/factures/{id}/envoyer` - Send

### Credit Notes (4 endpoints)
- GET `/api/avoirs` - List credit notes
- GET `/api/avoirs/{id}` - Get credit note
- GET `/api/avoirs/facture/{factureId}` - By invoice
- PUT `/api/avoirs/{id}` - Update
- PUT `/api/avoirs/{id}/valider` - Validate
- PUT `/api/avoirs/{id}/envoyer` - Send
- PUT `/api/avoirs/{id}/appliquer` - Apply

### Quotes (7 endpoints)
- GET `/api/devis` - List quotes
- GET `/api/devis/{id}` - Get quote
- GET `/api/devis/mes-devis` - My quotes
- POST `/api/devis` - Create quote
- PUT `/api/devis/{id}` - Update quote
- DELETE `/api/devis/{id}` - Delete quote
- PUT `/api/devis/{id}/envoyer` - Send
- PUT `/api/devis/{id}/accepter` - Accept
- PUT `/api/devis/{id}/rejeter` - Reject
- PUT `/api/devis/{id}/expirer` - Expire

### Products & Inventory (3 endpoints)
- GET `/api/produits` - List products
- POST `/api/produits` - Create product
- PUT `/api/produits/{id}` - Update product
- DELETE `/api/produits/{id}` - Delete product
- PUT `/api/produits/{id}/stock` - Update stock

### Delivery Notes (6 endpoints)
- GET `/api/bon-livraisons` - List delivery notes
- GET `/api/bon-livraisons/{id}` - Get delivery note
- GET `/api/bon-livraisons/mes-livraisons` - My delivery notes
- POST `/api/bon-livraisons` - Create
- DELETE `/api/bon-livraisons/{id}` - Delete
- PUT `/api/bon-livraisons/{id}/livrer` - Mark delivered
- PUT `/api/bon-livraisons/{id}/signer-client` - Client signature (PUBLIC)
- PUT `/api/bon-livraisons/{id}/litige` - Report dispute
- PUT `/api/bon-livraisons/{id}/resoudre-litige` - Resolve dispute

### Clients (5 endpoints)
- GET `/api/clients` - List clients
- GET `/api/clients/{id}` - Get client
- POST `/api/clients` - Create client
- PUT `/api/clients/{id}` - Update client
- DELETE `/api/clients/{id}` - Delete client
- GET `/api/clients/profile/me` - My profile (CLIENT role)
- PUT `/api/clients/profile/me` - Update my profile (CLIENT role)

### Emetteurs / Companies (5 endpoints)
- GET `/api/emetteurs` - List companies
- GET `/api/emetteurs/{id}` - Get company
- POST `/api/emetteurs` - Create company
- PUT `/api/emetteurs/{id}` - Update company
- DELETE `/api/emetteurs/{id}` - Delete company
- GET `/api/emetteurs/profile/me` - My profile (EMETTEUR role)
- PUT `/api/emetteurs/profile/me` - Update profile (EMETTEUR role)
- GET `/api/emetteurs/dashboard` - Dashboard
- GET `/api/emetteurs/mes-factures` - My invoices
- GET `/api/emetteurs/mes-produits` - My products

### Admin: Enterprise Management (3 endpoints)
- GET `/api/entreprise-admin/collaborateurs` - List team
- POST `/api/entreprise-admin/collaborateurs` - Add team member
- PATCH `/api/entreprise-admin/collaborateurs/{id}/desactiver` - Deactivate
- GET `/api/entreprise-admin/produits` - My products
- POST `/api/entreprise-admin/produits` - Create product

### Admin: Super Admin (10 endpoints)
- GET `/api/super-admin/users` - List all users
- GET `/api/super-admin/users/{id}` - Get user
- PUT `/api/super-admin/users/{id}` - Update user
- PATCH `/api/super-admin/users/{id}/status` - Change status
- DELETE `/api/super-admin/users/{id}` - Delete user
- GET `/api/super-admin/clients` - List clients
- GET `/api/super-admin/emetteurs` - List companies
- GET `/api/super-admin/factures` - List invoices
- GET `/api/super-admin/statistiques` - Stats

### Admin: Request Management (4 endpoints)
- GET `/api/super-admin/demandes/en-attente` - Pending requests
- GET `/api/super-admin/demandes/{id}` - Request details
- POST `/api/super-admin/demandes/{id}/approuver` - Approve
- POST `/api/super-admin/demandes/{id}/rejeter` - Reject
- GET `/api/super-admin/demandes/statistiques` - Stats

### Public: Company Requests (3 endpoints)
- POST `/api/public/demandes/emetteur` - Submit request
- GET `/api/public/demandes/statut` - Check status
- GET `/api/public/demandes/existe` - Check if exists

### Viewer: Read-Only Access (9 endpoints)
- GET `/api/viewer/factures` - Invoices
- GET `/api/viewer/factures/{id}` - Invoice details
- GET `/api/viewer/clients` - Clients list
- GET `/api/viewer/clients/{id}` - Client details
- GET `/api/viewer/produits` - Products list
- GET `/api/viewer/produits/{id}` - Product details

---

## HTTP Methods Summary

| Method | Count | Common Use |
|--------|-------|-----------|
| GET | ~40 | List/retrieve data |
| POST | ~15 | Create new resources |
| PUT | ~25 | Update or state changes |
| DELETE | ~10 | Delete resources |
| PATCH | ~3 | Partial updates |
| **TOTAL** | **~93** | |

---

## Authorization Summary

### Public Endpoints (No Auth Required)
- `POST /auth/register`
- `POST /auth/login`
- `PUT /bon-commandes/{id}/signer-client`
- `PUT /bon-livraisons/{id}/signer-client`
- `POST /public/demandes/emetteur`
- `GET /public/demandes/statut`
- `GET /public/demandes/existe`

### All Other Endpoints
- Require JWT token in `Authorization: Bearer <token>` header
- Role-based access control (see role hierarchy below)

---

## Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| SUPER_ADMIN | 1 - Highest | Full system access |
| ENTREPRISE_ADMIN | 2 | Manage company, team, products, documents |
| EMETTEUR | 3 | End-user in company, create/manage documents |
| ENTREPRISE_VIEWER | 4 | Read-only access to company data |
| CLIENT | 5 - Lowest | Limited access (view own orders, sign documents) |

---

## Common Angular HTTP Patterns

### Typical Service Structure

```typescript
service.getAll(): Observable<T[]>
service.getById(id: number): Observable<T>
service.create(dto: T): Observable<T>
service.update(id: number, dto: T): Observable<T>
service.delete(id: number): Observable<void>
service.customAction(id: number, data?: any): Observable<T>
```

### Common Headers (Angular)

```typescript
// JWT Token from login
headers = {
  'Authorization': 'Bearer eyJhbGc...',
  'Content-Type': 'application/json'
}

// For public endpoints (client signing)
// No headers needed
```

---

## Document Generation Workflow States

### Status Flow for Each Document Type

**Devis (Quote)**
```
DRAFT → SENT → ACCEPTED/REJECTED/EXPIRED
```

**Bon de Commande (PO)**
```
PENDING → SENT → (CLIENT SIGNS) → CONFIRMED → CONVERTED
```

**Commande (Order)**
```
PENDING → CONFIRMED → IN_PROGRESS → DELIVERED/CANCELLED
```

**Bon de Livraison (Delivery Note)**
```
DRAFT → SENT → DELIVERED → (DISPUTE?) → RESOLVED
```

**Facture (Invoice)**
```
DRAFT → SENT → SIGNED → PAID/PARTIALLY_PAID/UNPAID
```

---

## API Response Format

### Success Response (2xx)
```json
{
  "id": 1,
  "field1": "value1",
  "field2": 123,
  "timestamp": "2025-01-15T10:30:00"
}
```

### Error Response (4xx/5xx)
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Vous n'avez pas les droits pour cette action",
  "path": "/api/bon-commandes/5"
}
```

---

## Quick Integration Checklist

- [ ] Store JWT token after login
- [ ] Include token in Authorization header for all requests
- [ ] Handle 401/403 errors (redirect to login/unauthorized page)
- [ ] Implement role-based UI visibility
- [ ] Use conversion endpoints for document workflows
- [ ] Verify all API calls match your Angular service definitions
- [ ] Test CORS (requests from localhost:4200)
- [ ] Handle public endpoints (client signing) without auth
- [ ] Monitor role permissions for write operations

---

## Common Issues & Solutions

### Issue: 403 Forbidden on write operations
**Solution:** Verify user has ENTREPRISE_ADMIN, SUPER_ADMIN, or EMETTEUR role (not VIEWER or CLIENT)

### Issue: 404 Not Found
**Solution:** Check resource exists and belongs to user's company

### Issue: 401 Unauthorized
**Solution:** Ensure JWT token is in Authorization header and not expired

### Issue: CORS error
**Solution:** Ensure requests come from `http://localhost:4200`

### Issue: Document conversion fails
**Solution:** Verify source document exists, has correct status, and all required fields are filled

---

## API Documentation Links

For full details on specific endpoints, see:
- `BACKEND_API_ENDPOINTS.md` - Complete endpoint mapping
- `BON_COMMANDES_COMMANDES_DETAILED.md` - Detailed bon-commandes & commandes documentation

