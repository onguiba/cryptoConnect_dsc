/**
 * USER ROUTES
 * Routes de gestion du profil utilisateur
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateProfileUpdate, handleValidationErrors } = require('../middlewares/validators');
const { protect } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Obtenir le profil
router.get('/me', userController.getProfile);

// Mettre à jour le profil
router.put('/me', validateProfileUpdate, handleValidationErrors, userController.updateProfile);

// Gérer les favoris
router.post('/favorites', userController.toggleFavorite);
router.get('/favorites', userController.getFavorites);

module.exports = router;
