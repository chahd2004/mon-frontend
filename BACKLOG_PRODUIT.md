# Backlog de Produit - Plateforme de Facturation

## Épopée 1 : Authentification et Gestion des Utilisateurs

| ID | Tâche | User Story | Estimation (h) |
|--------|----------|----------|--------|
| 1 | Authentification | En tant qu'utilisateur, je veux me connecter avec mon email et mot de passe pour accéder à ma session | 8 |
| 2 | Gestion des gestionnaires RH | En tant qu'administrateur, je veux accepter ou refuser un gestionnaire RH pour gérer l'accès des utilisateurs | 8 |
| 3 | Gestion des utilisateurs | En tant que super admin, je veux consulter et gérer la liste de tous les utilisateurs du système | 8 |
| 4 | Profil utilisateur | En tant qu'utilisateur, je veux consulter et modifier mon profil personnel | 5 |
| 5 | Changement de mot de passe | En tant qu'utilisateur, je veux pouvoir changer mon mot de passe pour sécuriser mon compte | 4 |

## Épopée 2 : Gestion des Demandes d'Inscription

| ID | Tâche | User Story | Estimation (h) |
|--------|----------|----------|--------|
| 6 | Soumettre demande création entreprise | En tant qu'administrateur entreprise, je veux soumettre une demande de création d'entreprise pour obtenir l'accès au système | 5 |
| 7 | Consultation des demandes d'inscription | En tant que super admin, je veux consulter la liste des demandes d'inscription en attente de validation | 5 |
| 8 | Approuver une demande d'inscription | En tant que super admin, je veux approuver une demande d'inscription et envoyer un mail de confirmation à l'administrateur | 6 |
| 9 | Rejeter une demande d'inscription | En tant que super admin, je veux rejeter une demande d'inscription avec un motif et envoyer un mail de rejet à l'administrateur | 6 |

## Épopée 3 : Gestion des Devis

| ID | Tâche | User Story | Estimation (h) |
|--------|----------|----------|--------|
| 10 | Création de devis | En tant qu'administrateur entreprise, je veux créer un devis pour un client avec des produits et services | 8 |
| 11 | Modification de devis | En tant qu'administrateur entreprise, je veux modifier un devis avant son envoi au client | 5 |
| 12 | Envoi de devis au client | En tant qu'administrateur entreprise, je veux envoyer un devis au client pour obtenir son acceptation ou rejet | 6 |
| 13 | Acceptation du devis par le client | En tant que client, je veux accepter un devis reçu par email et confirmer la commande | 5 |
| 14 | Rejet du devis par le client | En tant que client, je veux rejeter un devis reçu et notifier l'entreprise | 5 |

## Épopée 4 : Gestion des Commandes et Bons de Livraison

| ID | Tâche | User Story | Estimation (h) |
|--------|----------|----------|--------|
| 15 | Création de bon de commande | En tant qu'administrateur entreprise, je veux créer un bon de commande pour transformer un devis accepté | 6 |
| 16 | Gestion des commandes | En tant qu'administrateur entreprise, je veux consulter et modifier mes commandes en attente de traitement | 6 |
| 17 | Envoi de demande signature BC & BL | En tant qu'administrateur entreprise, je veux envoyer une demande de signature du bon de commande et bon de livraison au client | 7 |
| 18 | Signature de BC & BL par le client | En tant que client, je veux signer le bon de commande et bon de livraison reçus par email sans authentification | 6 |
| 19 | Création de bon de livraison | En tant qu'administrateur entreprise, je veux créer un bon de livraison associé à une commande | 6 |

## Épopée 5 : Gestion des Factures et Avoirs

| ID | Tâche | User Story | Estimation (h) |
|--------|----------|----------|--------|
| 20 | Signature numérique des factures | En tant qu'administrateur entreprise, je veux signer numériquement (XAdES) mes factures pour les rendre légales | 10 |
| 21 | Gestion des factures | En tant qu'administrateur entreprise, je veux créer, modifier et consulter mes factures | 8 |
| 22 | Création d'avoirs | En tant qu'administrateur entreprise, je veux créer des avoirs (factures d'avoir) pour les retours ou annulations | 6 |
| 23 | Gestion des avoirs | En tant qu'administrateur entreprise, je veux gérer les avoirs existants et suivre les crédits | 5 |

## Épopée 6 : Gestion des Ressources et Consultation

| ID | Tâche | User Story | Estimation (h) |
|--------|----------|----------|--------|
| 24 | Gestion des clients | En tant qu'administrateur entreprise, je veux créer, modifier et consulter la liste de mes clients | 8 |
| 25 | Gestion des produits | En tant qu'administrateur entreprise, je veux gérer mon catalogue de produits avec prix et descriptions | 8 |

---

## Planning des Sprints (Basé sur le Diagramme de Use Case)

### Sprint 1 - "Authentification & Demandes" (Authentication & Requests)
**Objectif** : Mettre en place l'authentification et gérer les demandes d'inscription
**Use Cases** : S'authentifier, Gérer les Demandes d'inscription, Soumettre demande création
- US 1 : Authentification
- US 2 : Gestion des gestionnaires RH
- US 3 : Gestion des utilisateurs
- US 4 : Profil utilisateur
- US 5 : Changement de mot de passe
- US 6 : Soumettre demande création entreprise
- US 7 : Consultation des demandes d'inscription
- US 8 : Approuver une demande d'inscription (+ mail approbation)
- US 9 : Rejeter une demande d'inscription (+ mail rejet & confirmation)
**Total : 9 user stories | ~61 heures**

---

### Sprint 2 - "Ressources & Dashboard" (Resources & Dashboard)
**Objectif** : Gérer les ressources et mettre en place les tableaux de bord
**Use Cases** : Gérer les Clients et Produits, Gérer les Paramètres, Consulter Tableau de bord, Consulter Statistiques
- US 24 : Gestion des clients
- US 25 : Gestion des produits
- US 26 : Gestion des paramètres entreprise
- US 27 : Consultation du tableau de bord global
- US 28 : Consultation des statistiques entreprise
- US 29 : Consultation des documents
**Total : 6 user stories | ~34 heures**

---

### Sprint 3 - "Signature Numérique" (Digital Signature)
**Objectif** : Implémenter la signature numérique XAdES pour les factures
**Use Cases** : Signer numériquement - XAdES
- US 20 : Signature numérique des factures (XAdES)
**Total : 1 user story | ~10 heures**

---

### Sprint 4 - "Cycle de Vie : Devis, Commandes & Facturation" (Full Lifecycle: Quotation, Orders & Invoicing)
**Objectif** : Gérer le cycle complet de la facturation (devis à facturation)
**Use Cases** : Gérer les Devis, Accepter/Rejeter Devis, Gérer les Commandes et BL, Gérer les Factures et Avoirs
- US 10 : Création de devis
- US 11 : Modification de devis
- US 12 : Envoi de devis au client (+ mail demande acceptation)
- US 13 : Acceptation du devis par le client
- US 14 : Rejet du devis par le client
- US 15 : Création de bon de commande
- US 16 : Gestion des commandes
- US 17 : Envoi de demande signature BC & BL (+ mail demande signature)
- US 18 : Signature de BC & BL par le client
- US 19 : Création de bon de livraison
- US 21 : Gestion des factures
- US 22 : Création d'avoirs
- US 23 : Gestion des avoirs
**Total : 13 user stories | ~119 heures**

---

## Résumé
| Sprint | Nom | Stories | Heures |
|--------|----------|---------|---------|
| 1 | Authentification & Demandes | 9 | 61h |
| 2 | Ressources Principales | 2 | 16h |
| 3 | Dashboard & Paramètres | 4 | 18h |
| 4 | Cycle de Vie Complet (Devis, Commandes, Facturation & Signature) | 14 | 129h |

**Total : 29 user stories | 224 heures**
