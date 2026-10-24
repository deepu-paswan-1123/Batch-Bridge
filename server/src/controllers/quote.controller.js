const db = require('../models/dbStore');
const { compareQuotes } = require('../services/ai.service');

exports.create = async (req, res) => {
  try {
    const requirementId = req.params.id;
    const reqDoc = db.collection('requirements').findById(requirementId);
    if (!reqDoc) return res.status(404).json({ error: 'Requirement not found' });

    const mfg = db.collection('manufacturers').findOne({ owner: req.user._id });
    if (!mfg && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Must have a registered manufacturer profile to quote' });
    }

    const {
      lineItems = [],
      setupFee = 0,
      sampleFee = mfg?.sampleFee || 500,
      shippingFee = 0,
      taxRatePercent = 12,
      terms = '50% advance, 50% upon pre-dispatch inspection approval',
      leadTimeDays = mfg?.leadTimeDays?.min || 25,
      validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      inclusions = [],
      exclusions = []
    } = req.body;

    const qty = reqDoc.quantity || 1000;
    const baseTotal = lineItems.reduce((sum, item) => sum + (Number(item.unitCost) || 0) * qty, 0);
    const taxAmount = ((baseTotal + Number(setupFee) + Number(shippingFee)) * Number(taxRatePercent)) / 100;
    const totalAmount = baseTotal + Number(setupFee) + Number(shippingFee) + taxAmount;
    const unitLandedCost = Number((totalAmount / qty).toFixed(2));

    const quote = db.collection('quotes').create({
      requirementId,
      manufacturerId: mfg ? mfg._id : 'admin_mfg',
      manufacturerName: mfg ? mfg.businessName : req.user.name,
      lineItems,
      setupFee: Number(setupFee),
      sampleFee: Number(sampleFee),
      shippingFee: Number(shippingFee),
      taxRatePercent: Number(taxRatePercent),
      taxAmount,
      totalAmount,
      unitLandedCost,
      terms,
      leadTimeDays: Number(leadTimeDays),
      validUntil,
      inclusions,
      exclusions,
      status: 'submitted',
      revision: 1
    });

    // Update requirement status if it was open/matching
    if (['open', 'matching'].includes(reqDoc.status)) {
      db.collection('requirements').findByIdAndUpdate(reqDoc._id, { status: 'quotes_received' });
    }

    db.logAudit({
      actorId: req.user._id,
      entityType: 'quote',
      entityId: quote._id,
      action: 'SUBMIT_QUOTE',
      after: quote
    });

    res.status(201).json({ quote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByRequirement = async (req, res) => {
  try {
    const requirementId = req.params.id;
    const reqDoc = db.collection('requirements').findById(requirementId);
    if (!reqDoc) return res.status(404).json({ error: 'Requirement not found' });

    const quotes = db.collection('quotes').find({ requirementId });
    const normalizedComparison = compareQuotes(quotes, reqDoc.quantity);

    res.json({
      quotes,
      comparison: normalizedComparison
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const quote = db.collection('quotes').findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    const mfg = db.collection('manufacturers').findById(quote.manufacturerId);
    const reqDoc = db.collection('requirements').findById(quote.requirementId);

    const isMfgOwner = mfg && mfg.owner === req.user._id;
    const isBuyerOwner = reqDoc && reqDoc.buyerId === req.user._id;
    const isAdmin = req.user.role === 'admin';

    if (!isMfgOwner && !isBuyerOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to update this quote' });
    }

    // Status transition checks
    if (req.body.status) {
      if (['accepted', 'rejected'].includes(req.body.status) && !isBuyerOwner && !isAdmin) {
        return res.status(403).json({ error: 'Only the buyer can accept or reject a quote' });
      }
    }

    const before = { ...quote };
    const updatePayload = { ...req.body };
    if (isMfgOwner && (req.body.lineItems || req.body.setupFee || req.body.leadTimeDays)) {
      updatePayload.revision = (quote.revision || 1) + 1;
      updatePayload.status = 'revised';
    }

    const updated = db.collection('quotes').findByIdAndUpdate(quote._id, updatePayload);

    // If accepted, update requirement status to sample_stage or awarded
    if (req.body.status === 'accepted') {
      db.collection('requirements').findByIdAndUpdate(quote.requirementId, {
        status: 'sample_stage'
      });
    }

    db.logAudit({
      actorId: req.user._id,
      entityType: 'quote',
      entityId: quote._id,
      action: `UPDATE_QUOTE_${req.body.status || 'EDIT'}`,
      before,
      after: updated
    });

    res.json({ quote: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
