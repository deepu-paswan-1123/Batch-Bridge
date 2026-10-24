const test = require('node:test');
const assert = require('node:assert');
const { matchManufacturers, WEIGHTS } = require('../services/matching.service');
const { parseRequirement, compareQuotes } = require('../services/ai.service');

test('Matching Engine: Weights sum to 1.0', () => {
  const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  assert.strictEqual(Math.round(sum * 100) / 100, 1.0);
});

test('Matching Engine: Filters by MOQ and category', async () => {
  const req = {
    category: 'apparel',
    quantity: 1000,
    deadlineDays: 30,
    location: { city: 'Jaipur', state: 'Rajasthan' },
    specs: { material: 'cotton', processes: ['screen printing'] }
  };

  const matches = await matchManufacturers(req);
  assert.ok(matches.length > 0, 'Should find candidate manufacturers');
  assert.ok(matches[0].score > 50, 'Top match should score above 50%');
  assert.ok(matches[0].parts.capability >= 0, 'Should have capability score');
  assert.ok(matches[0].parts.moq >= 0, 'Should have MOQ score');
});

test('AI Parser: Extracts structured fields from free text', async () => {
  const text = "Need 1000 black hoodies, bio-washed cotton, embroidered logo, Jaipur, 30 days, budget 250";
  const parsed = await parseRequirement(text);

  assert.strictEqual(parsed.quantity, 1000);
  assert.strictEqual(parsed.category, 'apparel');
  assert.strictEqual(parsed.location.city, 'Jaipur');
  assert.strictEqual(parsed.deadlineDays, 30);
  assert.strictEqual(parsed.budget, 250);
  assert.ok(parsed.isAiExtracted, 'Should flag as AI extracted');
});

test('Quote Comparison: Calculates landed unit cost and normalizes differences', () => {
  const mockQuotes = [
    {
      _id: 'q1',
      manufacturerId: 'm1',
      manufacturerName: 'Factory A',
      lineItems: [{ description: 'Garment', unitCost: 150 }],
      setupFee: 3000,
      shippingFee: 2000,
      taxRatePercent: 12,
      leadTimeDays: 25
    }
  ];

  const comparison = compareQuotes(mockQuotes, 1000);
  assert.strictEqual(comparison.length, 1);
  // Base: 150,000 + 3,000 + 2,000 = 155,000. Tax (12%): 18,600. Total: 173,600. Landed unit cost: 173.6
  assert.strictEqual(comparison[0].unitLandedCost, 173.6);
  assert.strictEqual(comparison[0].setupFee, 3000);
  assert.strictEqual(comparison[0].shippingFee, 2000);
});
