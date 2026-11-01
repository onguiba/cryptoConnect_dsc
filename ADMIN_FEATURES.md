# 🔐 FONCTIONNALITÉS ADMINISTRATEUR

## ✅ Ce qui a été ajouté

Un **système d'administration complet** pour gérer toute la plateforme CryptoConnect.

---

## 👥 Système de rôles à 3 niveaux

### 1. **user** (Utilisateur standard)
- Accès aux fonctionnalités client
- Création de demandes
- Soumission KYC
- Gestion de son profil

### 2. **admin** (Administrateur)
- ✅ Toutes les fonctionnalités utilisateur
- ✅ Accès au panneau d'administration
- ✅ Voir le dashboard et statistiques
- ✅ Gérer toutes les demandes clients
- ✅ Approuver/rejeter les KYC
- ✅ Gérer les contenus (créer, modifier, supprimer)
- ✅ Gérer les services
- ✅ Voir et modifier les utilisateurs
- ✅ Changer le statut des comptes (actif, suspendu, supprimé)
- ❌ **Ne peut PAS** créer d'autres administrateurs

### 3. **super_admin** (Super administrateur)
- ✅ Tous les droits admin
- ✅ **Peut créer/modifier/supprimer des administrateurs**
- ✅ Gestion complète de la plateforme
- ✅ Seul rôle pouvant promouvoir un user en admin

---

## 📊 Dashboard administrateur

### Statistiques en temps réel

```
Utilisateurs
├── Total : 150
├── Actifs : 142
└── Nouveaux cette semaine : 12

Vérifications KYC
├── En attente : 8
├── Vérifiées : 95
└── Rejetées : 3

Demandes clients
├── En attente : 15
├── En cours : 7
├── Complétées : 234
└── Récentes (7 jours) : 22

Contenus
└── Publiés : 45

Services
└── Actifs : 4
```

**Endpoint :** `GET /api/admin/dashboard/stats`

---

## 👥 Gestion des utilisateurs

### Fonctionnalités

✅ **Liste paginée** avec recherche et filtres
✅ **Détails complets** (profil + KYC + historique demandes)
✅ **Modification du statut** (actif, suspendu, supprimé)
✅ **Modification du rôle** (user, admin, super_admin)
✅ **Recherche** par nom ou email
✅ **Filtres** par rôle et statut

### Cas d'usage

**Suspendre un compte :**
```http
PATCH /api/admin/users/:userId/status
{ "accountStatus": "suspended" }
```

**Promouvoir en admin :**
```http
PATCH /api/admin/users/:userId/role
{ "role": "admin" }
```
*Nécessite un token super_admin*

---

## 📋 Gestion des demandes clients

### Fonctionnalités

✅ **Liste paginée** de toutes les demandes
✅ **Filtres** (statut, priorité, type)
✅ **Détails** avec profil utilisateur
✅ **Assignation** à un admin
✅ **Mise à jour** (statut, réponse, priorité)
✅ **Suivi** des demandes traitées

### Workflow typique

```
1. Voir les demandes en attente
   GET /api/admin/requests?status=pending

2. S'assigner une demande
   POST /api/admin/requests/:id/assign

3. Traiter et répondre
   PATCH /api/admin/requests/:id
   {
     "status": "in_progress",
     "responseMessage": "Nous traitons votre demande..."
   }

4. Marquer comme complétée
   PATCH /api/admin/requests/:id
   {
     "status": "completed",
     "responseMessage": "Votre demande a été traitée avec succès."
   }
```

### Statuts disponibles

- `pending` - En attente
- `in_progress` - En cours de traitement
- `completed` - Complétée
- `cancelled` - Annulée

### Priorités

- `low` - Basse
- `medium` - Moyenne
- `high` - Haute
- `urgent` - Urgente

---

## 🆔 Gestion des vérifications KYC

### Fonctionnalités

✅ **Liste** des vérifications (toutes ou par statut)
✅ **Détails** avec documents soumis
✅ **Approbation** avec notes
✅ **Rejet** avec raison obligatoire
✅ **Historique** des vérifications par utilisateur
✅ **Mise à jour automatique** du statut utilisateur

### Workflow de vérification

```
1. Lister les KYC en attente
   GET /api/admin/kyc?status=pending

2. Examiner les documents
   GET /api/admin/kyc/:id

3a. Approuver si conforme
    POST /api/admin/kyc/:id/approve
    {
      "notes": "Documents valides"
    }

3b. Rejeter si problème
    POST /api/admin/kyc/:id/reject
    {
      "rejectionReason": "Documents illisibles",
      "notes": "Demander de nouvelles photos"
    }
```

### Effets automatiques

**Approbation :**
- Statut KYC → `verified`
- Statut utilisateur → `verified`
- Date de vérification enregistrée
- Utilisateur peut accéder aux services nécessitant KYC

**Rejet :**
- Statut KYC → `rejected`
- Statut utilisateur → `rejected`
- Raison visible pour l'utilisateur
- Utilisateur peut soumettre de nouveaux documents

---

## 📚 Gestion des contenus éducatifs

### Fonctionnalités CRUD complètes

✅ **Créer** de nouveaux articles/tutoriels
✅ **Modifier** le contenu existant
✅ **Supprimer** les contenus obsolètes
✅ **Publier/dépublier** (brouillons)
✅ **Filtrer** (publiés, brouillons)
✅ **Association** à un auteur

### Exemple de création

```http
POST /api/admin/content

{
  "title": "Guide du DeFi pour débutants",
  "slug": "guide-defi-debutants",
  "contentType": "article",
  "difficultyLevel": "beginner",
  "difficultyLabel": "Débutant",
  "excerpt": "Découvrez la finance décentralisée...",
  "body": "# Introduction\n\nLa DeFi...",
  "coverImageUrl": "assets/images/defi.jpg",
  "readingTime": "8 min",
  "tags": ["defi", "débutant", "blockchain"],
  "summaryPoints": [
    "Qu'est-ce que la DeFi",
    "Avantages et risques",
    "Comment commencer"
  ],
  "isPublished": true
}
```

---

## 🛠️ Gestion des services

### Fonctionnalités

✅ **Créer** de nouveaux services
✅ **Modifier** les services existants
✅ **Supprimer** les services obsolètes
✅ **Activer/désactiver** les services
✅ **Réorganiser** l'ordre d'affichage

### Structure d'un service

```javascript
{
  slug: "mon-service",
  name: "Nom du service",
  summary: "Description courte",
  description: "Description détaillée...",
  benefits: ["Avantage 1", "Avantage 2"],
  accessSteps: ["Étape 1", "Étape 2"],
  icon: "icon-name",
  color: "#3B82F6",
  requiresIdentityVerification: true,
  isActive: true,
  displayOrder: 1
}
```

---

## 🔐 Sécurité & Protection

### Middlewares de protection

1. **protect** - Vérifie le JWT valide
2. **requireAdmin** - Vérifie rôle admin ou super_admin
3. **requireSuperAdmin** - Vérifie rôle super_admin uniquement

### Routes protégées

Toutes les routes `/api/admin/*` nécessitent :
- ✅ Token JWT valide
- ✅ Rôle `admin` ou `super_admin`

Certaines routes nécessitent `super_admin` :
- ❌ Modifier le rôle d'un utilisateur
- ❌ Créer d'autres administrateurs

### Codes d'erreur

- `401` - Non authentifié (pas de token)
- `403` - Interdit (pas les droits suffisants)
- `404` - Ressource introuvable
- `500` - Erreur serveur

---

## 📊 Endpoints API Admin

### Dashboard
```
GET /api/admin/dashboard/stats
```

### Utilisateurs
```
GET    /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id/status
PATCH  /api/admin/users/:id/role (super_admin)
```

### Demandes
```
GET    /api/admin/requests
GET    /api/admin/requests/:id
PATCH  /api/admin/requests/:id
POST   /api/admin/requests/:id/assign
```

### KYC
```
GET    /api/admin/kyc
GET    /api/admin/kyc/:id
POST   /api/admin/kyc/:id/approve
POST   /api/admin/kyc/:id/reject
```

### Contenus
```
GET    /api/admin/content
POST   /api/admin/content
PATCH  /api/admin/content/:id
DELETE /api/admin/content/:id
```

### Services
```
GET    /api/admin/services
POST   /api/admin/services
PATCH  /api/admin/services/:id
DELETE /api/admin/services/:id
```

---

## 🎯 Compte administrateur par défaut

Après avoir exécuté `npm run seed`, un compte super administrateur est créé :

```
Email    : admin@cryptoconnect.app
Password : Admin@123456
Rôle     : super_admin
```

**⚠️ IMPORTANT : Changez ce mot de passe immédiatement en production !**

---

## 📖 Documentation complète

Pour plus de détails, consultez :
- **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - Guide complet de l'administration
- **[README.md](README.md)** - Documentation générale
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture technique

---

## 🚀 Prochaines fonctionnalités admin

### Version 2.1 (À venir)

- [ ] Interface web d'administration (dashboard UI)
- [ ] Notifications par email pour les admins
- [ ] Logs d'audit des actions admin
- [ ] Export des données (CSV, Excel)
- [ ] Rapports et analytics avancés
- [ ] Chat en temps réel avec les clients
- [ ] Gestion des rôles personnalisés
- [ ] Permissions granulaires

---

**Votre plateforme dispose maintenant d'un système d'administration professionnel complet ! 🎉**
