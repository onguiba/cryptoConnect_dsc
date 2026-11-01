# 🏗️ ARCHITECTURE - CryptoConnect Pro

## 📐 Vue d'ensemble

CryptoConnect est une application web full-stack suivant l'architecture **MVC (Model-View-Controller)** avec séparation claire des responsabilités.

---

## 🎯 Stack technologique

### Backend
- **Runtime** : Node.js v16+
- **Framework web** : Express.js 4.x
- **Base de données** : MongoDB + Mongoose ODM
- **Authentification** : Passport.js (JWT + Google OAuth 2.0)
- **Sécurité** : bcryptjs, helmet, express-rate-limit
- **Validation** : express-validator

### Frontend
- **HTML5 / CSS3** (Mobile-first)
- **JavaScript Vanilla** (ES6+)
- **SPA** (Single Page Application)

---

## 📂 Structure détaillée

```
server/
├── config/               # Configuration centralisée
│   ├── database.js      # Connexion MongoDB
│   └── passport.js      # Stratégies d'authentification
│
├── controllers/         # Logique métier
│   ├── authController.js     # Authentification (login, register, OAuth)
│   ├── userController.js     # Gestion profil utilisateur
│   ├── serviceController.js  # CRUD services
│   ├── contentController.js  # CRUD contenus éducatifs
│   ├── requestController.js  # Gestion demandes clients
│   └── kycController.js      # Vérification d'identité
│
├── middlewares/         # Middlewares personnalisés
│   ├── auth.js          # Protection routes avec JWT
│   ├── validators.js    # Validation des données entrantes
│   └── rateLimiter.js   # Limitation du taux de requêtes
│
├── models/              # Schémas MongoDB (Mongoose)
│   ├── User.js          # Utilisateurs
│   ├── Service.js       # Services proposés
│   ├── Content.js       # Contenus éducatifs
│   ├── Request.js       # Demandes clients
│   └── IdentityVerification.js  # KYC
│
├── routes/              # Définition des endpoints API
│   ├── auth.js          # /api/auth/*
│   ├── users.js         # /api/users/*
│   ├── services.js      # /api/services/*
│   ├── content.js       # /api/content/*
│   ├── requests.js      # /api/requests/*
│   ├── kyc.js           # /api/identity-verification/*
│   ├── contact.js       # /api/contact
│   └── crypto.js        # /api/crypto-rates
│
├── seeds/               # Données initiales
│   └── seed.js          # Script de peuplement
│
└── index.js             # Point d'entrée principal
```

---

## 🔐 Flux d'authentification

### 1. Inscription locale

```
Client → POST /api/auth/register
  ↓
Validation des données (validators.js)
  ↓
Vérification email unique (authController)
  ↓
Hachage du mot de passe (bcrypt dans User model)
  ↓
Création utilisateur en DB
  ↓
Génération JWT access + refresh tokens
  ↓
Retour tokens + données utilisateur
```

### 2. Connexion locale

```
Client → POST /api/auth/login
  ↓
Validation des données
  ↓
Recherche utilisateur par email
  ↓
Vérification compte non verrouillé
  ↓
Comparaison mot de passe (bcrypt)
  ↓
Réinitialisation tentatives connexion
  ↓
Génération JWT tokens
  ↓
Retour tokens + données utilisateur
```

### 3. Connexion Google OAuth

```
Client → GET /api/auth/google
  ↓
Redirection vers Google
  ↓
Utilisateur autorise l'application
  ↓
Google → Callback /api/auth/google/callback
  ↓
Passport vérifie le profil Google
  ↓
Recherche/Création utilisateur
  ↓
Génération JWT tokens
  ↓
Redirection client avec tokens
```

### 4. Accès aux routes protégées

```
Client → Request avec Header: Authorization: Bearer <token>
  ↓
Middleware auth.js (protect)
  ↓
Passport vérifie le JWT
  ↓
Extraction utilisateur depuis token
  ↓
Injection req.user pour le controller
  ↓
Traitement de la requête
```

---

## 💾 Modèles de données

### User (Utilisateur)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed),
  phoneNumber: String,
  googleId: String (pour OAuth),
  authProvider: "local" | "google",
  languagePreference: "fr" | "en",
  avatarUrl: String,
  emailVerified: Boolean,
  identityVerificationStatus: "not_started" | "pending" | "verified" | "rejected",
  accountStatus: "active" | "suspended" | "deleted",
  favorites: [ObjectId] (références Content),
  refreshTokens: [{ token, createdAt }],
  loginAttempts: Number,
  lockUntil: Date,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Service
```javascript
{
  _id: ObjectId,
  slug: String (unique),
  name: String,
  summary: String,
  description: String,
  benefits: [String],
  accessSteps: [String],
  icon: String,
  color: String,
  requiresIdentityVerification: Boolean,
  isActive: Boolean,
  displayOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Content (Contenu éducatif)
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  contentType: "article" | "tutorial" | "video" | "guide",
  difficultyLevel: "beginner" | "intermediate" | "advanced",
  difficultyLabel: String,
  excerpt: String,
  body: String (markdown),
  coverImageUrl: String,
  readingTime: String,
  tags: [String],
  summaryPoints: [String],
  author: ObjectId (référence User),
  isPublished: Boolean,
  publishedAt: Date,
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Request (Demande)
```javascript
{
  _id: ObjectId,
  user: ObjectId (référence User),
  requestType: "service_inquiry" | "support" | "contact_form" | "kyc" | "other",
  serviceName: String,
  subject: String,
  description: String,
  status: "pending" | "in_progress" | "completed" | "cancelled",
  statusLabel: String,
  responseMessage: String,
  assignedTo: ObjectId,
  priority: "low" | "medium" | "high" | "urgent",
  resolvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### IdentityVerification (KYC)
```javascript
{
  _id: ObjectId,
  user: ObjectId (référence User, unique),
  documentType: "national_id" | "passport" | "driver_license",
  documentName: String,
  documentUrl: String,
  status: "not_started" | "pending" | "verified" | "rejected",
  rejectionReason: String,
  reviewedBy: ObjectId,
  reviewedAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🛡️ Sécurité

### Couches de protection

1. **Helmet** : Headers HTTP sécurisés
2. **CORS** : Contrôle des origines autorisées
3. **Rate Limiting** :
   - API globale : 100 req/15min
   - Authentification : 5 req/15min
   - Contact : 3 req/1h
4. **Validation** : express-validator sur toutes les entrées
5. **Hachage** : bcrypt avec salt de 10 rounds
6. **JWT** : Tokens signés avec secret fort
7. **Verrouillage** : Compte bloqué 2h après 5 échecs
8. **Sanitization** : Nettoyage des données utilisateur

### Bonnes pratiques

- Mots de passe jamais stockés en clair
- Tokens JWT avec expiration courte
- Refresh tokens pour renouvellement
- Variables sensibles dans `.env`
- `.gitignore` pour ne pas commit les secrets
- Validation stricte côté serveur
- Logs des erreurs sans exposer les détails

---

## 📊 Flow de données

### Exemple : Création d'une demande de service

```
1. Frontend (app.js)
   ↓
   Utilisateur clique sur "Demander ce service"
   ↓
   
2. Formulaire → fetch() POST /api/requests
   Headers: { Authorization: Bearer <token> }
   Body: { subject, description, serviceName }
   ↓

3. Backend (routes/requests.js)
   ↓
   Middleware protect → Vérifie JWT
   ↓
   Middleware contactLimiter → Vérifie rate limit
   ↓
   Middleware validateRequest → Valide données
   ↓
   
4. Controller (requestController.js)
   ↓
   Crée une instance Request
   ↓
   Request.create({ user: req.user._id, ...data })
   ↓
   
5. Model (Request.js)
   ↓
   Validation Mongoose
   ↓
   Sauvegarde dans MongoDB
   ↓
   
6. Réponse
   ↓
   Status 201 Created
   ↓
   JSON: { success: true, request: {...} }
   ↓
   
7. Frontend
   ↓
   Affiche toast de confirmation
   ↓
   Actualise la liste des demandes
```

---

## 🚀 Déploiement

### Variables d'environnement en production

```env
NODE_ENV=production
PORT=443
APP_URL=https://cryptoconnect.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prod
JWT_SECRET=<générer un secret fort>
JWT_REFRESH_SECRET=<générer un secret fort>
GOOGLE_CLIENT_ID=<production ID>
GOOGLE_CLIENT_SECRET=<production secret>
GOOGLE_CALLBACK_URL=https://cryptoconnect.app/api/auth/google/callback
```

### Plateformes recommandées

- **Heroku** : Facile, gratuit pour débuter
- **Railway** : MongoDB intégré
- **Render** : Gratuit avec auto-deploy
- **Vercel** : Idéal pour le frontend
- **AWS EC2** : Plus de contrôle
- **DigitalOcean** : Serveurs VPS abordables

---

## 🔄 Évolutions futures

### Fonctionnalités planifiées

- [ ] Upload de fichiers (KYC documents)
- [ ] Notifications push (Web Push API)
- [ ] Chat en temps réel (Socket.io)
- [ ] Système de notifications par email (Nodemailer)
- [ ] Dashboard admin
- [ ] Analytics avancés
- [ ] API publique documentée (Swagger)
- [ ] Tests unitaires et d'intégration (Jest)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoring (Sentry, LogRocket)

### Améliorations techniques

- [ ] Migration vers TypeScript
- [ ] GraphQL en complément REST
- [ ] Redis pour caching
- [ ] Elasticsearch pour recherche avancée
- [ ] Microservices architecture
- [ ] Conteneurisation (Docker)
- [ ] Kubernetes orchestration

---

## 📖 Références

- **Express.js** : https://expressjs.com/
- **Mongoose** : https://mongoosejs.com/
- **Passport.js** : https://www.passportjs.org/
- **JWT** : https://jwt.io/
- **MongoDB** : https://docs.mongodb.com/

---

**CryptoConnect Team © 2026**
