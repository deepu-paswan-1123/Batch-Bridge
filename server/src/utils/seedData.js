const bcrypt = require('bcryptjs');
const db = require('../models/dbStore');

async function seed() {
  console.log('--- Seeding BatchBridge Database ---');

  // Clear existing
  ['users', 'buyerProfiles', 'manufacturers', 'requirements', 'quotes', 'samples', 'orders', 'verificationChecks', 'disputes', 'auditLogs'].forEach(col => {
    db.collection(col).clear();
  });

  const passwordHash = await bcrypt.hash('password123', 8);

  // 1. Users
  const adminUser = db.collection('users').create({
    _id: 'user_admin_01',
    name: 'Vikram Mehta (Chief Quality Officer)',
    email: 'admin@batchbridge.com',
    passwordHash,
    role: 'admin',
    status: 'active'
  });

  const buyerUser1 = db.collection('users').create({
    _id: 'user_buyer_01',
    name: 'Aarav Singhania',
    email: 'aarav@urbanthread.in',
    passwordHash,
    role: 'buyer',
    status: 'active'
  });

  const buyerUser2 = db.collection('users').create({
    _id: 'user_buyer_02',
    name: 'Pooja Iyer',
    email: 'pooja@zenroots.com',
    passwordHash,
    role: 'buyer',
    status: 'active'
  });

  const mfgUser1 = db.collection('users').create({
    _id: 'user_mfg_01',
    name: 'Rajesh K. Sharma',
    email: 'rajesh@jaipurexports.com',
    passwordHash,
    role: 'manufacturer',
    status: 'active'
  });

  const mfgUser2 = db.collection('users').create({
    _id: 'user_mfg_02',
    name: 'S. Ramanathan',
    email: 'ramanathan@tiruppurknits.com',
    passwordHash,
    role: 'manufacturer',
    status: 'active'
  });

  const mfgUser3 = db.collection('users').create({
    _id: 'user_mfg_03',
    name: 'Sunita Chawla',
    email: 'sunita@ecopackcraft.in',
    passwordHash,
    role: 'manufacturer',
    status: 'active'
  });

  // 2. Buyer Profiles
  db.collection('buyerProfiles').create({
    _id: 'bp_01',
    userId: buyerUser1._id,
    businessName: 'UrbanThread Apparel (D2C)',
    categoryInterests: ['apparel', 'textiles'],
    location: { city: 'Jaipur', state: 'Rajasthan' },
    phone: '+91 98290 11223'
  });

  db.collection('buyerProfiles').create({
    _id: 'bp_02',
    userId: buyerUser2._id,
    businessName: 'ZenRoots Organic Wellness',
    categoryInterests: ['packaging', 'apparel'],
    location: { city: 'Bengaluru', state: 'Karnataka' },
    phone: '+91 98450 44556'
  });

  // 3. Manufacturers
  const mfg1 = db.collection('manufacturers').create({
    _id: 'mfg_01',
    owner: mfgUser1._id,
    businessName: 'Sitapura Craft & Stitch Works',
    categories: ['apparel', 'textiles'],
    capabilities: ['screen printing', 'puff print', 'single jersey', 'french terry', 'bio-washed', 'cotton'],
    moq: { min: 300, max: 3000 },
    capacityPerMonth: 12000,
    leadTimeDays: { min: 20, max: 35 },
    sampleFee: 650,
    rating: 4.8,
    totalCompletedOrders: 34,
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      cluster: 'Sitapura Industrial Area, Phase II',
      geo: { type: 'Point', coordinates: [75.8362, 26.7766] }
    },
    status: 'active',
    contactEmail: 'orders@jaipurexports.com',
    contactPhone: '+91 141 277 8899',
    description: 'Specialised job-work unit catering to premium streetwear and boutique brands. In-house rotary and table screen printing, computerized embroidery, and garment washing setup.',
    evidence: []
  });

  const mfg2 = db.collection('manufacturers').create({
    _id: 'mfg_02',
    owner: mfgUser2._id,
    businessName: 'Tiruppur Precision Knitters Ltd',
    categories: ['apparel', 'textiles'],
    capabilities: ['combed cotton', 'dtf printing', 'embroidery', 'bio-washed', 'fleece', 'recycled polyester'],
    moq: { min: 500, max: 5000 },
    capacityPerMonth: 25000,
    leadTimeDays: { min: 18, max: 28 },
    sampleFee: 800,
    rating: 4.9,
    totalCompletedOrders: 82,
    location: {
      city: 'Tiruppur',
      state: 'Tamil Nadu',
      cluster: 'Avinashi Road Hosiery Cluster',
      geo: { type: 'Point', coordinates: [77.3411, 11.1085] }
    },
    status: 'active',
    contactEmail: 'contact@tiruppurknits.com',
    contactPhone: '+91 421 223 4455',
    description: 'OEKO-TEX compliant knitwear facility with dedicated pilot small-batch lines (500 to 5,000 units). Zero liquid discharge dyed yarns.',
    evidence: []
  });

  const mfg3 = db.collection('manufacturers').create({
    _id: 'mfg_03',
    owner: mfgUser3._id,
    businessName: 'EcoPack Craftworks & Rigid Boxes',
    categories: ['packaging'],
    capabilities: ['kraft paper', 'corrugated', 'die cut', 'foil stamping', 'rigid packaging', 'mailer boxes'],
    moq: { min: 250, max: 4000 },
    capacityPerMonth: 30000,
    leadTimeDays: { min: 14, max: 24 },
    sampleFee: 500,
    rating: 4.7,
    totalCompletedOrders: 47,
    location: {
      city: 'Surat',
      state: 'Gujarat',
      cluster: 'Sachin GIDC Industrial Estate',
      geo: { type: 'Point', coordinates: [72.8711, 21.0828] }
    },
    status: 'active',
    contactEmail: 'sales@ecopackcraft.in',
    contactPhone: '+91 261 289 1122',
    description: 'FSC-certified sustainable packaging facility specializing in rigid luxury mailers, magnetic clasp boxes, and embossed kraft sleeves.',
    evidence: []
  });

  // 4. Verification Checks (Documented evidence with dates & scopes)
  const checks = [
    {
      _id: 'chk_01',
      manufacturerId: mfg1._id,
      checkType: 'identity_checked',
      title: 'Udyam Registration & GST Verification',
      status: 'verified',
      checkedBy: adminUser.name,
      checkedAt: '2026-09-15T10:30:00Z',
      scope: 'Verified GSTIN (08AABCS1429Q1Z4) active status and factory lease deed in Sitapura Phase II.',
      evidenceRef: 'DOC-UDYAM-RJ-2026-0811'
    },
    {
      _id: 'chk_02',
      manufacturerId: mfg1._id,
      checkType: 'capability_evidence',
      title: 'Machine Calibration & Print Audits',
      status: 'verified',
      checkedBy: adminUser.name,
      checkedAt: '2026-09-18T14:00:00Z',
      scope: 'Inspection of 6-station pneumatic screen table and curing conveyor chamber.',
      evidenceRef: 'AUDIT-CAP-RJ-88'
    },
    {
      _id: 'chk_03',
      manufacturerId: mfg1._id,
      checkType: 'sample_reviewed',
      title: 'Physical Sample GSM & Shrinkage Test',
      status: 'verified',
      checkedBy: adminUser.name,
      checkedAt: '2026-10-02T11:15:00Z',
      scope: '240 GSM single jersey tested post 3 washes. Dimensional variation < 2.1%.',
      evidenceRef: 'LAB-SAMP-2026-904'
    },
    {
      _id: 'chk_04',
      manufacturerId: mfg1._id,
      checkType: 'production_history',
      title: 'Verified 1,500 Unit Order Dispatch',
      status: 'verified',
      checkedBy: adminUser.name,
      checkedAt: '2026-10-10T16:45:00Z',
      scope: 'E-way bill and signed delivery challan for 1,500 hoodies to Mumbai client.',
      evidenceRef: 'HIST-EWAY-2026-551'
    },
    {
      _id: 'chk_05',
      manufacturerId: mfg2._id,
      checkType: 'identity_checked',
      title: 'Statutory Identity & Factory License',
      status: 'verified',
      checkedBy: adminUser.name,
      checkedAt: '2026-08-20T09:00:00Z',
      scope: 'Tamil Nadu Pollution Control Board NOC and OEKO-TEX standard 100 certificates validated.',
      evidenceRef: 'DOC-TN-OEKOTEX-992'
    },
    {
      _id: 'chk_06',
      manufacturerId: mfg2._id,
      checkType: 'inspection_recorded',
      title: 'Pre-Shipment Random Inspection (PSI)',
      status: 'verified',
      checkedBy: adminUser.name,
      checkedAt: '2026-10-05T12:00:00Z',
      scope: 'Batch PSI report on 2,000 polos. Defect rate 1.2% (Passed AQL 2.5 standard).',
      evidenceRef: 'PSI-TIR-2026-104'
    },
    {
      _id: 'chk_07',
      manufacturerId: mfg3._id,
      checkType: 'identity_checked',
      title: 'FSC & DIC Unit Registration',
      status: 'verified',
      checkedBy: adminUser.name,
      checkedAt: '2026-09-01T15:20:00Z',
      scope: 'District Industries Centre Gujarat registration and FSC chain of custody certificate verified.',
      evidenceRef: 'DOC-FSC-GJ-310'
    }
  ];

  checks.forEach(c => db.collection('verificationChecks').create(c));

  // 5. Requirements
  const req1 = db.collection('requirements').create({
    _id: 'req_01',
    buyerId: buyerUser1._id,
    buyerName: buyerUser1.name,
    businessName: 'UrbanThread Apparel',
    title: '1,000 Custom Heavyweight Oversized Cotton T-Shirts',
    category: 'apparel',
    description: 'Looking to manufacture 1,000 units of 240 GSM 100% combed cotton oversized drop-shoulder tees with front puff print logo and back 4-color screen print. Need pre-shrunk bio-washed fabric with silicone softener wash.',
    quantity: 1000,
    budget: 185,
    deadlineDays: 30,
    location: { city: 'Jaipur', state: 'Rajasthan' },
    specs: {
      material: '100% Combed Compact Cotton, 240 GSM French Terry / Heavy Jersey',
      dimensions: 'Chest: S(42"), M(44"), L(46"), XL(48"), Length: Standard Streetwear Fit',
      tolerances: '+/- 1.0 cm',
      packaging: '100% biodegradable cornstarch bags with barcode sticker',
      acceptableDefects: 'AQL 2.5 Major, 4.0 Minor',
      processes: ['screen printing', 'puff print', 'bio-washed']
    },
    visibility: 'public',
    status: 'quotes_received'
  });

  const req2 = db.collection('requirements').create({
    _id: 'req_02',
    buyerId: buyerUser2._id,
    buyerName: buyerUser2.name,
    businessName: 'ZenRoots Organic',
    title: '2,500 Eco-Friendly Rigid Shipping Boxes',
    category: 'packaging',
    description: 'Custom magnetic closure rigid boxes for organic skincare jars with custom die-cut EVA foam insert wrapped in velvet paper. Gold foil hot-stamped logo on outer lid.',
    quantity: 2500,
    budget: 120,
    deadlineDays: 25,
    location: { city: 'Bengaluru', state: 'Karnataka' },
    specs: {
      material: '1200 GSM Kappa board lined with 157 GSM matte art paper',
      dimensions: '22cm x 16cm x 8cm interior depth',
      tolerances: '+/- 0.5 mm',
      packaging: 'Master cartons of 25 boxes palletized',
      acceptableDefects: 'Zero visual scuffs on exterior foil',
      processes: ['rigid packaging', 'foil stamping', 'die cut']
    },
    visibility: 'public',
    status: 'matching'
  });

  // 6. Itemised Quotations for Req 1
  const quote1 = db.collection('quotes').create({
    _id: 'quote_01',
    requirementId: req1._id,
    manufacturerId: mfg1._id,
    manufacturerName: mfg1.businessName,
    lineItems: [
      { description: '240 GSM Combed Cotton Heavy Jersey fabric & cutting', unitCost: 105, quantity: 1000, total: 105000 },
      { description: 'Tailoring, drop-shoulder stitching & bartacking', unitCost: 35, quantity: 1000, total: 35000 },
      { description: 'Front puff print + Back 4-colour screen printing', unitCost: 28, quantity: 1000, total: 28000 },
      { description: 'Bio-wash & silicone handfeel finish', unitCost: 12, quantity: 1000, total: 12000 }
    ],
    setupFee: 3500, // screen & mould fee
    sampleFee: 650,
    shippingFee: 2500, // Local Jaipur delivery
    taxRatePercent: 12, // 12% GST
    terms: '50% advance upon sample approval, 50% prior to dispatch post inspection.',
    leadTimeDays: 26,
    validUntil: '2026-11-15',
    inclusions: [
      'Silicone wash finishing',
      'Individual biodegradable polybag',
      'Local delivery to Sitapura or Jaipur warehouse',
      'Replacement of any defective unit exceeding 1.5%'
    ],
    exclusions: [
      'Buyer must provide vector artwork for puff screens',
      'Custom woven neck tags (can be stitched if provided)'
    ],
    status: 'submitted',
    revision: 1
  });

  const quote2 = db.collection('quotes').create({
    _id: 'quote_02',
    requirementId: req1._id,
    manufacturerId: mfg2._id,
    manufacturerName: mfg2.businessName,
    lineItems: [
      { description: '240 GSM Organic Ring-spun Cotton fabric', unitCost: 112, quantity: 1000, total: 112000 },
      { description: 'Precision sewing with twin needle stitching', unitCost: 38, quantity: 1000, total: 38000 },
      { description: 'Hybrid DTF & Screen print combo', unitCost: 24, quantity: 1000, total: 24000 },
      { description: 'Enzyme wash treatment', unitCost: 10, quantity: 1000, total: 10000 }
    ],
    setupFee: 2000,
    sampleFee: 800,
    shippingFee: 6500, // Tiruppur to Jaipur interstate logistics
    taxRatePercent: 12,
    terms: '40% advance, 60% on dispatch bill of lading.',
    leadTimeDays: 22,
    validUntil: '2026-11-20',
    inclusions: [
      'OEKO-TEX certified organic dye assurance',
      'Pre-shipment inspection report with 20 sample photos',
      'Export grade corrugated carton packing'
    ],
    exclusions: [
      'Interstate road permit/e-way generation by buyer if required',
      'Does not include hanger packs'
    ],
    status: 'submitted',
    revision: 1
  });

  // 7. Active Sample Workflow
  const sample1 = db.collection('samples').create({
    _id: 'sample_01',
    requirementId: req1._id,
    quoteId: quote1._id,
    manufacturerId: mfg1._id,
    buyerId: buyerUser1._id,
    fee: 650,
    status: 'dispatched',
    trackingNumber: 'DTDC-JP-992144',
    carrier: 'DTDC Express',
    feedback: 'Sample cut & stitched. Front puff print tested at 160C cure. Swatches dispatched for handfeel approval.',
    approvedSpecVersion: 'v1.1-spec'
  });

  // 8. Confirmed Order with Milestones & Evidence Trail
  const order1 = db.collection('orders').create({
    _id: 'order_01',
    requirementId: req1._id,
    quoteId: quote1._id,
    buyerId: buyerUser1._id,
    buyerName: buyerUser1.name,
    manufacturerId: mfg1._id,
    manufacturerName: mfg1.businessName,
    agreedSpecs: req1.specs,
    total: 212500,
    status: 'production',
    milestones: [
      {
        stage: 'confirmed',
        title: 'Order Confirmed & Spec Locked',
        completed: true,
        timestamp: '2026-10-12T11:00:00Z',
        notes: 'Spec approved by Aarav Singhania. Advance invoice issued.',
        evidenceUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        defectRatePercent: 0
      },
      {
        stage: 'materials',
        title: 'Yarn & Raw Fabric Sourced',
        completed: true,
        timestamp: '2026-10-15T16:30:00Z',
        notes: '280 kg of 240 GSM grey fabric delivered to dyeing mill. Lab dip #D-04 approved.',
        evidenceUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
        defectRatePercent: 0
      },
      {
        stage: 'production',
        title: 'Cutting, Screen Printing & Tailoring',
        completed: true,
        timestamp: '2026-10-19T14:15:00Z',
        notes: 'Screen printing 80% complete. First 300 pieces passed onto stitching line.',
        evidenceUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
        defectRatePercent: 0.8
      },
      {
        stage: 'inspection',
        title: 'AQL 2.5 Quality Inspection & Defect Check',
        completed: false,
        timestamp: null,
        notes: 'Scheduled for Oct 24th at factory assembly bay.',
        evidenceUrl: null,
        defectRatePercent: null
      },
      {
        stage: 'dispatched',
        title: 'Dispatched to Buyer Facility',
        completed: false,
        timestamp: null,
        notes: null,
        evidenceUrl: null,
        defectRatePercent: null
      },
      {
        stage: 'delivered',
        title: 'Delivery Confirmation & Handover',
        completed: false,
        timestamp: null,
        notes: null,
        evidenceUrl: null,
        defectRatePercent: null
      },
      {
        stage: 'closed',
        title: 'Order Closed & Review Logged',
        completed: false,
        timestamp: null,
        notes: null,
        evidenceUrl: null,
        defectRatePercent: null
      }
    ]
  });

  // 9. Initial Audit Log
  db.logAudit({
    actorId: adminUser._id,
    entityType: 'system',
    entityId: 'seed',
    action: 'INITIALIZE_SYSTEM_SEED',
    before: null,
    after: { seeded: true, manufacturersCount: 3, requirementsCount: 2 }
  });

  console.log('✅ Database seeded successfully with realistic clusters, RFPs, quotes & milestones.');
}

if (require.main === module) {
  seed();
}

module.exports = seed;
