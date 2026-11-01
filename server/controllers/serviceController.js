/**
 * SERVICE CONTROLLER
 * Gestion des services (Mongoose & Autonomous Mode)
 */

const mongoose = require('mongoose');
const Service = require('../models/Service');
const dbStore = require('../services/dbStore');

exports.getAllServices = async (req, res) => {
  try {
    let services = [];

    if (mongoose.connection.readyState === 1) {
      services = await Service.find({ isActive: true }).sort({ displayOrder: 1 });
    } else {
      services = dbStore.getServices({ isActive: true });
    }

    res.json({
      success: true,
      services,
      total: services.length,
    });
  } catch (error) {
    console.error('Erreur getAllServices:', error);
    // Fallback gracieux sur dbStore
    const services = dbStore.getServices({ isActive: true });
    res.json({
      success: true,
      services,
      total: services.length,
    });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    let service = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
      service = await Service.findOne({ ...query, isActive: true });
    } else {
      service = dbStore.findService(id);
    }

    if (!service) {
      // Vérifier le fallback dans dbStore
      service = dbStore.findService(id);
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service introuvable.',
      });
    }

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Erreur getServiceById:', error);
    const service = dbStore.findService(req.params.id);
    if (service) {
      return res.json({ success: true, service });
    }
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du service.',
    });
  }
};
