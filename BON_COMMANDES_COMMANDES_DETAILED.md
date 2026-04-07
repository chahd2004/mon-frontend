# Bon-Commandes & Commandes Endpoints - Detailed Analysis

## Overview

The Java backend has two separate but related controllers managing purchase orders and orders:
- **BonCommandeController** (`/api/bon-commandes`) - Purchase Order (PO)
- **CommandeController** (`/api/commandes`) - Order

These are part of the document generation workflow where:
- A **Devis** (Quote) can be converted to a **Bon de Commande** (PO)
- A **Bon de Commande** can be converted to a **Commande** (Order)
- A **Commande** leads to either **Bon de Livraison** (Delivery Note) or directly to **Facture** (Invoice)

---

## 1. BON DE COMMANDES (`/api/bon-commandes`)

**Base Path:** `/api/bon-commandes`  
**Controller:** `BonCommandeController`  
**CORS Origin:** `http://localhost:4200`

### Role-Based Access
- **Read Access:** SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER
- **Write Access:** SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR (NOT ENTREPRISE_VIEWER)

### Endpoints

#### 1.1 GET All Bon de Commandes
```
GET /api/bon-commandes
```
**Authorization:** SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER  
**Description:** List all POs based on user role
- **SUPER_ADMIN:** Returns ALL POs in system
- **ENTREPRISE_VIEWER:** Returns POs for their company
- **EMETTEUR/ENTREPRISE_ADMIN:** Returns POs for their company

**Response:**
```json
[
  {
    "id": 1,
    "statut": "PENDING",
    "vendeurId": 5,
    "acheteurId": 3,
    "montant": 5000.00,
    "dateCreation": "2025-01-15T10:30:00",
    ...
  }
]
```

---

#### 1.2 GET Bon de Commande by ID
```
GET /api/bon-commandes/{id}
```
**Authorization:** SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER, CLIENT  
**Path Parameters:**
- `id` (Long) - PO ID

**Response:**
```json
{
  "id": 1,
  "number": "BC-2025-001",
  "statut": "PENDING",
  "vendeurId": 5,
  "acheteurId": 3,
  "montant": 5000.00,
  "dateCreation": "2025-01-15T10:30:00",
  "devisAssocieId": 10,
  "items": [
    {
      "produitId": 1,
      "quantite": 5,
      "prixUnitaire": 1000.00
    }
  ]
}
```

---

#### 1.3 GET User's Bon de Commandes
```
GET /api/bon-commandes/mes-bons-commandes
```
**Authorization:** ANY AUTHENTICATED USER  
**Description:** Returns POs relevant to the authenticated user
- **CLIENT:** Their purchase POs
- **VENDOR:** Their sales POs
- **SUPER_ADMIN:** All POs

**Response:** Array of `BonCommandeResponseDTO`

---

#### 1.4 CREATE Bon de Commande
```
POST /api/bon-commandes
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Request Body:**
```json
{
  "vendeurId": 5,
  "acheteurId": 3,
  "devisAssocieId": 10,
  "montant": 5000.00,
  "dateExpiration": "2025-02-15",
  "items": [
    {
      "produitId": 1,
      "quantite": 5,
      "prixUnitaire": 1000.00
    }
  ],
  "notes": "Special conditions..."
}
```

**Response:** `BonCommandeResponseDTO` (HTTP 201)

**Behavior:**
- User role must be ENTREPRISE_ADMIN or EMETTEUR (auto-filled with their company)
- SUPER_ADMIN can specify vendeurId
- Validates related entities exist

---

#### 1.5 UPDATE Bon de Commande
```
PUT /api/bon-commandes/{id}
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Path Parameters:**
- `id` (Long) - PO ID

**Request Body:** Same as CREATE

**Response:** `BonCommandeResponseDTO` (HTTP 200)

**Ownership Check:**
- Non-SUPER_ADMIN users can only update POs they created/own

---

#### 1.6 DELETE Bon de Commande
```
DELETE /api/bon-commandes/{id}
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Path Parameters:**
- `id` (Long) - PO ID

**Response:** HTTP 204 No Content

**Ownership Check:**
- Non-SUPER_ADMIN users can only delete POs they own

---

#### 1.7 SEND Bon de Commande
```
PUT /api/bon-commandes/{id}/envoyer
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Path Parameters:**
- `id` (Long) - PO ID

**Description:** Send the PO to the buyer (changes status to SENT)

**Response:** `BonCommandeResponseDTO` (HTTP 200)

---

#### 1.8 CLIENT SIGNATURE (No Auth Required)
```
PUT /api/bon-commandes/{id}/signer-client
```
**Authorization:** NONE (Public - uses token in URL)  
**Path Parameters:**
- `id` (Long) - PO ID

**Description:** Client signs the PO via URL link (no JWT required)

**Response:** `BonCommandeResponseDTO` (HTTP 200)

---

#### 1.9 CONFIRM Bon de Commande
```
PUT /api/bon-commandes/{id}/confirmer
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Path Parameters:**
- `id` (Long) - PO ID

**Description:** Confirm the PO (changes status to CONFIRMED)

**Response:** `BonCommandeResponseDTO` (HTTP 200)

---

## 2. COMMANDES (`/api/commandes`)

**Base Path:** `/api/commandes`  
**Controller:** `CommandeController`  
**CORS Origin:** `http://localhost:4200`

### Role-Based Access
- **Read Access:** SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER
- **Write Access:** SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR (NOT ENTREPRISE_VIEWER)

### Endpoints

#### 2.1 GET All Commandes
```
GET /api/commandes
```
**Authorization:** SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER  
**Description:** List all Orders based on user role
- **SUPER_ADMIN:** Returns ALL Orders
- **ENTREPRISE_VIEWER:** Returns Orders for their company
- **EMETTEUR/ENTREPRISE_ADMIN:** Returns Orders for their company

**Response:**
```json
[
  {
    "id": 1,
    "statut": "PENDING",
    "vendeurId": 5,
    "acheteurId": 3,
    "bonCommandeAssocieId": 1,
    "montant": 5000.00,
    "dateCreation": "2025-01-15T10:30:00",
    ...
  }
]
```

---

#### 2.2 GET Commande by ID
```
GET /api/commandes/{id}
```
**Authorization:** SUPER_ADMIN, ENTREPRISE_ADMIN, EMETTEUR, ENTREPRISE_VIEWER  
**Path Parameters:**
- `id` (Long) - Order ID

**Response:** `CommandeResponseDTO` (JSON object)

---

#### 2.3 GET User's Commandes
```
GET /api/commandes/mes-commandes
```
**Authorization:** ANY AUTHENTICATED USER  
**Description:** Returns Orders relevant to the authenticated user

**Response:** Array of `CommandeResponseDTO`

---

#### 2.4 CREATE Commande
```
POST /api/commandes
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Request Body:**
```json
{
  "vendeurId": 5,
  "acheteurId": 3,
  "bonCommandeAssocieId": 1,
  "montant": 5000.00,
  "items": [
    {
      "produitId": 1,
      "quantite": 5,
      "prixUnitaire": 1000.00
    }
  ],
  "notes": "Order for..."
}
```

**Response:** `CommandeResponseDTO` (HTTP 201)

**Behavior:**
- Similar to Bon de Commande creation
- Links to associated PO if provided
- Auto-fills user's company for non-SUPER_ADMIN

---

#### 2.5 UPDATE Commande
```
PUT /api/commandes/{id}
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Path Parameters:**
- `id` (Long) - Order ID

**Request Body:** Same as CREATE

**Response:** `CommandeResponseDTO` (HTTP 200)

**Ownership Check:**
- Non-SUPER_ADMIN users can only update Orders they own

---

#### 2.6 DELETE Commande
```
DELETE /api/commandes/{id}
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Path Parameters:**
- `id` (Long) - Order ID

**Response:** HTTP 204 No Content

---

#### 2.7 CONFIRM Commande
```
PUT /api/commandes/{id}/confirmer
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Path Parameters:**
- `id` (Long) - Order ID

**Description:** Confirm the Order (changes status to CONFIRMED)

**Response:** `CommandeResponseDTO` (HTTP 200)

---

#### 2.8 START Commande
```
PUT /api/commandes/{id}/demarrer
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Path Parameters:**
- `id` (Long) - Order ID

**Description:** Start processing the Order (changes status to IN_PROGRESS)

**Response:** `CommandeResponseDTO` (HTTP 200)

---

#### 2.9 MARK AS DELIVERED Commande
```
PUT /api/commandes/{id}/livrer
```
**Authorization:** ENTREPRISE_ADMIN, SUPER_ADMIN, EMETTEUR  
**Path Parameters:**
- `id` (Long) - Order ID

**Description:** Mark Order as delivered (changes status to DELIVERED)

**Response:** `CommandeResponseDTO` (HTTP 200)

---

## Comparison: Bon-Commandes vs Commandes

| Feature | Bon de Commande (PO) | Commande (Order) |
|---------|---------------------|------------------|
| **Endpoint** | `/api/bon-commandes` | `/api/commandes` |
| **Purpose** | Initial purchase order | Formal order/agreement |
| **Workflow Before** | Created from Devis (Quote) | Created from Bon de Commande |
| **Workflow After** | Converted to Commande | Converted to Bon de Livraison or Facture |
| **Requires Client Signature** | Yes | No |
| **State Actions** | envoyer, confirmer, signer-client | confirmer, demarrer, livrer |
| **Associated Entity** | `devisAssocieId` | `bonCommandeAssocieId` |

---

## Processing Workflow

### Complete Purchasing Flow

```
1. START: Create Devis (Quote)
         POST /api/devis

2. Convert to PO: 
         POST /api/conversions/devis/{id}/vers-bon-commande
         → Creates Bon de Commande

3. Send & Sign PO:
         PUT /api/bon-commandes/{id}/envoyer
         PUT /api/bon-commandes/{id}/signer-client (public link to client)
         PUT /api/bon-commandes/{id}/confirmer

4. Create Order:
         POST /api/conversions/bon-commande/{id}/vers-commande
         → Creates Commande

5. Process Order:
         PUT /api/commandes/{id}/confirmer
         PUT /api/commandes/{id}/demarrer

6. Deliver or Invoice:
         Option A: Create Delivery Note first
                   POST /api/conversions/commande/{id}/vers-bon-livraison
                   → Then: POST /api/conversions/bon-livraison/{id}/vers-facture

         Option B: Create Invoice directly
                   POST /api/conversions/commande/{id}/vers-facture

7. END: Invoice created
         Facture ready for payment/tracking
```

---

## Frontend Integration Examples

### Angular Service Calls

```typescript
// Get all bon-commandes
this.http.get('/api/bon-commandes')

// Create bon-commande from devis
this.http.post('/api/conversions/devis/10/vers-bon-commande', {
  notes: "Created from quote",
  additionalItems: []
})

// Send bn-commande to client
this.http.put(`/api/bon-commandes/1/envoyer`, {})

// Get client signature link
// Share link: /api/bon-commandes/1/signer-client (no auth needed)

// Create commande from bon-commande
this.http.post('/api/conversions/bon-commande/1/vers-commande', {
  notes: "Order confirmed"
})

// Update commande status
this.http.put('/api/commandes/1/demarrer', {})
```

---

## Error Handling

### Common Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success (GET/PUT) | Retrieved or updated successfully |
| 201 | Created (POST) | New resource created |
| 204 | No Content (DELETE) | Successfully deleted |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | No JWT token provided |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Invalid state transition |

### Example Error Response

```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Vous n'êtes pas le vendeur de ce bon de commande",
  "path": "/api/bon-commandes/5"
}
```

---

## Key Implementation Notes

1. **Ownership Validation:**
   - All write operations verify the user owns the resource
   - Only SUPER_ADMIN can bypass this check

2. **Auto-Fill Company:**
   - Non-SUPER_ADMIN users have their `vendeurId` auto-filled from their company

3. **State Machine:**
   - Each document type follows a specific status workflow
   - Invalid transitions are rejected (e.g., can't delete a confirmed PO)

4. **Related Entities:**
   - Bon de Commande tracks associated Devis (`devisAssocieId`)
   - Commande tracks associated Bon de Commande (`bonCommandeAssocieId`)

5. **CORS Settings:**
   - Requests from `http://localhost:4200` are allowed
   - Credentials (cookies/JWT) are included in cross-domain requests

