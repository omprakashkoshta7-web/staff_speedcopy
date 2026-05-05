# Backend Field Mapping Guide

## 📋 Support Tickets Queue (`/api/staff/tickets`)

### Expected Backend Response Format

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "subject": "Order not delivered",
      "description": "Customer complaint about delayed delivery",
      "category": "delivery",
      "status": "open",
      "priority": "high",
      "orderId": "ORD-123456",
      "createdAt": "2024-01-15T10:30:00Z",
      "replies": [
        {
          "authorRole": "support_staff",
          "message": "We are investigating this issue",
          "createdAt": "2024-01-15T11:00:00Z"
        }
      ]
    }
  ]
}
```

### Field Mapping for Frontend

| Backend Field | Frontend Usage | Type | Required | Notes |
|---------------|----------------|------|----------|-------|
| `_id` | Ticket ID for API calls | string | ✅ Yes | Used in `/api/staff/tickets/{_id}/reply` |
| `subject` | Ticket title in table | string | ✅ Yes | Displayed in list and modal |
| `description` | Full description | string | ❌ No | Shown in detail modal |
| `category` | Ticket category | string | ❌ No | Displayed as badge |
| `status` | Ticket status | enum | ✅ Yes | Values: `open`, `in_progress`, `resolved`, `closed` |
| `priority` | Priority level | enum | ✅ Yes | Values: `urgent`, `high`, `medium`, `low` |
| `orderId` | Linked order | string | ❌ No | Shows order reference |
| `createdAt` | Ticket creation time | ISO string | ✅ Yes | Used to calculate SLA time |
| `replies` | Previous replies | array | ❌ No | Shown in detail modal |

### Frontend Type Definition

```typescript
type Ticket = {
  _id?: string;
  id?: string;
  ticketId?: string;
  subject: string;
  description?: string;
  category?: string;
  status: string;
  priority: string;
  orderId?: string;
  replies?: Array<{
    authorRole: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
};
```

### Frontend Display Mapping

```typescript
// Desktop Table
┌─────────────────────────────────────────────────────┐
│ Subject (from subject)                              │
│ ID: {_id.slice(-8)}                                 │
│ Category: {category}                                │
├─────────────────────────────────────────────────────┤
│ Status: {status} (color from STATUS_BG[status])     │
├─────────────────────────────────────────────────────┤
│ Priority: {priority} (color from PRI_COLOR[priority])│
├─────────────────────────────────────────────────────┤
│ Age: {getSLA(createdAt)}                            │
├─────────────────────────────────────────────────────┤
│ Actions: Handle / Escalate                          │
└─────────────────────────────────────────────────────┘

// Detail Modal
Title: Ticket #{_id.slice(-8)}
Subject: {subject}
Description: {description}
Status: {status}
Priority: {priority}
Age: {getSLA(createdAt)}
Previous Replies: {replies.map(...)}
```

---

## 🏢 Vendor Tickets Queue (`/api/staff/vendor-tickets`)

### Expected Backend Response Format

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "issue": "Vendor not responding to orders",
      "vendor": "Vendor A",
      "status": "open",
      "priority": "high",
      "sla": "2h remaining",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Field Mapping for Frontend

| Backend Field | Frontend Usage | Type | Required | Notes |
|---------------|----------------|------|----------|-------|
| `_id` | Ticket ID for API calls | string | ✅ Yes | Used in `/api/staff/vendor-tickets/{_id}/reply` |
| `issue` | Issue description | string | ✅ Yes | Displayed in list and modal |
| `vendor` | Vendor name | string | ✅ Yes | Shows which vendor |
| `status` | Ticket status | enum | ✅ Yes | Values: `open`, `in_progress`, `resolved`, `closed` |
| `priority` | Priority level | enum | ✅ Yes | Values: `urgent`, `high`, `medium`, `low` |
| `sla` | SLA time remaining | string | ❌ No | Shows time remaining |
| `createdAt` | Ticket creation time | ISO string | ✅ Yes | Used to calculate age |

### Frontend Type Definition

```typescript
type Ticket = {
  _id?: string;
  id?: string;
  ticketId?: string;
  issue: string;
  vendor: string;
  status: string;
  priority: string;
  sla?: string;
  createdAt: string;
};
```

### Frontend Display Mapping

```typescript
// Desktop Table
┌─────────────────────────────────────────────────────┐
│ Issue (from issue)                                  │
│ ID: {_id}                                           │
├─────────────────────────────────────────────────────┤
│ Vendor: {vendor}                                    │
├─────────────────────────────────────────────────────┤
│ Status: {status} (color from STATUS_BG[status])     │
├─────────────────────────────────────────────────────┤
│ SLA: {sla}                                          │
├─────────────────────────────────────────────────────┤
│ Actions: Handle / Escalate                          │
└─────────────────────────────────────────────────────┘

// Detail Modal
Title: {_id}
Vendor: {vendor}
Issue: {issue}
Status: {status}
SLA: {sla}
```

---

## 🔄 API Endpoints for Actions

### Reply to Ticket

**Endpoint:** `POST /api/staff/tickets/{_id}/reply`

**Request:**
```json
{
  "message": "We are investigating this issue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully"
}
```

### Escalate Ticket

**Endpoint:** `POST /api/staff/tickets/{_id}/escalate`

**Request:**
```json
{
  "reason": "Escalated by support staff"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket escalated successfully"
}
```

### Reply to Vendor Ticket

**Endpoint:** `POST /api/staff/vendor-tickets/{_id}/reply`

**Request:**
```json
{
  "message": "Please respond to pending orders"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully"
}
```

---

## ✅ Backend Implementation Checklist

### For Support Tickets (`/api/staff/tickets`)

- [ ] Endpoint returns `{ success: true, data: [...] }`
- [ ] Each ticket has `_id` field (MongoDB ID)
- [ ] `subject` field is present and non-empty
- [ ] `status` is one of: `open`, `in_progress`, `resolved`, `closed`
- [ ] `priority` is one of: `urgent`, `high`, `medium`, `low`
- [ ] `createdAt` is ISO format timestamp
- [ ] `description` field is optional but recommended
- [ ] `category` field is optional
- [ ] `orderId` field is optional
- [ ] `replies` array is optional but recommended

### For Vendor Tickets (`/api/staff/vendor-tickets`)

- [ ] Endpoint returns `{ success: true, data: [...] }`
- [ ] Each ticket has `_id` field (MongoDB ID)
- [ ] `issue` field is present and non-empty
- [ ] `vendor` field is present and non-empty
- [ ] `status` is one of: `open`, `in_progress`, `resolved`, `closed`
- [ ] `priority` is one of: `urgent`, `high`, `medium`, `low`
- [ ] `createdAt` is ISO format timestamp
- [ ] `sla` field is optional but recommended

### For Reply Endpoint

- [ ] `POST /api/staff/tickets/{_id}/reply` accepts `{ message: string }`
- [ ] Returns `{ success: true }` on success
- [ ] Returns `{ success: false, message: "error" }` on failure

### For Escalate Endpoint

- [ ] `POST /api/staff/tickets/{_id}/escalate` accepts `{ reason: string }`
- [ ] Returns `{ success: true }` on success
- [ ] Returns `{ success: false, message: "error" }` on failure

---

## 🧪 Testing Backend Response

### Using curl

```bash
# Test Support Tickets
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/staff/tickets | jq

# Test Vendor Tickets
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/staff/vendor-tickets | jq

# Test Reply
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test reply"}' \
  http://localhost:4000/api/staff/tickets/507f1f77bcf86cd799439011/reply | jq
```

### Using Postman

1. Create new request
2. Set method to GET
3. Set URL to `http://localhost:4000/api/staff/tickets`
4. Add header: `Authorization: Bearer YOUR_TOKEN`
5. Click Send
6. Check response format

---

## 🔍 Frontend Debugging

### Check Console Logs

```javascript
// Open DevTools: F12
// Go to Console tab
// Look for these logs:

📋 Tickets API response: {...}
✅ Parsed tickets: 5
🔍 First ticket structure: {
  _id: "507f1f77bcf86cd799439011",
  subject: "Order not delivered",
  status: "open",
  priority: "high",
  allKeys: ["_id", "subject", "status", "priority", ...]
}
```

### Check Network Response

```javascript
// Open DevTools: F12
// Go to Network tab
// Click on /api/staff/tickets request
// Check Response tab
// Verify format matches expected structure
```

---

## 📝 Common Issues & Solutions

### Issue: Data not showing

**Check:**
1. Backend returns `success: true`
2. `data` field contains array
3. Each item has `_id` field
4. Required fields are present

**Solution:**
```json
// ❌ Wrong
{
  "data": [
    {
      "subject": "...",
      "status": "..."
    }
  ]
}

// ✅ Correct
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "subject": "...",
      "status": "open",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Issue: 404 on reply/escalate

**Check:**
1. `_id` field is present in ticket
2. `_id` is not empty
3. Endpoint URL is correct

**Solution:**
```typescript
// ❌ Wrong - empty ID
POST /api/staff/tickets//reply

// ✅ Correct - with ID
POST /api/staff/tickets/507f1f77bcf86cd799439011/reply
```

### Issue: Status/Priority colors not showing

**Check:**
1. `status` value matches: `open`, `in_progress`, `resolved`, `closed`
2. `priority` value matches: `urgent`, `high`, `medium`, `low`

**Solution:**
```typescript
// ❌ Wrong
"status": "pending"  // Not in list
"priority": "P1"     // Not in list

// ✅ Correct
"status": "open"
"priority": "high"
```

---

## 🎯 Summary

**Backend should return:**
1. ✅ `{ success: true, data: [...] }` format
2. ✅ Each ticket with `_id` field
3. ✅ All required fields present
4. ✅ Valid enum values for status/priority
5. ✅ ISO format timestamps

**Frontend will:**
1. ✅ Parse the response
2. ✅ Normalize IDs
3. ✅ Display in table/cards
4. ✅ Handle user actions
5. ✅ Call action endpoints

**Result:**
✅ Data shows properly
✅ Actions work correctly
✅ No errors in console
