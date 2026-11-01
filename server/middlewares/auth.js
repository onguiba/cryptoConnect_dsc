/**
 * AUTH MIDDLEWARE
 * Protection des routes par JWT
 */

const passport = require('passport');

exports.protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Erreur d\'authentification.',
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Non autorisé. Token invalide ou expiré.',
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};
