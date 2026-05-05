# 📚 Backend Documentation Guide - How to Use These Docs

## Overview
Backend के लिए 4 comprehensive documentation files बनाए गए हैं। यह guide बताता है कि कौन सी file कब use करें।

---

## 📋 DOCUMENTATION FILES

### 1. **BACKEND_COMPLETE_API_LIST.md** ✅
**जब:** Backend में सभी available APIs देखने हैं

**क्या है:**
- सभी 52 APIs की complete list
- हर API के लिए:
  - Endpoint path
  - HTTP method
  - Request body format
  - Response format
  - Authentication requirement
  - कौन से staff roles use कर सकते हैं

**Example:**
```
GET /api/staff/tickets
Auth: Yes (Bearer token)
Response: { success: true, data: Ticket[] }
Used By: Support staff (customer)
Frontend: TicketQueuePage.tsx
```

**Use Cases:**
- Backend developer: "मुझे सभी endpoints देखने हैं"
- QA: "API testing के लिए सभी endpoints की list चाहिए"
- Project manager: "कितने APIs हैं?"

---

### 2. **BACKEND_APIS_BY_ROLE.md** ✅
**जब:** किसी specific staff role के लिए APIs देखने हैं

**क्या है:**
- APIs organized by staff role:
  - Support Staff (Customer) - 7 APIs
  - Support Staff (Vendor) - 3 APIs
  - OPS Staff - 5 APIs
  - Finance Staff - 9 APIs
  - Marketing Staff - 8 APIs
  - All Staff (Common) - 11 APIs

**हर API के लिए:**
- Endpoint
- Request/Response format
- कहाँ use होता है (frontend file)
- Console logs
- Error handling

**Example:**
```
### API 1: Get All Tickets
GET /api/staff/tickets
Response: { success: true, data: Ticket[] }

Ticket Object Structure:
{
  _id: string;              // MongoDB ID (REQUIRED for API calls)
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "urgent" | "high" | "medium" | "low";
  ...
}

Used In: TicketQueuePage.tsx - Line 47: fetchTickets()
```

**Use Cases:**
- Support staff: "मेरे role के लिए कौन से APIs हैं?"
- Frontend developer: "Support staff के लिए कौन से APIs implement करने हैं?"
- Backend developer: "Support staff के लिए कौन से endpoints बनाने हैं?"

---

### 3. **SCREEN_DATA_FLOW.md** ✅
**जब:** किसी screen के लिए complete data flow देखना हो

**क्या है:**
- हर screen के लिए step-by-step data flow:
  1. Component mount
  2. API call
  3. Backend response
  4. Data normalization
  5. State update
  6. UI rendering
  7. User interactions

**Screens Covered:**
- Ticket Queue (Support)
- Vendor Ticket Queue
- Order Queue (OPS)
- Refund Queue (Finance)
- Payout Assist (Finance)
- Ledger View (Finance)
- Campaigns (Marketing)

**Example:**
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
│    { success: true, data: [...] }                          │
└────────────────────┬────────────────────────────────────────┘
```

**Use Cases:**
- Frontend developer: "Ticket Queue में data कैसे flow होता है?"
- QA: "Data flow को समझना है"
- New team member: "Complete workflow समझना है"

---

### 4. **BACKEND_API_REFERENCE.md** ✅
**जब:** Quick reference चाहिए

**क्या है:**
- सभी 52 APIs की quick reference
- APIs organized by category:
  - Auth (8)
  - Dashboard (1)
  - RBAC (3)
  - Tasks (4)
  - Orders (5)
  - Support (8)
  - Finance (8)
  - Marketing (7)
  - Escalation (2)
  - Audit (3)
  - System (3)

**Use Cases:**
- Quick lookup
- API summary
- Testing checklist

---

## 🎯 QUICK DECISION TREE

```
मुझे क्या चाहिए?
│
├─ "सभी APIs की list" 
│  └─ BACKEND_COMPLETE_API_LIST.md
│
├─ "मेरे role के लिए कौन से APIs हैं?"
│  └─ BACKEND_APIS_BY_ROLE.md
│
├─ "Ticket Queue में data कैसे flow होता है?"
│  └─ SCREEN_DATA_FLOW.md
│
├─ "Quick reference चाहिए"
│  └─ BACKEND_API_REFERENCE.md
│
└─ "Backend integration guide"
   └─ BACKEND_INTEGRATION_GUIDE.md
```

---

## 📊 DOCUMENTATION COMPARISON

| Feature | Complete List | By Role | Screen Flow | Reference |
|---------|---------------|---------|-------------|-----------|
| All APIs | ✅ | ✅ | ✅ | ✅ |
| Organized by role | ❌ | ✅ | ❌ | ❌ |
| Data flow diagram | ❌ | ❌ | ✅ | ❌ |
| Code examples | ❌ | ✅ | ✅ | ❌ |
| Error handling | ❌ | ✅ | ✅ | ❌ |
| Console logs | ❌ | ✅ | ✅ | ❌ |
| Quick lookup | ❌ | ❌ | ❌ | ✅ |
| Frontend file mapping | ❌ | ✅ | ✅ | ❌ |

---

## 🔍 DETAILED GUIDE

### For Backend Developers

**Task:** "मुझे सभी endpoints implement करने हैं"

**Steps:**
1. Open: `BACKEND_COMPLETE_API_LIST.md`
2. देखो: सभी 52 APIs की list
3. हर API के लिए:
   - Endpoint path
   - HTTP method
   - Request body format
   - Response format
   - Authentication requirement

**Example:**
```
### 1. Get Support Tickets
GET /api/staff/tickets
Auth: Yes (Bearer token)
Response: {
  success: true;
  data: [
    {
      _id: string;
      subject: string;
      status: "open" | "in_progress" | "resolved" | "closed";
      priority: "urgent" | "high" | "medium" | "low";
      ...
    }
  ];
}
```

---

### For Frontend Developers

**Task:** "Support staff के लिए Ticket Queue implement करना है"

**Steps:**
1. Open: `BACKEND_APIS_BY_ROLE.md`
2. Find: "SUPPORT STAFF (CUSTOMER)" section
3. देखो: कौन से APIs use होते हैं
4. Open: `SCREEN_DATA_FLOW.md`
5. Find: "TICKET QUEUE (SUPPORT)" section
6. देखो: complete data flow

**APIs to implement:**
```
1. GET /api/staff/tickets - Get all tickets
2. GET /api/staff/tickets/{_id} - Get ticket detail
3. POST /api/staff/tickets/{_id}/reply - Send reply
4. POST /api/staff/tickets/{_id}/escalate - Escalate ticket
```

**Data flow:**
```
Component Mount
  ↓
API Call: GET /api/staff/tickets
  ↓
Backend Response: { success: true, data: [...] }
  ↓
Data Normalization: Ensure _id exists
  ↓
State Update: setItems(tickets)
  ↓
UI Rendering: Display in table/cards
  ↓
User Interaction: Click "Handle" button
  ↓
Detail Modal: Show full ticket info
```

---

### For QA/Testers

**Task:** "Ticket Queue को test करना है"

**Steps:**
1. Open: `BACKEND_APIS_BY_ROLE.md`
2. Find: "SUPPORT STAFF (CUSTOMER)" section
3. देखो: सभी APIs और उनके test cases

**Test Cases:**
```
1. Get Tickets
   - API: GET /api/staff/tickets
   - Expected: { success: true, data: [...] }
   - Verify: Data displays in table

2. Send Reply
   - API: POST /api/staff/tickets/{_id}/reply
   - Body: { message: "Reply text" }
   - Expected: { success: true }
   - Verify: Reply appears in ticket

3. Escalate Ticket
   - API: POST /api/staff/tickets/{_id}/escalate
   - Body: { reason: "Escalated by support staff" }
   - Expected: { success: true }
   - Verify: Priority changes to "urgent"
```

---

### For Project Managers

**Task:** "Backend API status जानना है"

**Steps:**
1. Open: `BACKEND_API_REFERENCE.md`
2. देखो: "📊 API Summary" section

**Summary:**
```
Total APIs: 52
Categories: 11
Status: ✅ All documented

By Category:
- Auth: 8 APIs
- Dashboard: 1 API
- RBAC: 3 APIs
- Tasks: 4 APIs
- Orders: 5 APIs
- Support: 8 APIs
- Finance: 8 APIs
- Marketing: 7 APIs
- Escalation: 2 APIs
- Audit: 3 APIs
- System: 3 APIs
```

---

## 🔑 KEY INFORMATION

### API Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

### Authentication
```
Header: Authorization: Bearer {token}
```

### Status Values
- **Tickets:** `open`, `in_progress`, `resolved`, `closed`
- **Orders:** `pending`, `assigned`, `in_progress`, `completed`, `cancelled`
- **Refunds:** `pending`, `approved`, `rejected`, `processed`

### Priority Values
- `urgent`, `high`, `medium`, `low`

### Timestamps
- ISO format: `2024-01-15T10:30:00Z`

---

## 📞 DOCUMENTATION STRUCTURE

```
Backend Documentation
│
├─ BACKEND_COMPLETE_API_LIST.md
│  └─ सभी 52 APIs की complete list
│     ├─ Authentication (8)
│     ├─ Dashboard (1)
│     ├─ RBAC (3)
│     ├─ Tasks (4)
│     ├─ Orders (5)
│     ├─ Support (8)
│     ├─ Finance (8)
│     ├─ Marketing (7)
│     ├─ Escalation (2)
│     ├─ Audit (3)
│     └─ System (3)
│
├─ BACKEND_APIS_BY_ROLE.md
│  └─ APIs organized by staff role
│     ├─ Support Staff (Customer) - 7 APIs
│     ├─ Support Staff (Vendor) - 3 APIs
│     ├─ OPS Staff - 5 APIs
│     ├─ Finance Staff - 9 APIs
│     ├─ Marketing Staff - 8 APIs
│     └─ All Staff (Common) - 11 APIs
│
├─ SCREEN_DATA_FLOW.md
│  └─ Data flow for each screen
│     ├─ Ticket Queue
│     ├─ Vendor Ticket Queue
│     ├─ Order Queue
│     ├─ Refund Queue
│     ├─ Payout Assist
│     ├─ Ledger View
│     └─ Campaigns
│
├─ BACKEND_API_REFERENCE.md
│  └─ Quick reference
│     ├─ All APIs summary
│     ├─ APIs by role
│     ├─ Testing procedures
│     └─ Implementation status
│
└─ BACKEND_INTEGRATION_GUIDE.md
   └─ Integration guide
      ├─ Backend setup
      ├─ API endpoints
      ├─ Response formats
      ├─ Error handling
      └─ Testing procedures
```

---

## ✅ CHECKLIST

### For Backend Developers
- [ ] Read: BACKEND_COMPLETE_API_LIST.md
- [ ] Understand: All 52 APIs
- [ ] Implement: Each API endpoint
- [ ] Test: Each endpoint with curl/Postman
- [ ] Verify: Response format matches documentation

### For Frontend Developers
- [ ] Read: BACKEND_APIS_BY_ROLE.md
- [ ] Read: SCREEN_DATA_FLOW.md
- [ ] Understand: Data flow for each screen
- [ ] Implement: API calls in frontend
- [ ] Test: Each screen with real backend data
- [ ] Verify: Data displays correctly

### For QA/Testers
- [ ] Read: BACKEND_API_REFERENCE.md
- [ ] Read: BACKEND_APIS_BY_ROLE.md
- [ ] Create: Test cases for each API
- [ ] Test: Each API endpoint
- [ ] Verify: Response format
- [ ] Test: Error scenarios

### For Project Managers
- [ ] Read: BACKEND_API_REFERENCE.md
- [ ] Understand: Total APIs (52)
- [ ] Track: Implementation status
- [ ] Monitor: Testing progress

---

## 🎯 SUMMARY

**4 Documentation Files Created:**

1. **BACKEND_COMPLETE_API_LIST.md** (52 APIs)
   - Complete list of all endpoints
   - Organized by category
   - Full details for each API

2. **BACKEND_APIS_BY_ROLE.md** (43 APIs)
   - APIs organized by staff role
   - Code examples
   - Error handling
   - Console logs

3. **SCREEN_DATA_FLOW.md** (7 Screens)
   - Data flow diagrams
   - Step-by-step flow
   - User interactions
   - Error handling

4. **BACKEND_API_REFERENCE.md** (Quick Reference)
   - Summary of all APIs
   - APIs by role
   - Testing procedures
   - Implementation status

---

## 📞 SUPPORT

For questions about:
- **All APIs:** See `BACKEND_COMPLETE_API_LIST.md`
- **Role-specific APIs:** See `BACKEND_APIS_BY_ROLE.md`
- **Data flow:** See `SCREEN_DATA_FLOW.md`
- **Quick reference:** See `BACKEND_API_REFERENCE.md`
- **Integration:** See `BACKEND_INTEGRATION_GUIDE.md`

---

**Last Updated:** May 1, 2026
**Status:** ✅ Complete
**Total Documentation:** 4 files
**Total APIs Documented:** 52
