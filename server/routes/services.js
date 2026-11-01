/**
 * SERVICE ROUTES
 * Routes des services
 */

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Routes publiques
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

module.exports = router;
