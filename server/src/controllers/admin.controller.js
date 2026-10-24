const db = require('../models/dbStore');

exports.getVerificationQueue = async (req, res) => {
  try {
    const checks = db.collection('verificationChecks').find();
    const manufacturers = db.collection('manufacturers').find();

    const queue = checks.map(c => {
      const m = manufacturers.find(item => item._id === c.manufacturerId);
      return {
        ...c,
        manufacturerName: m ? m.businessName : 'Unknown Factory',
        location: m ? m.location : null
      };
    });

    res.json({ queue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.recordVerificationCheck = async (req, res) => {
  try {
    const manufacturerId = req.params.id;
    const m = db.collection('manufacturers').findById(manufacturerId);
    if (!m) return res.status(404).json({ error: 'Manufacturer not found' });

    const { checkType, title, status = 'verified', scope, evidenceRef, notes } = req.body;
    if (!checkType || !title) {
      return res.status(400).json({ error: 'Check type and title are required' });
    }

    const check = db.collection('verificationChecks').create({
      manufacturerId,
      checkType,
      title,
      status,
      checkedBy: req.user.name,
      checkedAt: new Date().toISOString(),
      scope: scope || 'Verified by admin review team against statutory evidence.',
      evidenceRef: evidenceRef || `EVID-${Date.now()}`,
      notes: notes || ''
    });

    // If manufacturer was pending, activate them
    if (m.status === 'pending') {
      db.collection('manufacturers').findByIdAndUpdate(m._id, { status: 'active' });
    }

    db.logAudit({
      actorId: req.user._id,
      entityType: 'verificationCheck',
      entityId: check._id,
      action: 'RECORD_VERIFICATION_CHECK',
      after: check
    });

    res.status(201).json({ check });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = db.collection('auditLogs').find();
    // sort descending
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDisputes = async (req, res) => {
  try {
    const disputes = db.collection('disputes').find();
    res.json({ disputes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const dispute = db.collection('disputes').findById(req.params.id);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

    const { status = 'resolved', resolution } = req.body;
    const updated = db.collection('disputes').findByIdAndUpdate(dispute._id, {
      status,
      resolution: resolution || 'Resolved by platform admin after reviewing spec sheet and QC report.'
    });

    db.logAudit({
      actorId: req.user._id,
      entityType: 'dispute',
      entityId: dispute._id,
      action: `RESOLVE_DISPUTE_${status.toUpperCase()}`,
      after: updated
    });

    res.json({ dispute: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
