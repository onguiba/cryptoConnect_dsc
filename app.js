/**
 * ============================================================
 * CRYPTOCONNECT PRO - ENTRY POINT POUR HOSTINGER & SERVEURS CLOUD
 * ============================================================
 * 
 * Ce fichier sert de point d'entrée universel pour les hébergeurs
 * comme Hostinger (Node.js Selector / Phusion Passenger), cPanel,
 * Heroku, Render et Vercel qui recherchent un fichier `app.js`
 * à la racine du projet.
 */

// Charger et exécuter le serveur principal
const app = require('./server/index');

module.exports = app;
