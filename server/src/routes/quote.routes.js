const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quote.controller');
const { authenticate } = require('../middleware/auth');

router.patch('/:id', authenticate, quoteController.update);

module.exports = router;
