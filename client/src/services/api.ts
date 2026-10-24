const API_BASE = '/api';

export const api = {
  getHeaders: () => {
    const token = localStorage.getItem('token');
    const activeUserId = localStorage.getItem('activeUserId');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (activeUserId) headers['x-user-id'] = activeUserId;
    return headers;
  },

  // Auth
  getDemoUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return res.json();
  },
  login: async (creds: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    return res.json();
  },
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: api.getHeaders()
    });
    return res.json();
  },

  // Manufacturers
  getManufacturers: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/manufacturers?${query}`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  getManufacturerById: async (id: string) => {
    const res = await fetch(`${API_BASE}/manufacturers/${id}`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  createManufacturer: async (data: any) => {
    const res = await fetch(`${API_BASE}/manufacturers`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateManufacturer: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/manufacturers/${id}`, {
      method: 'PATCH',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Requirements
  getRequirements: async () => {
    const res = await fetch(`${API_BASE}/requirements`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  getRequirementById: async (id: string) => {
    const res = await fetch(`${API_BASE}/requirements/${id}`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  createRequirement: async (data: any) => {
    const res = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Quotes
  getQuotesByRequirement: async (requirementId: string) => {
    const res = await fetch(`${API_BASE}/requirements/${requirementId}/quotes`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  submitQuote: async (requirementId: string, data: any) => {
    const res = await fetch(`${API_BASE}/requirements/${requirementId}/quotes`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateQuote: async (quoteId: string, data: any) => {
    const res = await fetch(`${API_BASE}/quotes/${quoteId}`, {
      method: 'PATCH',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Samples
  getSamples: async () => {
    const res = await fetch(`${API_BASE}/samples`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  requestSample: async (data: any) => {
    const res = await fetch(`${API_BASE}/samples`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateSample: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/samples/${id}`, {
      method: 'PATCH',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Orders
  getOrders: async () => {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  getOrderById: async (id: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  createOrder: async (data: { quoteId: string }) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateMilestone: async (orderId: string, data: any) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/milestones`, {
      method: 'PATCH',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  openDispute: async (orderId: string, data: any) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/disputes`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // AI Services
  parseRequirementAi: async (text: string) => {
    const res = await fetch(`${API_BASE}/ai/parse-requirement`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify({ text })
    });
    return res.json();
  },
  matchManufacturersAi: async (requirementData: any, requirementId?: string) => {
    const res = await fetch(`${API_BASE}/ai/match`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify({ requirementData, requirementId })
    });
    return res.json();
  },
  compareQuotesAi: async (requirementId: string, quotes?: any[]) => {
    const res = await fetch(`${API_BASE}/ai/compare-quotes`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify({ requirementId, quotes })
    });
    return res.json();
  },

  // Admin
  getVerificationQueue: async () => {
    const res = await fetch(`${API_BASE}/admin/verification-queue`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  recordVerificationCheck: async (manufacturerId: string, data: any) => {
    const res = await fetch(`${API_BASE}/admin/manufacturers/${manufacturerId}/verification`, {
      method: 'PATCH',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  getDisputes: async () => {
    const res = await fetch(`${API_BASE}/admin/disputes`, {
      headers: api.getHeaders()
    });
    return res.json();
  },
  resolveDispute: async (disputeId: string, data: any) => {
    const res = await fetch(`${API_BASE}/admin/disputes/${disputeId}`, {
      method: 'PATCH',
      headers: api.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
