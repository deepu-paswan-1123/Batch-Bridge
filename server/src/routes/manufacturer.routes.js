const express = require('express');
const router = express.Router();
const mfgController = require('../controllers/manufacturer.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', mfgController.list);
router.get('/:id', mfgController.getById);
router.post('/', authenticate, requireRole('manufacturer', 'admin'), mfgController.create);
router.patch('/:id', authenticate, mfgController.update);

module.exports = router;
