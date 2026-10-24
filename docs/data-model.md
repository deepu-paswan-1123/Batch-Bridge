# BatchBridge AI — Data Model & Schema Design

BatchBridge AI uses a normalized document model designed for MongoDB Atlas with secondary indexes on high-throughput discovery vectors.

```
+---------------+        +----------------------+
|     User      | <----- |     BuyerProfile     |
+---------------+        +----------------------+
       ^
       |
+---------------+        +----------------------+
| Manufacturer  | <----- |  VerificationCheck   |
+---------------+        +----------------------+
       ^
       | submits
       |
+---------------+        +----------------------+
|  Requirement  | <----- |        Quote         |
+---------------+        +----------------------+
       |                            |
       +------------+---------------+
                    |
                    v
             +---------------+
             |    Sample     |
             +---------------+
                    |
                    v
             +---------------+
             |     Order     |
             +---------------+
                    |
             +---------------+
             |    Dispute    |
             +---------------+
```

---

## Collections Specification

### 1. `users`
- `_id`: ObjectId / String
- `name`: String
- `email`: String (indexed, unique)
- `passwordHash`: String
- `role`: Enum `['buyer', 'manufacturer', 'admin']`
- `status`: Enum `['active', 'suspended']`
- `createdAt`: ISO Date

### 2. `manufacturers`
- `_id`: ObjectId / String
- `owner`: ObjectId ref `User` (indexed)
- `businessName`: String
- `categories`: Array of String (e.g. `['apparel', 'textiles', 'packaging']`)
- `capabilities`: Array of String (e.g. `['screen printing', 'puff print', 'single jersey']`)
- `moq`: `{ min: Number, max: Number }`
- `capacityPerMonth`: Number
- `leadTimeDays`: `{ min: Number, max: Number }`
- `sampleFee`: Number
- `location`: `{ city: String, state: String, cluster: String, geo: { type: 'Point', coordinates: [Number, Number] } }`
- `evidence`: Array of ObjectId ref `VerificationCheck`
- `status`: Enum `['pending', 'active', 'suspended']`
- `rating`: Number
- `totalCompletedOrders`: Number

**Indexes:**
- `{ 'location.geo': '2dsphere' }`
- `{ categories: 1, 'moq.min': 1, 'moq.max': 1 }`

### 3. `verificationChecks`
*Granular evidence logs. A registration document alone is never proof of quality.*
- `_id`: ObjectId / String
- `manufacturerId`: ObjectId ref `Manufacturer`
- `checkType`: Enum `['identity_checked', 'capability_evidence', 'sample_reviewed', 'production_history', 'inspection_recorded']`
- `title`: String
- `status`: Enum `['pending', 'verified', 'rejected']`
- `checkedBy`: String
- `checkedAt`: ISO Date
- `evidenceRef`: String (e.g. `DOC-UDYAM-RJ-2026-0811`)
- `scope`: String (detailed scope of what was checked and when)

### 4. `requirements`
- `_id`: ObjectId / String
- `buyerId`: ObjectId ref `User`
- `title`: String
- `category`: String
- `description`: String
- `quantity`: Number (e.g. 1000)
- `budget`: Number
- `deadlineDays`: Number
- `location`: `{ city: String, state: String }`
- `specs`: `{ material, dimensions, tolerances, packaging, acceptableDefects, techPackUrl }`
- `visibility`: Enum `['public', 'invited']`
- `status`: Enum `['draft', 'open', 'matching', 'quotes_received', 'sample_stage', 'awarded', 'closed']`

### 5. `quotes`
- `_id`: ObjectId / String
- `requirementId`: ObjectId ref `Requirement`
- `manufacturerId`: ObjectId ref `Manufacturer`
- `lineItems`: `[{ description: String, unitCost: Number, quantity: Number, total: Number }]`
- `setupFee`: Number
- `sampleFee`: Number
- `shippingFee`: Number
- `taxRatePercent`: Number (e.g. 12)
- `taxAmount`: Number
- `totalAmount`: Number
- `unitLandedCost`: Number (normalized true unit cost)
- `terms`: String
- `leadTimeDays`: Number
- `validUntil`: String
- `inclusions`: Array of String
- `exclusions`: Array of String
- `status`: Enum `['draft', 'submitted', 'revised', 'accepted', 'rejected', 'expired']`
- `revision`: Number

### 6. `samples`
- `_id`: ObjectId / String
- `requirementId`: ObjectId ref `Requirement`
- `quoteId`: ObjectId ref `Quote`
- `manufacturerId`: ObjectId ref `Manufacturer`
- `buyerId`: ObjectId ref `User`
- `fee`: Number
- `status`: Enum `['requested', 'confirmed', 'dispatched', 'received', 'approved', 'rejected']`
- `trackingNumber`: String
- `carrier`: String
- `feedback`: String
- `approvedSpecVersion`: String

### 7. `orders`
- `_id`: ObjectId / String
- `requirementId`: ObjectId ref `Requirement`
- `quoteId`: ObjectId ref `Quote`
- `buyerId`: ObjectId ref `User`
- `manufacturerId`: ObjectId ref `Manufacturer`
- `total`: Number
- `status`: Enum `['confirmed', 'materials', 'production', 'inspection', 'dispatched', 'delivered', 'closed', 'disputed']`
- `milestones`: Array of `{ stage, title, completed, timestamp, notes, evidenceUrl, defectRatePercent }`

### 8. `auditLogs`
- `_id`: ObjectId / String
- `actorId`: ObjectId ref `User`
- `entityType`: String
- `entityId`: String
- `action`: String
- `before`: Object
- `after`: Object
- `createdAt`: ISO Date
