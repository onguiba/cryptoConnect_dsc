/**
 * ADMIN AUTHENTICATION MIDDLEWARE
 * Vérification des rôles admin
 */

// Vérifier que l'utilisateur est un administrateur
exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé. Connexion requise.',
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé. Droits administrateur requis.',
    });
  }

  next();
};

// Vérifier que l'utilisateur est un super administrateur
exports.requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé. Connexion requise.',
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé. Droits super administrateur requis.',
    });
  }

  next();
};
