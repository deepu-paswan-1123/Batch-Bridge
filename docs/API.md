# BatchBridge AI — REST API Documentation

BatchBridge AI exposes a structured REST API for managing small-batch manufacturing sourcing, transparent weighted matching, itemised quotations, sample workflows, and order milestones.

## Base URL
`http://localhost:5000/api`

---

## Authentication & Profiles

### 1. Register User
`POST /api/auth/register`
```json
{
  "name": "Aarav Singhania",
  "email": "aarav@urbanthread.in",
  "password": "password123",
  "role": "buyer",
  "businessName": "UrbanThread",
  "categoryInterests": ["apparel"],
  "location": { "city": "Jaipur", "state": "Rajasthan" }
}
```

### 2. Login
`POST /api/auth/login`
```json
{
  "email": "aarav@urbanthread.in",
  "password": "password123"
}
```
**Response:** Returns JWT token and sanitized user profile.

### 3. Current User
`GET /api/auth/me`
Header: `Authorization: Bearer <token>` or `x-user-id: <userId>`

---

## Manufacturers & Discovery

### 4. Search & Filter Manufacturers
`GET /api/manufacturers?category=apparel&city=Jaipur&minMoq=500`
Returns verified factories, MOQ ranges, verified audit checkpoints, and capability tags.

### 5. Get Factory Profile & Evidence Checks
`GET /api/manufacturers/:id`

### 6. Update Factory Profile
`PATCH /api/manufacturers/:id`

---

## Requirements (Buyer Briefs & RFPs)

### 7. Create Requirement
`POST /api/requirements`
```json
{
  "title": "1,000 Custom Heavyweight Oversized Cotton T-Shirts",
  "category": "apparel",
  "description": "240 GSM combed cotton drop-shoulder tees with front puff print logo",
  "quantity": 1000,
  "budget": 185,
  "deadlineDays": 30,
  "location": { "city": "Jaipur", "state": "Rajasthan" },
  "specs": {
    "material": "100% Combed Compact Cotton, 240 GSM",
    "tolerances": "+/- 1.0 cm",
    "acceptableDefects": "AQL 2.5 Major"
  }
}
```

### 8. List Requirements
`GET /api/requirements` (Scoped by role: buyers see their own briefs, manufacturers see public briefs)

### 9. Get Requirement Detail
`GET /api/requirements/:id`

---

## Itemised Quotations & Normalization

### 10. Submit Itemised Quote
`POST /api/requirements/:id/quotes`
```json
{
  "lineItems": [
    { "description": "240 GSM fabric & cutting", "unitCost": 105 },
    { "description": "Tailoring & construction", "unitCost": 35 },
    { "description": "Screen & puff printing", "unitCost": 28 }
  ],
  "setupFee": 3500,
  "sampleFee": 650,
  "shippingFee": 2500,
  "taxRatePercent": 12,
  "leadTimeDays": 26,
  "inclusions": ["Silicone wash finish", "Biodegradable polybag"],
  "exclusions": ["Vector artwork files must be provided"]
}
```

### 11. View & Compare Quotes for a Brief
`GET /api/requirements/:id/quotes`
Returns itemised quotes and the server-calculated normalized comparison matrix.

### 12. Revise / Accept / Reject Quote
`PATCH /api/quotes/:id`

---

## AI Services

### 13. Parse Requirement from Free Text
`POST /api/ai/parse-requirement`
```json
{
  "text": "Need 1000 black hoodies, bio-washed cotton, embroidered logo, Jaipur, 30 days, budget 250"
}
```
**Response:** Structured brief with `title`, `quantity`, `budget`, `location`, `specs`, and `notice: "AI-suggested, please confirm"`.

### 14. Algorithmic Matching Engine
`POST /api/ai/match`
```json
{
  "requirementId": "req_01"
}
```
**Formula Weights:**
- Capability Fit: **30%**
- MOQ Fit: **20%**
- Quality Evidence: **20%**
- Lead-Time Fit: **15%**
- Budget Fit: **10%**
- Logistics/Location: **5%**

### 15. Quote Comparison & Variance Summary
`POST /api/ai/compare-quotes`
Calculates true landed unit cost = `(baseTotal + setupFee + shippingFee + GST) / quantity` and generates an AI variance narrative.

---

## Sample Validation Lab

### 16. Request Sample
`POST /api/samples`
`{ "quoteId": "quote_01", "shippingAddress": "..." }`

### 17. Update Sample State
`PATCH /api/samples/:id`
Status transitions: `requested -> confirmed -> dispatched -> received -> approved/rejected`

---

## Order Milestones & Inspection Evidence

### 18. Confirm Order from Accepted Quote
`POST /api/orders`
`{ "quoteId": "quote_01" }`

### 19. Update Milestone Event
`PATCH /api/orders/:id/milestones`
```json
{
  "stage": "inspection",
  "completed": true,
  "notes": "Passed AQL 2.5 PSI inspection at Sitapura assembly line",
  "evidenceUrl": "https://...",
  "defectRatePercent": 0.8
}
```

### 20. Open Dispute
`POST /api/orders/:id/disputes`
`{ "category": "spec_deviation", "notes": "...", "evidence": "..." }`

---

## Admin & Trust Queue

### 21. Get Verification Queue
`GET /api/admin/verification-queue`

### 22. Record Granular Verification Check
`PATCH /api/admin/manufacturers/:id/verification`
`{ "checkType": "sample_reviewed", "title": "Fabric Shrinkage Test", "scope": "..." }`

### 23. View Audit Logs
`GET /api/admin/audit-logs`
