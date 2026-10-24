const db = require('../models/dbStore');

const ORDER_STAGES = [
  'confirmed',
  'materials',
  'production',
  'inspection',
  'dispatched',
  'delivered',
  'closed'
];

exports.create = async (req, res) => {
  try {
    const { quoteId } = req.body;
    const quote = db.collection('quotes').findById(quoteId);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    const requirement = db.collection('requirements').findById(quote.requirementId);
    if (!requirement) return res.status(404).json({ error: 'Requirement not found' });

    if (requirement.buyerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to place order for this requirement' });
    }

    const defaultMilestones = [
      {
        stage: 'confirmed',
        title: 'Order Terms Confirmed & Spec Locked',
        completed: true,
        timestamp: new Date().toISOString(),
        notes: 'Commercial terms agreed. Production slot reserved.',
        evidenceUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        defectRatePercent: 0
      },
      {
        stage: 'materials',
        title: 'Yarn & Raw Material Sourcing',
        completed: false,
        timestamp: null,
        notes: 'Pending dye lot batch check',
        evidenceUrl: null,
        defectRatePercent: null
      },
      {
        stage: 'production',
        title: 'Bulk Cutting, Printing & Sewing',
        completed: false,
        timestamp: null,
        notes: null,
        evidenceUrl: null,
        defectRatePercent: null
      },
      {
        stage: 'inspection',
        title: 'Pre-Shipment Quality Inspection (AQL 2.5)',
        completed: false,
        timestamp: null,
        notes: null,
        evidenceUrl: null,
        defectRatePercent: null
      },
      {
        stage: 'dispatched',
        title: 'Packaging & Dispatch',
        completed: false,
        timestamp: null,
        notes: null,
        evidenceUrl: null,
        defectRatePercent: null
      },
      {
        stage: 'delivered',
        title: 'Delivery Receipt & Inspection Signoff',
        completed: false,
        timestamp: null,
        notes: null,
        evidenceUrl: null,
        defectRatePercent: null
      },
      {
        stage: 'closed',
        title: 'Order Closed & Review Released',
        completed: false,
        timestamp: null,
        notes: null,
        evidenceUrl: null,
        defectRatePercent: null
      }
    ];

    const order = db.collection('orders').create({
      requirementId: requirement._id,
      quoteId: quote._id,
      buyerId: req.user._id,
      buyerName: req.user.name,
      manufacturerId: quote.manufacturerId,
      manufacturerName: quote.manufacturerName,
      agreedSpecs: requirement.specs,
      total: quote.totalAmount,
      status: 'confirmed',
      milestones: defaultMilestones
    });

    db.collection('quotes').findByIdAndUpdate(quote._id, { status: 'accepted' });
    db.collection('requirements').findByIdAndUpdate(requirement._id, { status: 'awarded' });

    db.logAudit({
      actorId: req.user._id,
      entityType: 'order',
      entityId: order._id,
      action: 'CONFIRM_ORDER',
      after: order
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const user = req.user;
    let orders = db.collection('orders').find();

    if (user.role === 'buyer') {
      orders = orders.filter(o => o.buyerId === user._id);
    } else if (user.role === 'manufacturer') {
      const mfg = db.collection('manufacturers').findOne({ owner: user._id });
      if (mfg) {
        orders = orders.filter(o => o.manufacturerId === mfg._id);
      }
    }

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = db.collection('orders').findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const requirement = db.collection('requirements').findById(order.requirementId);
    const quote = db.collection('quotes').findById(order.quoteId);
    const disputes = db.collection('disputes').find({ orderId: order._id });

    res.json({
      order,
      requirement,
      quote,
      disputes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const order = db.collection('orders').findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const { stage, completed = true, notes, evidenceUrl, defectRatePercent } = req.body;
    if (!stage || !ORDER_STAGES.includes(stage)) {
      return res.status(400).json({ error: `Valid milestone stage required (${ORDER_STAGES.join(', ')})` });
    }

    const updatedMilestones = order.milestones.map(m => {
      if (m.stage === stage) {
        return {
          ...m,
          completed: completed !== undefined ? completed : true,
          timestamp: new Date().toISOString(),
          notes: notes !== undefined ? notes : m.notes,
          evidenceUrl: evidenceUrl !== undefined ? evidenceUrl : m.evidenceUrl,
          defectRatePercent: defectRatePercent !== undefined ? defectRatePercent : m.defectRatePercent
        };
      }
      return m;
    });

    const updated = db.collection('orders').findByIdAndUpdate(order._id, {
      milestones: updatedMilestones,
      status: stage
    });

    db.logAudit({
      actorId: req.user._id,
      entityType: 'order',
      entityId: order._id,
      action: `MILESTONE_UPDATED_${stage.toUpperCase()}`,
      after: { stage, notes, defectRatePercent }
    });

    res.json({ order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.openDispute = async (req, res) => {
  try {
    const order = db.collection('orders').findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const { category, evidence, notes } = req.body;
    const dispute = db.collection('disputes').create({
      orderId: order._id,
      openedBy: req.user._id,
      openedByName: req.user.name,
      category: category || 'quality_defect',
      evidence: evidence || '',
      notes: notes || '',
      status: 'open',
      resolution: null
    });

    db.collection('orders').findByIdAndUpdate(order._id, { status: 'disputed' });

    db.logAudit({
      actorId: req.user._id,
      entityType: 'dispute',
      entityId: dispute._id,
      action: 'OPEN_DISPUTE',
      after: dispute
    });

    res.status(201).json({ dispute });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
