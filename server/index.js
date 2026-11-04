/**
 * ============================================================
 * CRYPTOCONNECT PRO - SERVEUR PRINCIPAL HAUTE PERFORMANCE
 * Backend Node.js Professionnel & API REST Résiliente
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

// Configuration & Moteur de données
const connectDB = require('./config/database');
const passport = require('./config/passport');
const dbStore = require('./services/dbStore');

// Middlewares
const { apiLimiter } = require('./middlewares/rateLimiter');

// Routes API
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const contentRoutes = require('./routes/content');
const requestRoutes = require('./routes/requests');
const kycRoutes = require('./routes/kyc');
const contactRoutes = require('./routes/contact');
const cryptoRoutes = require('./routes/crypto');
const adminRoutes = require('./routes/admin');

// ============================================================
// INITIALISATION
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Initialiser la base de données
connectDB();

// ============================================================
// SÉCURITÉ & MIDDLEWARES GLOBAUX
// ============================================================

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Rate Limiter doux
app.use('/api', apiLimiter);

// Journalisation élégante des requêtes
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 400 ? '❌' : '✅';
      console.log(`${statusColor} [${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ============================================================
// ROUTES API REST
// ============================================================

// Health check avec diagnostic complet
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const isMongo = mongoose.connection.readyState === 1;

  res.json({
    success: true,
    status: 'operational',
    service: 'CryptoConnect Pro API',
    version: '2.5.0',
    mode: isMongo ? 'MongoDB Cluster' : 'Autonomous Reactive High-Performance Engine',
    database: isMongo ? 'connected' : 'autonomous_persistent',
    features: {
      auth: 'JWT Bearer & Cookie',
      cryptoRates: 'Realtime Multi-Currency & Converter',
      services: 'Active',
      education: 'Active',
      kyc: 'AES-256 Protected',
      admin: 'Role-Based Access Control',
    },
    timestamp: new Date().toISOString(),
  });
});

// Info entreprise
app.get('/api/company-info', (req, res) => {
  res.json({
    success: true,
    companyInfo: {
      name: 'CryptoConnect Pro',
      tagline: 'La cryptomonnaie plus proche de vous — Simple, Sécurisée & Sans frontières',
      whatsappNumber: '+237696243890',
      phoneNumber: '+237696243890',
      email: 'contact@cryptoconnect.app',
      address: 'Abidjan Plateau, Tour Postel 2001, Côte d\'Ivoire',
      workingHours: 'Lundi - Samedi : 8h00 - 20h00 | Dimanche : 9h00 - 17h00 (GMT)',
      socialLinks: {
        whatsapp: 'https://wa.me/237696243890',
        twitter: 'https://twitter.com/cryptoconnect',
        linkedin: 'https://linkedin.com/company/cryptoconnect',
      },
    },
  });
});

// Enregistrement des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/identity-verification', kycRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/crypto-rates', cryptoRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================
// FICHIERS STATIQUES & SINGLE PAGE APPLICATION (SPA)
// ============================================================

const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Fallback SPA pour toutes les routes frontend non-API
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ============================================================
// GESTION GLOBALE DES ERREURS
// ============================================================

// 404 API Not Found
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route API non trouvée: ${req.method} ${req.originalUrl}`,
    suggestion: 'Consultez /api/health pour la liste des services disponibles.',
  });
});

// Erreur générale serveur
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur interne:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erreur interne du serveur.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================
// DÉMARRAGE DU SERVEUR
// ============================================================

const server = app.listen(PORT, () => {
  const isMongo = require('mongoose').connection.readyState === 1;

  console.log('\n' + '━'.repeat(74));
  console.log(' ✨ CRYPTOCONNECT PRO - BACKEND & APIS MAGNIFIQUES');
  console.log('━'.repeat(74));
  console.log(` 🌐 Application Web   : http://localhost:${PORT}`);
  console.log(` 📡 API REST Root    : http://localhost:${PORT}/api`);
  console.log(` 🏥 Diagnostic Santé  : http://localhost:${PORT}/api/health`);
  console.log(` 📊 Cours Cryptos     : http://localhost:${PORT}/api/crypto-rates`);
  console.log(` 🔐 Moteur Données    : ${isMongo ? 'MongoDB Actif' : '✅ Mode Autonome Persistant (Prêt à l\'emploi)'}`);
  console.log('━'.repeat(74));
  console.log(' 👥 Comptes de Démonstration Disponibles :');
  console.log('    • Super Admin     : admin@cryptoconnect.app  /  Admin@123456');
  console.log('    • Client Pro      : kouassi@email.com        /  Password123');
  console.log('━'.repeat(74) + '\n');
});

// Arrêt propre
process.on('SIGTERM', () => {
  console.log('\nFermeture sécurisée du serveur...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('\nFermeture du serveur CryptoConnect...');
  server.close(() => process.exit(0));
});

module.exports = app;
