/**
 * IDENTITY VERIFICATION MODEL
 * Modèle de données pour les vérifications KYC
 */

const mongoose = require('mongoose');

const identityVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    documentType: {
      type: String,
      enum: ['national_id', 'passport', 'driver_license'],
      required: true,
    },
    documentName: {
      type: String,
    },
    documentUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['not_started', 'pending', 'verified', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index
identityVerificationSchema.index({ status: 1 });

const IdentityVerification = mongoose.model('IdentityVerification', identityVerificationSchema);

module.exports = IdentityVerification;
