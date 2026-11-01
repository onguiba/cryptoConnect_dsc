/**
 * AUTH CONTROLLER
 * Authentification sécurisée (JWT, Login, Inscription, Déconnexion)
 * Supporte Mongoose & Mode Autonome dbStore
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const dbStore = require('../services/dbStore');

// Génération des tokens JWT
const generateTokens = (userId) => {
  const secret = process.env.JWT_SECRET || 'cryptoconnect_jwt_secret_dev_2026';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'cryptoconnect_refresh_secret_dev_2026';

  const accessToken = jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

  const refreshToken = jwt.sign({ id: userId }, refreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
};

// INSCRIPTION
exports.register = async (req, res) => {
  try {
    const { email, password, name, phoneNumber, phone } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();
    const finalPhone = phoneNumber || phone || '';

    if (!cleanEmail || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Le nom, l\'email et le mot de passe sont requis.',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Cet email est déjà associé à un compte.',
        });
      }

      const user = await User.create({
        email: cleanEmail,
        password,
        name,
        phoneNumber: finalPhone,
        authProvider: 'local',
      });

      const tokens = generateTokens(user._id);
      user.refreshTokens.push({ token: tokens.refreshToken, createdAt: new Date() });
      await user.save();

      return res.status(201).json({
        success: true,
        message: 'Compte créé avec succès !',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          phoneNumber: user.phoneNumber,
          identityVerificationStatus: user.identityVerificationStatus,
          avatarUrl: user.avatarUrl,
        },
      });
    } else {
      // Mode autonome dbStore
      const existingUser = dbStore.findUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Cet email est déjà associé à un compte.',
        });
      }

      const user = await dbStore.createUser({
        name,
        email: cleanEmail,
        password,
        phoneNumber: finalPhone,
      });

      const tokens = generateTokens(user._id);

      return res.status(201).json({
        success: true,
        message: 'Compte créé avec succès !',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          phoneNumber: user.phoneNumber,
          identityVerificationStatus: user.identityVerificationStatus,
          avatarUrl: user.avatarUrl,
        },
      });
    }
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du compte.',
    });
  }
};

// CONNEXION
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez saisir votre email et votre mot de passe.',
      });
    }

    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: cleanEmail }).select('+password');
    } else {
      user = dbStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides (email ou mot de passe incorrect).',
      });
    }

    if (typeof user.isLocked === 'function' && user.isLocked()) {
      return res.status(423).json({
        success: false,
        error: 'Compte temporairement verrouillé pour des raisons de sécurité. Réessayez plus tard.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      if (typeof user.incLoginAttempts === 'function') await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides (email ou mot de passe incorrect).',
      });
    }

    if (user.accountStatus && user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Compte suspendu ou désactivé.',
      });
    }

    if (typeof user.resetLoginAttempts === 'function') await user.resetLoginAttempts();

    const tokens = generateTokens(user._id);

    if (Array.isArray(user.refreshTokens)) {
      user.refreshTokens.push({ token: tokens.refreshToken, createdAt: new Date() });
      if (typeof user.save === 'function') await user.save();
    }

    // Définir un cookie sécurisé
    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: `Connexion réussie ! Heureux de vous revoir, ${user.name}.`,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        phoneNumber: user.phoneNumber,
        identityVerificationStatus: user.identityVerificationStatus,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion.',
    });
  }
};

// OBTENIR L'UTILISATEUR ACTUEL
exports.me = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié.',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        phoneNumber: user.phoneNumber,
        languagePreference: user.languagePreference || 'fr',
        identityVerificationStatus: user.identityVerificationStatus || 'not_started',
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified || false,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur me:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil.',
    });
  }
};

// DÉCONNEXION
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.clearCookie('accessToken');
    res.json({
      success: true,
      message: 'Déconnexion réussie.',
    });
  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion.',
    });
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token manquant.' });
    }

    const secret = process.env.JWT_REFRESH_SECRET || 'cryptoconnect_refresh_secret_dev_2026';
    const decoded = jwt.verify(refreshToken, secret);

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id);
    } else {
      user = dbStore.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Utilisateur introuvable.' });
    }

    const tokens = generateTokens(user._id);
    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Refresh token expiré ou invalide.' });
  }
};

// Google OAuth stub
exports.googleAuth = (req, res, next) => next();
exports.googleCallback = (req, res) => {
  res.redirect('/?auth=success');
};
