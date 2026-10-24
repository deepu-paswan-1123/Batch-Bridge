const db = require('../models/dbStore');

exports.list = async (req, res) => {
  try {
    const { category, minMoq, maxMoq, city, state, search } = req.query;

    let items = db.collection('manufacturers').find({ status: 'active' });

    if (category && category !== 'all') {
      items = items.filter(m => m.categories?.some(c => c.toLowerCase() === category.toLowerCase()));
    }
    if (minMoq) {
      items = items.filter(m => (m.moq?.min || 0) <= parseInt(minMoq, 10));
    }
    if (maxMoq) {
      items = items.filter(m => (m.moq?.max || 999999) >= parseInt(maxMoq, 10));
    }
    if (city) {
      items = items.filter(m => m.location?.city?.toLowerCase() === city.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(m =>
        m.businessName.toLowerCase().includes(q) ||
        m.categories?.some(c => c.toLowerCase().includes(q)) ||
        m.capabilities?.some(c => c.toLowerCase().includes(q)) ||
        m.location?.city?.toLowerCase().includes(q)
      );
    }

    // Attach verification summary for each
    const enriched = items.map(m => {
      const checks = db.collection('verificationChecks').find({
        manufacturerId: m._id,
        status: 'verified'
      });
      return {
        ...m,
        verificationChecks: checks
      };
    });

    res.json({
      total: enriched.length,
      manufacturers: enriched
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const m = db.collection('manufacturers').findById(req.params.id);
    if (!m) {
      return res.status(404).json({ error: 'Manufacturer not found' });
    }

    const checks = db.collection('verificationChecks').find({
      manufacturerId: m._id,
      status: 'verified'
    });

    const reviews = db.collection('reviews').find({ revieweeId: m._id });

    res.json({
      manufacturer: {
        ...m,
        verificationChecks: checks,
        reviews
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const categories = req.body.categories && req.body.categories.length > 0 
      ? req.body.categories.map(c => c.toLowerCase().trim())
      : ['custom'];

    const doc = db.collection('manufacturers').create({
      owner: req.user?._id || 'anon_mfg',
      businessName: req.body.businessName || 'New Manufacturing Unit',
      categories,
      capabilities: req.body.capabilities || [],
      moq: req.body.moq || { min: 200, max: 2000 },
      capacityPerMonth: req.body.capacityPerMonth || 10000,
      leadTimeDays: req.body.leadTimeDays || { min: 15, max: 30 },
      sampleFee: req.body.sampleFee !== undefined ? Number(req.body.sampleFee) : 500,
      samplePolicy: req.body.samplePolicy || (req.body.sampleFee === 0 ? 'Digital approval / 3D proof only' : 'Physical swatches provided'),
      location: req.body.location || { city: 'Jaipur', state: 'Rajasthan', cluster: 'Industrial Area' },
      status: 'active',
      rating: 5.0,
      totalCompletedOrders: 0,
      contactEmail: req.body.contactEmail || req.user?.email || 'contact@factory.com',
      contactPhone: req.body.contactPhone || '+91 98000 00000',
      description: req.body.description || 'Specialised contract manufacturer with custom material and process setup.'
    });

    // Add baseline self-declared identity check
    db.collection('verificationChecks').create({
      manufacturerId: doc._id,
      checkType: 'identity_checked',
      title: 'Business Registration / Self-Declaration',
      status: 'verified',
      checkedBy: 'Platform Auto-Check / Admin Queue',
      checkedAt: new Date().toISOString(),
      scope: `Onboarded with registered domain: ${categories.join(', ')}. Capabilities: ${(req.body.capabilities || []).join(', ')}.`,
      evidenceRef: `REG-ONBOARD-${Date.now().toString().slice(-6)}`
    });

    db.logAudit({
      actorId: req.user?._id || 'system',
      entityType: 'manufacturer',
      entityId: doc._id,
      action: 'REGISTER_NEW_COMPANY',
      after: doc
    });

    res.status(201).json({ manufacturer: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const m = db.collection('manufacturers').findById(req.params.id);
    if (!m) return res.status(404).json({ error: 'Manufacturer not found' });

    const before = { ...m };
    const updated = db.collection('manufacturers').findByIdAndUpdate(req.params.id, req.body);

    db.logAudit({
      actorId: req.user?._id || 'system',
      entityType: 'manufacturer',
      entityId: m._id,
      action: 'UPDATE_PROFILE',
      before,
      after: updated
    });

    res.json({ manufacturer: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
