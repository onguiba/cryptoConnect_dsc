# 🚀 DÉMARRAGE RAPIDE - CryptoConnect

## ⚡ Installation en 3 étapes

### 1️⃣ Installer MongoDB

#### Option A : MongoDB Local (Recommandé pour Windows)

**Télécharger et installer :**
- Allez sur https://www.mongodb.com/try/download/community
- Téléchargez MongoDB Community Server pour Windows
- Installez avec les options par défaut
- MongoDB démarrera automatiquement comme service Windows

**Vérifier que MongoDB fonctionne :**
```cmd
mongosh
```
Si ça se connecte, c'est bon ! (tapez `exit` pour quitter)

#### Option B : MongoDB Atlas (Cloud gratuit)

1. Allez sur https://www.mongodb.com/cloud/atlas
2. Créez un compte gratuit
3. Créez un cluster gratuit
4. Créez un utilisateur de base de données
5. Autorisez votre IP (ou `0.0.0.0/0` pour autoriser tout)
6. Obtenez votre URI de connexion
7. Remplacez dans `.env` :
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cryptoconnect
   ```

---

### 2️⃣ Installer les dépendances

```cmd
npm install
```

---

### 3️⃣ Lancer l'application

```cmd
npm run seed
npm run dev
```

**C'est tout ! 🎉**

Ouvrez votre navigateur : **http://localhost:3000**

---

## 🔐 Compte de test

**Email :** `kouassi@email.com`  
**Mot de passe :** `Password123`

---

## ⚙️ Configuration Google OAuth (Optionnel)

### Étape 1 : Créer un projet Google Cloud

1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet "CryptoConnect"
3. Dans le menu : **APIs & Services** > **Credentials**

### Étape 2 : Configurer l'écran de consentement

1. **OAuth consent screen**
2. Sélectionnez **External**
3. Remplissez :
   - Nom : `CryptoConnect`
   - Email de support : votre email
   - Cliquez **Save and Continue**

### Étape 3 : Créer les identifiants

1. **Credentials** > **Create Credentials** > **OAuth client ID**
2. Type : **Web application**
3. Nom : `CryptoConnect Web`
4. **Origines JavaScript autorisées** :
   ```
   http://localhost:3000
   ```
5. **URI de redirection autorisés** :
   ```
   http://localhost:3000/api/auth/google/callback
   ```

### Étape 4 : Copier les identifiants

Copiez le **Client ID** et **Client Secret** dans le fichier `.env` :

```env
GOOGLE_CLIENT_ID=votre_client_id_ici.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
```

### Étape 5 : Redémarrer l'application

```cmd
npm run dev
```

Le bouton **Se connecter avec Google** fonctionnera maintenant ! 🎉

---

## 📱 Fonctionnalités disponibles

### ✅ Sans authentification
- Page d'accueil avec présentation
- Catalogue des services
- Articles éducatifs
- Formulaire de contact
- Taux crypto en temps réel

### ✅ Avec authentification
- Espace personnel (dashboard)
- Profil utilisateur
- Vérification KYC
- Favoris
- Historique des demandes
- Demandes de service

---

## 🐛 Problèmes fréquents

### MongoDB ne démarre pas

**Windows :**
```cmd
net start MongoDB
```

**Erreur "connection refused" :**
- Vérifiez que MongoDB est bien démarré
- Vérifiez l'URI dans `.env` : `mongodb://localhost:27017/cryptoconnect`

### Port 3000 déjà utilisé

Changez le port dans `.env` :
```env
PORT=4000
```

### Erreur "Google OAuth not configured"

C'est normal si vous n'avez pas configuré Google OAuth.
L'authentification locale (email/password) fonctionne toujours !

---

## 📚 Commandes utiles

```cmd
# Installer les dépendances
npm install

# Démarrer en mode développement (auto-reload)
npm run dev

# Démarrer en mode production
npm start

# Peupler la base de données
npm run seed

# Réinitialiser tout (ATTENTION : supprime toutes les données)
npm run seed
```

---

## 🎯 Prochaines étapes

1. ✅ Testez la connexion avec le compte de test
2. ✅ Explorez toutes les fonctionnalités
3. ✅ Configurez Google OAuth (optionnel)
4. ✅ Personnalisez les contenus et services
5. ✅ Déployez en production (Heroku, Vercel, Railway, etc.)

---

## 💡 Besoin d'aide ?

Consultez le fichier **README.md** pour la documentation complète !

**Support :**
- 📧 Email : contact@cryptoconnect.app
- 💬 WhatsApp : +225 07 88 99 00 11
