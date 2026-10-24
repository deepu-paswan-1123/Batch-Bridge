const db = require('../models/dbStore');

exports.create = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      quantity,
      budget,
      deadlineDays,
      location,
      specs,
      visibility = 'public',
      invitedManufacturerIds = []
    } = req.body;

    if (!title || !category || !quantity) {
      return res.status(400).json({ error: 'Title, category, and quantity are required' });
    }

    const doc = db.collection('requirements').create({
      buyerId: req.user._id,
      buyerName: req.user.name,
      title,
      category,
      description: description || '',
      quantity: Number(quantity),
      budget: budget ? Number(budget) : null,
      deadlineDays: deadlineDays ? Number(deadlineDays) : 30,
      location: location || { city: 'Jaipur', state: 'Rajasthan' },
      specs: specs || {
        material: 'Standard',
        dimensions: 'Standard',
        tolerances: '+/- 1.5 cm',
        packaging: 'Standard polybags',
        acceptableDefects: 'AQL 2.5'
      },
      visibility,
      invitedManufacturerIds,
      status: 'open'
    });

    db.logAudit({
      actorId: req.user._id,
      entityType: 'requirement',
      entityId: doc._id,
      action: 'CREATE_REQUIREMENT',
      after: doc
    });

    res.status(201).json({ requirement: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const user = req.user;
    let reqs = db.collection('requirements').find();

    if (user.role === 'buyer') {
      // Buyer sees their own requirements
      reqs = reqs.filter(r => r.buyerId === user._id);
    } else if (user.role === 'manufacturer') {
      const mfg = db.collection('manufacturers').findOne({ owner: user._id });
      reqs = reqs.filter(r => {
        if (r.visibility === 'public') return true;
        if (mfg && r.invitedManufacturerIds?.includes(mfg._id)) return true;
        return false;
      });
    }

    // Attach quote counts
    const enriched = reqs.map(r => {
      const quotes = db.collection('quotes').find({ requirementId: r._id });
      return {
        ...r,
        quotesCount: quotes.length
      };
    });

    res.json({ requirements: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = db.collection('requirements').findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    const quotes = db.collection('quotes').find({ requirementId: doc._id });
    const samples = db.collection('samples').find({ requirementId: doc._id });

    res.json({
      requirement: doc,
      quotes,
      samples
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.invite = async (req, res) => {
  try {
    const { manufacturerIds } = req.body;
    const reqDoc = db.collection('requirements').findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ error: 'Requirement not found' });

    if (reqDoc.buyerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to invite manufacturers for this requirement' });
    }

    const updated = db.collection('requirements').findByIdAndUpdate(reqDoc._id, {
      invitedManufacturerIds: Array.from(new Set([...(reqDoc.invitedManufacturerIds || []), ...(manufacturerIds || [])])),
      status: reqDoc.status === 'open' ? 'matching' : reqDoc.status
    });

    res.json({ requirement: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
