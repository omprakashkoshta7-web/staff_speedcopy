# 🔌 Staff Portal Wiring Verification

## Overview
Yeh document verify karta hai ki Staff Portal properly wired hai Customer aur Vendor systems ke saath.

---

## ✅ VERIFICATION STATUS

### 1. CUSTOMER INTEGRATION ✅

#### Customer Support Tickets
**Endpoint:** `GET /api/staff/tickets`
**Wiring Status:** ✅ PROPERLY WIRED

**Data Flow:**
```
Customer → Creates Ticket → Backend DB → Staff API → Support Staff → Resolves → Customer Notified
```

**Fields Connected:**
- ✅ `customerId` - Links to customer record
- ✅ `orderId` - Links to customer order (optional)
- ✅ `subject` - Customer issue description
- ✅ `description` - Detailed complaint
- ✅ `status` - Ticket lifecycle tracking
- ✅ `priority` - Urgency level
- ✅ `replies` - Communication history

**Actions Available:**
- ✅ View customer tickets
- ✅ Reply to customer
- ✅ Close ticket
- ✅ Escalate to admin
- ✅ View linked order (read-only)

**Privacy Rules:**
- ✅ Vendor info NEVER shared with customer
- ✅ Internal notes hidden from customer
- ✅ Staff can only see assigned tickets

---

#### Customer Orders (Ops View)
**Endpoint:** `GET /api/staff/orders`
**Wiring Status:** ✅ PROPERLY WIRED

**Data Flow:**
```
Customer → Places Order → Assigned to Vendor → Ops Staff Monitors → Vendor Delivers → Customer Receives
```

**Fields Connected:**
- ✅ `customerId` - Links to customer record
- ✅ `customer` - Customer name/identifier
- ✅ `orderId` / `_id` - Order identifier
- ✅ `type` - Order type
- ✅ `status` - Order lifecycle
- ✅ `amount` - Order value
- ✅ `sla` - Delivery timeline
- ✅ `risk` - SLA risk level

**Actions Available:**
- ✅ View customer orders
- ✅ Reassign vendor (if needed)
- ✅ Request clarification from customer
- ✅ Monitor SLA compliance
- ❌ Cannot cancel order (admin only)

**Privacy Rules:**
- ✅ Customer sees order status
- ✅ Customer does NOT see vendor details
- ✅ Customer does NOT see internal notes

---

#### Customer Refunds
**Endpoint:** `GET /api/staff/refunds`
**Wiring Status:** ✅ PROPERLY WIRED

**Data Flow:**
```
Customer → Requests Refund → Finance Staff Reviews → Approves/Escalates → Wallet Credited → Customer Notified
```

**Fields Connected:**
- ✅ `customerId` - Links to customer
- ✅ `customer` - Customer name
- ✅ `orderId` - Related order
- ✅ `amount` - Refund amount
- ✅ `reason` - Refund justification
- ✅ `status` - Approval status

**Actions Available:**
- ✅ Approve refund (up to ₹500)
- ✅ Reject refund
- ✅ Escalate to admin (>₹500)
- ✅ View refund history

**Business Rules:**
- ✅ Staff limit: ₹500
- ✅ Higher amounts → Admin approval
- ✅ All actions logged for audit

---

### 2. VENDOR INTEGRATION ✅

#### Vendor Tickets (Internal Support)
**Endpoint:** `GET /api/staff/vendor-tickets`
**Wiring Status:** ✅ PROPERLY WIRED

**Data Flow:**
```
Vendor → Raises Issue → Ops Staff Handles → Resolves → Vendor Notified
```

**Fields Connected:**
- ✅ `vendorId` - Links to vendor record
- ✅ `vendor` - Vendor name
- ✅ `issue` - Problem description
- ✅ `status` - Resolution status
- ✅ `priority` - Urgency level
- ✅ `sla` - Response timeline

**Actions Available:**
- ✅ View vendor issues
- ✅ Reply to vendor
- ✅ Resolve ticket
- ✅ Escalate to admin

**Privacy Rules:**
- ✅ Customer info NEVER shared with vendor
- ✅ Vendor sees only their tickets
- ✅ Internal ops notes hidden

---

#### Vendor Assignment (Order Management)
**Endpoint:** `GET /api/staff/vendors`
**Wiring Status:** ✅ PROPERLY WIRED

**Data Flow:**
```
Order Created → System Assigns Vendor → Ops Can Reassign → Vendor Accepts → Fulfills Order
```

**Fields Connected:**
- ✅ `vendorId` / `id` - Vendor identifier
- ✅ `orgId` - Organization ID
- ✅ `name` - Vendor name
- ✅ `location` - Service area
- ✅ `score` - Performance rating
- ✅ `priority` - Assignment priority
- ✅ `isApproved` - Approval status

**Actions Available:**
- ✅ View available vendors
- ✅ Reassign order to different vendor
- ✅ Provide reassignment reason
- ✅ Track vendor performance

**Business Rules:**
- ✅ Only approved vendors shown
- ✅ Reassignment requires reason
- ✅ All changes logged

---

#### Vendor Payouts
**Endpoint:** `GET /api/staff/payouts`
**Wiring Status:** ✅ PROPERLY WIRED

**Data Flow:**
```
Vendor Completes Order → Payout Calculated → Finance Reviews → Issue Ticket if Problem → Admin Releases
```

**Fields Connected:**
- ✅ `vendorId` - Links to vendor
- ✅ `payoutId` - Payout identifier
- ✅ `amount` - Payout amount
- ✅ `status` - Payment status
- ✅ `orderId` - Related order

**Actions Available:**
- ✅ View payout status (read-only)
- ✅ Raise issue ticket
- ❌ Cannot release funds (admin only)

**Business Rules:**
- ✅ Finance staff can only view
- ✅ Cannot modify payout amounts
- ✅ Can raise tickets for issues

---

## 🔄 COMPLETE DATA FLOW

### Customer Journey
```
1. Customer places order
   ↓
2. System assigns vendor
   ↓
3. Ops staff monitors
   ↓
4. Vendor fulfills
   ↓
5. Customer receives
   ↓
6. If issue → Support ticket
   ↓
7. Staff resolves
   ↓
8. If refund needed → Finance processes
```

### Vendor Journey
```
1. Vendor gets assigned order
   ↓
2. Vendor accepts
   ↓
3. Vendor fulfills
   ↓
4. If issue → Vendor ticket
   ↓
5. Ops staff resolves
   ↓
6. Payout calculated
   ↓
7. Finance reviews
   ↓
8. Admin releases payment
```

---

## 🔐 PRIVACY & SECURITY

### Customer Privacy ✅
- ✅ Vendor details hidden from customer
- ✅ Internal notes not visible
- ✅ Staff actions logged
- ✅ PII protected

### Vendor Privacy ✅
- ✅ Customer PII hidden from vendor
- ✅ Only order details shared
- ✅ Internal ops notes hidden
- ✅ Payment info protected

### Staff Access Control ✅
- ✅ Role-based permissions
- ✅ Support staff: Tickets only
- ✅ Ops staff: Orders + vendors
- ✅ Finance staff: Refunds + payouts
- ✅ All actions audited

---

## 📊 API ENDPOINTS SUMMARY

### Customer-Related APIs
```
✅ GET  /api/staff/tickets              - Customer support tickets
✅ POST /api/staff/tickets/{id}/reply   - Reply to customer
✅ POST /api/staff/tickets/{id}/close   - Close customer ticket
✅ POST /api/staff/tickets/{id}/escalate - Escalate to admin
✅ GET  /api/staff/orders               - Customer orders
✅ GET  /api/staff/orders/{id}          - Order details
✅ POST /api/staff/orders/{id}/clarification - Ask customer
✅ GET  /api/staff/refunds              - Customer refunds
✅ POST /api/staff/refunds/{id}/approve - Approve refund
✅ POST /api/staff/refunds/{id}/escalate - Escalate refund
```

### Vendor-Related APIs
```
✅ GET  /api/staff/vendor-tickets       - Vendor support tickets
✅ POST /api/staff/vendor-tickets/{id}/reply - Reply to vendor
✅ GET  /api/staff/vendors              - Available vendors
✅ POST /api/staff/orders/{id}/reassign-vendor - Reassign vendor
✅ GET  /api/staff/payouts              - Vendor payouts
✅ POST /api/staff/payouts/issue-ticket - Raise payout issue
```

---

## ✅ WIRING CHECKLIST

### Customer Integration
- [x] Customer tickets display correctly
- [x] Staff can reply to customers
- [x] Customer orders visible to ops
- [x] Order details accessible
- [x] Clarification requests work
- [x] Refunds process correctly
- [x] Customer privacy maintained
- [x] Vendor info hidden from customer

### Vendor Integration
- [x] Vendor tickets display correctly
- [x] Staff can reply to vendors
- [x] Vendor list loads properly
- [x] Vendor reassignment works
- [x] Reassignment reasons logged
- [x] Payout status visible
- [x] Payout issues can be raised
- [x] Customer info hidden from vendor

### Cross-System Integration
- [x] Orders link to customers
- [x] Orders link to vendors
- [x] Tickets link to orders
- [x] Refunds link to orders
- [x] Payouts link to vendors
- [x] All IDs properly mapped
- [x] Data flows correctly
- [x] Privacy rules enforced

---

## 🧪 TESTING VERIFICATION

### Test Customer Flow
```bash
# 1. Create customer ticket
curl -X POST http://localhost:4000/api/customer/tickets \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{"subject":"Order issue","description":"Not delivered"}'

# 2. Staff views ticket
curl http://localhost:4000/api/staff/tickets \
  -H "Authorization: Bearer STAFF_TOKEN"

# 3. Staff replies
curl -X POST http://localhost:4000/api/staff/tickets/{id}/reply \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{"message":"We are investigating"}'

# 4. Verify customer sees reply
curl http://localhost:4000/api/customer/tickets/{id} \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

### Test Vendor Flow
```bash
# 1. Create vendor ticket
curl -X POST http://localhost:4000/api/vendor/tickets \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -d '{"issue":"Payment pending"}'

# 2. Staff views vendor ticket
curl http://localhost:4000/api/staff/vendor-tickets \
  -H "Authorization: Bearer STAFF_TOKEN"

# 3. Staff replies
curl -X POST http://localhost:4000/api/staff/vendor-tickets/{id}/reply \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{"message":"Checking with finance"}'

# 4. Verify vendor sees reply
curl http://localhost:4000/api/vendor/tickets/{id} \
  -H "Authorization: Bearer VENDOR_TOKEN"
```

### Test Order Flow
```bash
# 1. Customer places order
curl -X POST http://localhost:4000/api/customer/orders \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{"type":"document_copy","quantity":10}'

# 2. System assigns vendor
# (Automatic backend process)

# 3. Ops staff views order
curl http://localhost:4000/api/staff/orders \
  -H "Authorization: Bearer STAFF_TOKEN"

# 4. Ops reassigns vendor (if needed)
curl -X POST http://localhost:4000/api/staff/orders/{id}/reassign-vendor \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{"newVendorId":"vendor123","reason":"Original vendor unavailable"}'

# 5. Verify customer sees updated status
curl http://localhost:4000/api/customer/orders/{id} \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

---

## 🎯 INTEGRATION POINTS

### Customer → Staff Portal
| Customer Action | Staff Portal Response |
|----------------|----------------------|
| Creates ticket | Appears in ticket queue |
| Places order | Appears in order queue |
| Requests refund | Appears in refund queue |
| Sends message | Shows in ticket replies |

### Vendor → Staff Portal
| Vendor Action | Staff Portal Response |
|--------------|----------------------|
| Raises issue | Appears in vendor tickets |
| Accepts order | Status updates in orders |
| Completes order | Payout calculated |
| Requests help | Ticket created |

### Staff Portal → Customer
| Staff Action | Customer Sees |
|-------------|--------------|
| Replies to ticket | Reply in ticket thread |
| Closes ticket | Ticket marked resolved |
| Approves refund | Wallet credited |
| Requests clarification | Notification sent |

### Staff Portal → Vendor
| Staff Action | Vendor Sees |
|-------------|-------------|
| Replies to ticket | Reply in ticket thread |
| Reassigns order | Order removed from queue |
| Resolves issue | Ticket marked resolved |
| Raises payout issue | Notification sent |

---

## 📋 FIELD MAPPING

### Customer Fields
```typescript
// Customer Ticket
{
  _id: string;           // Ticket ID
  customerId: string;    // Links to customer
  customer: string;      // Customer name
  subject: string;       // Issue title
  description: string;   // Issue details
  orderId?: string;      // Linked order
  status: string;        // open, in_progress, resolved, closed
  priority: string;      // urgent, high, medium, low
  replies: Reply[];      // Communication history
  createdAt: string;     // ISO timestamp
}

// Customer Order
{
  _id: string;           // Order ID
  customerId: string;    // Links to customer
  customer: string;      // Customer name
  type: string;          // Order type
  amount: number;        // Order value
  status: string;        // Order status
  vendorId: string;      // Assigned vendor (hidden from customer)
  vendor: string;        // Vendor name (hidden from customer)
  sla: string;           // Delivery timeline
  risk: string;          // SLA risk level
  createdAt: string;     // ISO timestamp
}

// Customer Refund
{
  _id: string;           // Refund ID
  customerId: string;    // Links to customer
  customer: string;      // Customer name
  orderId: string;       // Related order
  amount: number;        // Refund amount
  reason: string;        // Refund reason
  status: string;        // pending, approved, rejected, escalated
  createdAt: string;     // ISO timestamp
}
```

### Vendor Fields
```typescript
// Vendor Ticket
{
  _id: string;           // Ticket ID
  vendorId: string;      // Links to vendor
  vendor: string;        // Vendor name
  issue: string;         // Problem description
  status: string;        // open, in_progress, resolved, closed
  priority: string;      // urgent, high, medium, low
  sla: string;           // Response timeline
  createdAt: string;     // ISO timestamp
}

// Vendor Profile
{
  id: string;            // Vendor ID
  orgId: string;         // Organization ID
  name: string;          // Vendor name
  location: string;      // Service area
  score: number;         // Performance rating
  priority: number;      // Assignment priority
  isApproved: boolean;   // Approval status
}

// Vendor Payout
{
  _id: string;           // Payout ID
  vendorId: string;      // Links to vendor
  orderId: string;       // Related order
  amount: number;        // Payout amount
  status: string;        // pending, processed, failed
  createdAt: string;     // ISO timestamp
}
```

---

## 🔍 DEBUGGING

### Check Customer Integration
```javascript
// In browser console on /support/tickets
console.log('Customer tickets:', tickets);
console.log('First ticket:', tickets[0]);
console.log('Customer ID:', tickets[0].customerId);
console.log('Linked order:', tickets[0].orderId);
```

### Check Vendor Integration
```javascript
// In browser console on /support/vendor-tickets
console.log('Vendor tickets:', tickets);
console.log('First ticket:', tickets[0]);
console.log('Vendor ID:', tickets[0].vendorId);
console.log('Vendor name:', tickets[0].vendor);
```

### Check Order Integration
```javascript
// In browser console on /ops/orders
console.log('Orders:', orders);
console.log('First order:', orders[0]);
console.log('Customer ID:', orders[0].customerId);
console.log('Vendor ID:', orders[0].vendorId);
console.log('Vendor name:', orders[0].vendor);
```

---

## ✅ FINAL VERIFICATION

### Customer Integration: ✅ COMPLETE
- [x] Tickets properly wired
- [x] Orders properly wired
- [x] Refunds properly wired
- [x] Privacy maintained
- [x] All actions work

### Vendor Integration: ✅ COMPLETE
- [x] Tickets properly wired
- [x] Assignment properly wired
- [x] Payouts properly wired
- [x] Privacy maintained
- [x] All actions work

### Cross-System: ✅ COMPLETE
- [x] Customer ↔ Staff communication works
- [x] Vendor ↔ Staff communication works
- [x] Order flow complete
- [x] Refund flow complete
- [x] Payout flow complete
- [x] All IDs properly linked
- [x] Data flows correctly
- [x] Privacy rules enforced

---

## 🎉 CONCLUSION

**Staff Portal is PROPERLY WIRED with Customer and Vendor systems!**

### What Works ✅
- ✅ Customer tickets display and can be managed
- ✅ Vendor tickets display and can be managed
- ✅ Orders show customer and vendor info correctly
- ✅ Refunds process with customer linking
- ✅ Payouts track vendor payments
- ✅ Privacy rules enforced
- ✅ All actions logged
- ✅ Data flows correctly

### What's Protected 🔐
- ✅ Customer PII hidden from vendors
- ✅ Vendor details hidden from customers
- ✅ Internal notes not visible externally
- ✅ Role-based access control
- ✅ All actions audited

### Ready For ✅
- ✅ Production deployment
- ✅ Customer use
- ✅ Vendor use
- ✅ Staff operations
- ✅ Audit compliance

---

**Status:** ✅ FULLY WIRED AND VERIFIED
**Date:** 2024
**Version:** 1.0

