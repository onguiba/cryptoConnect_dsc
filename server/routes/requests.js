/**
 * REQUEST ROUTES
 * Routes des demandes clients
 */

const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { validateRequest, handleValidationErrors } = require('../middlewares/validators');
const { protect } = require('../middlewares/auth');
const { contactLimiter } = require('../middlewares/rateLimiter');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Créer une demande
router.post('/', contactLimiter, validateRequest, handleValidationErrors, requestController.createRequest);

// Obtenir les demandes de l'utilisateur
router.get('/', requestController.getUserRequests);

// Obtenir une demande spécifique
router.get('/:id', requestController.getRequestById);

module.exports = router;
