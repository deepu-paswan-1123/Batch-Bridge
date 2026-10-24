const db = require('../models/dbStore');

exports.create = async (req, res) => {
  try {
    const { quoteId, notes, shippingAddress } = req.body;
    const quote = db.collection('quotes').findById(quoteId);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    const requirement = db.collection('requirements').findById(quote.requirementId);
    if (!requirement) return res.status(404).json({ error: 'Requirement not found' });

    if (requirement.buyerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the requirement buyer can order samples' });
    }

    const sample = db.collection('samples').create({
      requirementId: requirement._id,
      quoteId: quote._id,
      manufacturerId: quote.manufacturerId,
      buyerId: req.user._id,
      fee: quote.sampleFee || 500,
      status: 'requested',
      shippingAddress: shippingAddress || 'Buyer registered address',
      notes: notes || '',
      trackingNumber: null,
      carrier: null,
      feedback: null,
      approvedSpecVersion: 'v1.0'
    });

    db.collection('requirements').findByIdAndUpdate(requirement._id, {
      status: 'sample_stage'
    });

    db.logAudit({
      actorId: req.user._id,
      entityType: 'sample',
      entityId: sample._id,
      action: 'REQUEST_SAMPLE',
      after: sample
    });

    res.status(201).json({ sample });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const user = req.user;
    let samples = db.collection('samples').find();

    if (user.role === 'buyer') {
      samples = samples.filter(s => s.buyerId === user._id);
    } else if (user.role === 'manufacturer') {
      const mfg = db.collection('manufacturers').findOne({ owner: user._id });
      if (mfg) {
        samples = samples.filter(s => s.manufacturerId === mfg._id);
      }
    }

    res.json({ samples });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const sample = db.collection('samples').findById(req.params.id);
    if (!sample) return res.status(404).json({ error: 'Sample not found' });

    const allowedTransitions = {
      requested: ['confirmed'],
      confirmed: ['dispatched'],
      dispatched: ['received'],
      received: ['approved', 'rejected']
    };

    if (req.body.status && allowedTransitions[sample.status]) {
      if (!allowedTransitions[sample.status].includes(req.body.status) && req.user.role !== 'admin') {
        return res.status(400).json({
          error: `Invalid transition from ${sample.status} to ${req.body.status}`
        });
      }
    }

    const before = { ...sample };
    const updated = db.collection('samples').findByIdAndUpdate(sample._id, req.body);

    db.logAudit({
      actorId: req.user._id,
      entityType: 'sample',
      entityId: sample._id,
      action: `UPDATE_SAMPLE_${req.body.status || 'STATUS'}`,
      before,
      after: updated
    });

    res.json({ sample: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
