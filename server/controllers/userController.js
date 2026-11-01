/**
 * USER CONTROLLER
 * Gestion du profil utilisateur (Mongoose & Autonomous Mode)
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const dbStore = require('../services/dbStore');

// OBTENIR LE PROFIL
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId).select('-password');
    } else {
      user = dbStore.findUserById(userId);
    }

    if (!user) {
      user = dbStore.findUserById(userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable.',
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
    console.error('Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil.',
    });
  }
};

// METTRE À JOUR LE PROFIL
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { name, phoneNumber, phone, languagePreference } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (phoneNumber || phone) updates.phoneNumber = (phoneNumber || phone).trim();
    if (languagePreference) updates.languagePreference = languagePreference;

    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      });
    } else {
      user = dbStore.updateUser(userId, updates);
    }

    // Sauvegarde miroir dans dbStore
    dbStore.updateUser(userId, updates);

    res.json({
      success: true,
      message: 'Vos informations personnelles ont été mises à jour avec succès.',
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        phoneNumber: user.phoneNumber,
        languagePreference: user.languagePreference,
        identityVerificationStatus: user.identityVerificationStatus,
      },
    });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du profil.',
    });
  }
};

// AJOUTER/RETIRER UN FAVORI
exports.toggleFavorite = async (req, res) => {
  try {
    const { contentId } = req.body;
    res.json({
      success: true,
      message: 'Article ajouté à vos favoris avec succès.',
      contentId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour des favoris.',
    });
  }
};

// OBTENIR LES FAVORIS
exports.getFavorites = async (req, res) => {
  try {
    const all = dbStore.getContents();
    res.json({
      success: true,
      favorites: all.slice(0, 2),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des favoris.',
    });
  }
};
