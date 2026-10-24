# BatchBridge AI — Small-Batch Manufacturing Marketplace (MERN + AI)

> A modern B2B platform connecting emerging startups and D2C brands (needing 500–5,000 unit production runs) with verified contract manufacturers and job-work units — featuring AI requirement parsing, transparent multi-criteria matching, itemised quote normalisation, sample approvals, and 7-stage order milestone tracking.

---

## 🌟 The Core Problem

Startups and D2C brands needing **500–5,000 units** face severe barriers:
- Large factories demand 10,000+ unit MOQs or charge prohibitive 40–50% premiums.
- Directory listings fail to prove actual MOQ fit, available capacity, quality history, or delivery reliability.
- Quotations are non-standardized: setup fees, screens, freight, and taxes are obscured until after orders are placed.

**BatchBridge AI** provides:
1. **Evidence-Based Factory Verification**: Granular check badges (Statutory Identity, Machinery Audits, Sample Lab Tests, Production History, and Pre-Shipment Inspection Reports).
2. **AI Requirement Parser**: Turns unstructured buyer text into structured manufacturing briefs with tolerances and tech packs.
3. **Transparent Weighted Matching**: Strict formula (Capability 30%, MOQ 20%, Quality 20%, Lead Time 15%, Budget 10%, Location 5%) with plain-language explanations.
4. **Side-by-Side Landed Cost Matrix**: Normalizes base costs, setup tooling, freight, and GST to show the true landed unit cost.
5. **Sample-First Workflow**: Locks written specifications and courier tracking before committing to bulk production.
6. **7-Stage Milestone & Inspection Trail**: Orders require timestamped inspection evidence photos, defect rate metrics, and dispute controls.

---

## 🏛️ System Architecture

```
batchbridge-ai/
├── client/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Directory, RFPs, AI Parser, Quote Matrix, Milestones
│   │   ├── services/           # REST API client
│   │   ├── types/              # TypeScript interfaces
│   │   └── App.tsx             # Main orchestrated layout & persona switcher
├── server/                     # Node.js + Express API
│   ├── src/
│   │   ├── controllers/        # Thin request handlers
│   │   ├── middleware/         # JWT auth & RBAC
│   │   ├── models/             # Schema & in-memory/JSON store
│   │   ├── routes/             # REST route endpoints
│   │   ├── services/           # Matching engine, AI services, quote normalizer
│   │   ├── utils/              # Seed data (Jaipur & Tiruppur clusters)
│   │   └── tests/              # Automated unit tests
│   └── data/                   # Persistent local database store
├── docs/                       # API.md, data-model.md
└── README.md
```

---

## 🧮 Matching Formula & Weights

```javascript
Matching Score = 0.30 * Capability + 0.20 * MOQ + 0.20 * Quality + 0.15 * LeadTime + 0.10 * Budget + 0.05 * Location
```

- **Hard Filters**: Status is active, category matches, order quantity falls within factory practical MOQ range.
- **Explainable AI**: Accompanies each score with plain-language reasons and considerations.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In project root
npm run install:all
```

### 2. Seed Initial Clusters & Accounts
```bash
npm run seed
```
Seeds realistic textile & packaging clusters (Sitapura Industrial Area, Jaipur & Avinashi Road, Tiruppur) with pre-configured verified checks, RFPs, and sample orders.

### 3. Run Automated Tests
```bash
npm test
```
Executes unit tests verifying matching weights, schema parsing, and quote math.

### 4. Start the Full Application
```bash
npm run dev
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

## 👥 Demo Personas (1-Click Switcher)

Switch personas in the top-right menu to test all user journeys:
1. **Aarav Singhania (Buyer - UrbanThread Apparel)**: Posts RFPs with AI, inspects ranked matches, compares quotes, requests samples.
2. **Rajesh K. Sharma (Manufacturer - Sitapura Works)**: Submits itemised quotes, updates sample dispatch, records milestone photos and defect rates.
3. **Vikram Mehta (Admin - Chief Quality Officer)**: Grants granular verification badges with audit scopes, reviews disputes, monitors audit trail.

---

## 🛡️ AI Guardrails Adherence

- AI acts as an **assistant layer**, never the source of truth for pricing or guarantees.
- All AI extractions feature an explicit `"AI-suggested, please confirm"` gate before posting.
- Missing values are explicitly flagged as `null` / `"not provided"` — never assumed positive.
- Deterministic math engine calculates landed costs and matching rankings.
