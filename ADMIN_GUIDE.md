# 🔐 GUIDE ADMINISTRATEUR - CryptoConnect Pro

## 📋 Table des matières

- [Accès administrateur](#accès-administrateur)
- [Compte super administrateur](#compte-super-administrateur)
- [Dashboard](#dashboard)
- [Gestion des utilisateurs](#gestion-des-utilisateurs)
- [Gestion des demandes](#gestion-des-demandes)
- [Gestion KYC](#gestion-kyc)
- [Gestion des contenus](#gestion-des-contenus)
- [Gestion des services](#gestion-des-services)
- [API Admin](#api-admin)

---

## 🔑 Accès administrateur

### Rôles disponibles

CryptoConnect dispose de 3 niveaux de rôles :

1. **user** (Utilisateur standard)
   - Accès aux fonctionnalités client
   - Peut créer des demandes
   - Soumettre des vérifications KYC

2. **admin** (Administrateur)
   - Toutes les fonctionnalités utilisateur
   - Accès au panneau d'administration
   - Peut gérer les demandes, KYC, contenus, services
   - Peut modifier le statut des utilisateurs
   - **Ne peut PAS** créer d'autres administrateurs

3. **super_admin** (Super administrateur)
   - Tous les droits admin
   - Peut créer/modifier/supprimer des administrateurs
   - Gestion complète de la plateforme

---

## 👤 Compte super administrateur

### Par défaut (après seed)

```
Email    : admin@cryptoconnect.app
Password : Admin@123456
Rôle     : super_admin
```

**⚠️ IMPORTANT : Changez ce mot de passe en production !**

### Créer un nouvel administrateur

1. Se connecter en tant que super_admin
2. Utiliser l'endpoint :
   ```http
   PATCH /api/admin/users/:userId/role
   Authorization: Bearer <super_admin_token>
   
   {
     "role": "admin"
   }
   ```

---

## 📊 Dashboard

### Statistiques globales

```http
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

**Réponse :**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 150,
      "active": 142,
      "newThisWeek": 12
    },
    "kyc": {
      "pending": 8,
      "verified": 95,
      "rejected": 3
    },
    "requests": {
      "pending": 15,
      "inProgress": 7,
      "completed": 234,
      "recentRequests": 22
    },
    "content": {
      "total": 45
    },
    "services": {
      "total": 4
    }
  }
}
```

---

## 👥 Gestion des utilisateurs

### Lister tous les utilisateurs

```http
GET /api/admin/users?page=1&limit=20&search=kouassi&role=user&status=active
Authorization: Bearer <admin_token>
```

**Paramètres query :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Résultats par page (défaut: 20)
- `search` (optionnel) : Recherche par nom ou email
- `role` (optionnel) : Filtrer par rôle (user, admin, super_admin)
- `status` (optionnel) : Filtrer par statut (active, suspended, deleted)

### Voir les détails d'un utilisateur

```http
GET /api/admin/users/:userId
Authorization: Bearer <admin_token>
```

**Réponse :**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Kouassi Alain",
    "email": "kouassi@email.com",
    "role": "user",
    "accountStatus": "active",
    "identityVerificationStatus": "verified",
    ...
  },
  "kyc": { ... },
  "recentRequests": [ ... ]
}
```

### Modifier le statut d'un compte

```http
PATCH /api/admin/users/:userId/status
Authorization: Bearer <admin_token>

{
  "accountStatus": "suspended"
}
```

**Statuts possibles :**
- `active` : Compte actif
- `suspended` : Compte suspendu (utilisateur ne peut plus se connecter)
- `deleted` : Compte supprimé

### Modifier le rôle d'un utilisateur

```http
PATCH /api/admin/users/:userId/role
Authorization: Bearer <super_admin_token>

{
  "role": "admin"
}
```

**⚠️ Seul un super_admin peut créer un autre super_admin**

---

## 📋 Gestion des demandes

### Lister toutes les demandes

```http
GET /api/admin/requests?page=1&limit=20&status=pending&priority=high
Authorization: Bearer <admin_token>
```

**Filtres disponibles :**
- `status` : pending, in_progress, completed, cancelled
- `priority` : low, medium, high, urgent
- `requestType` : service_inquiry, support, contact_form, kyc, other

### Voir les détails d'une demande

```http
GET /api/admin/requests/:requestId
Authorization: Bearer <admin_token>
```

### Mettre à jour une demande

```http
PATCH /api/admin/requests/:requestId
Authorization: Bearer <admin_token>

{
  "status": "in_progress",
  "statusLabel": "En cours de traitement",
  "responseMessage": "Nous examinons votre demande...",
  "priority": "high"
}
```

### S'assigner une demande

```http
POST /api/admin/requests/:requestId/assign
Authorization: Bearer <admin_token>

{
  "assignedTo": "adminUserId"  // Optionnel (par défaut: vous-même)
}
```

**Effet :**
- Statut passe à `in_progress`
- Demande assignée à l'admin spécifié

---

## 🆔 Gestion KYC

### Lister toutes les vérifications KYC

```http
GET /api/admin/kyc?page=1&limit=20&status=pending
Authorization: Bearer <admin_token>
```

**Filtres :**
- `status` : not_started, pending, verified, rejected

### Voir les détails d'une vérification

```http
GET /api/admin/kyc/:kycId
Authorization: Bearer <admin_token>
```

### Approuver une vérification KYC

```http
POST /api/admin/kyc/:kycId/approve
Authorization: Bearer <admin_token>

{
  "notes": "Documents conformes. Identité vérifiée."
}
```

**Effet :**
- Statut KYC → `verified`
- Statut utilisateur → `verified`
- Date de vérification enregistrée

### Rejeter une vérification KYC

```http
POST /api/admin/kyc/:kycId/reject
Authorization: Bearer <admin_token>

{
  "rejectionReason": "Documents illisibles. Veuillez soumettre des photos plus nettes.",
  "notes": "Photo floue"
}
```

**Effet :**
- Statut KYC → `rejected`
- Statut utilisateur → `rejected`
- Raison du rejet enregistrée

---

## 📚 Gestion des contenus

### Lister tous les contenus

```http
GET /api/admin/content?page=1&limit=20&isPublished=true
Authorization: Bearer <admin_token>
```

### Créer un nouveau contenu

```http
POST /api/admin/content
Authorization: Bearer <admin_token>

{
  "title": "Guide complet du trading crypto",
  "slug": "guide-trading-crypto",
  "contentType": "tutorial",
  "difficultyLevel": "intermediate",
  "difficultyLabel": "Intermédiaire",
  "excerpt": "Apprenez les bases du trading...",
  "body": "# Introduction\n\nLe trading crypto...",
  "coverImageUrl": "assets/images/trading.jpg",
  "readingTime": "12 min",
  "tags": ["trading", "crypto", "tutoriel"],
  "summaryPoints": [
    "Comprendre les bases du trading",
    "Analyser les graphiques",
    "Gérer les risques"
  ],
  "isPublished": true
}
```

### Mettre à jour un contenu

```http
PATCH /api/admin/content/:contentId
Authorization: Bearer <admin_token>

{
  "title": "Nouveau titre",
  "isPublished": false
}
```

### Supprimer un contenu

```http
DELETE /api/admin/content/:contentId
Authorization: Bearer <admin_token>
```

---

## 🛠️ Gestion des services

### Lister tous les services

```http
GET /api/admin/services
Authorization: Bearer <admin_token>
```

### Créer un nouveau service

```http
POST /api/admin/services
Authorization: Bearer <admin_token>

{
  "slug": "nouveau-service",
  "name": "Mon Nouveau Service",
  "summary": "Description courte",
  "description": "Description complète du service...",
  "benefits": [
    "Avantage 1",
    "Avantage 2"
  ],
  "accessSteps": [
    "Étape 1",
    "Étape 2"
  ],
  "icon": "icon-name",
  "color": "#3B82F6",
  "requiresIdentityVerification": true,
  "isActive": true,
  "displayOrder": 5
}
```

### Mettre à jour un service

```http
PATCH /api/admin/services/:serviceId
Authorization: Bearer <admin_token>

{
  "name": "Nouveau nom",
  "isActive": false
}
```

### Supprimer un service

```http
DELETE /api/admin/services/:serviceId
Authorization: Bearer <admin_token>
```

---

## 🔐 Sécurité

### Authentification

Toutes les routes admin nécessitent :
1. Un token JWT valide
2. Le rôle `admin` ou `super_admin`

### Headers requis

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Obtenir un token admin

```http
POST /api/auth/login

{
  "email": "admin@cryptoconnect.app",
  "password": "Admin@123456"
}
```

**Réponse :**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "name": "Super Admin",
    "email": "admin@cryptoconnect.app",
    "role": "super_admin"
  }
}
```

---

## 📊 Workflow typique

### 1. Traiter une demande client

```
1. Lister les demandes en attente
   GET /api/admin/requests?status=pending

2. Voir les détails
   GET /api/admin/requests/:id

3. S'assigner la demande
   POST /api/admin/requests/:id/assign

4. Mettre à jour avec une réponse
   PATCH /api/admin/requests/:id
   {
     "status": "completed",
     "responseMessage": "Votre demande a été traitée..."
   }
```

### 2. Vérifier un KYC

```
1. Lister les KYC en attente
   GET /api/admin/kyc?status=pending

2. Voir les détails et documents
   GET /api/admin/kyc/:id

3. Approuver ou rejeter
   POST /api/admin/kyc/:id/approve
   OU
   POST /api/admin/kyc/:id/reject
```

### 3. Gérer un utilisateur problématique

```
1. Rechercher l'utilisateur
   GET /api/admin/users?search=email@example.com

2. Voir son historique
   GET /api/admin/users/:id

3. Suspendre le compte
   PATCH /api/admin/users/:id/status
   { "accountStatus": "suspended" }
```

---

## 🛡️ Bonnes pratiques

### Sécurité
- ✅ Changez le mot de passe admin par défaut
- ✅ Ne partagez jamais vos identifiants admin
- ✅ Créez des comptes admin séparés (pas de partage)
- ✅ Utilisez des mots de passe forts
- ✅ Déconnectez-vous après chaque session

### Gestion des demandes
- ✅ Assignez-vous les demandes avant de les traiter
- ✅ Répondez dans les 24h pour les demandes "high priority"
- ✅ Laissez des notes claires pour les autres admins
- ✅ Marquez "completed" uniquement quand résolu

### KYC
- ✅ Vérifiez minutieusement les documents
- ✅ Donnez des raisons claires en cas de rejet
- ✅ Ne validez jamais un document douteux
- ✅ Documentez vos décisions dans les notes

---

## 📧 Support

Pour toute question sur l'administration :
- 📧 Email : admin@cryptoconnect.app
- 💬 WhatsApp : +225 07 88 99 00 11

---

**CryptoConnect Admin Team © 2026**
