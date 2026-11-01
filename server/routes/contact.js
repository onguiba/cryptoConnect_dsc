/**
 * CONTACT ROUTES
 * Formulaire de contact public (sans authentification obligatoire)
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Request = require('../models/Request');
const dbStore = require('../services/dbStore');
const { validateContact, handleValidationErrors } = require('../middlewares/validators');
const { contactLimiter } = require('../middlewares/rateLimiter');

router.post('/', contactLimiter, validateContact, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const userId = req.user?._id || req.user?.id || null;

    let request = null;

    if (mongoose.connection.readyState === 1) {
      request = await Request.create({
        user: userId,
        guestName: name,
        guestEmail: email,
        requestType: 'contact_form',
        serviceName: subject,
        subject: `Contact: ${subject}`,
        description: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        status: 'pending',
        statusLabel: 'En attente',
        responseMessage: 'Votre message a bien été reçu. Notre équipe vous répondra sous 24 heures.',
      });
    } else {
      request = dbStore.createRequest({
        user: userId,
        guestName: name,
        guestEmail: email,
        requestType: 'contact_form',
        serviceName: subject,
        subject: `Contact: ${subject}`,
        description: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Votre message a bien été transmis. Un conseiller vous répondra sous 24h ouvrées.',
      requestId: request?._id || request?.id || request?.requestId,
      estimatedResponseTime: '24 heures',
    });
  } catch (error) {
    console.error('Erreur contact:', error);
    // Sauvegarde de secours dans dbStore
    const fallback = dbStore.createRequest({
      guestName: req.body.name,
      guestEmail: req.body.email,
      requestType: 'contact_form',
      subject: req.body.subject,
      description: req.body.message,
    });

    res.status(201).json({
      success: true,
      message: 'Votre message a bien été transmis. Un conseiller vous répondra sous 24h ouvrées.',
      requestId: fallback.id,
      estimatedResponseTime: '24 heures',
    });
  }
});

module.exports = router;
