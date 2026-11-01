# 🧪 TESTER LE PANNEAU D'ADMINISTRATION

Guide pour tester toutes les fonctionnalités admin de CryptoConnect.

---

## 🚀 Prérequis

1. **MongoDB** doit être démarré
2. **L'application** doit être lancée (`npm run dev`)
3. **La base de données** doit être peuplée (`npm run seed`)

---

## 1️⃣ Connexion en tant qu'administrateur

### Méthode A : Via l'interface web

1. Ouvrez http://localhost:3000
2. Cliquez sur "Se connecter"
3. Utilisez les identifiants admin :
   - Email : `admin@cryptoconnect.app`
   - Password : `Admin@123456`

### Méthode B : Via API (Postman, Thunder Client, etc.)

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@cryptoconnect.app",
  "password": "Admin@123456"
}
```

**Réponse attendue :**
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

**⚠️ Important : Copiez l'accessToken pour les prochaines requêtes**

---

## 2️⃣ Tester le Dashboard

```http
GET http://localhost:3000/api/admin/dashboard/stats
Authorization: Bearer <votre_token>
```

**Vous devriez voir :**
- Nombre total d'utilisateurs
- Nombre de KYC (pending, verified, rejected)
- Nombre de demandes par statut
- Nombre de contenus et services

---

## 3️⃣ Tester la gestion des utilisateurs

### Lister tous les utilisateurs

```http
GET http://localhost:3000/api/admin/users
Authorization: Bearer <votre_token>
```

### Rechercher un utilisateur

```http
GET http://localhost:3000/api/admin/users?search=kouassi
Authorization: Bearer <votre_token>
```

### Voir les détails d'un utilisateur

```http
GET http://localhost:3000/api/admin/users/<user_id>
Authorization: Bearer <votre_token>
```

### Suspendre un compte

```http
PATCH http://localhost:3000/api/admin/users/<user_id>/status
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "accountStatus": "suspended"
}
```

**Test :** L'utilisateur ne pourra plus se connecter.

### Réactiver le compte

```http
PATCH http://localhost:3000/api/admin/users/<user_id>/status
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "accountStatus": "active"
}
```

### Promouvoir en administrateur

```http
PATCH http://localhost:3000/api/admin/users/<user_id>/role
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "role": "admin"
}
```

**Note :** Seul un super_admin peut faire cela.

---

## 4️⃣ Tester la gestion des demandes

### Créer une demande (en tant qu'utilisateur standard)

1. Connectez-vous avec : `kouassi@email.com` / `Password123`
2. Créez une demande :

```http
POST http://localhost:3000/api/requests
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "subject": "Demande de renseignement",
  "description": "Je souhaite des informations sur le service de trading.",
  "serviceName": "Achat & Vente"
}
```

### Lister les demandes (en tant qu'admin)

```http
GET http://localhost:3000/api/admin/requests?status=pending
Authorization: Bearer <admin_token>
```

### S'assigner une demande

```http
POST http://localhost:3000/api/admin/requests/<request_id>/assign
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "assignedTo": "<admin_user_id>"
}
```

### Répondre à la demande

```http
PATCH http://localhost:3000/api/admin/requests/<request_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "in_progress",
  "statusLabel": "En cours de traitement",
  "responseMessage": "Merci pour votre demande. Nous examinons votre dossier et reviendrons vers vous sous 24h.",
  "priority": "high"
}
```

### Marquer comme complétée

```http
PATCH http://localhost:3000/api/admin/requests/<request_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "completed",
  "statusLabel": "Complétée",
  "responseMessage": "Votre demande a été traitée avec succès. N'hésitez pas à nous recontacter si besoin."
}
```

---

## 5️⃣ Tester la gestion KYC

### Soumettre des documents KYC (en tant qu'utilisateur)

1. Connectez-vous avec : `marie@email.com` / `Password123`
2. Soumettez des documents :

```http
POST http://localhost:3000/api/identity-verification
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "documentType": "national_id",
  "documentName": "CNI_Marie_Dupont.jpg"
}
```

### Lister les KYC en attente (en tant qu'admin)

```http
GET http://localhost:3000/api/admin/kyc?status=pending
Authorization: Bearer <admin_token>
```

### Voir les détails d'une vérification

```http
GET http://localhost:3000/api/admin/kyc/<kyc_id>
Authorization: Bearer <admin_token>
```

### Approuver une vérification

```http
POST http://localhost:3000/api/admin/kyc/<kyc_id>/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Documents conformes. Identité vérifiée avec succès."
}
```

**Effet :** Le statut de l'utilisateur passe à `verified`.

### Rejeter une vérification

```http
POST http://localhost:3000/api/admin/kyc/<kyc_id>/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejectionReason": "La photo de votre document est trop floue. Veuillez soumettre une photo plus nette.",
  "notes": "Document illisible"
}
```

**Effet :** Le statut de l'utilisateur passe à `rejected`.

---

## 6️⃣ Tester la gestion des contenus

### Lister tous les contenus

```http
GET http://localhost:3000/api/admin/content
Authorization: Bearer <admin_token>
```

### Créer un nouveau contenu

```http
POST http://localhost:3000/api/admin/content
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Guide complet du staking crypto",
  "slug": "guide-staking-crypto",
  "contentType": "tutorial",
  "difficultyLevel": "intermediate",
  "difficultyLabel": "Intermédiaire",
  "excerpt": "Apprenez à générer des revenus passifs avec le staking de cryptomonnaies.",
  "body": "# Introduction au Staking\n\nLe staking est une méthode...",
  "coverImageUrl": "assets/images/staking.jpg",
  "readingTime": "10 min",
  "tags": ["staking", "revenus passifs", "crypto"],
  "summaryPoints": [
    "Qu'est-ce que le staking",
    "Comment commencer",
    "Les meilleurs cryptos pour le staking"
  ],
  "isPublished": true
}
```

### Modifier un contenu

```http
PATCH http://localhost:3000/api/admin/content/<content_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Guide complet du staking crypto 2026",
  "isPublished": true
}
```

### Supprimer un contenu

```http
DELETE http://localhost:3000/api/admin/content/<content_id>
Authorization: Bearer <admin_token>
```

---

## 7️⃣ Tester la gestion des services

### Lister tous les services

```http
GET http://localhost:3000/api/admin/services
Authorization: Bearer <admin_token>
```

### Créer un nouveau service

```http
POST http://localhost:3000/api/admin/services
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "slug": "trading-automatique",
  "name": "Trading Automatique",
  "summary": "Bot de trading intelligent pour automatiser vos investissements.",
  "description": "Notre bot de trading analyse le marché 24/7...",
  "benefits": [
    "Trading 24/7 sans interruption",
    "Stratégies optimisées par IA",
    "Gestion automatique du risque"
  ],
  "accessSteps": [
    "Configurez votre profil de risque",
    "Définissez votre budget",
    "Activez le bot"
  ],
  "icon": "bot",
  "color": "#8B5CF6",
  "requiresIdentityVerification": true,
  "isActive": true,
  "displayOrder": 5
}
```

### Modifier un service

```http
PATCH http://localhost:3000/api/admin/services/<service_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Trading Automatique Pro",
  "isActive": true
}
```

### Supprimer un service

```http
DELETE http://localhost:3000/api/admin/services/<service_id>
Authorization: Bearer <admin_token>
```

---

## 8️⃣ Tester les restrictions de sécurité

### Tenter d'accéder sans token

```http
GET http://localhost:3000/api/admin/dashboard/stats
```

**Résultat attendu :** `401 Unauthorized`

### Tenter d'accéder avec un token utilisateur standard

1. Connectez-vous en tant que `kouassi@email.com`
2. Utilisez ce token pour :

```http
GET http://localhost:3000/api/admin/dashboard/stats
Authorization: Bearer <user_token>
```

**Résultat attendu :** `403 Forbidden`

### Tenter de modifier un rôle en tant qu'admin simple

1. Créez un compte admin simple (non super_admin)
2. Tentez de modifier le rôle d'un utilisateur :

```http
PATCH http://localhost:3000/api/admin/users/<user_id>/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"
}
```

**Résultat attendu :** `403 Forbidden` (seul super_admin peut faire cela)

---

## 🎯 Checklist complète

### Dashboard
- [ ] Obtenir les statistiques globales
- [ ] Vérifier que les chiffres sont corrects

### Utilisateurs
- [ ] Lister tous les utilisateurs
- [ ] Rechercher un utilisateur
- [ ] Voir les détails d'un utilisateur
- [ ] Suspendre un compte
- [ ] Réactiver un compte
- [ ] Promouvoir en admin
- [ ] Rétrograder en user

### Demandes
- [ ] Créer une demande (en tant qu'user)
- [ ] Lister les demandes (en tant qu'admin)
- [ ] Filtrer par statut
- [ ] S'assigner une demande
- [ ] Mettre à jour une demande
- [ ] Marquer comme complétée

### KYC
- [ ] Soumettre des documents (en tant qu'user)
- [ ] Lister les KYC en attente
- [ ] Voir les détails d'un KYC
- [ ] Approuver une vérification
- [ ] Rejeter une vérification
- [ ] Vérifier que le statut utilisateur change

### Contenus
- [ ] Lister les contenus
- [ ] Créer un nouveau contenu
- [ ] Modifier un contenu
- [ ] Supprimer un contenu

### Services
- [ ] Lister les services
- [ ] Créer un nouveau service
- [ ] Modifier un service
- [ ] Supprimer un service

### Sécurité
- [ ] Vérifier que les routes admin sont protégées
- [ ] Vérifier qu'un user ne peut pas accéder à /api/admin/*
- [ ] Vérifier qu'un admin ne peut pas modifier les rôles

---

## 💡 Conseils

1. **Utilisez Postman ou Thunder Client** pour tester facilement les endpoints
2. **Copiez les IDs** des ressources depuis les réponses pour les utiliser dans les tests suivants
3. **Testez les erreurs** : essayez d'accéder sans token, avec un mauvais rôle, etc.
4. **Vérifiez la base de données** : utilisez MongoDB Compass ou mongosh pour voir les changements

---

## 🐛 Problèmes courants

### "401 Unauthorized"
- Vérifiez que vous avez bien ajouté le header `Authorization: Bearer <token>`
- Vérifiez que le token n'a pas expiré (24h par défaut)

### "403 Forbidden"
- Vérifiez que vous êtes connecté en tant qu'admin
- Pour certaines routes, vérifiez que vous êtes super_admin

### "404 Not Found"
- Vérifiez l'ID de la ressource
- Vérifiez que la ressource existe dans la base de données

---

**Tous les tests passent ? Félicitations ! Votre système d'administration fonctionne parfaitement ! 🎉**
