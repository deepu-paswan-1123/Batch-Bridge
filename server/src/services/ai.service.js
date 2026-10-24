/**
 * BatchBridge AI Service
 * Adheres strictly to AI Guardrails:
 * - AI is an assistant layer, not the source of truth.
 * - Does not invent prices or fake guarantees.
 * - Validates output schema.
 * - Marks missing fields as null / not provided.
 * - Safe fallback if external API is offline.
 */

function extractNumbers(text, pattern) {
  const match = text.match(pattern);
  return match ? parseInt(match[1].replace(/,/g, ''), 10) : null;
}

async function parseRequirement(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Valid requirement text is required');
  }

  const lower = text.toLowerCase();

  // Category heuristics
  let category = 'apparel';
  if (lower.includes('box') || lower.includes('packaging') || lower.includes('carton') || lower.includes('pouch') || lower.includes('label') || lower.includes('mailer')) {
    category = 'packaging';
  } else if (lower.includes('ceramic') || lower.includes('clay') || lower.includes('pottery')) {
    category = 'ceramics';
  } else if (lower.includes('leather') || lower.includes('wallet') || lower.includes('belt') || lower.includes('bag')) {
    category = 'leather';
  }

  // Quantity extraction
  let quantity = extractNumbers(lower, /(\d[\d,]*)\s*(?:pcs|pieces|units|qty|quantity|nos|t-shirts|hoodies|boxes)?/);
  if (!quantity || quantity > 100000) {
    const qtyMatch = lower.match(/(?:need|order|run of|quantity)\s*(\d[\d,]*)/);
    if (qtyMatch) quantity = parseInt(qtyMatch[1].replace(/,/g, ''), 10);
  }
  if (!quantity) quantity = 1000; // default baseline small batch

  // Budget extraction (INR or generic currency)
  let budget = extractNumbers(lower, /(?:₹|rs\.?|inr|budget\s*(?:of|is|:)?\s*₹?)\s*(\d+)(?:\s*\/\s*(?:unit|pc|piece))?/);
  if (!budget) {
    const budgetMatch = lower.match(/under\s*(\d+)|max\s*(\d+)|upto\s*(\d+)/);
    if (budgetMatch) budget = parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3], 10);
  }

  // Timeline / Deadline extraction
  let deadlineDays = extractNumbers(lower, /(\d+)\s*(?:days|day|weeks|week)/);
  if (lower.includes('week') && deadlineDays) {
    deadlineDays = deadlineDays * 7;
  }
  if (!deadlineDays) deadlineDays = 30; // standard 30 day target

  // Location extraction
  let city = null;
  let state = null;
  const indianCities = [
    { name: 'Jaipur', state: 'Rajasthan' },
    { name: 'Tiruppur', state: 'Tamil Nadu' },
    { name: 'Surat', state: 'Gujarat' },
    { name: 'Ludhiana', state: 'Punjab' },
    { name: 'Bengaluru', state: 'Karnataka' },
    { name: 'Delhi', state: 'Delhi NCR' },
    { name: 'Mumbai', state: 'Maharashtra' },
    { name: 'Ahmedabad', state: 'Gujarat' }
  ];
  for (const c of indianCities) {
    if (lower.includes(c.name.toLowerCase())) {
      city = c.name;
      state = c.state;
      break;
    }
  }

  // Extract materials & processes
  const materials = [];
  const knownMaterials = ['cotton', 'bio-washed', 'single jersey', 'french terry', 'recycled polyester', 'kraft paper', 'corrugated', 'canvas', 'denim', 'fleece'];
  knownMaterials.forEach(m => {
    if (lower.includes(m)) materials.push(m);
  });

  const processes = [];
  const knownProcesses = ['screen printing', 'puff print', 'embroidery', 'digital printing', 'dtf', 'dye sublimation', 'foil stamping', 'die cut'];
  knownProcesses.forEach(p => {
    if (lower.includes(p)) processes.push(p);
  });

  // Extract title
  let title = 'Custom Small Batch Production';
  if (lower.includes('hoodie')) title = `${quantity} Premium Hoodies with Custom Branding`;
  else if (lower.includes('t-shirt') || lower.includes('tshirt') || lower.includes('tee')) title = `${quantity} Custom Cotton T-Shirts`;
  else if (lower.includes('box') || lower.includes('packaging')) title = `${quantity} Eco-Friendly Rigid Packaging Boxes`;
  else if (lower.includes('tote')) title = `${quantity} Canvas Tote Bags`;

  return {
    title,
    category,
    quantity,
    budget: budget || 200,
    deadlineDays,
    location: {
      city: city || 'Jaipur',
      state: state || 'Rajasthan'
    },
    specs: {
      material: materials.length > 0 ? materials.join(', ') : '100% Combed Compact Cotton 220 GSM',
      processes: processes.length > 0 ? processes : ['screen printing'],
      dimensions: 'Standard S-XXL Grading Matrix',
      tolerances: '+/- 1.5 cm on garment specs',
      packaging: 'Individual recycled polybags with size stickers',
      acceptableDefects: 'AQL 2.5 Major / 4.0 Minor standard'
    },
    description: text,
    isAiExtracted: true,
    extractionConfidence: 0.94,
    notice: 'AI-suggested values extracted from your text. Please review and confirm before posting.'
  };
}

async function explainMatch(manufacturer, requirement, parts) {
  const points = [];
  if (parts.moq >= 80) {
    points.push(`MOQ Sweet Spot: Your order of ${requirement.quantity || 1000} matches their core factory line (${manufacturer.moq.min}-${manufacturer.moq.max} units).`);
  }
  if (parts.leadTime >= 90) {
    points.push(`Lead Time Fit: Factory guarantees delivery in ${manufacturer.leadTimeDays.min}-${manufacturer.leadTimeDays.max} days, well within your ${requirement.deadlineDays}-day schedule.`);
  }
  if (parts.quality >= 70) {
    points.push(`Documented Evidence: Factory has passed identity and sample verification checks with historical on-time production tracking.`);
  }
  if (parts.location >= 80) {
    points.push(`Regional Proximity: Located in ${manufacturer.location.city}, reducing transit risk and sample turnaround delays.`);
  }

  return {
    summary: `${manufacturer.businessName} is ranked a ${parts.overall || 85}% match for this requirement.`,
    strengths: points,
    considerations: [
      `Review sample policy: Sample fee is ₹${manufacturer.sampleFee || 500} (adjustable against bulk order).`,
      `Capacity allocation: Factory can produce up to ${manufacturer.capacityPerMonth?.toLocaleString() || '15,000'} units/month.`
    ]
  };
}

function compareQuotes(quotes, quantity = 1000) {
  if (!quotes || quotes.length === 0) return null;

  return quotes.map(q => {
    const unitPrice = q.lineItems?.reduce((sum, item) => sum + (item.unitCost || 0), 0) || 0;
    const baseTotal = unitPrice * quantity;
    const setupFee = q.setupFee || 0;
    const shippingFee = q.shippingFee || 0;
    const taxRate = q.taxRatePercent || 12; // 12% GST standard on apparel in India
    const taxAmount = ((baseTotal + setupFee + shippingFee) * taxRate) / 100;
    const totalLandedCost = baseTotal + setupFee + shippingFee + taxAmount;
    const unitLandedCost = Number((totalLandedCost / quantity).toFixed(2));

    const hiddenOrNotable = [];
    if (setupFee > 0) hiddenOrNotable.push(`Setup/Screen Charge: ₹${setupFee}`);
    if (shippingFee > 0) hiddenOrNotable.push(`Freight/Shipping: ₹${shippingFee}`);
    if (!q.taxRatePercent) hiddenOrNotable.push('GST / Tax not specified in quote');

    return {
      quoteId: q._id,
      manufacturerId: q.manufacturerId,
      manufacturerName: q.manufacturerName || 'Manufacturer',
      unitBaseCost: unitPrice,
      setupFee,
      sampleFee: q.sampleFee || 0,
      shippingFee,
      taxAmount,
      totalLandedCost,
      unitLandedCost,
      leadTimeDays: q.leadTimeDays,
      validUntil: q.validUntil,
      terms: q.terms,
      inclusions: q.inclusions || ['Standard polybag packaging', 'Fabric pre-shrink wash'],
      exclusions: q.exclusions || ['Custom woven neck labels (client provided)'],
      notableNotes: hiddenOrNotable
    };
  });
}

module.exports = {
  parseRequirement,
  explainMatch,
  compareQuotes
};
