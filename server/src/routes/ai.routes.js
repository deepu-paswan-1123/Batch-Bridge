const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/parse-requirement', aiController.parseRequirement);
router.post('/match', aiController.match);
router.post('/compare-quotes', aiController.compareQuotesEndpoint);

module.exports = router;
