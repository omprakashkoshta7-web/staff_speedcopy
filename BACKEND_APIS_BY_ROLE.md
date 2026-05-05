# 🎯 Backend APIs by Staff Role - Complete Reference

## Overview
यह document सभी backend APIs को staff roles के हिसाब से organize करता है। हर role के लिए कौन से APIs available हैं, कहाँ use होते हैं, और क्या data return करते हैं।

---

## 📋 TABLE OF CONTENTS
1. [Support Staff (Customer)](#support-staff-customer)
2. [Support Staff (Vendor)](#support-staff-vendor)
3. [OPS Staff](#ops-staff)
4. [Finance Staff](#finance-staff)
5. [Marketing Staff](#marketing-staff)
6. [All Staff (Common)](#all-staff-common)

---

## 🎧 SUPPORT STAFF (CUSTOMER)

### Role Purpose
Customer support tickets को handle करना, issues resolve करना, और escalate करना।

### Screen: Ticket Queue (`TicketQueuePage.tsx`)

#### API 1: Get All Tickets
```
GET /api/staff/tickets
Header: Authorization: Bearer {token}
Response: { success: true, data: Ticket[] }
```

**Ticket Object Structure:**
```typescript
{
  _id: string;              // MongoDB ID (REQUIRED for API calls)
  id?: string;              // Alternative ID
  ticketId?: string;        // Alternative ID
  subject: string;          // Ticket title
  description?: string;     // Detailed issue
  category: string;         // Issue category
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "urgent" | "high" | "medium" | "low";
  orderId?: string;         // Linked order (if any)
  replies?: Array<{
    authorRole: string;     // "support" | "customer" | "admin"
    message: string;
    createdAt: string;      // ISO format
  }>;
  createdAt: string;        // ISO format
}
```

**Used In:**
- `TicketQueuePage.tsx` - Line 47: `fetchTickets()`
- Displays in table/mobile cards
- Shows: subject, status, priority, SLA, age

**Console Logs:**
```
📋 Tickets API response: {...}
✅ Parsed tickets: 5 tickets
🔍 First ticket structure: {...}
```

---

#### API 2: Get Ticket Detail
```
GET /api/staff/tickets/{_id}
Header: Authorization: Bearer {token}
Response: { success: true, data: Ticket }
```

**Used In:**
- `TicketQueuePage.tsx` - Detail modal
- Shows full ticket info with reply history

---

#### API 3: Reply to Ticket
```
POST /api/staff/tickets/{_id}/reply
Header: Authorization: Bearer {token}
Body: { message: string }
Response: { success: true }
```

**Used In:**
- `TicketQueuePage.tsx` - Line 73: `doReply()`
- Support staff sends reply to customer
- Requires: Valid `_id` (not fallback ID)

**Error Handling:**
```
if (!id || id.startsWith("ticket-")) {
  setErr("Cannot send reply: Ticket ID is missing");
  return;
}
```

---

#### API 4: Close Ticket
```
POST /api/staff/tickets/{_id}/close
Header: Authorization: Bearer {token}
Response: { success: true }
```

**Used In:**
- `TicketQueuePage.tsx` - (Available but not shown in UI)
- Closes resolved tickets

---

#### API 5: Escalate Ticket
```
POST /api/staff/tickets/{_id}/escalate
Header: Authorization: Bearer {token}
Body: { reason: string }
Response: { success: true }
```

**Used In:**
- `TicketQueuePage.tsx` - Line 64: `doEscalate()`
- Escalates to admin when needed
- Updates: priority → "urgent", status → "in_progress"

**Error Handling:**
```
if (!id || id.startsWith("ticket-")) {
  setErr("Cannot escalate: Ticket ID is missing");
  return;
}
```

---

#### API 6: Get Order Detail (Read-Only)
```
GET /api/staff/orders/{orderId}
Header: Authorization: Bearer {token}
Response: { success: true, data: Order }
```

**Used In:**
- `TicketQueuePage.tsx` - Detail modal
- Shows linked order info (read-only)
- Ticket can have `orderId` field

---

#### API 7: Upload Attachments
```
POST /api/staff/uploads/attachments
Header: Authorization: Bearer {token}
Body: FormData with file
Response: { success: true, url: string }
```

**Used In:**
- `TicketQueuePage.tsx` - (Available for future use)
- Attach files to ticket replies

---

### Summary: Support Staff (Customer)
| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Tickets | GET | `/api/staff/tickets` | List all tickets |
| Get Detail | GET | `/api/staff/tickets/{_id}` | View ticket details |
| Reply | POST | `/api/staff/tickets/{_id}/reply` | Send reply to customer |
| Close | POST | `/api/staff/tickets/{_id}/close` | Close ticket |
| Escalate | POST | `/api/staff/tickets/{_id}/escalate` | Escalate to admin |
| Get Order | GET | `/api/staff/orders/{orderId}` | View linked order |
| Upload | POST | `/api/staff/uploads/attachments` | Attach files |

**Total: 7 APIs**

---

## 🏢 SUPPORT STAFF (VENDOR)

### Role Purpose
Internal vendor tickets को handle करना, vendor issues resolve करना।

### Screen: Vendor Ticket Queue (`VendorTicketsPage.tsx`)

#### API 1: Get Vendor Tickets
```
GET /api/staff/vendor-tickets
Header: Authorization: Bearer {token}
Response: { success: true, data: Ticket[] }
```

**Ticket Object Structure:**
```typescript
{
  id?: string;              // Ticket ID (REQUIRED for API calls)
  _id?: string;             // Alternative ID
  ticketId?: string;        // Alternative ID
  issue: string;            // Issue description
  vendor: string;           // Vendor name
  status: "open" | "in_progress" | "resolved" | "closed";
  sla: string;              // SLA time (e.g., "2h", "1d")
  priority: "urgent" | "high" | "medium" | "low";
}
```

**Used In:**
- `VendorTicketsPage.tsx` - Line 35: `fetchTickets()`
- Displays in table/mobile cards
- Shows: issue, vendor, status, SLA

**Console Logs:**
```
📋 Vendor Tickets API response: {...}
✅ Parsed vendor tickets: 3 tickets
🔍 First vendor ticket structure: {...}
```

---

#### API 2: Reply to Vendor Ticket
```
POST /api/staff/vendor-tickets/{id}/reply
Header: Authorization: Bearer {token}
Body: { message: string }
Response: { success: true }
```

**Used In:**
- `VendorTicketsPage.tsx` - Line 60: `doResolve()`
- Support staff sends reply to vendor
- Requires: Valid `id` (not fallback ID)

**Error Handling:**
```
if (!id || id.startsWith("ticket-")) {
  setErr("Cannot send reply: Ticket ID is missing");
  return;
}
```

---

#### API 3: Escalate Vendor Ticket
```
POST /api/staff/tickets/{id}/escalate
Header: Authorization: Bearer {token}
Body: { reason: string }
Response: { success: true }
```

**Used In:**
- `VendorTicketsPage.tsx` - Line 72: `doEscalate()`
- Escalates vendor issue to admin
- Updates: status → "in_progress"

**Error Handling:**
```
if (!id || id.startsWith("ticket-")) {
  setErr("Cannot escalate: Ticket ID is missing");
  return;
}
```

---

### Summary: Support Staff (Vendor)
| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Tickets | GET | `/api/staff/vendor-tickets` | List vendor tickets |
| Reply | POST | `/api/staff/vendor-tickets/{id}/reply` | Send reply to vendor |
| Escalate | POST | `/api/staff/tickets/{id}/escalate` | Escalate to admin |

**Total: 3 APIs**

---

## 📦 OPS STAFF

### Role Purpose
Order management, vendor assignment, clarifications।

### Screen: Order Queue (`OpsOrderQueuePage.tsx`)

#### API 1: Get Order Queue
```
GET /api/staff/orders
Header: Authorization: Bearer {token}
Response: { success: true, data: Order[] }
```

**Order Object Structure:**
```typescript
{
  id: string;               // Order ID (REQUIRED for API calls)
  _id?: string;             // MongoDB ID
  orderId?: string;         // Alternative ID
  orderNumber?: string;     // Order number
  type: string;             // Order type
  vendor: string;           // Vendor name
  status: string;           // Order status
  sla: string;              // SLA time
  risk: "critical" | "warning" | "normal";
  customer: string;         // Customer name
  rawStatus: string;        // Raw status from backend
  customerId: string;       // Customer ID
  amount: number;           // Order amount
}
```

**Used In:**
- `OpsOrderQueuePage.tsx` - Line 50: `fetchOrders()`
- Displays in table/mobile cards
- Shows: type, vendor, status, SLA, risk, customer

**Console Logs:**
```
📦 Order queue API response: {...}
✅ Total orders received: 10 orders
🔍 First order structure: {...}
```

---

#### API 2: Get Order Detail
```
GET /api/staff/orders/{id}
Header: Authorization: Bearer {token}
Response: { success: true, data: Order }
```

**Used In:**
- `OpsOrderQueuePage.tsx` - Detail view
- Shows full order information

---

#### API 3: Get Assignable Vendors
```
GET /api/staff/vendors
Header: Authorization: Bearer {token}
Response: { success: true, data: { vendors: Vendor[] } }
```

**Vendor Object Structure:**
```typescript
{
  id: string;               // Vendor ID
  orgId: string;            // Organization ID
  name: string;             // Vendor name
  location: string;         // Vendor location
  score: number;            // Performance score (0-100)
  priority: number;         // Priority level
  isApproved?: boolean;     // Approval status
}
```

**Used In:**
- `OpsOrderQueuePage.tsx` - Line 80: `fetchVendors()`
- Reassign modal - vendor selection dropdown

**Console Logs:**
```
🏢 Vendors API response: {...}
✅ Vendors loaded: 5 vendors
```

---

#### API 4: Reassign Vendor
```
POST /api/staff/orders/{id}/reassign-vendor
Header: Authorization: Bearer {token}
Body: { newVendorId: string, reason: string }
Response: { success: true }
```

**Used In:**
- `OpsOrderQueuePage.tsx` - Reassign modal
- Changes vendor for order
- Requires: Valid `id` and `newVendorId`

**Reasons Available:**
```
- "Vendor SLA breach"
- "Vendor capacity full"
- "Vendor suspended"
- "Quality concern"
```

---

#### API 5: Raise Clarification
```
POST /api/staff/orders/{id}/clarification
Header: Authorization: Bearer {token}
Body: { message: string }
Response: { success: true }
```

**Used In:**
- `OpsOrderQueuePage.tsx` - Clarify modal
- Sends clarification message to vendor
- Requires: Valid `id`

---

### Summary: OPS Staff
| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Queue | GET | `/api/staff/orders` | List orders |
| Get Detail | GET | `/api/staff/orders/{id}` | View order details |
| Get Vendors | GET | `/api/staff/vendors` | List assignable vendors |
| Reassign | POST | `/api/staff/orders/{id}/reassign-vendor` | Change vendor |
| Clarify | POST | `/api/staff/orders/{id}/clarification` | Send clarification |

**Total: 5 APIs**

---

## 💰 FINANCE STAFF

### Role Purpose
Refunds, wallet management, payouts, ledger audit।

### Screen 1: Refund Queue (`RefundQueuePage.tsx`)

#### API 1: Get Refunds
```
GET /api/staff/refunds
Header: Authorization: Bearer {token}
Response: { success: true, data: Refund[] }
```

**Refund Object Structure:**
```typescript
{
  id: string;               // Refund ID
  orderId: string;          // Order ID
  customerId: string;       // Customer ID
  amount: number;           // Refund amount
  reason: string;           // Refund reason
  status: "pending" | "approved" | "rejected" | "processed";
  createdAt: string;        // ISO format
}
```

---

#### API 2: Approve Refund
```
POST /api/staff/refunds/{id}/approve
Header: Authorization: Bearer {token}
Response: { success: true }
```

---

#### API 3: Escalate Refund
```
POST /api/staff/refunds/{id}/escalate
Header: Authorization: Bearer {token}
Body: { reason: string }
Response: { success: true }
```

---

### Screen 2: Wallet Adjustment (`PayoutAssistPage.tsx`)

#### API 4: Credit Wallet
```
POST /api/staff/wallet/credit
Header: Authorization: Bearer {token}
Body: { userId: string, amount: number, reason?: string }
Response: { success: true }
```

**Reason Examples:**
```
- "Refund processed"
- "Compensation"
- "Adjustment"
```

---

#### API 5: Debit Wallet
```
POST /api/staff/wallet/debit
Header: Authorization: Bearer {token}
Body: { userId: string, amount: number, reason?: string }
Response: { success: true }
```

---

#### API 6: Get Wallet Ledger
```
GET /api/staff/wallet/ledger
Header: Authorization: Bearer {token}
Response: { success: true, data: LedgerEntry[] }
```

**LedgerEntry Object:**
```typescript
{
  id: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  balance: number;
  createdAt: string;
}
```

---

### Screen 3: Payout Assistance (`PayoutAssistPage.tsx`)

#### API 7: Get Payouts
```
GET /api/staff/payouts
Header: Authorization: Bearer {token}
Response: { success: true, data: Payout[] }
```

**Payout Object:**
```typescript
{
  id: string;
  vendorId: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  dueDate: string;
  createdAt: string;
}
```

---

#### API 8: Issue Payout Ticket
```
POST /api/staff/payouts/issue-ticket
Header: Authorization: Bearer {token}
Body: { payoutId: string, issueDetails: string }
Response: { success: true }
```

---

### Screen 4: Ledger View (`LedgerViewPage.tsx`)

#### API 9: Get Audit Logs
```
GET /api/staff/audit/logs
Header: Authorization: Bearer {token}
Response: { success: true, data: AuditLog[] }
```

**AuditLog Object:**
```typescript
{
  id: string;
  action: string;
  actor: string;
  resource: string;
  changes: object;
  timestamp: string;
}
```

---

### Summary: Finance Staff
| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Refunds | GET | `/api/staff/refunds` | List refunds |
| Approve | POST | `/api/staff/refunds/{id}/approve` | Approve refund |
| Escalate | POST | `/api/staff/refunds/{id}/escalate` | Escalate refund |
| Credit | POST | `/api/staff/wallet/credit` | Add to wallet |
| Debit | POST | `/api/staff/wallet/debit` | Remove from wallet |
| Ledger | GET | `/api/staff/wallet/ledger` | View ledger |
| Payouts | GET | `/api/staff/payouts` | List payouts |
| Issue Ticket | POST | `/api/staff/payouts/issue-ticket` | Create payout ticket |
| Audit | GET | `/api/staff/audit/logs` | View audit logs |

**Total: 9 APIs**

---

## 📢 MARKETING STAFF

### Role Purpose
Campaigns, coupons, user targeting, analytics।

### Screen: Campaigns & Offers (`CampaignsPage.tsx`)

#### API 1: Get Campaigns
```
GET /api/staff/campaigns
Header: Authorization: Bearer {token}
Response: { success: true, data: Campaign[] }
```

**Campaign Object:**
```typescript
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
```

---

#### API 2: Get Coupons
```
GET /api/admin/coupons
Header: Authorization: Bearer {token}
Response: { success: true, data: Coupon[] }
```

**Coupon Object:**
```typescript
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
```

---

#### API 3: Get Coupon Detail
```
GET /api/admin/coupons/{id}
Header: Authorization: Bearer {token}
Response: { success: true, data: Coupon }
```

---

#### API 4: Create Coupon
```
POST /api/admin/coupons
Header: Authorization: Bearer {token}
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
Response: { success: true, data: Coupon }
```

---

#### API 5: Update Coupon
```
PUT /api/admin/coupons/{id}
Header: Authorization: Bearer {token}
Body: { ...coupon fields }
Response: { success: true, data: Coupon }
```

---

#### API 6: Delete Coupon
```
DELETE /api/admin/coupons/{id}
Header: Authorization: Bearer {token}
Response: { success: true }
```

---

#### API 7: Get Coupon Usage
```
GET /api/admin/coupons/{id}/usage
Header: Authorization: Bearer {token}
Response: { success: true, data: Usage }
```

**Usage Object:**
```typescript
{
  couponId: string;
  totalUsed: number;
  uniqueUsers: number;
  totalDiscount: number;
  lastUsed: string;
}
```

---

#### API 8: Get Analytics Reports
```
GET /api/staff/analytics/reports
Header: Authorization: Bearer {token}
Response: { success: true, data: Report[] }
```

---

### Summary: Marketing Staff
| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Campaigns | GET | `/api/staff/campaigns` | List campaigns |
| Coupons | GET | `/api/admin/coupons` | List coupons |
| Detail | GET | `/api/admin/coupons/{id}` | View coupon |
| Create | POST | `/api/admin/coupons` | Create coupon |
| Update | PUT | `/api/admin/coupons/{id}` | Update coupon |
| Delete | DELETE | `/api/admin/coupons/{id}` | Delete coupon |
| Usage | GET | `/api/admin/coupons/{id}/usage` | View usage stats |
| Analytics | GET | `/api/staff/analytics/reports` | View reports |

**Total: 8 APIs**

---

## 👥 ALL STAFF (COMMON)

### APIs Available to All Staff Roles

#### API 1: Login
```
POST /api/staff/auth/login
Body: { email: string, password: string, role: string }
Response: { success: true, token: string, user: User }
```

---

#### API 2: Verify Token
```
POST /api/auth/verify
Header: Authorization: Bearer {token}
Body: { role: string }
Response: { success: true, user: User, token: string }
```

---

#### API 3: Get Current User
```
GET /api/auth/me
Header: Authorization: Bearer {token}
Response: { success: true, user: User }
```

---

#### API 4: Logout
```
POST /api/staff/auth/logout
Header: Authorization: Bearer {token}
Response: { success: true }
```

---

#### API 5: Get Dashboard
```
GET /api/staff/dashboard?role={role}
Header: Authorization: Bearer {token}
Response: { success: true, data: Dashboard }
```

---

#### API 6: Get Tasks
```
GET /api/staff/tasks
Header: Authorization: Bearer {token}
Response: { success: true, data: Task[] }
```

---

#### API 7: Complete Task
```
POST /api/staff/tasks/{id}/complete
Header: Authorization: Bearer {token}
Response: { success: true }
```

---

#### API 8: Trigger Escalation
```
POST /api/staff/escalation
Header: Authorization: Bearer {token}
Body: { entityId: string, type: string, reason: string }
Response: { success: true }
```

---

#### API 9: Get Escalations
```
GET /api/staff/escalations
Header: Authorization: Bearer {token}
Response: { success: true, data: Escalation[] }
```

---

#### API 10: Get Activity Logs
```
GET /api/staff/activity
Header: Authorization: Bearer {token}
Response: { success: true, data: Activity[] }
```

---

#### API 11: Get Performance Metrics
```
GET /api/staff/performance
Header: Authorization: Bearer {token}
Response: { success: true, data: Metrics }
```

---

### Summary: All Staff
| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Login | POST | `/api/staff/auth/login` | Authenticate |
| Verify | POST | `/api/auth/verify` | Verify token |
| Me | GET | `/api/auth/me` | Get current user |
| Logout | POST | `/api/staff/auth/logout` | Logout |
| Dashboard | GET | `/api/staff/dashboard` | Get dashboard |
| Tasks | GET | `/api/staff/tasks` | List tasks |
| Complete | POST | `/api/staff/tasks/{id}/complete` | Complete task |
| Escalate | POST | `/api/staff/escalation` | Trigger escalation |
| Escalations | GET | `/api/staff/escalations` | List escalations |
| Activity | GET | `/api/staff/activity` | View activity |
| Metrics | GET | `/api/staff/performance` | View metrics |

**Total: 11 APIs**

---

## 📊 COMPLETE API SUMMARY

### By Role
| Role | APIs | Total |
|------|------|-------|
| Support (Customer) | 7 | 7 |
| Support (Vendor) | 3 | 3 |
| OPS | 5 | 5 |
| Finance | 9 | 9 |
| Marketing | 8 | 8 |
| All Staff | 11 | 11 |
| **TOTAL** | - | **43** |

### By Category
| Category | Count |
|----------|-------|
| Auth | 4 |
| Support | 10 |
| Orders | 5 |
| Finance | 9 |
| Marketing | 8 |
| Common | 7 |
| **TOTAL** | **43** |

---

## 🔑 Key Points

### 1. ID Fields
- **Support Tickets:** Use `_id` field for API calls
- **Vendor Tickets:** Use `id` field for API calls
- **Orders:** Use `id` field for API calls
- **Always validate:** Check if ID is not a fallback (`ticket-0`, `ticket-1`, etc.)

### 2. Response Handling
```typescript
// All APIs return this format
{
  success: true,
  data: {...},
  message?: "Optional message"
}
```

### 3. Error Handling
```typescript
// Check for missing IDs before API calls
if (!id || id.startsWith("ticket-")) {
  setErr("Cannot perform action: ID is missing");
  return;
}
```

### 4. Console Logging
```typescript
// Use emoji-prefixed logs for debugging
📋 Tickets API response: {...}
✅ Parsed tickets: 5 tickets
🔍 First ticket structure: {...}
❌ Fetch error: {...}
```

### 5. Status Values
- **Tickets:** `open`, `in_progress`, `resolved`, `closed`
- **Orders:** `pending`, `assigned`, `in_progress`, `completed`, `cancelled`
- **Refunds:** `pending`, `approved`, `rejected`, `processed`

### 6. Priority Values
- `urgent`, `high`, `medium`, `low`

### 7. Timestamps
- All timestamps in ISO format: `2024-01-15T10:30:00Z`

---

## 🧪 Testing APIs

### Using curl
```bash
# Get tickets
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/staff/tickets

# Send reply
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Reply text"}' \
  http://localhost:4000/api/staff/tickets/ID/reply
```

### Using Postman
1. Create collection
2. Set Authorization header: `Bearer TOKEN`
3. Test each endpoint
4. Check response format

---

## ✅ Implementation Checklist

### Support Staff (Customer)
- [x] Get tickets
- [x] View ticket detail
- [x] Send reply
- [x] Escalate ticket
- [x] View linked order

### Support Staff (Vendor)
- [x] Get vendor tickets
- [x] Send reply to vendor
- [x] Escalate vendor ticket

### OPS Staff
- [x] Get order queue
- [x] View order detail
- [x] Get assignable vendors
- [x] Reassign vendor
- [x] Raise clarification

### Finance Staff
- [x] Get refunds
- [x] Approve refund
- [x] Credit/debit wallet
- [x] View ledger
- [x] Get payouts

### Marketing Staff
- [x] Get campaigns
- [x] Manage coupons
- [x] View analytics

### All Staff
- [x] Login/logout
- [x] Dashboard
- [x] Tasks
- [x] Escalations
- [x] Activity logs

---

## 📞 Support

For questions about:
- **API endpoints:** See `BACKEND_API_REFERENCE.md`
- **Field mapping:** See `FIELD_REFERENCE.md`
- **Workflow:** See `WORKFLOW_SUMMARY.md`
- **Integration:** See `BACKEND_INTEGRATION_GUIDE.md`

---

**Last Updated:** May 1, 2026
**Status:** ✅ All APIs Documented
**Total APIs:** 43 (across all roles)
