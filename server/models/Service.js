/**
 * SERVICE MODEL
 * Modèle de données pour les services proposés
 */

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Le nom du service est requis'],
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    benefits: [
      {
        type: String,
      },
    ],
    accessSteps: [
      {
        type: String,
      },
    ],
    icon: {
      type: String,
      default: 'service',
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    requiresIdentityVerification: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index
serviceSchema.index({ isActive: 1, displayOrder: 1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
