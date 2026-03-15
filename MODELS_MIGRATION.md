# 📋 GUIDE DE MIGRATION - Nettoyage des anciens modèles

## ✅ État actuel (Après restructuration)

### Nouveaux fichiers (Garder ✅)
```
src/app/models/
├── enums.ts ✅ (MAIN - Énums centralisés)
├── auth.models.ts ✅ (Login/Register/AuthResponse)
├── user.models.ts ✅ (UserDTO, CRUD)
├── demande.models.ts ✅ (Demandes)
├── collaborateur.models.ts ✅ (Collaborateurs)
├── client.models.ts ✅ (Clients)
├── produit.models.ts ✅ (Produits)  
├── facture.models.ts ✅ (Factures)
├── emetteur.models.ts ✅ (Émetteurs)
├── dashboard.models.ts ✅ (KPI/Stats)
├── index.ts ✅ (Central exports)
└── README.md ✅ (Documentation)
```

### Anciens fichiers (À archiver/supprimer ❌)
```
src/app/models/
├── role.model.ts ❌ → remplacé par enums.ts
├── user.model.ts ❌ → remplacé par user.models.ts + auth.models.ts
├── client.model.ts ❌ → remplacé par client.models.ts (note: .models avec 's')
├── product.model.ts ❌ → remplacé par produit.models.ts
├── emetteur.model.ts ❌ → remplacé par emetteur.models.ts
├── facture.model.ts ❌ → remplacé par facture.models.ts
├── dashboard.model.ts ❌ → remplacé par dashboard.models.ts
├── devise.model.ts ❌ → À vérifier si nécessaire
└── parametres.model.ts ❌ → À vérifier si nécessaire
```

## 🔍 Vérifier l'utilisation avant suppression

### 1. Vérifier les anciens imports
```bash
# Chercher les imports des anciens fichiers
grep -r "from.*\.model'" src/app/ | grep -v ".models'"
grep -r "role\.model\|user\.model\|client\.model\|product\.model" src/app/
```

### 2. Fichiers déjà migrés ✅
- ✅ auth.service.ts - Utilise maintenant auth.models + enums
- ✅ auth.guard.ts - Utilise maintenant enums
- ✅ accueil.component.ts - Utilise maintenant enums

### 3. Services à vérifier
```
src/app/core/services/
├── user.service.ts → Vérifie imports
├── client.service.ts → Vérifie imports
├── produit.service.ts → Vérifie imports
├── facture.service.ts → Vérifie imports
├── emetteur.service.ts → Vérifie imports
├── demande.service.ts → Vérifie imports
├── dashboard.service.ts → Vérifie imports
└── collaborateur.service.ts → Vérifie imports
```

## 🧹 Plan de nettoyage (Phase optionnelle)

### Option 1: Suppression directe (Si tous les imports mis à jour)
```bash
# Supprimer les anciens modèles
rm src/app/models/role.model.ts
rm src/app/models/user.model.ts
rm src/app/models/client.model.ts
rm src/app/models/product.model.ts
rm src/app/models/emetteur.model.ts
rm src/app/models/facture.model.ts
rm src/app/models/dashboard.model.ts

# Optionnel: Vérifier devise.model.ts et parametres.model.ts
rm src/app/models/devise.model.ts
rm src/app/models/parametres.model.ts
```

### Option 2: Archivage (Plus sûr)
```bash
# Créer un dossier d'archive
mkdir -p src/app/models/_archived

# Archiver les anciens modèles
mv src/app/models/role.model.ts src/app/models/_archived/
mv src/app/models/user.model.ts src/app/models/_archived/
# ... etc
```

### Option 3: Git branching (Pour la production)
```bash
# Créer une branche pour la refactorisation
git checkout -b feat/models-restructure

# Compléter la migration
git add .
git commit -m "chore(models): restructure to centralized models"

# Merger après validation
git checkout main
git merge feat/models-restructure
```

## 📝 Checklist avant nettoyage

- [ ] Tous les fichiers .ts migrés vers les nouveaux modèles
- [ ] Tous les imports mis à jour (role.model → enums.ts)
- [ ] Tous les imports mis à jour (user.model → user.models + auth.models)
- [ ] `npm run build` passe sans erreurs
- [ ] `npm run test` passe si disponible
- [ ] `ng serve` compile sans problèmes
- [ ] Aucun warning d'import dans la console VS Code
- [ ] Validation finale des services

## 🔗 Références

Voir [src/app/models/README.md](./README.md) pour la documentation complète des nouveaux modèles.

## ❓ Questions fréquentes

**Q: Dois-je supprimer les anciens fichiers immédiatement?**
R: Non, vous pouvez les archiver d'abord. Supprimez-les une fois que vous êtes sûr que tous les imports sont migrés.

**Q: Et si j'oublie de migrer un import?**
R: La compilation TypeScript (`npm run build`) va échouer avec une erreur d'import. C'est bon – ça vous le fera savoir!

**Q: Que faire des modèles que je ne connais pas (devise.model.ts)?**
R: Cherchez sur le projet pour voir si c'est importé. Si ce n'est pas utilisé, vous pouvez l'archiver.

**Q: Comment tester après la refactorisation?**
R: 
```bash
npm run build        # Compilation complète
npm run start       # Dev server
ng serve --open     # Accès local au site
```

