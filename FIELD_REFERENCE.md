# 🎯 Quick Field Reference

## Support Tickets - Exact Fields Required

### Backend Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "string (MongoDB ID)",
      "subject": "string (ticket title)",
      "description": "string (optional)",
      "category": "string (optional)",
      "status": "open | in_progress | resolved | closed",
      "priority": "urgent | high | medium | low",
      "orderId": "string (optional)",
      "createdAt": "ISO timestamp",
      "replies": [
        {
          "authorRole": "string",
          "message": "string",
          "createdAt": "ISO timestamp"
        }
      ]
    }
  ]
}
```

### Frontend Type
```typescript
type Ticket = {
  _id?: string;
  id?: string;
  subject: string;
  description?: string;
  category?: string;
  status: string;
  priority: string;
  orderId?: string;
  createdAt: string;
  replies?: Array<{
    authorRole: string;
    message: string;
    createdAt: string;
  }>;
};
```

### Display in UI
```
Table Row:
├─ Subject: {subject}
├─ ID: {_id.slice(-8)}
├─ Category: {category}
├─ Status: {status} [color: STATUS_BG[status]]
├─ Priority: {priority} [color: PRI_COLOR[priority]]
├─ Age: {getSLA(createdAt)}
└─ Actions: Handle / Escalate

Modal:
├─ Title: Ticket #{_id.slice(-8)}
├─ Subject: {subject}
├─ Description: {description}
├─ Status: {status}
├─ Priority: {priority}
├─ Age: {getSLA(createdAt)}
├─ Previous Replies: {replies}
└─ Actions: Send Reply / Escalate
```

---

## Vendor Tickets - Exact Fields Required

### Backend Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "string (MongoDB ID)",
      "issue": "string (issue description)",
      "vendor": "string (vendor name)",
      "status": "open | in_progress | resolved | closed",
      "priority": "urgent | high | medium | low",
      "sla": "string (optional, e.g., '2h remaining')",
      "createdAt": "ISO timestamp"
    }
  ]
}
```

### Frontend Type
```typescript
type Ticket = {
  _id?: string;
  id?: string;
  issue: string;
  vendor: string;
  status: string;
  priority: string;
  sla?: string;
  createdAt: string;
};
```

### Display in UI
```
Table Row:
├─ Issue: {issue}
├─ ID: {_id}
├─ Vendor: {vendor}
├─ Status: {status} [color: STATUS_BG[status]]
├─ Priority: {priority} [color: PRI_COLOR[priority]]
├─ SLA: {sla}
└─ Actions: Handle / Escalate

Mobile Card:
├─ Issue: {issue}
├─ Vendor: {vendor}
├─ SLA: {sla}
├─ Status: {status}
└─ Actions: Handle / Escalate

Modal:
├─ Title: {_id}
├─ Vendor: {vendor}
├─ Issue: {issue}
├─ Status: {status}
├─ SLA: {sla}
└─ Actions: Send Reply / Escalate
```

---

## Status Values & Colors

```typescript
const STATUS_COLOR = {
  "open": "#3b82f6",        // Blue
  "in_progress": "#f59e0b", // Amber
  "resolved": "#16a34a",    // Green
  "closed": "#6b7280"       // Gray
};

const STATUS_BG = {
  "open": "#eff6ff",        // Light Blue
  "in_progress": "#fffbeb", // Light Amber
  "resolved": "#f0fdf4",    // Light Green
  "closed": "#f3f4f6"       // Light Gray
};
```

---

## Priority Values & Colors

```typescript
const PRI_COLOR = {
  "urgent": "#ef4444",  // Red
  "high": "#f59e0b",    // Amber
  "medium": "#3b82f6",  // Blue
  "low": "#16a34a"      // Green
};
```

---

## API Endpoints

### Get Tickets
```
GET /api/staff/tickets
Response: { success: true, data: Ticket[] }
```

### Get Vendor Tickets
```
GET /api/staff/vendor-tickets
Response: { success: true, data: Ticket[] }
```

### Reply to Ticket
```
POST /api/staff/tickets/{_id}/reply
Body: { message: string }
Response: { success: true }
```

### Escalate Ticket
```
POST /api/staff/tickets/{_id}/escalate
Body: { reason: string }
Response: { success: true }
```

### Reply to Vendor Ticket
```
POST /api/staff/vendor-tickets/{_id}/reply
Body: { message: string }
Response: { success: true }
```

---

## ✅ Validation Rules

### Required Fields
- ✅ `_id` - Must be present and non-empty
- ✅ `subject` (tickets) or `issue` (vendor) - Must be present
- ✅ `status` - Must be one of: open, in_progress, resolved, closed
- ✅ `priority` - Must be one of: urgent, high, medium, low
- ✅ `createdAt` - Must be ISO format timestamp

### Optional Fields
- ❌ `description` - Can be empty or missing
- ❌ `category` - Can be empty or missing
- ❌ `orderId` - Can be empty or missing
- ❌ `replies` - Can be empty array or missing
- ❌ `sla` - Can be empty or missing
- ❌ `vendor` - Can be empty or missing (for support tickets)

---

## 🔍 Debug Checklist

### Before Testing
- [ ] Backend endpoint is running
- [ ] Authentication token is valid
- [ ] Database has test data

### Response Check
- [ ] Response has `success: true`
- [ ] Response has `data` array
- [ ] Each item has `_id` field
- [ ] Status values are valid
- [ ] Priority values are valid
- [ ] Timestamps are ISO format

### Frontend Check
- [ ] Console shows no errors
- [ ] Console shows parsed ticket count
- [ ] Console shows first ticket structure
- [ ] Tickets display in table/cards
- [ ] Colors are correct
- [ ] Handle button works

### Action Check
- [ ] Click Handle button
- [ ] Modal opens with ticket details
- [ ] Type reply message
- [ ] Click Send Reply
- [ ] Check if API call succeeds
- [ ] Check if list refreshes

---

## 📝 Example Responses

### ✅ Correct Support Tickets Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "subject": "Order not delivered",
      "description": "Customer complaint",
      "category": "delivery",
      "status": "open",
      "priority": "high",
      "orderId": "ORD-123",
      "createdAt": "2024-01-15T10:30:00Z",
      "replies": []
    }
  ]
}
```

### ✅ Correct Vendor Tickets Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "issue": "Vendor not responding",
      "vendor": "Vendor A",
      "status": "open",
      "priority": "high",
      "sla": "2h remaining",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### ❌ Wrong Response (Missing _id)
```json
{
  "success": true,
  "data": [
    {
      "subject": "Order not delivered",
      "status": "open"
    }
  ]
}
```

### ❌ Wrong Response (Invalid status)
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "subject": "Order not delivered",
      "status": "pending"  // ❌ Should be "open"
    }
  ]
}
```

---

## 🎯 Summary

**Backend must provide:**
1. `_id` field in every ticket
2. Valid status: open, in_progress, resolved, closed
3. Valid priority: urgent, high, medium, low
4. ISO format timestamps
5. `{ success: true, data: [...] }` format

**Frontend will:**
1. Parse and normalize data
2. Display in table/cards
3. Apply colors based on status/priority
4. Handle user actions
5. Call API endpoints

**Result:**
✅ Data shows correctly
✅ All features work
✅ No errors
