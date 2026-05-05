// Staff Portal API Configuration
export const STAFF_API_CONFIG = {
  BASE_URL: (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, ''),
  TIMEOUT: 30000,
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/api/staff/auth/login',
      VERIFY: '/api/auth/verify',
      ME: '/api/auth/me',
      MFA_VERIFY: '/api/staff/auth/mfa/verify',
      LOGOUT: '/api/staff/auth/logout',
      SESSION: '/api/staff/auth/session',
      SESSIONS: '/api/staff/auth/sessions',
      KILL_SESSION: (id: string) => `/api/staff/auth/session/${id}`,
    },
    // Profile
    PROFILE: {
      ME:         '/api/staff/profile',
      UPDATE_ME:  '/api/staff/profile',
      LIST:       '/api/staff/profiles',
      CREATE:     '/api/staff/profiles',
      GET:        (id: string) => `/api/staff/profiles/${id}`,
      UPDATE:     (id: string) => `/api/staff/profiles/${id}`,
      DELETE:     (id: string) => `/api/staff/profiles/${id}`,
    },
    // Dashboard
    DASHBOARD: {
      GET: '/api/staff/dashboard',
    },
    // RBAC
    RBAC: {
      USER_ROLE: (userId: string) => `/api/staff/roles/${userId}`,
      PERMISSIONS: (role: string) => `/api/staff/permissions/${role}`,
      ASSIGN_ROLE: '/api/staff/roles/assign',
    },
    // Tasks
    TASKS: {
      LIST: '/api/staff/tasks',
      DETAIL: (id: string) => `/api/staff/tasks/${id}`,
      COMPLETE: (id: string) => `/api/staff/tasks/${id}/complete`,
      ASSIGN: (id: string) => `/api/staff/tasks/${id}/assign`,
    },
    // Orders
    ORDERS: {
      VENDORS: '/api/staff/vendors',
      QUEUE: '/api/staff/orders',
      DETAIL: (id: string) => `/api/staff/orders/${id}`,
      REASSIGN_VENDOR: (id: string) => `/api/staff/orders/${id}/reassign-vendor`,
      CLARIFICATION: (id: string) => `/api/staff/orders/${id}/clarification`,
    },
    // Support
    SUPPORT: {
      TICKETS: '/api/staff/tickets',
      TICKET_DETAIL: (id: string) => `/api/staff/tickets/${id}`,
      REPLY: (id: string) => `/api/staff/tickets/${id}/reply`,
      CLOSE: (id: string) => `/api/staff/tickets/${id}/close`,
      ESCALATE: (id: string) => `/api/staff/tickets/${id}/escalate`,
      VENDOR_TICKETS: '/api/staff/vendor-tickets',
      VENDOR_REPLY: (id: string) => `/api/staff/vendor-tickets/${id}/reply`,
      UPLOAD_ATTACHMENTS: '/api/staff/uploads/attachments',
    },
    // Finance
    FINANCE: {
      REFUNDS: '/api/staff/refunds',
      APPROVE_REFUND: (id: string) => `/api/staff/refunds/${id}/approve`,
      ESCALATE_REFUND: (id: string) => `/api/staff/refunds/${id}/escalate`,
      CREDIT_WALLET: '/api/staff/wallet/credit',
      DEBIT_WALLET: '/api/staff/wallet/debit',
      WALLET_LEDGER: '/api/staff/wallet/ledger',
      // Payout endpoints (old API - waiting for new Payout Assist API deployment)
      PAYOUTS: '/api/staff/payouts',
      ISSUE_PAYOUT_TICKET: '/api/staff/payouts/issue-ticket',
    },
    // Marketing - Staff Coupon APIs
    MARKETING: {
      CAMPAIGNS: '/api/staff/campaigns',
      COUPONS: '/api/staff/coupons',
      CREATE_TARGETING: '/api/staff/targeting',
      ANALYTICS_REPORTS: '/api/staff/analytics/reports',
    },
    // Escalation
    ESCALATION: {
      TRIGGER: '/api/staff/escalation',
      LIST: '/api/staff/escalations',
    },
    // Audit
    AUDIT: {
      LOGS: '/api/staff/audit/logs',
      ACTIVITY: '/api/staff/activity',
      PERFORMANCE: '/api/staff/performance',
    },
    // System
    SYSTEM: {
      STATUS: '/api/staff/system/status',
      PERMISSIONS_CHECK: '/api/staff/permissions/check',
      CONFLICT_LOCK: '/api/staff/conflict/lock',
    },
  },
};

export default STAFF_API_CONFIG;
