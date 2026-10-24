const { parseRequirement, compareQuotes, explainMatch } = require('../services/ai.service');
const { matchManufacturers } = require('../services/matching.service');
const db = require('../models/dbStore');

exports.parseRequirement = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide requirement text' });
    }

    const parsed = await parseRequirement(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.match = async (req, res) => {
  try {
    const { requirementId, requirementData } = req.body;
    let reqDoc = requirementData;

    if (requirementId) {
      reqDoc = db.collection('requirements').findById(requirementId);
      if (!reqDoc) return res.status(404).json({ error: 'Requirement not found' });
    }

    if (!reqDoc) {
      return res.status(400).json({ error: 'Requirement ID or requirement data required' });
    }

    const matches = await matchManufacturers(reqDoc);

    // Add match explainer details
    const explainedMatches = await Promise.all(
      matches.map(async m => {
        const explanation = await explainMatch(m.manufacturer, reqDoc, m.parts);
        return {
          ...m,
          aiExplanation: explanation
        };
      })
    );

    res.json({
      requirement: reqDoc,
      totalCandidates: explainedMatches.length,
      matches: explainedMatches
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.compareQuotesEndpoint = async (req, res) => {
  try {
    const { requirementId, quotes } = req.body;
    let quoteList = quotes;
    let reqDoc = null;

    if (requirementId) {
      reqDoc = db.collection('requirements').findById(requirementId);
      if (!quoteList) {
        quoteList = db.collection('quotes').find({ requirementId });
      }
    }

    const quantity = reqDoc?.quantity || (quoteList && quoteList[0]?.lineItems?.[0]?.quantity) || 1000;
    const comparison = compareQuotes(quoteList, quantity);

    // AI comparison narrative
    let narrative = 'No quotes available for comparison.';
    if (comparison && comparison.length > 0) {
      const lowestCost = [...comparison].sort((a, b) => a.unitLandedCost - b.unitLandedCost)[0];
      const fastest = [...comparison].sort((a, b) => a.leadTimeDays - b.leadTimeDays)[0];

      narrative = `Compared ${comparison.length} quotations for ${quantity.toLocaleString()} units. Lowest landed unit cost is ₹${lowestCost.unitLandedCost}/unit offered by ${lowestCost.manufacturerName} (including taxes & setup fees). Fastest delivery is offered by ${fastest.manufacturerName} with a ${fastest.leadTimeDays}-day turnaround. Notice variances in setup tooling and freight inclusions.`;
    }

    res.json({
      quantity,
      narrative,
      comparison
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
