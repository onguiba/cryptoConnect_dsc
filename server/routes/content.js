/**
 * CONTENT ROUTES
 * Routes des contenus éducatifs
 */

const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Routes publiques
router.get('/', contentController.getAllContent);
router.get('/search', contentController.searchContent);
router.get('/:id', contentController.getContentById);

module.exports = router;
