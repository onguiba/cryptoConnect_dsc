/**
 * RATE LIMITER MIDDLEWARE
 * Protection contre les abus et attaques DDoS
 */

const rateLimit = require('express-rate-limit');

// Limite générale de l'API
exports.apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Trop de requêtes. Veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite stricte pour l'authentification
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  skipSuccessfulRequests: true, // Ne compte que les échecs
  message: {
    success: false,
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  },
});

// Limite pour les formulaires de contact
exports.contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 demandes par heure
  message: {
    success: false,
    error: 'Limite de soumissions atteinte. Réessayez dans 1 heure.',
  },
});
