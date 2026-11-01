/**
 * KYC ROUTES
 * Routes de vérification d'identité
 */

const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { validateKyc, handleValidationErrors } = require('../middlewares/validators');
const { protect } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Obtenir le statut KYC (supporte / et /status)
router.get('/', kycController.getKycStatus);
router.get('/status', kycController.getKycStatus);

// Soumettre les documents KYC
router.post('/', validateKyc, handleValidationErrors, kycController.submitKyc);

module.exports = router;
