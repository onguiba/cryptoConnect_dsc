/**
 * ADMIN ROUTES
 * Routes du panneau d'administration
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const { requireAdmin, requireSuperAdmin } = require('../middlewares/adminAuth');

// Toutes les routes nécessitent une authentification et des droits admin
router.use(protect);
router.use(requireAdmin);

// ============================================================
// DASHBOARD
// ============================================================
router.get('/dashboard/stats', adminController.getDashboardStats);

// ============================================================
// GESTION DES UTILISATEURS
// ============================================================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', requireSuperAdmin, adminController.updateUserRole);

// ============================================================
// GESTION DES DEMANDES
// ============================================================
router.get('/requests', adminController.getAllRequests);
router.get('/requests/:id', adminController.getRequestDetails);
router.patch('/requests/:id', adminController.updateRequest);
router.post('/requests/:id/assign', adminController.assignRequest);

// ============================================================
// GESTION DES VÉRIFICATIONS KYC
// ============================================================
router.get('/kyc', adminController.getAllKyc);
router.get('/kyc/:id', adminController.getKycDetails);
router.post('/kyc/:id/approve', adminController.approveKyc);
router.post('/kyc/:id/reject', adminController.rejectKyc);

// ============================================================
// GESTION DES CONTENUS
// ============================================================
router.get('/content', adminController.getAllContent);
router.post('/content', adminController.createContent);
router.patch('/content/:id', adminController.updateContent);
router.delete('/content/:id', adminController.deleteContent);

// ============================================================
// GESTION DES SERVICES
// ============================================================
router.get('/services', adminController.getAllServices);
router.post('/services', adminController.createService);
router.patch('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

module.exports = router;
