const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, orderController.create);
router.get('/', authenticate, orderController.list);
router.get('/:id', authenticate, orderController.getById);
router.patch('/:id/milestones', authenticate, orderController.updateMilestone);
router.post('/:id/disputes', authenticate, orderController.openDispute);

module.exports = router;
