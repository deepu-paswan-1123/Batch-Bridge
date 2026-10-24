const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('admin'));

router.get('/verification-queue', adminController.getVerificationQueue);
router.patch('/manufacturers/:id/verification', adminController.recordVerificationCheck);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/disputes', adminController.getDisputes);
router.patch('/disputes/:id', adminController.resolveDispute);

module.exports = router;
