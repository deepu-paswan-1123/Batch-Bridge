const express = require('express');
const router = express.Router();
const reqController = require('../controllers/requirement.controller');
const quoteController = require('../controllers/quote.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, reqController.list);
router.post('/', authenticate, requireRole('buyer', 'admin'), reqController.create);
router.get('/:id', authenticate, reqController.getById);
router.post('/:id/invitations', authenticate, reqController.invite);

// Sub-routes for quotes
router.post('/:id/quotes', authenticate, requireRole('manufacturer', 'admin'), quoteController.create);
router.get('/:id/quotes', authenticate, quoteController.getByRequirement);

module.exports = router;
