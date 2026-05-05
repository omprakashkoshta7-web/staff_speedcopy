# 🎯 Integration Summary - Backend to Frontend

## Backend Provide Kare Yeh Data

### Support Tickets
```
GET /api/staff/tickets

Response:
{
  "success": true,
  "data": [
    {
      "_id": "ID",
      "subject": "Title",
      "status": "open|in_progress|resolved|closed",
      "priority": "urgent|high|medium|low",
      "createdAt": "2024-01-15T10:30:00Z",
      "description": "...",
      "category": "...",
      "orderId": "...",
      "replies": [...]
    }
  ]
}
```

### Vendor Tickets
```
GET /api/staff/vendor-tickets

Response:
{
  "success": true,
  "data": [
    {
      "_id": "ID",
      "issue": "Title",
      "vendor": "Name",
      "status": "open|in_progress|resolved|closed",
      "priority": "urgent|high|medium|low",
      "createdAt": "2024-01-15T10:30:00Z",
      "sla": "..."
    }
  ]
}
```

---

## Frontend Display Karega Aisa

### Support Tickets Table
```
┌─────────────────────────────────────────────────────┐
│ Subject (from subject)                              │
│ ID: {_id.slice(-8)}                                 │
│ Category: {category}                                │
├─────────────────────────────────────────────────────┤
│ Status: {status}                                    │
│ Color: STATUS_BG[status]                            │
├─────────────────────────────────────────────────────┤
│ Priority: {priority}                                │
│ Color: PRI_COLOR[priority]                          │
├─────────────────────────────────────────────────────┤
│ Age: {getSLA(createdAt)}                            │
├─────────────────────────────────────────────────────┤
│ [Handle] [Escalate]                                 │
└─────────────────────────────────────────────────────┘
```

### Vendor Tickets Table
```
┌─────────────────────────────────────────────────────┐
│ Issue (from issue)                                  │
│ ID: {_id}                                           │
├─────────────────────────────────────────────────────┤
│ Vendor: {vendor}                                    │
├─────────────────────────────────────────────────────┤
│ Status: {status}                                    │
│ Color: STATUS_BG[status]                            │
├─────────────────────────────────────────────────────┤
│ SLA: {sla}                                          │
├─────────────────────────────────────────────────────┤
│ [Handle] [Escalate]                                 │
└─────────────────────────────────────────────────────┘
```

---

## Action Endpoints

### Reply
```
POST /api/staff/tickets/{_id}/reply
Body: { "message": "..." }
Response: { "success": true }

POST /api/staff/vendor-tickets/{_id}/reply
Body: { "message": "..." }
Response: { "success": true }
```

### Escalate
```
POST /api/staff/tickets/{_id}/escalate
Body: { "reason": "..." }
Response: { "success": true }
```

---

## ✅ Checklist

### Backend Must Have
- [ ] `_id` field in every ticket
- [ ] `subject` or `issue` field
- [ ] `status` field (valid enum)
- [ ] `priority` field (valid enum)
- [ ] `createdAt` field (ISO format)
- [ ] `{ success: true, data: [...] }` format
- [ ] All 5 endpoints working

### Frontend Will Do
- [ ] Fetch data
- [ ] Parse and normalize
- [ ] Display in table
- [ ] Show colors
- [ ] Handle actions
- [ ] Call endpoints

### Result
- [ ] Data shows correctly
- [ ] All features work
- [ ] No errors

---

## 🔍 Debug Commands

```bash
# Test Support Tickets
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/staff/tickets | jq

# Test Vendor Tickets
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/staff/vendor-tickets | jq

# Test Reply
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' \
  http://localhost:4000/api/staff/tickets/ID/reply | jq
```

---

## 📊 Field Reference

### Status Colors
```
open          → Blue (#3b82f6)
in_progress   → Amber (#f59e0b)
resolved      → Green (#16a34a)
closed        → Gray (#6b7280)
```

### Priority Colors
```
urgent        → Red (#ef4444)
high          → Amber (#f59e0b)
medium        → Blue (#3b82f6)
low           → Green (#16a34a)
```

---

## 🎯 That's It!

Backend provide kare:
1. Correct response format
2. Required fields
3. Valid enum values
4. All endpoints

Frontend automatically:
1. Fetch data
2. Display correctly
3. Handle actions
4. Show colors

**Result: Data show hoga perfectly!** ✅
