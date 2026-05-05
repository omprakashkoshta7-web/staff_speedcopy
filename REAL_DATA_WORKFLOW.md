# 🔄 Real Data Workflow - Ticket & Vendor Queue

## Complete Flow - Step by Step

### Step 1: User Login
```
User enters email & password
         ↓
Frontend sends to Firebase OR Backend Mock
         ↓
Backend returns token
         ↓
Token stored in localStorage
         ↓
User redirected to dashboard
```

### Step 2: User Navigates to Support Tickets
```
User clicks: /support/tickets
         ↓
TicketQueuePage component loads
         ↓
useEffect triggers
         ↓
fetchTickets() called
```

### Step 3: Fetch Tickets from Backend
```
Frontend:
  GET /api/staff/tickets
  Header: Authorization: Bearer {token}
         ↓
Backend:
  1. Verify token
  2. Query database for tickets
  3. Return response
         ↓
Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "subject": "Order not delivered",
      "status": "open",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00Z",
      "description": "Customer complaint",
      "category": "delivery",
      "orderId": "ORD-123",
      "replies": [...]
    }
  ]
}
```

### Step 4: Frontend Processes Data
```
Frontend receives response
         ↓
Check: response.success === true
         ↓
Extract: response.data (array of tickets)
         ↓
Normalize IDs:
  - Ensure _id exists
  - Ensure id exists
  - Generate fallback if needed
         ↓
setItems(tickets)
         ↓
Console logs:
  📋 Tickets API response: {...}
  ✅ Parsed tickets: 5
  🔍 First ticket structure: {...}
```

### Step 5: Display Tickets in UI
```
Frontend renders table/cards
         ↓
For each ticket:
  - Display subject
  - Display status (with color)
  - Display priority (with color)
  - Display age (calculated from createdAt)
  - Show Handle button
         ↓
Table shows:
┌─────────────────────────────────────────┐
│ Subject          │ Status │ Priority    │
├─────────────────────────────────────────┤
│ Order not deliv. │ Open   │ High        │
│ Payment issue    │ In Pr. │ Medium      │
└─────────────────────────────────────────┘
```

### Step 6: User Clicks "Handle"
```
User clicks Handle button
         ↓
setDetail(ticket) called
         ↓
Modal opens showing:
  - Ticket ID
  - Subject
  - Description
  - Status
  - Priority
  - Previous replies
  - Reply textarea
  - Send Reply button
  - Escalate button
```

### Step 7: User Sends Reply
```
User types message in textarea
         ↓
User clicks "Send Reply"
         ↓
Frontend validates:
  - Message not empty
  - Ticket ID exists
  - ID is not fallback
         ↓
Frontend calls:
  POST /api/staff/tickets/{_id}/reply
  Body: { "message": "..." }
  Header: Authorization: Bearer {token}
         ↓
Backend:
  1. Verify token
  2. Find ticket by _id
  3. Add reply to ticket
  4. Save to database
  5. Return response
         ↓
Response:
{
  "success": true,
  "message": "Reply sent successfully"
}
         ↓
Frontend:
  1. Close modal
  2. Clear reply text
  3. Refresh ticket list
  4. Show success
```

### Step 8: User Escalates Ticket
```
User clicks "Escalate"
         ↓
Frontend validates:
  - Ticket ID exists
  - ID is not fallback
         ↓
Frontend calls:
  POST /api/staff/tickets/{_id}/escalate
  Body: { "reason": "Escalated by support staff" }
  Header: Authorization: Bearer {token}
         ↓
Backend:
  1. Verify token
  2. Find ticket by _id
  3. Update status to "in_progress"
  4. Update priority to "urgent"
  5. Save to database
  6. Return response
         ↓
Response:
{
  "success": true,
  "message": "Ticket escalated successfully"
}
         ↓
Frontend:
  1. Update ticket in list
  2. Close modal
  3. Show success
```

---

## Vendor Tickets Workflow

### Step 1: User Navigates to Vendor Tickets
```
User clicks: /support/vendor-tickets
         ↓
VendorTicketsPage component loads
         ↓
useEffect triggers
         ↓
fetchTickets() called
```

### Step 2: Fetch Vendor Tickets
```
Frontend:
  GET /api/staff/vendor-tickets
  Header: Authorization: Bearer {token}
         ↓
Backend returns:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "issue": "Vendor not responding",
      "vendor": "Vendor A",
      "status": "open",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00Z",
      "sla": "2h remaining"
    }
  ]
}
```

### Step 3: Display Vendor Tickets
```
Frontend renders table/cards
         ↓
For each ticket:
  - Display issue
  - Display vendor name
  - Display status (with color)
  - Display priority (with color)
  - Display SLA
  - Show Handle button
         ↓
Table shows:
┌──────────────────────────────────────────┐
│ Issue            │ Vendor   │ Status     │
├──────────────────────────────────────────┤
│ Not responding   │ Vendor A │ Open       │
│ Delayed response │ Vendor B │ In Prog.   │
└──────────────────────────────────────────┘
```

### Step 4: User Sends Reply to Vendor
```
User clicks Handle
         ↓
Modal opens
         ↓
User types message
         ↓
User clicks "Send Reply"
         ↓
Frontend calls:
  POST /api/staff/vendor-tickets/{_id}/reply
  Body: { "message": "..." }
  Header: Authorization: Bearer {token}
         ↓
Backend processes and returns success
         ↓
Frontend refreshes list
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Login                            │
│  Email + Password → Firebase/Backend → Token            │
│  Token stored in localStorage                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Navigate to Page      │
        │  /support/tickets      │
        │  /support/vendor-tickets
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Component Loads       │
        │  useEffect triggers    │
        │  fetchTickets()        │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  API Call              │
        │  GET /api/staff/tickets│
        │  Header: Bearer token  │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Backend Processing    │
        │  1. Verify token       │
        │  2. Query database     │
        │  3. Return data        │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Frontend Processing   │
        │  1. Parse response     │
        │  2. Normalize IDs      │
        │  3. setItems(data)     │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Render UI             │
        │  Display table/cards   │
        │  Show tickets          │
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    User Clicks          User Clicks
    "Handle"             "Escalate"
        │                         │
        ▼                         ▼
    Modal Opens          API Call
    Show Details         POST /escalate
        │                         │
        ▼                         ▼
    User Types           Backend
    Reply                Updates
        │                         │
        ▼                         ▼
    User Clicks          Frontend
    "Send Reply"         Refreshes
        │                         │
        ▼                         ▼
    API Call             List Updated
    POST /reply
        │
        ▼
    Backend
    Saves Reply
        │
        ▼
    Frontend
    Refreshes List
```

---

## Real Data Requirements

### Backend Must Provide

**For Support Tickets:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string (MongoDB ID)",
      "subject": "string",
      "status": "open|in_progress|resolved|closed",
      "priority": "urgent|high|medium|low",
      "createdAt": "ISO timestamp",
      "description": "string (optional)",
      "category": "string (optional)",
      "orderId": "string (optional)",
      "replies": "array (optional)"
    }
  ]
}
```

**For Vendor Tickets:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string (MongoDB ID)",
      "issue": "string",
      "vendor": "string",
      "status": "open|in_progress|resolved|closed",
      "priority": "urgent|high|medium|low",
      "createdAt": "ISO timestamp",
      "sla": "string (optional)"
    }
  ]
}
```

### API Endpoints Required

```
GET /api/staff/tickets
  Returns: { success: true, data: Ticket[] }

GET /api/staff/vendor-tickets
  Returns: { success: true, data: Ticket[] }

POST /api/staff/tickets/{_id}/reply
  Body: { message: string }
  Returns: { success: true }

POST /api/staff/tickets/{_id}/escalate
  Body: { reason: string }
  Returns: { success: true }

POST /api/staff/vendor-tickets/{_id}/reply
  Body: { message: string }
  Returns: { success: true }
```

---

## No Mock Data

**Frontend does NOT have:**
- ❌ Hardcoded ticket data
- ❌ Fake API responses
- ❌ Test data in components
- ❌ Placeholder tickets

**Frontend ONLY:**
- ✅ Fetches from real API
- ✅ Uses real token from login
- ✅ Processes real backend response
- ✅ Displays real data

**Backend MUST:**
- ✅ Provide real endpoints
- ✅ Return real data from database
- ✅ Verify authentication token
- ✅ Handle all operations

---

## Testing the Real Workflow

### Step 1: Start Backend
```bash
# Backend should be running on port 4000
npm run dev:backend
# or
node server.js
```

### Step 2: Login
```
1. Go to http://localhost:5173
2. Enter email & password
3. Click Login
4. Should redirect to dashboard
```

### Step 3: Navigate to Tickets
```
1. Click Support → Tickets
2. Check console for logs
3. Verify tickets display
```

### Step 4: Test Actions
```
1. Click Handle on a ticket
2. Type reply message
3. Click Send Reply
4. Verify success
5. Check if list refreshes
```

### Step 5: Debug if Issues
```
1. Open DevTools: F12
2. Go to Console tab
3. Look for logs:
   📋 Tickets API response: {...}
   ✅ Parsed tickets: X
4. Check Network tab for API calls
5. Verify response status is 200
```

---

## Summary

**Real Workflow:**
1. ✅ User logs in with real credentials
2. ✅ Frontend gets real token
3. ✅ Frontend calls real API endpoints
4. ✅ Backend returns real data from database
5. ✅ Frontend displays real data
6. ✅ User performs real actions
7. ✅ Backend processes real operations
8. ✅ Data updates in database

**No Mock Data:**
- ✅ All data comes from backend
- ✅ All operations are real
- ✅ All changes persist in database
- ✅ No hardcoded test data

**Result:**
✅ Complete real workflow
✅ No mock data
✅ Production-ready
