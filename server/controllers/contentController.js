/**
 * CONTENT CONTROLLER
 * Gestion des contenus éducatifs (Mongoose & Autonomous Mode)
 */

const mongoose = require('mongoose');
const Content = require('../models/Content');
const dbStore = require('../services/dbStore');

exports.getAllContent = async (req, res) => {
  try {
    const { difficultyLevel, search } = req.query;
    let content = [];

    if (mongoose.connection.readyState === 1) {
      const filter = { isPublished: true };
      if (difficultyLevel && difficultyLevel !== 'all') {
        filter.difficultyLevel = difficultyLevel.toLowerCase();
      }
      let query = Content.find(filter);
      if (search) {
        query = query.find({ $text: { $search: search } });
      }
      content = await query.sort({ publishedAt: -1 });
    } else {
      content = dbStore.getContents({
        isPublished: true,
        difficultyLevel,
      });

      if (search) {
        const q = search.toLowerCase();
        content = content.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.excerpt.toLowerCase().includes(q) ||
            (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }
    }

    res.json({
      success: true,
      content,
      total: content.length,
    });
  } catch (error) {
    console.error('Erreur getAllContent:', error);
    const content = dbStore.getContents();
    res.json({
      success: true,
      content,
      total: content.length,
    });
  }
};

exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    let content = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
      content = await Content.findOne({ ...query, isPublished: true });
      if (content) {
        content.views = (content.views || 0) + 1;
        await content.save();
      }
    } else {
      content = dbStore.findContent(id);
      if (content) {
        content.views = (content.views || 0) + 1;
        await content.save();
      }
    }

    if (!content) {
      content = dbStore.findContent(id);
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Contenu introuvable.',
      });
    }

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('Erreur getContentById:', error);
    const content = dbStore.findContent(req.params.id);
    if (content) {
      return res.json({ success: true, content });
    }
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du contenu.',
    });
  }
};

exports.searchContent = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 1 || query.trim().length > 200) {
      return res.status(400).json({
        success: false,
        error: 'La requête doit contenir entre 1 et 200 caractères.',
      });
    }

    const q = query.toLowerCase().trim();
    let results = [];

    if (mongoose.connection.readyState === 1) {
      try {
        results = await Content.find({
          $text: { $search: query },
          isPublished: true,
        }).limit(20);
      } catch (err) {
        // Fallback regex
        results = await Content.find({
          title: { $regex: q, $options: 'i' },
          isPublished: true,
        }).limit(20);
      }
    } else {
      const all = dbStore.getContents({ isPublished: true });
      results = all.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.excerpt.toLowerCase().includes(q) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    res.json({
      success: true,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error('Erreur searchContent:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche.',
    });
  }
};
