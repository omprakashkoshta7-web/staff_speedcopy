# Staff Portal Data Wiring Guide

## Overview
This guide explains how data flows through the staff portal and how to debug data display issues.

---

## 1. Order Queue Page (`/ops/orders`)

### Data Flow
```
OpsOrderQueuePage
  ├─ fetchOrders() → staffService.getOrderQueue()
  │  └─ GET /api/staff/orders
  │     └─ Expected Response: { success: true, data: Order[] }
  │
  └─ fetchVendors() → staffService.getAssignableVendors()
     └─ GET /api/staff/vendors
        └─ Expected Response: { success: true, data: { vendors: Vendor[] } }
```

### Order Type Definition
```typescript
type Order = {
  id: string;                    // Primary ID (required)
  _id?: string;                  // MongoDB ID (fallback)
  orderId?: string;              // Alternative ID field
  orderNumber?: string;          // Order number if different
  type: string;                  // Order type (e.g., "standard", "express")
  vendor: string;                // Current vendor name
  status: string;                // Order status (pending, processing, etc.)
  sla: string;                   // SLA time remaining
  risk: string;                  // Risk level (critical, warning, normal)
  customer: string;              // Customer name
  rawStatus: string;             // Raw status from backend
  customerId: string;            // Customer ID
  amount: number;                // Order amount in rupees
};
```

### Vendor Type Definition
```typescript
type Vendor = {
  id: string;                    // Vendor ID (required)
  orgId: string;                 // Organization ID
  name: string;                  // Vendor name
  location: string;              // Vendor location
  score: number;                 // Performance score
  priority: number;              // Priority level
  isApproved?: boolean;          // Approval status
};
```

### Debugging Steps
1. **Check Console Logs**: Look for `📦 Order queue API response:` and `✅ Total orders received:`
2. **Verify Response Format**: Ensure backend returns `{ success: true, data: [...] }`
3. **Check Order Fields**: Verify all required fields are present in order objects
4. **Test Reassignment**: Click "Reassign" button and check console for ID resolution

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| No orders showing | API returns empty array | Check backend `/api/staff/orders` endpoint |
| Wrong ID used | Multiple ID fields present | Code tries: `_id` → `id` → `orderId` → `orderNumber` |
| Vendors not loading | API returns wrong format | Check if response is `{ vendors: [...] }` or `[...]` |
| Reassign fails | Order ID not found | Check console for "Attempting reassignment with order data" |

---

## 2. Support Tickets Page (`/support/tickets`)

### Data Flow
```
TicketQueuePage
  └─ fetchTickets() → staffService.getTickets()
     └─ GET /api/staff/tickets
        └─ Expected Response: { success: true, data: Ticket[] }
```

### Ticket Type Definition
```typescript
type Ticket = {
  _id: string;                   // MongoDB ID (primary)
  id?: string;                   // Alternative ID
  subject: string;               // Ticket subject
  description?: string;          // Detailed description
  category: string;              // Ticket category
  status: string;                // Status (open, in_progress, resolved, closed)
  priority: string;              // Priority (urgent, high, medium, low)
  orderId?: string;              // Linked order ID
  replies?: Array<{              // Previous replies
    authorRole: string;          // Role of replier
    message: string;             // Reply message
    createdAt: string;           // Reply timestamp
  }>;
  createdAt: string;             // Ticket creation time
};
```

### Response Format Handling
The page now handles multiple response formats:
- `{ success: true, data: { tickets: [...] } }` ✅
- `{ success: true, data: [...] }` ✅
- `{ success: true, data: {...} }` (single object wrapped) ✅

### Debugging Steps
1. **Check Console Logs**: Look for `📋 Tickets API response:` and `✅ Parsed tickets:`
2. **Verify Status Values**: Ensure status is one of: `open`, `in_progress`, `resolved`, `closed`
3. **Check Priority Colors**: Verify priority is one of: `urgent`, `high`, `medium`, `low`
4. **Test Modal**: Click "Handle" button and verify ticket details load

---

## 3. Vendor Tickets Page (`/support/vendor-tickets`)

### Data Flow
```
VendorTicketsPage
  └─ fetchTickets() → staffService.getVendorTickets()
     └─ GET /api/staff/vendor-tickets
        └─ Expected Response: { success: true, data: Ticket[] }
```

### Ticket Type Definition
```typescript
type Ticket = {
  id: string;                    // Ticket ID
  issue: string;                 // Issue description
  vendor: string;                // Vendor name
  status: string;                // Status (open, in_progress, resolved, closed)
  sla: string;                   // SLA time
  priority: string;              // Priority level
};
```

### Response Format Handling
Same as Support Tickets - handles multiple formats automatically.

### Debugging Steps
1. **Check Console Logs**: Look for `📋 Vendor Tickets API response:` and `✅ Parsed vendor tickets:`
2. **Verify Vendor Names**: Ensure vendor field is populated
3. **Check SLA Format**: Verify SLA is a readable string (e.g., "2h remaining")
4. **Test Reply**: Click "Handle" and verify reply submission works

---

## 4. API Configuration

### Base URL
- **Development**: `http://localhost:4000` (default)
- **Environment Variable**: `VITE_API_URL`

### Endpoints
```
Orders:
  GET  /api/staff/orders                    → Order queue
  GET  /api/staff/vendors                   → Assignable vendors
  GET  /api/staff/orders/:id                → Order detail
  POST /api/staff/orders/:id/reassign-vendor → Reassign vendor
  POST /api/staff/orders/:id/clarification  → Raise clarification

Support:
  GET  /api/staff/tickets                   → Support tickets
  GET  /api/staff/tickets/:id               → Ticket detail
  POST /api/staff/tickets/:id/reply         → Reply to ticket
  POST /api/staff/tickets/:id/escalate      → Escalate ticket
  GET  /api/staff/vendor-tickets            → Vendor tickets
  POST /api/staff/vendor-tickets/:id/reply  → Reply to vendor
```

---

## 5. Testing Data Display

### Manual Testing Checklist

#### Order Queue
- [ ] Page loads without errors
- [ ] Console shows "Total orders received: X"
- [ ] Orders display in table/cards
- [ ] Stats row shows correct counts
- [ ] Search filters work
- [ ] Reassign modal opens
- [ ] Vendor dropdown populates
- [ ] Reassign request succeeds

#### Support Tickets
- [ ] Page loads without errors
- [ ] Console shows "Parsed tickets: X"
- [ ] Tickets display in table
- [ ] Status filter works
- [ ] Priority colors display correctly
- [ ] Handle modal opens
- [ ] Reply textarea works
- [ ] Escalate button works

#### Vendor Tickets
- [ ] Page loads without errors
- [ ] Console shows "Parsed vendor tickets: X"
- [ ] Vendor names display
- [ ] SLA times display
- [ ] Handle modal opens
- [ ] Reply submission works

---

## 6. Console Debugging

### Enable Detailed Logging
All pages now log to console with emoji prefixes:
- `📦` Order queue operations
- `📋` Ticket operations
- `🏢` Vendor operations
- `✅` Success states
- `❌` Error states
- `🔍` Data inspection
- `🔄` Reassignment operations

### Example Console Output
```
📦 Order queue API response: {success: true, data: Array(5)}
✅ Total orders received: 5
🔍 First order structure: {id: "ORD-123", _id: "507f1f77bcf86cd799439011", ...}
```

---

## 7. Backend Integration Checklist

### Required Backend Endpoints

#### Orders Service
- [ ] `GET /api/staff/orders` returns `{ success: true, data: Order[] }`
- [ ] `GET /api/staff/vendors` returns `{ success: true, data: { vendors: Vendor[] } }`
- [ ] `POST /api/staff/orders/:id/reassign-vendor` accepts `{ newVendorId, reason }`
- [ ] `POST /api/staff/orders/:id/clarification` accepts `{ message }`

#### Support Service
- [ ] `GET /api/staff/tickets` returns `{ success: true, data: Ticket[] }`
- [ ] `POST /api/staff/tickets/:id/reply` accepts `{ message }`
- [ ] `POST /api/staff/tickets/:id/escalate` accepts `{ reason }`
- [ ] `GET /api/staff/vendor-tickets` returns `{ success: true, data: Ticket[] }`
- [ ] `POST /api/staff/vendor-tickets/:id/reply` accepts `{ message }`

---

## 8. Troubleshooting

### Data Not Showing
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for API response logs
4. Check Network tab for API calls
5. Verify response status is 200
6. Check response body format

### Wrong Data Displayed
1. Check if all required fields are present
2. Verify field names match type definitions
3. Look for null/undefined values
4. Check data transformation logic

### API Errors
1. Check if backend service is running
2. Verify API base URL in `.env`
3. Check authentication token in localStorage
4. Look for CORS errors in console
5. Verify request headers include Authorization

---

## 9. Quick Reference

### Response Format Examples

**Orders (Success)**
```json
{
  "success": true,
  "data": [
    {
      "id": "ORD-123",
      "type": "standard",
      "vendor": "Vendor A",
      "status": "pending",
      "sla": "2h",
      "risk": "warning",
      "customer": "John Doe",
      "amount": 5000
    }
  ]
}
```

**Tickets (Success)**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "subject": "Order not delivered",
      "status": "open",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 10. Support

For issues or questions:
1. Check console logs first
2. Review this guide
3. Check backend service logs
4. Verify API endpoints are correct
5. Test with curl/Postman if needed
