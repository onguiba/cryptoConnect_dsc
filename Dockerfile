# ============================================================
# CRYPTOCONNECT PRO - DOCKERFILE OPTIMISÉ POUR DÉPLOIEMENT
# ============================================================

FROM node:20-alpine

# Répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier les manifests npm
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Copier le reste du code source
COPY . .

# Création des dossiers de persistance
RUN mkdir -p server/data uploads public/images

# Exposer le port de l'application (par défaut 3000)
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["node", "server.js"]
