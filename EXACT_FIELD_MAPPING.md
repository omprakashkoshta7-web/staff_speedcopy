# 🎯 Exact Field Mapping - Backend to Frontend

## Support Tickets Queue

### Backend Returns This
```json
GET /api/staff/tickets
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
          "message": "We are investigating",
          "createdAt": "2024-01-15T11:00:00Z"
        }
      ]
    }
  ]
}
```

### Frontend Uses Like This

#### In Table Header
```typescript
["Subject", "Status", "Priority", "Age", "Action"]
```

#### In Table Row
```typescript
// Column 1: Subject
<p>{t.subject}</p>                    // "Order not delivered"
<p>{tid.slice(-8)}</p>                // "bcf86cd7"
<p>{t.category}</p>                   // "delivery"

// Column 2: Status
<span>{(t.status || "open").replace("_", " ")}</span>  // "open"
// Color: STATUS_BG[t.status] = "#eff6ff"
// Text Color: STATUS_COLOR[t.status] = "#3b82f6"

// Column 3: Priority
<span>{t.priority || "medium"}</span>  // "high"
// Color: PRI_COLOR[t.priority] = "#f59e0b"

// Column 4: Age
<span>{getSLA(t.createdAt)}</span>     // "2h ago"

// Column 5: Actions
<button onClick={() => setDetail(t)}>Handle</button>
```

#### In Detail Modal
```typescript
// Header
<h2>Ticket #{(t._id || t.id || "").slice(-8)}</h2>  // "Ticket #bcf86cd7"

// Content
<p>{t.subject}</p>                     // "Order not delivered"
<p>{t.description}</p>                 // "Customer complaint..."
<p>Linked order: {t.orderId}</p>       // "Linked order: ORD-123456"

// Status & Priority
<span>{(t.status || "open").replace("_", " ")}</span>  // "open"
<span>{t.priority || "medium"}</span>   // "high"

// Age
<span>{getSLA(t.createdAt)}</span>      // "2h ago"

// Previous Replies
{t.replies?.map(r => (
  <div>
    <span>{r.authorRole}:</span>       // "support_staff:"
    <span>{r.message}</span>           // "We are investigating"
  </div>
))}

// Actions
<button onClick={() => doReply(t._id)}>Send Reply</button>
<button onClick={() => doEscalate(t._id)}>Escalate</button>
```

---

## Vendor Tickets Queue

### Backend Returns This
```json
GET /api/staff/vendor-tickets
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

### Frontend Uses Like This

#### In Table Header
```typescript
["Issue", "Vendor", "Status", "SLA", "Action"]
```

#### In Table Row
```typescript
// Column 1: Issue
<p>{t.issue}</p>                       // "Vendor not responding to orders"
<p>{t.id}</p>                          // "507f1f77bcf86cd799439012"

// Column 2: Vendor
<span>{t.vendor || "Unknown"}</span>   // "Vendor A"

// Column 3: Status
<span>{(t.status || "open").replace("_", " ")}</span>  // "open"
// Color: STATUS_BG[t.status] = "#eff6ff"
// Text Color: STATUS_COLOR[t.status] = "#3b82f6"

// Column 4: SLA
<span>{t.sla || "—"}</span>            // "2h remaining"

// Column 5: Actions
<button onClick={() => setDetail(t)}>Handle</button>
```

#### In Mobile Card
```typescript
// Header
<p>{t.issue}</p>                       // "Vendor not responding to orders"
<p>{t.vendor || "Unknown"}</p>         // "Vendor A"
<p>{t.sla || "—"}</p>                  // "2h remaining"

// Status Badge
<span>{(t.status || "open").replace("_", " ")}</span>  // "open"
// Color: STATUS_BG[t.status] = "#eff6ff"

// Actions
<button onClick={() => setDetail(t)}>Handle</button>
```

#### In Detail Modal
```typescript
// Header
<h2>{t.id}</h2>                        // "507f1f77bcf86cd799439012"
<p>Vendor: {t.vendor}</p>              // "Vendor: Vendor A"

// Content
<p>{t.issue}</p>                       // "Vendor not responding to orders"

// Status & SLA
<span>{(t.status || "open").replace("_", " ")}</span>  // "open"
<span>{t.sla || "—"}</span>            // "2h remaining"

// Actions
<button onClick={() => doReply(t._id)}>Send Reply</button>
<button onClick={() => doEscalate(t._id)}>Escalate</button>
```

---

## Color Mapping

### Status Colors
```
status: "open"          → Color: #3b82f6 (Blue)      → BG: #eff6ff
status: "in_progress"   → Color: #f59e0b (Amber)     → BG: #fffbeb
status: "resolved"      → Color: #16a34a (Green)     → BG: #f0fdf4
status: "closed"        → Color: #6b7280 (Gray)      → BG: #f3f4f6
```

### Priority Colors
```
priority: "urgent"      → Color: #ef4444 (Red)
priority: "high"        → Color: #f59e0b (Amber)
priority: "medium"      → Color: #3b82f6 (Blue)
priority: "low"         → Color: #16a34a (Green)
```

---

## API Calls

### When User Clicks "Send Reply"
```typescript
// Frontend extracts ID
const id = t._id || t.id;  // "507f1f77bcf86cd799439011"

// Frontend calls API
POST /api/staff/tickets/{id}/reply
{
  "message": "We are investigating this issue"
}

// Backend should return
{
  "success": true,
  "message": "Reply sent successfully"
}

// Frontend refreshes list
fetchTickets();
```

### When User Clicks "Escalate"
```typescript
// Frontend extracts ID
const id = t._id || t.id;  // "507f1f77bcf86cd799439011"

// Frontend calls API
POST /api/staff/tickets/{id}/escalate
{
  "reason": "Escalated by support staff"
}

// Backend should return
{
  "success": true,
  "message": "Ticket escalated successfully"
}

// Frontend updates status
setItems(p => p.map(ticket => 
  ticket._id === id 
    ? { ...ticket, priority: "urgent", status: "in_progress" }
    : ticket
));
```

---

## Field Validation

### Support Tickets - Required Fields
```
✅ _id          - Must exist and be non-empty
✅ subject      - Must exist and be non-empty
✅ status       - Must be: open, in_progress, resolved, closed
✅ priority     - Must be: urgent, high, medium, low
✅ createdAt    - Must be ISO format timestamp

❌ description  - Optional (can be empty)
❌ category     - Optional (can be empty)
❌ orderId      - Optional (can be empty)
❌ replies      - Optional (can be empty array)
```

### Vendor Tickets - Required Fields
```
✅ _id          - Must exist and be non-empty
✅ issue        - Must exist and be non-empty
✅ vendor       - Must exist and be non-empty
✅ status       - Must be: open, in_progress, resolved, closed
✅ priority     - Must be: urgent, high, medium, low
✅ createdAt    - Must be ISO format timestamp

❌ sla          - Optional (can be empty)
```

---

## 🔍 Debugging

### Check Backend Response
```bash
# In browser console
fetch('/api/staff/tickets', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
```

### Check Frontend Parsing
```javascript
// Console logs to look for:
📋 Tickets API response: {...}
✅ Parsed tickets: 5
🔍 First ticket structure: {
  _id: "507f1f77bcf86cd799439011",
  subject: "Order not delivered",
  status: "open",
  priority: "high",
  createdAt: "2024-01-15T10:30:00Z",
  allKeys: ["_id", "subject", "status", "priority", "createdAt", ...]
}
```

### Check Display
```javascript
// Verify in UI:
1. Tickets appear in table/cards
2. Subject shows correctly
3. Status color is correct
4. Priority color is correct
5. Age shows correctly
6. Handle button works
```

---

## ✅ Complete Checklist

### Backend
- [ ] `/api/staff/tickets` returns correct format
- [ ] `/api/staff/vendor-tickets` returns correct format
- [ ] Each ticket has `_id` field
- [ ] Status values are valid
- [ ] Priority values are valid
- [ ] Timestamps are ISO format
- [ ] `/api/staff/tickets/{id}/reply` endpoint works
- [ ] `/api/staff/tickets/{id}/escalate` endpoint works
- [ ] `/api/staff/vendor-tickets/{id}/reply` endpoint works

### Frontend
- [ ] Console shows no errors
- [ ] Console shows parsed ticket count
- [ ] Tickets display in table
- [ ] Tickets display on mobile
- [ ] Status colors are correct
- [ ] Priority colors are correct
- [ ] Handle button opens modal
- [ ] Reply button works
- [ ] Escalate button works
- [ ] List refreshes after action

---

## 🎯 Summary

**Backend provides:**
- Tickets with `_id`, `subject`, `status`, `priority`, `createdAt`
- Vendor tickets with `_id`, `issue`, `vendor`, `status`, `priority`, `createdAt`
- Valid enum values for status and priority
- ISO format timestamps

**Frontend displays:**
- Tickets in table/cards with all fields
- Colors based on status and priority
- Detail modal with full information
- Actions: Reply, Escalate

**Result:**
✅ Data shows correctly
✅ All features work
✅ No errors
