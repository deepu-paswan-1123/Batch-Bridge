export type Role = 'buyer' | 'manufacturer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export interface VerificationCheck {
  _id: string;
  manufacturerId: string;
  checkType: 'identity_checked' | 'capability_evidence' | 'sample_reviewed' | 'production_history' | 'inspection_recorded';
  title: string;
  status: 'pending' | 'verified' | 'rejected';
  checkedBy: string;
  checkedAt: string;
  scope: string;
  evidenceRef: string;
  notes?: string;
  manufacturerName?: string;
  location?: { city: string; state: string };
}

export interface Manufacturer {
  _id: string;
  owner: string;
  businessName: string;
  categories: string[];
  capabilities: string[];
  moq: { min: number; max: number };
  capacityPerMonth: number;
  leadTimeDays: { min: number; max: number };
  sampleFee: number;
  rating: number;
  totalCompletedOrders: number;
  location: {
    city: string;
    state: string;
    cluster?: string;
    geo?: { type: string; coordinates: [number, number] };
  };
  status: 'pending' | 'active' | 'suspended';
  contactEmail: string;
  contactPhone: string;
  description: string;
  verificationChecks?: VerificationCheck[];
}

export interface Requirement {
  _id: string;
  buyerId: string;
  buyerName?: string;
  businessName?: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  budget?: number;
  deadlineDays: number;
  location: { city: string; state: string };
  specs: {
    material: string;
    dimensions?: string;
    tolerances?: string;
    packaging?: string;
    acceptableDefects?: string;
    processes?: string[];
    techPackUrl?: string;
  };
  visibility: 'public' | 'invited';
  invitedManufacturerIds?: string[];
  status: 'draft' | 'open' | 'matching' | 'quotes_received' | 'sample_stage' | 'awarded' | 'closed';
  quotesCount?: number;
  createdAt?: string;
}

export interface QuoteLineItem {
  description: string;
  unitCost: number;
  quantity?: number;
  total?: number;
}

export interface Quote {
  _id: string;
  requirementId: string;
  manufacturerId: string;
  manufacturerName: string;
  lineItems: QuoteLineItem[];
  setupFee: number;
  sampleFee: number;
  shippingFee: number;
  taxRatePercent: number;
  taxAmount: number;
  totalAmount: number;
  unitLandedCost: number;
  terms: string;
  leadTimeDays: number;
  validUntil: string;
  inclusions: string[];
  exclusions: string[];
  status: 'draft' | 'submitted' | 'revised' | 'accepted' | 'rejected' | 'expired';
  revision: number;
  createdAt?: string;
}

export interface NormalizedQuoteComparison {
  quoteId: string;
  manufacturerId: string;
  manufacturerName: string;
  unitBaseCost: number;
  setupFee: number;
  sampleFee: number;
  shippingFee: number;
  taxAmount: number;
  totalLandedCost: number;
  unitLandedCost: number;
  leadTimeDays: number;
  validUntil: string;
  terms: string;
  inclusions: string[];
  exclusions: string[];
  notableNotes: string[];
}

export interface Sample {
  _id: string;
  requirementId: string;
  quoteId: string;
  manufacturerId: string;
  buyerId: string;
  fee: number;
  status: 'requested' | 'confirmed' | 'dispatched' | 'received' | 'approved' | 'rejected';
  trackingNumber?: string;
  carrier?: string;
  feedback?: string;
  shippingAddress?: string;
  approvedSpecVersion?: string;
  createdAt?: string;
}

export interface Milestone {
  stage: 'confirmed' | 'materials' | 'production' | 'inspection' | 'dispatched' | 'delivered' | 'closed';
  title: string;
  completed: boolean;
  timestamp?: string | null;
  notes?: string | null;
  evidenceUrl?: string | null;
  defectRatePercent?: number | null;
}

export interface Order {
  _id: string;
  requirementId: string;
  quoteId: string;
  buyerId: string;
  buyerName: string;
  manufacturerId: string;
  manufacturerName: string;
  agreedSpecs: any;
  total: number;
  status: string;
  milestones: Milestone[];
  createdAt?: string;
}

export interface MatchScoreParts {
  capability: number;
  moq: number;
  quality: number;
  leadTime: number;
  budget: number | null;
  location: number;
}

export interface MatchResult {
  manufacturer: Manufacturer;
  score: number;
  parts: MatchScoreParts;
  verifiedChecks: VerificationCheck[];
  reasons: string[];
  aiExplanation?: {
    summary: string;
    strengths: string[];
    considerations: string[];
  };
}

export interface AuditLog {
  _id: string;
  actorId: string;
  entityType: string;
  entityId: string;
  action: string;
  before?: any;
  after?: any;
  createdAt: string;
}
