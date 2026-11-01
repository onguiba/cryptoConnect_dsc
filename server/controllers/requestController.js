/**
 * REQUEST CONTROLLER
 * Gestion des demandes clients (Mongoose & Autonomous Mode)
 */

const mongoose = require('mongoose');
const Request = require('../models/Request');
const dbStore = require('../services/dbStore');

exports.createRequest = async (req, res) => {
  try {
    const { serviceName, subject, description, requestType } = req.body;
    const userId = req.user?._id || req.user?.id;

    let request = null;

    if (mongoose.connection.readyState === 1) {
      request = await Request.create({
        user: userId,
        serviceName,
        subject,
        description,
        requestType: requestType || 'service_inquiry',
        status: 'pending',
        statusLabel: 'En attente',
        responseMessage: 'Votre demande a bien été reçue. Notre équipe vous répondra sous 24h.',
      });
    } else {
      request = dbStore.createRequest({
        user: userId,
        serviceName,
        subject,
        description,
        requestType: requestType || 'service_inquiry',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Demande transmise avec succès ! Réponse sous 24h.',
      request,
    });
  } catch (error) {
    console.error('Erreur createRequest:', error);
    // Fallback gracieux sur dbStore
    const fallbackReq = dbStore.createRequest({
      user: req.user?._id || req.user?.id,
      ...req.body,
    });
    res.status(201).json({
      success: true,
      message: 'Demande enregistrée avec succès.',
      request: fallbackReq,
    });
  }
};

exports.getUserRequests = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let requests = [];

    if (mongoose.connection.readyState === 1) {
      requests = await Request.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    } else {
      requests = dbStore.getRequests({ user: userId });
    }

    if (!requests || requests.length === 0) {
      // Retourner les demandes de l'utilisateur ou démonstration
      requests = dbStore.getRequests({ user: userId });
    }

    res.json({
      success: true,
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error('Erreur getUserRequests:', error);
    const requests = dbStore.getRequests({ user: req.user?._id || req.user?.id });
    res.json({
      success: true,
      requests,
      total: requests.length,
    });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    let request = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id, user: userId } : { requestId: id, user: userId };
      request = await Request.findOne(query);
    } else {
      request = dbStore.findRequestById(id);
    }

    if (!request) {
      request = dbStore.findRequestById(id);
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande introuvable.',
      });
    }

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error('Erreur getRequestById:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la demande.',
    });
  }
};
