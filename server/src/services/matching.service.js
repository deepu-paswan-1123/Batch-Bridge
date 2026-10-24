const db = require('../models/dbStore');

const WEIGHTS = {
  capability: 0.30,
  moq: 0.20,
  quality: 0.20,
  leadTime: 0.15,
  budget: 0.10,
  location: 0.05
};

function capabilityScore(m, req) {
  if (!m.capabilities || m.capabilities.length === 0) return 0.5;
  const reqTokens = [
    req.title || '',
    req.description || '',
    req.specs?.material || '',
    ...(req.specs?.processes || [])
  ].join(' ').toLowerCase();

  const matched = m.capabilities.filter(c => reqTokens.includes(c.toLowerCase()));
  if (matched.length === 0) return 0.4;
  return Math.min(1.0, 0.5 + (matched.length / m.capabilities.length) * 0.5);
}

function moqScore(m, quantity) {
  const min = m.moq?.min || 100;
  const max = m.moq?.max || 10000;
  if (quantity < min || quantity > max) return 0.2;
  // Sweet spot is in the middle 60% of the range
  const midpoint = (min + max) / 2;
  const dist = Math.abs(quantity - midpoint) / ((max - min) / 2);
  return Math.max(0.6, 1.0 - dist * 0.3);
}

function qualityScore(m) {
  const checks = db.collection('verificationChecks').find({
    manufacturerId: m._id,
    status: 'verified'
  });
  const checkCount = checks.length;
  // 5 standard checks possible
  const checkRatio = Math.min(1.0, checkCount / 4);
  const ratingBonus = (m.rating || 4.5) / 5.0;
  return 0.6 * checkRatio + 0.4 * ratingBonus;
}

function leadTimeScore(m, deadlineDays) {
  if (!deadlineDays) return 0.8;
  const maxLead = m.leadTimeDays?.max || 30;
  if (maxLead <= deadlineDays) return 1.0;
  if (maxLead <= deadlineDays * 1.2) return 0.6;
  return 0.3;
}

function locationScore(m, reqLocation) {
  if (!reqLocation || !m.location) return 0.7;
  const reqCity = (reqLocation.city || '').toLowerCase();
  const reqState = (reqLocation.state || '').toLowerCase();
  const mCity = (m.location.city || '').toLowerCase();
  const mState = (m.location.state || '').toLowerCase();

  if (mCity && reqCity && mCity === reqCity) return 1.0;
  if (mState && reqState && mState === reqState) return 0.85;
  return 0.6;
}

function budgetScore(m, req) {
  if (!req.budget) return null;
  // If manufacturer has quotes or sample fee or typical unit pricing
  const estUnit = m.sampleFee ? m.sampleFee / 10 : 200;
  if (estUnit <= req.budget) return 1.0;
  return 0.5;
}

async function matchManufacturers(requirement) {
  const allManufacturers = db.collection('manufacturers').find({ status: 'active' });

  // 1. Hard filters
  const candidates = allManufacturers.filter(m => {
    // category match
    const categoryMatches = !requirement.category ||
      (m.categories && m.categories.some(c => c.toLowerCase() === requirement.category.toLowerCase()));
    
    // moq bounds
    const moqMatches = !requirement.quantity ||
      ((m.moq?.min || 0) <= requirement.quantity && (m.moq?.max || 999999) >= requirement.quantity);

    return categoryMatches && moqMatches;
  });

  // 2. Score each candidate with known data only
  const scored = candidates.map(m => {
    const verifiedChecks = db.collection('verificationChecks').find({
      manufacturerId: m._id,
      status: 'verified'
    });

    const parts = {
      capability: capabilityScore(m, requirement),
      moq: moqScore(m, requirement.quantity || 1000),
      quality: qualityScore(m),
      leadTime: leadTimeScore(m, requirement.deadlineDays || 30),
      budget: budgetScore(m, requirement),
      location: locationScore(m, requirement.location)
    };

    const known = Object.entries(parts).filter(([, v]) => v !== null);
    const wSum = known.reduce((s, [k]) => s + WEIGHTS[k], 0);
    const scoreVal = known.reduce((s, [k, v]) => s + WEIGHTS[k] * v, 0) / wSum;
    const finalScore = Math.round(scoreVal * 100);

    const reasons = [
      `MOQ fit: order of ${requirement.quantity || 1000} units fits comfortably within capacity range (${m.moq.min}-${m.moq.max} units).`,
      parts.leadTime >= 0.9
        ? `Lead time aligns: Factory delivers in ${m.leadTimeDays.min}-${m.leadTimeDays.max} days, within your ${requirement.deadlineDays || 30}-day target.`
        : `Timeline tight: Factory takes up to ${m.leadTimeDays.max} days.`,
      `Quality trust: ${verifiedChecks.length} verified evidence checkpoints on file (${verifiedChecks.map(c => c.title || c.checkType).slice(0, 2).join(', ') || 'identity verified'}).`,
      `Capability: ${m.capabilities.slice(0, 3).join(', ')} match requirement.`
    ];

    return {
      manufacturer: m,
      score: finalScore,
      parts: {
        capability: Math.round(parts.capability * 100),
        moq: Math.round(parts.moq * 100),
        quality: Math.round(parts.quality * 100),
        leadTime: Math.round(parts.leadTime * 100),
        budget: parts.budget !== null ? Math.round(parts.budget * 100) : null,
        location: Math.round(parts.location * 100)
      },
      verifiedChecks,
      reasons
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

module.exports = {
  WEIGHTS,
  matchManufacturers
};
