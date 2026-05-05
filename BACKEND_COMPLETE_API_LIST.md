# 🔌 Backend Complete API List - All Endpoints

## Overview
Backend में सभी available APIs की complete list। हर API के लिए:
- Endpoint path
- HTTP method
- Request body (if any)
- Response format
- Authentication requirement
- Staff roles who can use it

---

## 📋 TABLE OF CONTENTS
1. [Authentication (8 APIs)](#authentication-8-apis)
2. [Dashboard (1 API)](#dashboard-1-api)
3. [RBAC (3 APIs)](#rbac-3-apis)
4. [Tasks (4 APIs)](#tasks-4-apis)
5. [Orders (5 APIs)](#orders-5-apis)
6. [Support Tickets (8 APIs)](#support-tickets-8-apis)
7. [Finance (8 APIs)](#finance-8-apis)
8. [Marketing (7 APIs)](#marketing-7-apis)
9. [Escalation (2 APIs)](#escalation-2-apis)
10. [Audit (3 APIs)](#audit-3-apis)
11. [System (3 APIs)](#system-3-apis)

---

## 🔐 AUTHENTICATION (8 APIs)

### 1. Login
```
POST /api/staff/auth/login
Auth: No
Body: {
  email: string;
  password: string;
  role: "support" | "ops" | "finance" | "marketing" | "admin";
}
Response: {
  success: true;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}
```
**Used By:** All staff
**Frontend:** LoginPage.tsx

---

### 2. Verify Token
```
POST /api/auth/verify
Auth: Yes (Bearer token)
Body: {
  role: string;
}
Response: {
  success: true;
  user: User;
  token: string;
}
```
**Used By:** All staff
**Frontend:** StaffContext.tsx

---

### 3. Get Current User
```
GET /api/auth/me
Auth: Yes (Bearer token)
Response: {
  success: true;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}
```
**Used By:** All staff
**Frontend:** ProfilePage.tsx

---

### 4. MFA Verify
```
POST /api/staff/auth/mfa/verify
Auth: No
Body: {
  code: string;
  sessionId: string;
}
Response: {
  success: true;
  token: string;
}
```
**Used By:** All staff (if MFA enabled)
**Frontend:** SessionPage.tsx

---

### 5. Logout
```
POST /api/staff/auth/logout
Auth: Yes (Bearer token)
Response: {
  success: true;
}
```
**Used By:** All staff
**Frontend:** All pages

---

### 6. Get Session
```
GET /api/staff/auth/session
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: {
    sessionId: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
  };
}
```
**Used By:** All staff
**Frontend:** SessionPage.tsx

---

### 7. Get All Sessions
```
GET /api/staff/auth/sessions
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: Session[];
}
```
**Used By:** All staff
**Frontend:** SessionPage.tsx

---

### 8. Kill Session
```
DELETE /api/staff/auth/session/{sessionId}
Auth: Yes (Bearer token)
Response: {
  success: true;
}
```
**Used By:** All staff
**Frontend:** SessionPage.tsx

---

## 📊 DASHBOARD (1 API)

### 1. Get Dashboard
```
GET /api/staff/dashboard?role={role}
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: {
    stats: {
      totalTickets: number;
      openTickets: number;
      totalOrders: number;
      pendingOrders: number;
      totalRefunds: number;
      pendingRefunds: number;
    };
    tasks: Task[];
    alerts: Alert[];
  };
}
```
**Used By:** All staff
**Frontend:** DashboardPage.tsx

---

## 👥 RBAC (3 APIs)

### 1. Get User Role
```
GET /api/staff/roles/{userId}
Auth: Yes (Bearer token)
Response: {
  success: true;
  role: string;
  permissions: string[];
}
```
**Used By:** Admin
**Frontend:** Admin panel

---

### 2. Get Permissions
```
GET /api/staff/permissions/{role}
Auth: Yes (Bearer token)
Response: {
  success: true;
  permissions: [
    "view_tickets",
    "reply_tickets",
    "escalate_tickets",
    ...
  ];
}
```
**Used By:** All staff
**Frontend:** Permission checks

---

### 3. Assign Role
```
POST /api/staff/roles/assign
Auth: Yes (Bearer token)
Body: {
  userId: string;
  role: string;
}
Response: {
  success: true;
}
```
**Used By:** Admin
**Frontend:** Admin panel

---

## 📋 TASKS (4 APIs)

### 1. Get Tasks
```
GET /api/staff/tasks
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      title: string;
      description: string;
      status: "pending" | "in_progress" | "completed";
      assignedTo: string;
      dueDate: string;
      priority: "high" | "medium" | "low";
    }
  ];
}
```
**Used By:** All staff
**Frontend:** DashboardPage.tsx

---

### 2. Get Task Detail
```
GET /api/staff/tasks/{taskId}
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: Task;
}
```
**Used By:** All staff
**Frontend:** Task detail modal

---

### 3. Complete Task
```
POST /api/staff/tasks/{taskId}/complete
Auth: Yes (Bearer token)
Response: {
  success: true;
}
```
**Used By:** All staff
**Frontend:** Task actions

---

### 4. Assign Task
```
POST /api/staff/tasks/{taskId}/assign
Auth: Yes (Bearer token)
Body: {
  assigneeId: string;
}
Response: {
  success: true;
}
```
**Used By:** Admin
**Frontend:** Admin panel

---

## 📦 ORDERS (5 APIs)

### 1. Get Order Queue
```
GET /api/staff/orders
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      type: string;
      vendor: string;
      status: string;
      sla: string;
      risk: "critical" | "warning" | "normal";
      customer: string;
      customerId: string;
      amount: number;
      rawStatus: string;
    }
  ];
}
```
**Used By:** OPS staff
**Frontend:** OpsOrderQueuePage.tsx

---

### 2. Get Order Detail
```
GET /api/staff/orders/{orderId}
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: Order;
}
```
**Used By:** OPS staff, Support staff (read-only)
**Frontend:** Order detail modal

---

### 3. Get Assignable Vendors
```
GET /api/staff/vendors
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: {
    vendors: [
      {
        id: string;
        orgId: string;
        name: string;
        location: string;
        score: number;
        priority: number;
        isApproved: boolean;
      }
    ];
  };
}
```
**Used By:** OPS staff
**Frontend:** OpsOrderQueuePage.tsx (reassign modal)

---

### 4. Reassign Vendor
```
POST /api/staff/orders/{orderId}/reassign-vendor
Auth: Yes (Bearer token)
Body: {
  newVendorId: string;
  reason: string;
}
Response: {
  success: true;
}
```
**Used By:** OPS staff
**Frontend:** OpsOrderQueuePage.tsx (reassign modal)

---

### 5. Raise Clarification
```
POST /api/staff/orders/{orderId}/clarification
Auth: Yes (Bearer token)
Body: {
  message: string;
}
Response: {
  success: true;
}
```
**Used By:** OPS staff
**Frontend:** OpsOrderQueuePage.tsx (clarify modal)

---

## 🎧 SUPPORT TICKETS (8 APIs)

### 1. Get Support Tickets
```
GET /api/staff/tickets
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      _id: string;
      subject: string;
      description: string;
      category: string;
      status: "open" | "in_progress" | "resolved" | "closed";
      priority: "urgent" | "high" | "medium" | "low";
      orderId?: string;
      replies?: Array<{
        authorRole: string;
        message: string;
        createdAt: string;
      }>;
      createdAt: string;
    }
  ];
}
```
**Used By:** Support staff (customer)
**Frontend:** TicketQueuePage.tsx

---

### 2. Get Ticket Detail
```
GET /api/staff/tickets/{ticketId}
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: Ticket;
}
```
**Used By:** Support staff (customer)
**Frontend:** TicketQueuePage.tsx (detail modal)

---

### 3. Reply to Ticket
```
POST /api/staff/tickets/{ticketId}/reply
Auth: Yes (Bearer token)
Body: {
  message: string;
}
Response: {
  success: true;
}
```
**Used By:** Support staff (customer)
**Frontend:** TicketQueuePage.tsx (detail modal)

---

### 4. Close Ticket
```
POST /api/staff/tickets/{ticketId}/close
Auth: Yes (Bearer token)
Response: {
  success: true;
}
```
**Used By:** Support staff (customer)
**Frontend:** TicketQueuePage.tsx

---

### 5. Escalate Ticket
```
POST /api/staff/tickets/{ticketId}/escalate
Auth: Yes (Bearer token)
Body: {
  reason: string;
}
Response: {
  success: true;
}
```
**Used By:** Support staff (customer), Support staff (vendor)
**Frontend:** TicketQueuePage.tsx, VendorTicketsPage.tsx

---

### 6. Get Vendor Tickets
```
GET /api/staff/vendor-tickets
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      issue: string;
      vendor: string;
      status: "open" | "in_progress" | "resolved" | "closed";
      sla: string;
      priority: "urgent" | "high" | "medium" | "low";
    }
  ];
}
```
**Used By:** Support staff (vendor)
**Frontend:** VendorTicketsPage.tsx

---

### 7. Reply to Vendor Ticket
```
POST /api/staff/vendor-tickets/{ticketId}/reply
Auth: Yes (Bearer token)
Body: {
  message: string;
}
Response: {
  success: true;
}
```
**Used By:** Support staff (vendor)
**Frontend:** VendorTicketsPage.tsx (detail modal)

---

### 8. Upload Attachments
```
POST /api/staff/uploads/attachments
Auth: Yes (Bearer token)
Body: FormData with file
Response: {
  success: true;
  url: string;
}
```
**Used By:** Support staff
**Frontend:** TicketQueuePage.tsx, VendorTicketsPage.tsx

---

## 💰 FINANCE (8 APIs)

### 1. Get Refunds
```
GET /api/staff/refunds
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      orderId: string;
      customerId: string;
      amount: number;
      reason: string;
      status: "pending" | "approved" | "rejected" | "processed";
      createdAt: string;
    }
  ];
}
```
**Used By:** Finance staff
**Frontend:** RefundQueuePage.tsx

---

### 2. Approve Refund
```
POST /api/staff/refunds/{refundId}/approve
Auth: Yes (Bearer token)
Response: {
  success: true;
}
```
**Used By:** Finance staff
**Frontend:** RefundQueuePage.tsx

---

### 3. Escalate Refund
```
POST /api/staff/refunds/{refundId}/escalate
Auth: Yes (Bearer token)
Body: {
  reason: string;
}
Response: {
  success: true;
}
```
**Used By:** Finance staff
**Frontend:** RefundQueuePage.tsx

---

### 4. Credit Wallet
```
POST /api/staff/wallet/credit
Auth: Yes (Bearer token)
Body: {
  userId: string;
  amount: number;
  reason?: string;
}
Response: {
  success: true;
}
```
**Used By:** Finance staff
**Frontend:** PayoutAssistPage.tsx

---

### 5. Debit Wallet
```
POST /api/staff/wallet/debit
Auth: Yes (Bearer token)
Body: {
  userId: string;
  amount: number;
  reason?: string;
}
Response: {
  success: true;
}
```
**Used By:** Finance staff
**Frontend:** PayoutAssistPage.tsx

---

### 6. Get Wallet Ledger
```
GET /api/staff/wallet/ledger
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      userId: string;
      type: "credit" | "debit";
      amount: number;
      reason: string;
      balance: number;
      createdAt: string;
    }
  ];
}
```
**Used By:** Finance staff
**Frontend:** LedgerViewPage.tsx, PayoutAssistPage.tsx

---

### 7. Get Payouts
```
GET /api/staff/payouts
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      vendorId: string;
      amount: number;
      status: "pending" | "processing" | "completed" | "failed";
      dueDate: string;
      createdAt: string;
    }
  ];
}
```
**Used By:** Finance staff
**Frontend:** PayoutAssistPage.tsx

---

### 8. Issue Payout Ticket
```
POST /api/staff/payouts/issue-ticket
Auth: Yes (Bearer token)
Body: {
  payoutId: string;
  issueDetails: string;
}
Response: {
  success: true;
}
```
**Used By:** Finance staff
**Frontend:** PayoutAssistPage.tsx

---

## 📢 MARKETING (7 APIs)

### 1. Get Campaigns
```
GET /api/staff/campaigns
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      name: string;
      description: string;
      status: "active" | "inactive" | "scheduled";
      startDate: string;
      endDate: string;
      budget: number;
      spent: number;
    }
  ];
}
```
**Used By:** Marketing staff
**Frontend:** CampaignsPage.tsx

---

### 2. Get Coupons
```
GET /api/admin/coupons
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      code: string;
      description: string;
      discountType: "percentage" | "flat";
      discountValue: number;
      maxDiscount?: number;
      minOrderValue?: number;
      usageLimit?: number;
      perUserLimit?: number;
      isActive: boolean;
      expiresAt: string;
    }
  ];
}
```
**Used By:** Marketing staff
**Frontend:** CampaignsPage.tsx

---

### 3. Get Coupon Detail
```
GET /api/admin/coupons/{couponId}
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: Coupon;
}
```
**Used By:** Marketing staff
**Frontend:** CampaignsPage.tsx

---

### 4. Create Coupon
```
POST /api/admin/coupons
Auth: Yes (Bearer token)
Body: {
  code: string;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  applicableFlows?: string[];
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
  expiresAt?: string;
}
Response: {
  success: true;
  data: Coupon;
}
```
**Used By:** Marketing staff
**Frontend:** CampaignsPage.tsx

---

### 5. Update Coupon
```
PUT /api/admin/coupons/{couponId}
Auth: Yes (Bearer token)
Body: {
  description?: string;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  maxDiscount?: number;
  minOrderValue?: number;
  applicableFlows?: string[];
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
  expiresAt?: string;
}
Response: {
  success: true;
  data: Coupon;
}
```
**Used By:** Marketing staff
**Frontend:** CampaignsPage.tsx

---

### 6. Delete Coupon
```
DELETE /api/admin/coupons/{couponId}
Auth: Yes (Bearer token)
Response: {
  success: true;
}
```
**Used By:** Marketing staff
**Frontend:** CampaignsPage.tsx

---

### 7. Get Coupon Usage
```
GET /api/admin/coupons/{couponId}/usage
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: {
    couponId: string;
    totalUsed: number;
    uniqueUsers: number;
    totalDiscount: number;
    lastUsed: string;
  };
}
```
**Used By:** Marketing staff
**Frontend:** CampaignsPage.tsx

---

## 🚨 ESCALATION (2 APIs)

### 1. Trigger Escalation
```
POST /api/staff/escalation
Auth: Yes (Bearer token)
Body: {
  entityId: string;
  type: "ticket" | "order" | "refund" | "payout";
  reason: string;
}
Response: {
  success: true;
}
```
**Used By:** All staff
**Frontend:** All pages (escalate buttons)

---

### 2. Get Escalations
```
GET /api/staff/escalations
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      entityId: string;
      type: string;
      reason: string;
      status: "pending" | "resolved";
      createdAt: string;
    }
  ];
}
```
**Used By:** Admin
**Frontend:** Admin panel

---

## 📊 AUDIT (3 APIs)

### 1. Get Audit Logs
```
GET /api/staff/audit/logs
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      action: string;
      actor: string;
      resource: string;
      changes: object;
      timestamp: string;
    }
  ];
}
```
**Used By:** Finance staff, Admin
**Frontend:** LedgerViewPage.tsx

---

### 2. Get Activity Logs
```
GET /api/staff/activity
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      id: string;
      userId: string;
      action: string;
      timestamp: string;
    }
  ];
}
```
**Used By:** All staff
**Frontend:** Activity view

---

### 3. Get Performance Metrics
```
GET /api/staff/performance
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: {
    ticketsResolved: number;
    avgResolutionTime: number;
    customerSatisfaction: number;
    ordersProcessed: number;
  };
}
```
**Used By:** All staff
**Frontend:** Dashboard, Performance view

---

## ⚙️ SYSTEM (3 APIs)

### 1. Get System Status
```
GET /api/staff/system/status
Auth: Yes (Bearer token)
Response: {
  success: true;
  status: "online" | "offline";
  uptime: number;
  lastCheck: string;
}
```
**Used By:** Admin
**Frontend:** Admin panel

---

### 2. Check Permissions
```
GET /api/staff/permissions/check
Auth: Yes (Bearer token)
Response: {
  success: true;
  permissions: string[];
}
```
**Used By:** All staff
**Frontend:** Permission checks

---

### 3. Conflict Lock
```
POST /api/staff/conflict/lock
Auth: Yes (Bearer token)
Body: {
  resourceId: string;
  lockType: "read" | "write";
}
Response: {
  success: true;
  locked: boolean;
}
```
**Used By:** All staff
**Frontend:** Concurrent edit prevention

---

## 📊 SUMMARY TABLE

| Category | Count | Endpoints |
|----------|-------|-----------|
| Authentication | 8 | Login, Verify, Me, MFA, Logout, Session, Sessions, Kill |
| Dashboard | 1 | Get Dashboard |
| RBAC | 3 | User Role, Permissions, Assign Role |
| Tasks | 4 | Get, Detail, Complete, Assign |
| Orders | 5 | Queue, Detail, Vendors, Reassign, Clarify |
| Support | 8 | Tickets, Detail, Reply, Close, Escalate, Vendor, Reply Vendor, Upload |
| Finance | 8 | Refunds, Approve, Escalate, Credit, Debit, Ledger, Payouts, Issue Ticket |
| Marketing | 7 | Campaigns, Coupons, Detail, Create, Update, Delete, Usage |
| Escalation | 2 | Trigger, Get |
| Audit | 3 | Logs, Activity, Metrics |
| System | 3 | Status, Permissions, Lock |
| **TOTAL** | **52** | **All endpoints** |

---

## 🔐 Authentication

### All APIs Require
```
Header: Authorization: Bearer {token}
```

### Except
- `POST /api/staff/auth/login` (No auth needed)
- `POST /api/staff/auth/mfa/verify` (No auth needed)

---

## 📝 Response Format

### Success
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

### Error
```json
{
  "success": false,
  "error": "Error code",
  "message": "Error description"
}
```

---

## 🧪 Testing

### Using curl
```bash
# Login
curl -X POST http://localhost:4000/api/staff/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"support@speedcopy.com","password":"password","role":"support"}'

# Get Tickets
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/staff/tickets

# Send Reply
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Reply text"}' \
  http://localhost:4000/api/staff/tickets/ID/reply
```

### Using Postman
1. Create collection
2. Add requests for each endpoint
3. Set Authorization header
4. Test each endpoint

---

## ✅ Implementation Status

### All 52 APIs
- ✅ Documented
- ✅ Categorized
- ✅ Tested
- ✅ Production-ready

---

**Last Updated:** May 1, 2026
**Total APIs:** 52
**Status:** ✅ Complete
