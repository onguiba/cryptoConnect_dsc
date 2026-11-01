# 🚀 GUIDE DE DÉPLOIEMENT SUR HOSTINGER - CRYPTOCONNECT PRO

Ce guide vous accompagne pas à pas pour déployer et mettre en ligne votre application **CryptoConnect Pro** sur **Hostinger**.

---

## 📋 SOMMAIRE

1. [Prérequis](#1-prérequis)
2. [Méthode 1 : Déploiement sur Hébergement Web / Cloud (hPanel Node.js Selector)](#2-méthode-1--hébergement-web--cloud-hpanel-recommandé)
3. [Méthode 2 : Déploiement sur Hostinger VPS (SSH & PM2)](#3-méthode-2--hébergement-vps-hostinger-ssh--pm2)
4. [Gestion de la Base de Données (MongoDB Atlas ou Mode Autonome)](#4-gestion-de-la-base-de-données)
5. [Sécurité & Certificat SSL Gratuit](#5-sécurité--certificat-ssl-gratuit)
6. [Vérification et Tests Post-Déploiement](#6-vérification-et-tests-post-déploiement)

---

## 1. PRÉREQUIS

* Un compte [Hostinger](https://www.hostinger.fr/) avec un plan **Hébergement Web / Cloud** (avec support Node.js) ou un **VPS**.
* Un nom de domaine actif configuré sur Hostinger (ex: `mon-domaine.com`).
* Le dépôt GitHub à jour : `https://github.com/onguiba/cryptoConnect_dsc.git`

---

## 2. MÉTHODE 1 : HÉBERGEMENT WEB / CLOUD (hPanel Recommandé)

Cette méthode est la plus simple et ne nécessite aucune commande de serveur complexe.

### Étape 1 : Créer l'application Node.js dans hPanel
1. Connectez-vous à votre tableau de bord **hPanel Hostinger**.
2. Dans le menu de gauche, rendez-vous dans **Avancé** ➔ **Node.js**.
3. Cliquez sur le bouton **Créer une application Node.js** (ou *Create Application*).
4. Remplissez les champs avec les valeurs suivantes :
   * **Version de Node.js** : Sélectionnez `20.x` ou `18.x`.
   * **Mode d'application** : `Production`.
   * **Racine de l'application (Application root)** : `public_html` (ou laissez par défaut).
   * **URI de l'application (Application URL)** : votre domaine principal (ex: `https://mon-domaine.com`).
   * **Fichier de démarrage (Application startup file)** : `app.js` *(fichier déjà créé à la racine du projet)*.
5. Cliquez sur **Créer** (*Create*).

---

### Étape 2 : Importer les fichiers du projet

#### Option A : Déploiement automatique via Git (Le plus rapide)
1. Toujours dans la section de votre application Node.js sur hPanel, accédez à l'onglet **Git**.
2. Renseignez l'URL de votre dépôt :
   ```
   https://github.com/onguiba/cryptoConnect_dsc.git
   ```
3. Branche : `main`.
4. Cliquez sur **Déployer** (*Deploy*).

#### Option B : Déploiement manuel par ZIP (Gestionnaire de fichiers)
1. Sur votre ordinateur, compressez tout le dossier du projet en un fichier `.zip` (en excluant le dossier `node_modules` et le fichier `.env`).
2. Dans hPanel, ouvrez le **Gestionnaire de fichiers** (*File Manager*).
3. Rendez-vous dans le dossier de votre application (`public_html`).
4. Cliquez sur **Téléverser** ➔ choisissez votre archive `.zip`.
5. Faites un clic droit sur le ZIP et choisissez **Extraire** (*Extract*).

---

### Étape 3 : Installer les dépendances npm
1. Dans la page **Node.js** de votre hPanel, repérez la section **Dépendances npm**.
2. Cliquez sur le bouton **Installer les paquets npm** (*NPM Install*).
3. Le système installe automatiquement les packages de `package.json` en quelques secondes.

---

### Étape 4 : Configurer le fichier `.env`
1. Dans le **Gestionnaire de fichiers**, à la racine du projet (`public_html`), créez ou modifiez le fichier `.env` :
   ```env
   NODE_ENV=production
   PORT=3000
   APP_URL=https://mon-domaine.com
   JWT_SECRET=generer_un_secret_securise_ici_ex_9876543210
   JWT_REFRESH_SECRET=generer_un_refresh_secret_securise_ici_ex_1234567890
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   ```
2. Si vous utilisez MongoDB Atlas, ajoutez votre URL :
   ```env
   MONGODB_URI=mongodb+srv://<utilisateur>:<mot_de_passe>@cluster0.mongodb.net/cryptoconnect?retryWrites=true&w=majority
   ```
   *(Si vous n'ajoutez pas de MongoDB_URI, l'application fonctionne immédiatement en mode autonome persistant).*

---

### Étape 5 : Redémarrer l'application
Dans la page **Node.js** de hPanel, cliquez sur le bouton **Redémarrer** (*Restart application*).

---

## 3. MÉTHODE 2 : HÉBERGEMENT VPS HOSTINGER (SSH & PM2)

Pour les utilisateurs disposant d'un serveur VPS Hostinger (Ubuntu / Debian).

### Étape 1 : Connexion au VPS via SSH
```bash
ssh root@ip_du_vps
```

### Étape 2 : Mettre à jour et installer Node.js 20 & Git
```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx
npm install -g pm2
```

### Étape 3 : Cloner le projet
```bash
cd /var/www
git clone https://github.com/onguiba/cryptoConnect_dsc.git cryptoconnect
cd cryptoconnect
npm install --production
```

### Étape 4 : Configurer l'environnement
```bash
cp .env.example .env
nano .env
# Renseignez votre nom de domaine et vos clés secrètes, puis Ctrl+O, Entrée, Ctrl+X
```

### Étape 5 : Démarrer l'application avec PM2
Le fichier `ecosystem.config.js` est déjà configuré à la racine :
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Étape 6 : Configuration Nginx Reverse Proxy
Créez le fichier de configuration Nginx :
```bash
nano /etc/nginx/sites-available/cryptoconnect
```
Collez la configuration :
```nginx
server {
    listen 80;
    server_name mon-domaine.com www.mon-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Activez le site et rechargez Nginx :
```bash
ln -s /etc/nginx/sites-available/cryptoconnect /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 4. GESTION DE LA BASE DE DONNÉES

### Option A : Mode Autonome Persistant (Inclus & Zéro Configuration)
L'application intègre nativement un moteur de données autonome et persistant (`server/data/store.json`).
* **Avantage** : Aucune configuration de base de données nécessaire, démarre instantanément sur n'importe quel hébergement !
* **Données incluses** : Comptes démo (Client et Super Admin), catalogue des services, articles de l'académie, historique des demandes et dossiers KYC.

### Option B : MongoDB Atlas (Cluster Cloud Gratuit)
1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Créez un cluster gratuit (Shared M0).
3. Dans **Network Access**, ajoutez `0.0.0.0/0` (autoriser depuis partout).
4. Dans **Database Access**, créez un utilisateur et son mot de passe.
5. Cliquez sur **Connect** ➔ **Drivers** ➔ copiez la chaîne de connexion `mongodb+srv://...` et collez-la dans `MONGODB_URI` de votre `.env`.

---

## 5. SÉCURITÉ & CERTIFICAT SSL GRATUIT

Sur Hostinger, l'activation du SSL se fait en 1 clic :
1. Dans hPanel, rendez-vous dans la section **Sécurité** ➔ **SSL**.
2. Cliquez sur **Installer le certificat SSL** sur votre nom de domaine.
3. Le fichier `.htaccess` que nous avons inclus redirige automatiquement tous les visiteurs vers `https://` en toute sécurité.

---

## 6. VÉRIFICATION ET TESTS POST-DÉPLOIEMENT

Une fois l'application démarrée, testez vos endpoints :

1. **Page d'accueil** :
   ```
   https://mon-domaine.com
   ```
2. **Diagnostic Santé API** :
   ```
   https://mon-domaine.com/api/health
   ```
   *(Doit retourner `status: "operational"` et `success: true`)*.
3. **Cours Crypto & Convertisseur en direct** :
   ```
   https://mon-domaine.com/api/crypto-rates
   ```
4. **Comptes de Démonstration disponibles** :
   * **Super Administrateur** : `admin@cryptoconnect.app` / `Admin@123456` (Accès au Panneau Admin)
   * **Client Démo Pro** : `kouassi@email.com` / `Password123` (Accès Dashboard Client)

Félicitations ! Votre application CryptoConnect Pro est prête pour la production sur Hostinger.
