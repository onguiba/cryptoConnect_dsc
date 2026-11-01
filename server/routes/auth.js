/**
 * AUTH ROUTES
 * Routes d'authentification
 */

const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middlewares/validators');
const { authLimiter } = require('../middlewares/rateLimiter');
const { protect } = require('../middlewares/auth');

// Inscription
router.post('/register', authLimiter, validateRegister, handleValidationErrors, authController.register);

// Connexion
router.post('/login', authLimiter, validateLogin, handleValidationErrors, authController.login);

// Google OAuth - Initier l'authentification
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Google OAuth - Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=auth_failed' }),
  authController.googleCallback
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Déconnexion
router.post('/logout', protect, authController.logout);

// Obtenir l'utilisateur actuel
router.get('/me', protect, authController.me);

module.exports = router;
