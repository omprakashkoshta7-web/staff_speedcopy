# 📱 Screen Data Flow - Complete Reference

## Overview
यह document हर screen के लिए data flow को दिखाता है:
1. कौन से APIs call होते हैं
2. Backend से क्या data आता है
3. Frontend में कैसे display होता है
4. कौन से actions available हैं

---

## 📋 TABLE OF CONTENTS
1. [Ticket Queue (Support)](#ticket-queue-support)
2. [Vendor Ticket Queue](#vendor-ticket-queue)
3. [Order Queue (OPS)](#order-queue-ops)
4. [Refund Queue (Finance)](#refund-queue-finance)
5. [Payout Assist (Finance)](#payout-assist-finance)
6. [Ledger View (Finance)](#ledger-view-finance)
7. [Campaigns (Marketing)](#campaigns-marketing)

---

## 🎧 TICKET QUEUE (SUPPORT)

### File: `src/pages/support/TicketQueuePage.tsx`

### Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Component Mounts                                         │
│    useEffect(() => { fetchTickets(); }, [])                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. API Call                                                 │
│    GET /api/staff/tickets                                  │
│    Header: Authorization: Bearer {token}                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend Response                                         │
│    {                                                        │
│      success: true,                                         │
│      data: [                                                │
│        {                                                    │
│          _id: "507f1f77bcf86cd799439011",                  │
│          subject: "Payment not received",                   │
│          status: "open",                                    │
│          priority: "high",                                  │
│          createdAt: "2024-01-15T10:30:00Z",                │
│          ...                                                │
│        }                                                    │
│      ]                                                      │
│    }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Data Normalization (Line 47-60)                          │
│    - Ensure each ticket has _id                            │
│    - Fallback: _id || id || ticketId || 'ticket-{idx}'    │
│    - Validate: Check if ID is not fallback                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. State Update                                             │
│    setItems(tickets)                                        │
│    Console logs:                                            │
│    📋 Tickets API response: {...}                          │
│    ✅ Parsed tickets: 5 tickets                            │
│    🔍 First ticket structure: {...}                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. UI Rendering                                             │
│    - Desktop: Grid layout (5 columns)                       │
│    - Mobile: Card layout                                    │
│    - Shows: subject, status, priority, age, action button  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. User Interaction                                         │
│    - Click "Handle" button                                  │
│    - Opens detail modal                                     │
│    - Shows full ticket info + reply form                    │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step Data Flow

#### Step 1: Initial Load
```typescript
useEffect(() => { fetchTickets(); }, []);
```
- Component mounts
- Calls `fetchTickets()` function

#### Step 2: API Call
```typescript
const r = await staffService.getTickets();
```
- Endpoint: `GET /api/staff/tickets`
- Header: `Authorization: Bearer {token}`
- Response: `{ success: true, data: Ticket[] }`

#### Step 3: Response Handling
```typescript
console.log('📋 Tickets API response:', r);

let tickets: Ticket[] = [];

if (r.success) {
  if (r.data?.tickets && Array.isArray(r.data.tickets)) {
    tickets = r.data.tickets;
  } else if (Array.isArray(r.data)) {
    tickets = r.data;
  } else if (r.data && typeof r.data === 'object') {
    tickets = [r.data];
  }
}
```
- Handles multiple response formats
- Supports: `{ data: [...] }`, `{ data: { tickets: [...] } }`, single object

#### Step 4: Data Normalization
```typescript
tickets = tickets.map((t, idx) => ({
  ...t,
  _id: t._id || t.id || t.ticketId || `ticket-${idx}`,
  id: t.id || t._id || t.ticketId || `ticket-${idx}`
}));
```
- Ensures every ticket has `_id` field
- Fallback: `ticket-0`, `ticket-1`, etc. (for display only)

#### Step 5: Console Logging
```typescript
console.log('✅ Parsed tickets:', tickets.length, tickets);
if (tickets.length > 0) {
  console.log('🔍 First ticket structure:', {
    _id: tickets[0]._id,
    id: tickets[0].id,
    ticketId: tickets[0].ticketId,
    subject: tickets[0].subject,
    allKeys: Object.keys(tickets[0])
  });
}
```

#### Step 6: State Update
```typescript
setItems(tickets);
```

#### Step 7: UI Rendering
```
Desktop View:
┌─────────────────────────────────────────────────────────────┐
│ Subject          │ Status │ Priority │ Age  │ Action        │
├─────────────────────────────────────────────────────────────┤
│ Payment issue    │ Open   │ High     │ 2h   │ [Handle →]    │
│ Delivery delay   │ In Pr. │ Medium   │ 5h   │ [Handle →]    │
└─────────────────────────────────────────────────────────────┘

Mobile View:
┌──────────────────────────────────┐
│ • Payment issue                  │
│   ticket-123 · 2h ago            │
│   [Open]                         │
│ [Handle →]                       │
└──────────────────────────────────┘
```

### User Actions

#### Action 1: View Ticket Detail
```typescript
onClick={() => { 
  setDetail(t);           // Set selected ticket
  setReply("");           // Clear reply field
  setErr("");             // Clear errors
}}
```
- Opens modal with full ticket info
- Shows reply history
- Shows reply form

#### Action 2: Send Reply
```typescript
const doReply = async (id: string) => {
  if (!reply) return;
  if (!id || id.startsWith("ticket-")) {
    setErr("Cannot send reply: Ticket ID is missing");
    return;
  }
  
  const r = await staffService.replyTicket(id, reply);
  if (r.success) {
    setDetail(null);
    setReply("");
    fetchTickets();  // Refresh list
  }
}
```
- Validates: ID is not fallback
- API Call: `POST /api/staff/tickets/{_id}/reply`
- Body: `{ message: string }`
- Refreshes ticket list

#### Action 3: Escalate Ticket
```typescript
const doEscalate = async (id: string) => {
  if (!id || id.startsWith("ticket-")) {
    setErr("Cannot escalate: Ticket ID is missing");
    return;
  }
  
  const r = await staffService.escalateTicket(id, "Escalated by support staff");
  if (r.success) {
    setItems(p => p.map(t => 
      (t._id === id || t.id === id) 
        ? { ...t, priority: "urgent", status: "in_progress" } 
        : t
    ));
    setDetail(null);
  }
}
```
- Validates: ID is not fallback
- API Call: `POST /api/staff/tickets/{_id}/escalate`
- Body: `{ reason: string }`
- Updates local state immediately

### Data Display

#### Desktop Table
```
Column 1: Subject (with priority dot)
  - Shows: subject text
  - Shows: ticket ID (last 8 chars)
  - Shows: category

Column 2: Status
  - Badge with color
  - Values: open, in_progress, resolved, closed

Column 3: Priority
  - Text with color
  - Values: urgent, high, medium, low

Column 4: Age
  - Clock icon + time
  - Format: "< 1h", "2h ago", "1d ago"

Column 5: Action
  - "Handle" button (if not resolved/closed)
  - "Resolved" badge (if resolved/closed)
```

#### Mobile Card
```
┌──────────────────────────────────┐
│ • Subject                        │
│   ticket-123 · 2h ago            │
│   [Status Badge]                 │
│ [Handle →]                       │
└──────────────────────────────────┘
```

#### Detail Modal
```
┌─────────────────────────────────────────┐
│ Ticket #ticket-123              [X]     │
├─────────────────────────────────────────┤
│ Subject: Payment not received           │
│ Description: Customer says...           │
│ Linked order: order-456                 │
│ [Status] [Priority] [Age]               │
│                                         │
│ Previous Replies:                       │
│ Support: We are looking into this...    │
│                                         │
├─────────────────────────────────────────┤
│ Reply to Customer:                      │
│ [Text area for reply]                   │
│                                         │
│ [Escalate] [Send Reply]                 │
└─────────────────────────────────────────┘
```

### Error Handling

#### Error 1: Missing Ticket ID
```typescript
if (!id || id.startsWith("ticket-")) {
  setErr("Cannot send reply: Ticket ID is missing. Please refresh and try again.");
  return;
}
```
- Shows error message in modal
- Prevents API call with invalid ID

#### Error 2: API Failure
```typescript
catch (e: any) {
  setErr(e?.message || "Failed to send reply");
}
```
- Shows error message
- User can retry

#### Error 3: Empty Reply
```typescript
disabled={!reply || busy}
```
- Disables "Send Reply" button if reply is empty

### Console Logs

```
📋 Tickets API response: {
  success: true,
  data: [
    { _id: "507f...", subject: "Payment issue", ... }
  ]
}

✅ Parsed tickets: 5 tickets

🔍 First ticket structure: {
  _id: "507f...",
  id: "507f...",
  ticketId: undefined,
  subject: "Payment issue",
  allKeys: ["_id", "id", "subject", "status", ...]
}
```

---

## 🏢 VENDOR TICKET QUEUE

### File: `src/pages/support/VendorTicketsPage.tsx`

### Data Flow (Similar to Ticket Queue)

#### API Call
```
GET /api/staff/vendor-tickets
Response: { success: true, data: Ticket[] }
```

#### Ticket Structure
```typescript
{
  id: string;              // Use this for API calls
  _id?: string;
  ticketId?: string;
  issue: string;
  vendor: string;
  status: string;
  sla: string;
  priority: string;
}
```

#### Data Normalization
```typescript
tickets = tickets.map((t, idx) => ({
  ...t,
  id: t.id || t._id || t.ticketId || `ticket-${idx}`,
  _id: t._id || t.id || t.ticketId || `ticket-${idx}`
}));
```

#### User Actions

**Action 1: Send Reply to Vendor**
```typescript
const doResolve = async (id: string) => {
  if (!id || id.startsWith("ticket-")) {
    setErr("Cannot send reply: Ticket ID is missing");
    return;
  }
  
  const r = await staffService.replyVendorTicket(id, reply);
  if (r.success) {
    setItems(p => p.map(t => t.id === id ? { ...t, status: "resolved" } : t));
    setDetail(null);
    setReply("");
  }
}
```
- API: `POST /api/staff/vendor-tickets/{id}/reply`
- Updates status to "resolved"

**Action 2: Escalate Vendor Ticket**
```typescript
const doEscalate = async (id: string) => {
  if (!id || id.startsWith("ticket-")) {
    setErr("Cannot escalate: Ticket ID is missing");
    return;
  }
  
  const r = await staffService.escalateTicket(id, "Escalated by staff");
  if (r.success) {
    setItems(p => p.map(t => t.id === id ? { ...t, status: "in_progress" } : t));
    setDetail(null);
  }
}
```
- API: `POST /api/staff/tickets/{id}/escalate`
- Updates status to "in_progress"

### Data Display

#### Table Columns
```
Issue | Vendor | Status | SLA | Action
```

#### Mobile Card
```
┌──────────────────────────────────┐
│ • Issue description              │
│   Vendor Name · 2h SLA           │
│   [Status Badge]                 │
│ [Handle →]                       │
└──────────────────────────────────┘
```

---

## 📦 ORDER QUEUE (OPS)

### File: `src/pages/ops/OpsOrderQueuePage.tsx`

### Data Flow

#### Step 1: Fetch Orders
```typescript
const r = await staffService.getOrderQueue();
console.log('📦 Order queue API response:', r);
```
- API: `GET /api/staff/orders`
- Response: `{ success: true, data: Order[] }`

#### Step 2: Response Handling
```typescript
let orders: Order[] = [];

if (r.success) {
  if (r.data?.orders && Array.isArray(r.data.orders)) {
    orders = r.data.orders;
  } else if (Array.isArray(r.data)) {
    orders = r.data;
  } else if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    orders = [r.data];
  }
}
```

#### Step 3: Fetch Vendors
```typescript
const r = await staffService.getAssignableVendors();
console.log('🏢 Vendors API response:', r);
```
- API: `GET /api/staff/vendors`
- Response: `{ success: true, data: { vendors: Vendor[] } }`

#### Step 4: Data Display

**Desktop Table:**
```
Type | Vendor | Status | SLA | Risk | Customer | Action
```

**Mobile Card:**
```
┌──────────────────────────────────┐
│ Order #order-123                 │
│ Vendor: ABC Corp                 │
│ Customer: John Doe               │
│ [Status] [Risk]                  │
│ [Reassign] [Clarify]             │
└──────────────────────────────────┘
```

### User Actions

#### Action 1: Reassign Vendor
```typescript
const doReassign = async () => {
  if (!vendor) return;
  
  const r = await staffService.reassignVendor(
    modal.order.id,
    vendor,
    reason
  );
  if (r.success) {
    fetchOrders();
    setModal(null);
  }
}
```
- API: `POST /api/staff/orders/{id}/reassign-vendor`
- Body: `{ newVendorId, reason }`
- Reasons: "Vendor SLA breach", "Vendor capacity full", etc.

#### Action 2: Raise Clarification
```typescript
const doClarify = async () => {
  if (!msg) return;
  
  const r = await staffService.raiseClarification(
    modal.order.id,
    msg
  );
  if (r.success) {
    fetchOrders();
    setModal(null);
  }
}
```
- API: `POST /api/staff/orders/{id}/clarification`
- Body: `{ message }`

---

## 💰 REFUND QUEUE (FINANCE)

### File: `src/pages/finance/RefundQueuePage.tsx`

### Data Flow

#### API Call
```
GET /api/staff/refunds
Response: { success: true, data: Refund[] }
```

#### Refund Structure
```typescript
{
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  createdAt: string;
}
```

#### Data Display

**Table Columns:**
```
Order ID | Customer | Amount | Reason | Status | Action
```

### User Actions

#### Action 1: Approve Refund
```typescript
const doApprove = async (id: string) => {
  const r = await staffService.approveRefund(id);
  if (r.success) {
    fetchRefunds();
  }
}
```
- API: `POST /api/staff/refunds/{id}/approve`

#### Action 2: Escalate Refund
```typescript
const doEscalate = async (id: string) => {
  const r = await staffService.escalateRefund(id);
  if (r.success) {
    fetchRefunds();
  }
}
```
- API: `POST /api/staff/refunds/{id}/escalate`

---

## 💳 PAYOUT ASSIST (FINANCE)

### File: `src/pages/finance/PayoutAssistPage.tsx`

### Data Flow

#### API Calls
```
GET /api/staff/payouts
GET /api/staff/wallet/ledger
```

#### Payout Structure
```typescript
{
  id: string;
  vendorId: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  dueDate: string;
}
```

### User Actions

#### Action 1: Credit Wallet
```typescript
const doCredit = async (userId: string, amount: number) => {
  const r = await staffService.creditWallet(userId, amount, reason);
  if (r.success) {
    fetchLedger();
  }
}
```
- API: `POST /api/staff/wallet/credit`
- Body: `{ userId, amount, reason }`

#### Action 2: Debit Wallet
```typescript
const doDebit = async (userId: string, amount: number) => {
  const r = await staffService.debitWallet(userId, amount, reason);
  if (r.success) {
    fetchLedger();
  }
}
```
- API: `POST /api/staff/wallet/debit`
- Body: `{ userId, amount, reason }`

---

## 📊 LEDGER VIEW (FINANCE)

### File: `src/pages/finance/LedgerViewPage.tsx`

### Data Flow

#### API Call
```
GET /api/staff/wallet/ledger
Response: { success: true, data: LedgerEntry[] }
```

#### LedgerEntry Structure
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

#### Data Display

**Table Columns:**
```
Date | User | Type | Amount | Reason | Balance
```

---

## 📢 CAMPAIGNS (MARKETING)

### File: `src/pages/marketing/CampaignsPage.tsx`

### Data Flow

#### API Calls
```
GET /api/staff/campaigns
GET /api/admin/coupons
```

#### Campaign Structure
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

#### Coupon Structure
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

### User Actions

#### Action 1: Create Coupon
```typescript
const doCreate = async (couponData) => {
  const r = await staffService.createCoupon(couponData);
  if (r.success) {
    fetchCoupons();
  }
}
```
- API: `POST /api/admin/coupons`

#### Action 2: Update Coupon
```typescript
const doUpdate = async (id: string, couponData) => {
  const r = await staffService.updateCoupon(id, couponData);
  if (r.success) {
    fetchCoupons();
  }
}
```
- API: `PUT /api/admin/coupons/{id}`

#### Action 3: Delete Coupon
```typescript
const doDelete = async (id: string) => {
  const r = await staffService.deleteCoupon(id);
  if (r.success) {
    fetchCoupons();
  }
}
```
- API: `DELETE /api/admin/coupons/{id}`

---

## 🔑 Key Patterns

### 1. Data Normalization
```typescript
// Always ensure ID fields exist
data = data.map((item, idx) => ({
  ...item,
  id: item.id || item._id || item.ticketId || `item-${idx}`,
  _id: item._id || item.id || item.ticketId || `item-${idx}`
}));
```

### 2. ID Validation
```typescript
// Always validate before API calls
if (!id || id.startsWith("item-")) {
  setErr("Cannot perform action: ID is missing");
  return;
}
```

### 3. Response Handling
```typescript
// Handle multiple response formats
if (r.data?.items && Array.isArray(r.data.items)) {
  items = r.data.items;
} else if (Array.isArray(r.data)) {
  items = r.data;
} else if (r.data && typeof r.data === 'object') {
  items = [r.data];
}
```

### 4. Console Logging
```typescript
// Use emoji-prefixed logs
📋 API response: {...}
✅ Parsed data: 5 items
🔍 First item structure: {...}
❌ Error: {...}
```

### 5. Error Handling
```typescript
// Always show user-friendly errors
catch (e: any) {
  setErr(e?.message || "Operation failed");
}
```

---

## 📊 Summary

| Screen | File | APIs | Actions |
|--------|------|------|---------|
| Ticket Queue | TicketQueuePage.tsx | 2 | Reply, Escalate |
| Vendor Queue | VendorTicketsPage.tsx | 2 | Reply, Escalate |
| Order Queue | OpsOrderQueuePage.tsx | 3 | Reassign, Clarify |
| Refund Queue | RefundQueuePage.tsx | 2 | Approve, Escalate |
| Payout Assist | PayoutAssistPage.tsx | 3 | Credit, Debit |
| Ledger View | LedgerViewPage.tsx | 1 | View |
| Campaigns | CampaignsPage.tsx | 3 | Create, Update, Delete |

---

**Last Updated:** May 1, 2026
**Status:** ✅ All Screens Documented
