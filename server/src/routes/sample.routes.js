const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sample.controller');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, sampleController.create);
router.get('/', authenticate, sampleController.list);
router.patch('/:id', authenticate, sampleController.update);

module.exports = router;
