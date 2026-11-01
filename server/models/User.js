/**
 * USER MODEL
 * Modèle de données pour les utilisateurs
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Informations de base
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: {
      type: String,
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
      select: false, // Ne pas retourner par défaut
    },
    phoneNumber: {
      type: String,
      trim: true,
    },

    // Authentification Google
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    // Paramètres
    languagePreference: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr',
    },
    avatarUrl: {
      type: String,
    },

    // Vérifications
    emailVerified: {
      type: Boolean,
      default: false,
    },
    identityVerificationStatus: {
      type: String,
      enum: ['not_started', 'pending', 'verified', 'rejected'],
      default: 'not_started',
    },
    identityVerificationRejectionReason: {
      type: String,
    },

    // Rôle utilisateur
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user',
    },

    // Statut du compte
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },

    // Favoris
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
      },
    ],

    // Tokens de refresh
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Sécurité
    lastLoginAt: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index pour performances (email et googleId sont déjà indexés par unique: true)


// ============================================================
// MIDDLEWARE PRE-SAVE : Hachage du mot de passe
// ============================================================
userSchema.pre('save', async function (next) {
  // Si le mot de passe n'a pas été modifié, continuer
  if (!this.isModified('password')) {
    return next();
  }

  // Si l'authentification est via Google, ne pas hasher
  if (this.authProvider === 'google' && !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================
// MÉTHODES
// ============================================================

// Comparer le mot de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Vérifier si le compte est verrouillé
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Incrémenter les tentatives de connexion
userSchema.methods.incLoginAttempts = async function () {
  // Si le verrouillage a expiré, réinitialiser
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 heures

  // Verrouiller le compte après 5 tentatives
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return await this.updateOne(updates);
};

// Réinitialiser les tentatives de connexion
userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $set: { loginAttempts: 0, lastLoginAt: Date.now() },
    $unset: { lockUntil: 1 },
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
