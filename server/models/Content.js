/**
 * CONTENT MODEL
 * Modèle de données pour les contenus éducatifs
 */

const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ['article', 'tutorial', 'video', 'guide'],
      default: 'article',
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    difficultyLabel: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
    },
    readingTime: {
      type: String,
      default: '5 min',
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    summaryPoints: [
      {
        type: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche
contentSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });
contentSchema.index({ isPublished: 1, publishedAt: -1 });
contentSchema.index({ difficultyLevel: 1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
