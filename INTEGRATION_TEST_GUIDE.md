# 🧪 Integration Test Guide - Staff Portal

## Overview
Complete testing guide to verify Staff Portal integration with Customer and Vendor systems.

---

## 🎯 Test Scenarios

### Scenario 1: Customer Support Flow ✅

#### Step 1: Customer Creates Ticket
```bash
# Customer creates support ticket
POST /api/customer/tickets
Authorization: Bearer {CUSTOMER_TOKEN}
Body: {
  "subject": "Order not delivered",
  "description": "I placed order #ORD-123 but haven't received it",
  "orderId": "ORD-123"
}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "TICKET-001",
    "subject": "Order not delivered",
    "status": "open",
    "priority": "high"
  }
}
```

#### Step 2: Staff Views Ticket
```bash
# Support staff views ticket queue
GET /api/staff/tickets
Authorization: Bearer {STAFF_TOKEN}

Expected Response:
{
  "success": true,
  "data": [
    {
      "_id": "TICKET-001",
      "customerId": "CUST-123",
      "customer": "John Doe",
      "subject": "Order not delivered",
      "description": "I placed order #ORD-123 but haven't received it",
      "orderId": "ORD-123",
      "status": "open",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Step 3: Staff Replies to Customer
```bash
# Staff sends reply
POST /api/staff/tickets/TICKET-001/reply
Authorization: Bearer {STAFF_TOKEN}
Body: {
  "message": "We are investigating your order. Will update you shortly."
}

Expected Response:
{
  "success": true,
  "message": "Reply sent successfully"
}
```

#### Step 4: Customer Sees Reply
```bash
# Customer checks ticket
GET /api/customer/tickets/TICKET-001
Authorization: Bearer {CUSTOMER_TOKEN}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "TICKET-001",
    "subject": "Order not delivered",
    "status": "in_progress",
    "replies": [
      {
        "authorRole": "support_staff",
        "message": "We are investigating your order. Will update you shortly.",
        "createdAt": "2024-01-15T10:35:00Z"
      }
    ]
  }
}
```

#### Step 5: Staff Closes Ticket
```bash
# Staff closes ticket after resolution
POST /api/staff/tickets/TICKET-001/close
Authorization: Bearer {STAFF_TOKEN}

Expected Response:
{
  "success": true,
  "message": "Ticket closed successfully"
}
```

#### ✅ Verification Checklist
- [ ] Customer ticket appears in staff queue
- [ ] Customer name visible to staff
- [ ] Order ID linked correctly
- [ ] Staff reply reaches customer
- [ ] Ticket status updates correctly
- [ ] Customer cannot see internal notes
- [ ] Vendor info hidden from customer

---

### Scenario 2: Order Management Flow ✅

#### Step 1: Customer Places Order
```bash
# Customer creates order
POST /api/customer/orders
Authorization: Bearer {CUSTOMER_TOKEN}
Body: {
  "type": "document_copy",
  "quantity": 100,
  "deliveryAddress": "123 Main St"
}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "ORD-123",
    "type": "document_copy",
    "status": "pending",
    "amount": 500
  }
}
```

#### Step 2: System Assigns Vendor
```bash
# Backend automatically assigns vendor
# (This happens in backend, no API call needed)

Result:
- Order status: pending → assigned
- Vendor assigned: VENDOR-456
```

#### Step 3: Ops Staff Views Order
```bash
# Ops staff views order queue
GET /api/staff/orders
Authorization: Bearer {STAFF_TOKEN}

Expected Response:
{
  "success": true,
  "data": [
    {
      "_id": "ORD-123",
      "orderId": "ORD-123",
      "customerId": "CUST-123",
      "customer": "John Doe",
      "vendorId": "VENDOR-456",
      "vendor": "ABC Printers",
      "type": "document_copy",
      "status": "assigned",
      "amount": 500,
      "sla": "2h",
      "risk": "normal",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Step 4: Ops Reassigns Vendor (If Needed)
```bash
# Ops staff reassigns to different vendor
POST /api/staff/orders/ORD-123/reassign-vendor
Authorization: Bearer {STAFF_TOKEN}
Body: {
  "newVendorId": "VENDOR-789",
  "reason": "Original vendor at capacity"
}

Expected Response:
{
  "success": true,
  "message": "Vendor reassigned successfully"
}
```

#### Step 5: Customer Sees Updated Status
```bash
# Customer checks order status
GET /api/customer/orders/ORD-123
Authorization: Bearer {CUSTOMER_TOKEN}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "ORD-123",
    "type": "document_copy",
    "status": "assigned",
    "amount": 500,
    "estimatedDelivery": "2024-01-15T14:00:00Z"
    // NOTE: Vendor details NOT included for customer
  }
}
```

#### ✅ Verification Checklist
- [ ] Customer order appears in ops queue
- [ ] Customer and vendor info visible to ops
- [ ] Vendor reassignment works
- [ ] Reassignment reason logged
- [ ] Customer sees status update
- [ ] Customer CANNOT see vendor details
- [ ] SLA tracking works

---

### Scenario 3: Vendor Support Flow ✅

#### Step 1: Vendor Raises Issue
```bash
# Vendor creates support ticket
POST /api/vendor/tickets
Authorization: Bearer {VENDOR_TOKEN}
Body: {
  "issue": "Payment not received for order ORD-123",
  "orderId": "ORD-123"
}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "VTICKET-001",
    "issue": "Payment not received for order ORD-123",
    "status": "open",
    "priority": "high"
  }
}
```

#### Step 2: Ops Staff Views Vendor Ticket
```bash
# Ops staff views vendor ticket queue
GET /api/staff/vendor-tickets
Authorization: Bearer {STAFF_TOKEN}

Expected Response:
{
  "success": true,
  "data": [
    {
      "_id": "VTICKET-001",
      "vendorId": "VENDOR-456",
      "vendor": "ABC Printers",
      "issue": "Payment not received for order ORD-123",
      "orderId": "ORD-123",
      "status": "open",
      "priority": "high",
      "sla": "4h remaining",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

#### Step 3: Staff Replies to Vendor
```bash
# Staff sends reply
POST /api/staff/vendor-tickets/VTICKET-001/reply
Authorization: Bearer {STAFF_TOKEN}
Body: {
  "message": "Checking with finance team. Will update you within 2 hours."
}

Expected Response:
{
  "success": true,
  "message": "Reply sent successfully"
}
```

#### Step 4: Vendor Sees Reply
```bash
# Vendor checks ticket
GET /api/vendor/tickets/VTICKET-001
Authorization: Bearer {VENDOR_TOKEN}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "VTICKET-001",
    "issue": "Payment not received for order ORD-123",
    "status": "in_progress",
    "replies": [
      {
        "authorRole": "ops_staff",
        "message": "Checking with finance team. Will update you within 2 hours.",
        "createdAt": "2024-01-15T11:05:00Z"
      }
    ]
  }
}
```

#### ✅ Verification Checklist
- [ ] Vendor ticket appears in staff queue
- [ ] Vendor name visible to staff
- [ ] Order ID linked correctly
- [ ] Staff reply reaches vendor
- [ ] Ticket status updates correctly
- [ ] Vendor cannot see customer PII
- [ ] SLA timer works

---

### Scenario 4: Refund Processing Flow ✅

#### Step 1: Customer Requests Refund
```bash
# Customer requests refund
POST /api/customer/refunds
Authorization: Bearer {CUSTOMER_TOKEN}
Body: {
  "orderId": "ORD-123",
  "amount": 500,
  "reason": "Order not delivered on time"
}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "REFUND-001",
    "orderId": "ORD-123",
    "amount": 500,
    "status": "pending"
  }
}
```

#### Step 2: Finance Staff Views Refund
```bash
# Finance staff views refund queue
GET /api/staff/refunds
Authorization: Bearer {STAFF_TOKEN}

Expected Response:
{
  "success": true,
  "data": [
    {
      "_id": "REFUND-001",
      "customerId": "CUST-123",
      "customer": "John Doe",
      "orderId": "ORD-123",
      "amount": 500,
      "reason": "Order not delivered on time",
      "status": "pending",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

#### Step 3: Finance Approves Refund (Under Limit)
```bash
# Finance staff approves refund (amount ≤ ₹500)
POST /api/staff/refunds/REFUND-001/approve
Authorization: Bearer {STAFF_TOKEN}

Expected Response:
{
  "success": true,
  "message": "Refund approved successfully"
}
```

#### Step 4: Customer Wallet Credited
```bash
# Customer checks wallet
GET /api/customer/wallet
Authorization: Bearer {CUSTOMER_TOKEN}

Expected Response:
{
  "success": true,
  "data": {
    "balance": 500,
    "transactions": [
      {
        "type": "refund",
        "amount": 500,
        "orderId": "ORD-123",
        "createdAt": "2024-01-15T12:05:00Z"
      }
    ]
  }
}
```

#### Step 5: Finance Escalates Large Refund
```bash
# Finance staff escalates refund (amount > ₹500)
POST /api/staff/refunds/REFUND-002/escalate
Authorization: Bearer {STAFF_TOKEN}
Body: {
  "reason": "Amount exceeds staff limit"
}

Expected Response:
{
  "success": true,
  "message": "Refund escalated to admin"
}
```

#### ✅ Verification Checklist
- [ ] Customer refund appears in finance queue
- [ ] Customer name and order visible
- [ ] Finance can approve (≤₹500)
- [ ] Finance must escalate (>₹500)
- [ ] Customer wallet credited correctly
- [ ] All actions logged for audit
- [ ] Refund status updates correctly

---

### Scenario 5: Vendor Payout Flow ✅

#### Step 1: Vendor Completes Order
```bash
# Vendor marks order complete
POST /api/vendor/orders/ORD-123/complete
Authorization: Bearer {VENDOR_TOKEN}

Expected Response:
{
  "success": true,
  "message": "Order marked complete"
}
```

#### Step 2: System Calculates Payout
```bash
# Backend automatically calculates payout
# (This happens in backend, no API call needed)

Result:
- Payout created: PAYOUT-001
- Amount: ₹450 (after commission)
- Status: pending
```

#### Step 3: Finance Views Payout
```bash
# Finance staff views payout queue
GET /api/staff/payouts
Authorization: Bearer {STAFF_TOKEN}

Expected Response:
{
  "success": true,
  "data": [
    {
      "_id": "PAYOUT-001",
      "vendorId": "VENDOR-456",
      "vendor": "ABC Printers",
      "orderId": "ORD-123",
      "amount": 450,
      "status": "pending",
      "createdAt": "2024-01-15T13:00:00Z"
    }
  ]
}
```

#### Step 4: Finance Raises Issue (If Problem)
```bash
# Finance staff raises issue with payout
POST /api/staff/payouts/issue-ticket
Authorization: Bearer {STAFF_TOKEN}
Body: {
  "payoutId": "PAYOUT-001",
  "issueDetails": "Bank details incorrect"
}

Expected Response:
{
  "success": true,
  "message": "Issue ticket created"
}
```

#### Step 5: Admin Releases Payment
```bash
# Admin releases payment (not staff)
POST /api/admin/payouts/PAYOUT-001/release
Authorization: Bearer {ADMIN_TOKEN}

Expected Response:
{
  "success": true,
  "message": "Payment released successfully"
}
```

#### ✅ Verification Checklist
- [ ] Vendor payout appears in finance queue
- [ ] Vendor name and order visible
- [ ] Finance can view (read-only)
- [ ] Finance can raise issues
- [ ] Finance CANNOT release funds
- [ ] Admin approval required
- [ ] All actions logged

---

## 🔍 Privacy Verification Tests

### Test 1: Customer Cannot See Vendor Details
```bash
# Customer views order
GET /api/customer/orders/ORD-123
Authorization: Bearer {CUSTOMER_TOKEN}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "ORD-123",
    "type": "document_copy",
    "status": "in_progress",
    "amount": 500
    // ❌ vendorId should NOT be present
    // ❌ vendor should NOT be present
    // ❌ vendorContact should NOT be present
  }
}
```

### Test 2: Vendor Cannot See Customer PII
```bash
# Vendor views order
GET /api/vendor/orders/ORD-123
Authorization: Bearer {VENDOR_TOKEN}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "ORD-123",
    "type": "document_copy",
    "quantity": 100,
    "deliveryAddress": "123 Main St"
    // ❌ customerName should NOT be present
    // ❌ customerPhone should NOT be present
    // ❌ customerEmail should NOT be present
    // ✅ Only delivery address (needed for fulfillment)
  }
}
```

### Test 3: Staff Sees Both (With Permissions)
```bash
# Staff views order
GET /api/staff/orders/ORD-123
Authorization: Bearer {STAFF_TOKEN}

Expected Response:
{
  "success": true,
  "data": {
    "_id": "ORD-123",
    "customerId": "CUST-123",
    "customer": "John Doe",
    "vendorId": "VENDOR-456",
    "vendor": "ABC Printers",
    "type": "document_copy",
    "status": "in_progress",
    "amount": 500
    // ✅ Both customer and vendor info visible
    // ✅ Staff has permission to see both
  }
}
```

---

## 🧪 Automated Test Suite

### Jest Test Example
```typescript
describe('Staff Portal Integration', () => {
  describe('Customer Support Flow', () => {
    it('should display customer ticket in staff queue', async () => {
      // Create customer ticket
      const ticket = await createCustomerTicket({
        subject: 'Test issue',
        description: 'Test description'
      });

      // Staff fetches tickets
      const response = await staffService.getTickets();

      expect(response.success).toBe(true);
      expect(response.data).toContainEqual(
        expect.objectContaining({
          _id: ticket._id,
          subject: 'Test issue'
        })
      );
    });

    it('should send staff reply to customer', async () => {
      const ticketId = 'TICKET-001';
      
      // Staff sends reply
      const response = await staffService.replyTicket(
        ticketId,
        'Test reply'
      );

      expect(response.success).toBe(true);

      // Customer sees reply
      const customerTicket = await customerService.getTicket(ticketId);
      expect(customerTicket.replies).toContainEqual(
        expect.objectContaining({
          message: 'Test reply',
          authorRole: 'support_staff'
        })
      );
    });
  });

  describe('Privacy Rules', () => {
    it('should hide vendor details from customer', async () => {
      const order = await customerService.getOrder('ORD-123');

      expect(order.vendorId).toBeUndefined();
      expect(order.vendor).toBeUndefined();
      expect(order.vendorContact).toBeUndefined();
    });

    it('should hide customer PII from vendor', async () => {
      const order = await vendorService.getOrder('ORD-123');

      expect(order.customerName).toBeUndefined();
      expect(order.customerPhone).toBeUndefined();
      expect(order.customerEmail).toBeUndefined();
    });

    it('should show both to staff', async () => {
      const order = await staffService.getOrderDetail('ORD-123');

      expect(order.customerId).toBeDefined();
      expect(order.customer).toBeDefined();
      expect(order.vendorId).toBeDefined();
      expect(order.vendor).toBeDefined();
    });
  });
});
```

---

## 📊 Test Results Template

### Test Execution Report

**Date:** _____________
**Tester:** _____________
**Environment:** _____________

#### Customer Support Flow
- [ ] Customer ticket creation: ✅ / ❌
- [ ] Staff ticket viewing: ✅ / ❌
- [ ] Staff reply sending: ✅ / ❌
- [ ] Customer reply viewing: ✅ / ❌
- [ ] Ticket closure: ✅ / ❌

#### Order Management Flow
- [ ] Order creation: ✅ / ❌
- [ ] Vendor assignment: ✅ / ❌
- [ ] Staff order viewing: ✅ / ❌
- [ ] Vendor reassignment: ✅ / ❌
- [ ] Customer status update: ✅ / ❌

#### Vendor Support Flow
- [ ] Vendor ticket creation: ✅ / ❌
- [ ] Staff ticket viewing: ✅ / ❌
- [ ] Staff reply sending: ✅ / ❌
- [ ] Vendor reply viewing: ✅ / ❌
- [ ] Ticket resolution: ✅ / ❌

#### Refund Processing Flow
- [ ] Refund request: ✅ / ❌
- [ ] Staff refund viewing: ✅ / ❌
- [ ] Refund approval (≤₹500): ✅ / ❌
- [ ] Refund escalation (>₹500): ✅ / ❌
- [ ] Wallet credit: ✅ / ❌

#### Vendor Payout Flow
- [ ] Payout calculation: ✅ / ❌
- [ ] Staff payout viewing: ✅ / ❌
- [ ] Issue ticket creation: ✅ / ❌
- [ ] Admin payment release: ✅ / ❌

#### Privacy Verification
- [ ] Customer cannot see vendor: ✅ / ❌
- [ ] Vendor cannot see customer PII: ✅ / ❌
- [ ] Staff sees both: ✅ / ❌

**Overall Status:** ✅ PASS / ❌ FAIL

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 🎯 Success Criteria

### All Tests Must Pass ✅
- [x] Customer support flow complete
- [x] Order management flow complete
- [x] Vendor support flow complete
- [x] Refund processing flow complete
- [x] Vendor payout flow complete
- [x] Privacy rules enforced
- [x] All actions logged
- [x] No data leaks

### Performance Criteria ✅
- [ ] API response time < 500ms
- [ ] Page load time < 2s
- [ ] No console errors
- [ ] No memory leaks

### Security Criteria ✅
- [ ] Authentication required
- [ ] Authorization enforced
- [ ] Privacy rules working
- [ ] Audit logs created

---

## 🚀 Ready for Production

**When all tests pass:**
- ✅ Staff portal fully integrated
- ✅ Customer system connected
- ✅ Vendor system connected
- ✅ Privacy rules enforced
- ✅ All flows working
- ✅ Ready for deployment

---

**Test Guide Version:** 1.0
**Last Updated:** 2024
**Status:** Ready for Testing

