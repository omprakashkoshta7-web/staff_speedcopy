# Backend Integration Guide

## 🎯 Quick Start

Backend ko yeh 3 cheezein ensure karni hain:

### 1. Response Format
```json
{
  "success": true,
  "data": [...]
}
```

### 2. Required Fields
- `_id` - Ticket ID
- `subject` or `issue` - Title
- `status` - open, in_progress, resolved, closed
- `priority` - urgent, high, medium, low
- `createdAt` - ISO timestamp

### 3. API Endpoints
- `GET /api/staff/tickets`
- `GET /api/staff/vendor-tickets`
- `POST /api/staff/tickets/{id}/reply`
- `POST /api/staff/tickets/{id}/escalate`
- `POST /api/staff/vendor-tickets/{id}/reply`

---

## 📋 Support Tickets Endpoint

### GET /api/staff/tickets

**Response:**
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
      "replies": [
        {
          "authorRole": "support_staff",
          "message": "We are investigating",
          "createdAt": "2024-01-15T11:00:00Z"
        }
      ]
    }
  ]
}
```

**Field Details:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| _id | string | ✅ | "507f1f77bcf86cd799439011" |
| subject | string | ✅ | "Order not delivered" |
| description | string | ❌ | "Customer complaint" |
| category | string | ❌ | "delivery" |
| status | enum | ✅ | "open" |
| priority | enum | ✅ | "high" |
| orderId | string | ❌ | "ORD-123" |
| createdAt | ISO | ✅ | "2024-01-15T10:30:00Z" |
| replies | array | ❌ | [...] |

**Status Values:** `open`, `in_progress`, `resolved`, `closed`
**Priority Values:** `urgent`, `high`, `medium`, `low`

---

## 🏢 Vendor Tickets Endpoint

### GET /api/staff/vendor-tickets

**Response:**
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

**Field Details:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| _id | string | ✅ | "507f1f77bcf86cd799439012" |
| issue | string | ✅ | "Vendor not responding" |
| vendor | string | ✅ | "Vendor A" |
| status | enum | ✅ | "open" |
| priority | enum | ✅ | "high" |
| sla | string | ❌ | "2h remaining" |
| createdAt | ISO | ✅ | "2024-01-15T10:30:00Z" |

**Status Values:** `open`, `in_progress`, `resolved`, `closed`
**Priority Values:** `urgent`, `high`, `medium`, `low`

---

## 💬 Reply Endpoints

### POST /api/staff/tickets/{_id}/reply

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

### POST /api/staff/vendor-tickets/{_id}/reply

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

## 🚀 Escalate Endpoint

### POST /api/staff/tickets/{_id}/escalate

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

---

## 🧪 Testing

### Test with curl

```bash
# Get Support Tickets
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/staff/tickets | jq

# Get Vendor Tickets
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/staff/vendor-tickets | jq

# Send Reply
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test reply"}' \
  http://localhost:4000/api/staff/tickets/507f1f77bcf86cd799439011/reply | jq

# Escalate Ticket
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Escalated by staff"}' \
  http://localhost:4000/api/staff/tickets/507f1f77bcf86cd799439011/escalate | jq
```

### Test with Postman

1. **Create GET request**
   - URL: `http://localhost:4000/api/staff/tickets`
   - Header: `Authorization: Bearer YOUR_TOKEN`
   - Click Send
   - Verify response format

2. **Create POST request**
   - URL: `http://localhost:4000/api/staff/tickets/{_id}/reply`
   - Header: `Authorization: Bearer YOUR_TOKEN`
   - Body: `{"message": "Test reply"}`
   - Click Send
   - Verify success response

---

## ✅ Validation Checklist

### Response Format
- [ ] Response has `success: true`
- [ ] Response has `data` array
- [ ] Data array is not empty
- [ ] Each item has `_id` field

### Support Tickets
- [ ] `subject` is non-empty string
- [ ] `status` is one of: open, in_progress, resolved, closed
- [ ] `priority` is one of: urgent, high, medium, low
- [ ] `createdAt` is ISO format timestamp
- [ ] `description` is optional but recommended
- [ ] `category` is optional
- [ ] `orderId` is optional
- [ ] `replies` is optional array

### Vendor Tickets
- [ ] `issue` is non-empty string
- [ ] `vendor` is non-empty string
- [ ] `status` is one of: open, in_progress, resolved, closed
- [ ] `priority` is one of: urgent, high, medium, low
- [ ] `createdAt` is ISO format timestamp
- [ ] `sla` is optional

### Action Endpoints
- [ ] Reply endpoint accepts `{ message: string }`
- [ ] Reply endpoint returns `{ success: true }`
- [ ] Escalate endpoint accepts `{ reason: string }`
- [ ] Escalate endpoint returns `{ success: true }`

---

## 🔍 Common Issues

### Issue: Data not showing
**Check:**
- Response has `success: true`
- Response has `data` array
- Each item has `_id` field
- Status/priority values are valid

**Fix:**
```json
// ❌ Wrong
{
  "data": [
    {
      "subject": "...",
      "status": "pending"
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
- `_id` field is present
- `_id` is not empty
- Endpoint URL is correct

**Fix:**
```
❌ POST /api/staff/tickets//reply
✅ POST /api/staff/tickets/507f1f77bcf86cd799439011/reply
```

### Issue: Colors not showing
**Check:**
- Status values are valid
- Priority values are valid

**Fix:**
```
❌ status: "pending"
✅ status: "open"

❌ priority: "P1"
✅ priority: "high"
```

---

## 📝 Implementation Steps

### Step 1: Create Endpoints
```
GET /api/staff/tickets
GET /api/staff/vendor-tickets
POST /api/staff/tickets/{id}/reply
POST /api/staff/tickets/{id}/escalate
POST /api/staff/vendor-tickets/{id}/reply
```

### Step 2: Return Correct Format
```json
{
  "success": true,
  "data": [...]
}
```

### Step 3: Include Required Fields
- `_id` - Ticket ID
- `subject`/`issue` - Title
- `status` - Valid enum
- `priority` - Valid enum
- `createdAt` - ISO timestamp

### Step 4: Test Endpoints
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/staff/tickets
```

### Step 5: Verify in Frontend
- Open `/support/tickets`
- Check console for logs
- Verify data displays
- Test actions

---

## 🎯 Summary

**Backend must:**
1. ✅ Return `{ success: true, data: [...] }`
2. ✅ Include `_id` in every ticket
3. ✅ Use valid status/priority values
4. ✅ Return ISO format timestamps
5. ✅ Implement all 5 endpoints

**Frontend will:**
1. ✅ Fetch data from endpoints
2. ✅ Parse and normalize
3. ✅ Display in table/cards
4. ✅ Handle user actions
5. ✅ Call action endpoints

**Result:**
✅ Data shows correctly
✅ All features work
✅ No errors

---

## 📞 Support

**Questions?**
- Check `FIELD_REFERENCE.md` for exact fields
- Check `EXACT_FIELD_MAPPING.md` for mapping
- Check `BACKEND_FIELD_MAPPING.md` for details
- Check console logs for debugging

**Issues?**
- Verify response format
- Check field names
- Validate enum values
- Test with curl first
