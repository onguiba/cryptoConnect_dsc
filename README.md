# 🚀 CryptoConnect Pro

**Application web professionnelle de services et éducation en cryptomonnaies**

Architecture full-stack moderne avec Node.js, Express, MongoDB et Google OAuth 2.0.

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Structure du projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Google OAuth Setup](#-google-oauth-setup)

---

## ✨ Fonctionnalités

### 🔐 Authentification
- ✅ Inscription et connexion locale (email/password)
- ✅ **Connexion avec Google OAuth 2.0**
- ✅ JWT avec access & refresh tokens
- ✅ Protection contre les attaques brute force
- ✅ Rate limiting intelligent

### 👤 Gestion utilisateur
- ✅ Profil personnalisé
- ✅ Vérification KYC (Know Your Customer)
- ✅ Favoris de contenus éducatifs
- ✅ Historique des demandes

### 📚 Contenus éducatifs
- ✅ Articles et tutoriels
- ✅ Filtres par niveau (Débutant, Intermédiaire, Avancé)
- ✅ Recherche full-text
- ✅ Compteur de vues

### 🛠️ Services
- ✅ Achat & Vente de cryptomonnaies
- ✅ Investissement & placements
- ✅ Formation & accompagnement
- ✅ Conseil & support personnalisé

### 💬 Support client
- ✅ Formulaire de contact
- ✅ Système de tickets/demandes
- ✅ Suivi en temps réel

---

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **Passport.js** - Authentification (JWT + Google OAuth)
- **bcryptjs** - Hachage des mots de passe
- **jsonwebtoken** - Génération JWT
- **express-validator** - Validation des données
- **helmet** - Sécurité HTTP headers
- **express-rate-limit** - Protection DDoS

### Frontend
- **HTML5 / CSS3** - Interface responsive
- **JavaScript Vanilla** - Pas de framework lourd
- **Mobile-first design** - Optimisé mobile et desktop

---

## 📦 Prérequis

- **Node.js** >= 16.x
- **MongoDB** >= 5.x (local ou MongoDB Atlas)
- **npm** ou **yarn**

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd cryptoConnect_dsc
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Installer MongoDB localement (optionnel)

**Windows:**
- Téléchargez MongoDB depuis [mongodb.com](https://www.mongodb.com/try/download/community)
- Installez et démarrez le service MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt install mongodb
sudo systemctl start mongodb
```

Ou utilisez **MongoDB Atlas** (gratuit) : [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## ⚙️ Configuration

### 1. Créer le fichier `.env`

Copiez `.env.example` vers `.env` :

```bash
copy .env.example .env
```

### 2. Configurer les variables d'environnement

Éditez le fichier `.env` :

```env
# Environnement
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cryptoconnect

# JWT Secrets (générez des clés sécurisées)
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi
JWT_REFRESH_SECRET=votre_refresh_secret_super_securise_changez_moi
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (voir section Google OAuth Setup)
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 3. Peupler la base de données

```bash
npm run seed
```

Cela créera :
- 2 utilisateurs de test
- 4 services
- 3 articles éducatifs

**Compte de test :**
- Email: `kouassi@email.com`
- Mot de passe: `Password123`

**Compte administrateur :**
- Email: `admin@cryptoconnect.app`
- Mot de passe: `Admin@123456`
- Rôle: `super_admin`

⚠️ **Changez le mot de passe admin en production !**

---

## 🏃 Démarrage

### Mode développement (avec auto-reload)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

L'application sera accessible sur : **http://localhost:3000**

---

## 📁 Structure du projet

```
cryptoConnect_dsc/
├── server/
│   ├── config/
│   │   ├── database.js           # Configuration MongoDB
│   │   └── passport.js            # Stratégies Passport (JWT + Google)
│   ├── controllers/
│   │   ├── authController.js      # Authentification
│   │   ├── userController.js      # Gestion utilisateur
│   │   ├── serviceController.js   # Services
│   │   ├── contentController.js   # Contenus éducatifs
│   │   ├── requestController.js   # Demandes clients
│   │   └── kycController.js       # Vérifications KYC
│   ├── middlewares/
│   │   ├── auth.js                # Protection JWT
│   │   ├── validators.js          # Validation des données
│   │   └── rateLimiter.js         # Rate limiting
│   ├── models/
│   │   ├── User.js                # Modèle Utilisateur
│   │   ├── Service.js             # Modèle Service
│   │   ├── Content.js             # Modèle Contenu
│   │   ├── Request.js             # Modèle Demande
│   │   └── IdentityVerification.js # Modèle KYC
│   ├── routes/
│   │   ├── auth.js                # Routes authentification
│   │   ├── users.js               # Routes utilisateurs
│   │   ├── services.js            # Routes services
│   │   ├── content.js             # Routes contenus
│   │   ├── requests.js            # Routes demandes
│   │   ├── kyc.js                 # Routes KYC
│   │   ├── contact.js             # Route contact
│   │   └── crypto.js              # Taux crypto en temps réel
│   ├── seeds/
│   │   └── seed.js                # Script de seeding
│   └── index.js                   # Point d'entrée serveur
├── public/
│   ├── css/
│   │   └── style.css              # Styles
│   ├── js/
│   │   └── app.js                 # Application frontend
│   ├── assets/
│   │   └── images/                # Images
│   └── index.html                 # Page principale
├── .env.example                   # Template variables d'environnement
├── .gitignore                     # Fichiers ignorés par Git
├── package.json                   # Dépendances
└── README.md                      # Documentation
```

---

## 📡 API Documentation

### Authentification

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phoneNumber": "+225 01 23 45 67 89"
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Connexion Google
```http
GET /api/auth/google
```

#### Obtenir l'utilisateur actuel
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Services

```http
GET /api/services                    # Liste tous les services
GET /api/services/:id                # Détails d'un service
```

### Contenus éducatifs

```http
GET /api/content                     # Liste tous les contenus
GET /api/content?difficultyLevel=beginner  # Filtre par niveau
GET /api/content/search?query=bitcoin      # Recherche
GET /api/content/:id                 # Détails d'un contenu
```

### Profil utilisateur (authentifié)

```http
GET /api/users/me                    # Obtenir le profil
PUT /api/users/me                    # Mettre à jour le profil
POST /api/users/favorites            # Ajouter/retirer favori
GET /api/users/favorites             # Liste des favoris
```

### Administration (authentifié - admin/super_admin uniquement)

```http
# Dashboard
GET /api/admin/dashboard/stats        # Statistiques globales

# Utilisateurs
GET /api/admin/users                  # Liste utilisateurs
GET /api/admin/users/:id              # Détails utilisateur
PATCH /api/admin/users/:id/status     # Modifier statut
PATCH /api/admin/users/:id/role       # Modifier rôle (super_admin)

# Demandes
GET /api/admin/requests               # Liste demandes
GET /api/admin/requests/:id           # Détails demande
PATCH /api/admin/requests/:id         # Mettre à jour
POST /api/admin/requests/:id/assign   # Assigner à un admin

# KYC
GET /api/admin/kyc                    # Liste vérifications
GET /api/admin/kyc/:id                # Détails vérification
POST /api/admin/kyc/:id/approve       # Approuver
POST /api/admin/kyc/:id/reject        # Rejeter

# Contenus
GET /api/admin/content                # Liste contenus
POST /api/admin/content               # Créer contenu
PATCH /api/admin/content/:id          # Modifier contenu
DELETE /api/admin/content/:id         # Supprimer contenu

# Services
GET /api/admin/services               # Liste services
POST /api/admin/services              # Créer service
PATCH /api/admin/services/:id         # Modifier service
DELETE /api/admin/services/:id        # Supprimer service
```

Voir **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** pour la documentation complète du panneau admin.

### Demandes (authentifié)

```http
POST /api/requests                   # Créer une demande
GET /api/requests                    # Liste des demandes
GET /api/requests/:id                # Détails d'une demande
```

### KYC (authentifié)

```http
GET /api/identity-verification/status    # Statut KYC
POST /api/identity-verification          # Soumettre documents
```

### Contact (public)

```http
POST /api/contact
Content-Type: application/json

{
  "name": "Marie Dupont",
  "email": "marie@example.com",
  "subject": "Demande d'information",
  "message": "Bonjour, je souhaite..."
}
```

---

## 🔑 Google OAuth Setup

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Activez **Google+ API**

### 2. Configurer l'écran de consentement OAuth

1. Menu **APIs & Services** > **OAuth consent screen**
2. Choisissez **External** (pour test)
3. Remplissez les informations obligatoires :
   - Nom de l'application : `CryptoConnect`
   - Email de support
   - Domaine autorisé : `localhost` (en dev)

### 3. Créer les identifiants OAuth 2.0

1. Menu **APIs & Services** > **Credentials**
2. Cliquez **Create Credentials** > **OAuth client ID**
3. Type d'application : **Web application**
4. Nom : `CryptoConnect Web`
5. **Origines JavaScript autorisées** :
   - `http://localhost:3000`
6. **URI de redirection autorisés** :
   - `http://localhost:3000/api/auth/google/callback`

### 4. Copier les identifiants

Copiez le **Client ID** et **Client Secret** dans votre fichier `.env` :

```env
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 5. Tester

Démarrez l'application et cliquez sur **Se connecter avec Google** !

---

## 🔒 Sécurité

- ✅ Mots de passe hachés avec **bcrypt**
- ✅ Tokens JWT sécurisés
- ✅ Headers sécurisés avec **Helmet**
- ✅ Rate limiting contre les attaques DDoS
- ✅ Validation stricte des données
- ✅ Protection CSRF
- ✅ Compte verrouillé après 5 tentatives échouées

---

## 📝 License

ISC - CryptoConnect Team © 2026

---

## 🤝 Support

Pour toute question ou problème :
- 📧 Email : contact@cryptoconnect.app
- 💬 WhatsApp : +225 07 88 99 00 11
