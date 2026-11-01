/**
 * VALIDATORS MIDDLEWARE
 * Validation des requêtes avec express-validator
 */

const { body, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Données invalides.',
      errors: errors.array(),
    });
  }
  next();
};

// Validation inscription
exports.validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email trop long'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/[a-z]/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[0-9]/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('phoneNumber').optional().trim(),
];

// Validation connexion
exports.validateLogin = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

// Validation profil
exports.validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('phoneNumber').optional().trim(),
  body('languagePreference').optional().isIn(['fr', 'en']).withMessage('Langue invalide'),
];

// Validation demande de contact
exports.validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('subject')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le sujet doit contenir entre 3 et 200 caractères'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Le message doit contenir entre 10 et 2000 caractères'),
];

// Validation demande de service
exports.validateRequest = [
  body('subject')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le sujet doit contenir entre 3 et 200 caractères'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La description doit contenir entre 10 et 2000 caractères'),
  body('serviceName').optional().trim(),
  body('requestType')
    .optional()
    .isIn(['service_inquiry', 'support', 'contact_form', 'kyc', 'other'])
    .withMessage('Type de demande invalide'),
];

// Validation KYC
exports.validateKyc = [
  body('documentType')
    .isIn(['national_id', 'passport', 'driver_license'])
    .withMessage('Type de document invalide'),
  body('documentName').optional().trim(),
];
