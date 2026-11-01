/**
 * REQUEST MODEL
 * Modèle de données pour les demandes clients
 */

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    guestName: {
      type: String,
      trim: true,
    },
    guestEmail: {
      type: String,
      trim: true,
    },
    requestType: {
      type: String,
      enum: ['service_inquiry', 'support', 'contact_form', 'kyc', 'other'],
      default: 'service_inquiry',
    },
    serviceName: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Le sujet est requis'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    statusLabel: {
      type: String,
      default: 'En attente',
    },
    responseMessage: {
      type: String,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index
requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ status: 1 });

// Générer un ID lisible
requestSchema.pre('save', function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    this.requestId = `REQ-${year}-${random}`;
  }
  next();
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
