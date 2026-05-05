# 📐 API Structure by Module

## Complete Backend API Organization

---

## 🔐 AUTH MODULE

### Endpoints
```
POST   /api/staff/auth/login              → Login
POST   /api/auth/verify                   → Verify token
GET    /api/auth/me                       → Get current user
POST   /api/staff/auth/mfa/verify         → MFA verification
POST   /api/staff/auth/logout             → Logout
GET    /api/staff/auth/session            → Get session
GET    /api/staff/auth/sessions           → Get all sessions
DELETE /api/staff/auth/session/{id}       → Kill session
```

### Used By
- All staff members

---

## 📊 DASHBOARD MODULE

### Endpoints
```
GET /api/staff/dashboard?role={role}     → Get dashboard data
```

### Returns
```json
{
  "stats": {...},
  "tasks": [...],
  "alerts": [...]
}
```

### Used By
- All staff members

---

## 👥 RBAC MODULE

### Endpoints
```
GET  /api/staff/roles/{userId}           → Get user role
GET  /api/staff/permissions/{role}       → Get role permissions
POST /api/staff/roles/assign             → Assign role to user
```

### Used By
- Admin staff

---

## ✅ TASK MODULE

### Endpoints
```
GET    /api/staff/tasks                  → Get all tasks
GET    /api/staff/tasks/{id}             → Get task detail
POST   /api/staff/tasks/{id}/complete    → Complete task
POST   /api/staff/tasks/{id}/assign      → Assign task
```

### Used By
- All staff members

---

## 📦 ORDER MODULE

### Endpoints
```
GET    /api/staff/orders                 → Get order queue
GET    /api/staff/orders/{id}            → Get order detail
GET    /api/staff/vendors                → Get assignable vendors
POST   /api/staff/orders/{id}/reassign-vendor    → Reassign vendor
POST   /api/staff/orders/{id}/clarification     → Raise clarification
```

### Used By
- OPS staff

### Data Flow
```
Order Queue
  ├─ GET /api/staff/orders
  ├─ Display orders
  ├─ User clicks Handle
  ├─ GET /api/staff/orders/{id}
  ├─ Show detail
  ├─ User clicks Reassign
  ├─ GET /api/staff/vendors
  ├─ Show vendor list
  └─ POST /api/staff/orders/{id}/reassign-vendor
```

---

## 🎫 SUPPORT MODULE

### Customer Support
```
GET    /api/staff/tickets                → Get support tickets
GET    /api/staff/tickets/{id}           → Get ticket detail
POST   /api/staff/tickets/{id}/reply     → Reply to ticket
POST   /api/staff/tickets/{id}/close     → Close ticket
POST   /api/staff/tickets/{id}/escalate  → Escalate ticket
POST   /api/staff/uploads/attachments    → Upload attachment
```

### Vendor Support
```
GET    /api/staff/vendor-tickets         → Get vendor tickets
POST   /api/staff/vendor-tickets/{id}/reply  → Reply to vendor
```

### Used By
- Support staff (customer)
- Support staff (vendor)

### Data Flow
```
Ticket Queue
  ├─ GET /api/staff/tickets
  ├─ Display tickets
  ├─ User clicks Handle
  ├─ GET /api/staff/tickets/{id}
  ├─ Show detail
  ├─ User types reply
  ├─ POST /api/staff/tickets/{id}/reply
  ├─ Refresh list
  └─ Show success

Vendor Ticket Queue
  ├─ GET /api/staff/vendor-tickets
  ├─ Display vendor tickets
  ├─ User clicks Handle
  ├─ User types reply
  └─ POST /api/staff/vendor-tickets/{id}/reply
```

---

## 💰 FINANCE MODULE

### Refunds
```
GET    /api/staff/refunds                → Get refund queue
POST   /api/staff/refunds/{id}/approve   → Approve refund
POST   /api/staff/refunds/{id}/escalate  → Escalate refund
```

### Wallet
```
POST   /api/staff/wallet/credit          → Credit wallet
POST   /api/staff/wallet/debit           → Debit wallet
GET    /api/staff/wallet/ledger          → Get ledger
```

### Payouts
```
GET    /api/staff/payouts                → Get payouts
POST   /api/staff/payouts/issue-ticket   → Issue payout ticket
```

### Used By
- Finance staff

### Data Flow
```
Refund Queue
  ├─ GET /api/staff/refunds
  ├─ Display refunds
  ├─ User clicks Approve
  └─ POST /api/staff/refunds/{id}/approve

Wallet Adjustment
  ├─ User enters amount
  ├─ POST /api/staff/wallet/credit
  ├─ or POST /api/staff/wallet/debit
  └─ GET /api/staff/wallet/ledger

Payout Assistance
  ├─ GET /api/staff/payouts
  ├─ Display payouts
  ├─ User clicks Issue Ticket
  └─ POST /api/staff/payouts/issue-ticket
```

---

## 🎯 MARKETING MODULE

### Campaigns
```
GET /api/staff/campaigns                 → Get campaigns
```

### Coupons
```
GET    /api/admin/coupons                → Get coupons
GET    /api/admin/coupons/{id}           → Get coupon detail
POST   /api/admin/coupons                → Create coupon
PUT    /api/admin/coupons/{id}           → Update coupon
DELETE /api/admin/coupons/{id}           → Delete coupon
GET    /api/admin/coupons/{id}/usage     → Get usage stats
```

### Analytics
```
GET /api/staff/analytics/reports         → Get reports
```

### Used By
- Marketing staff

### Data Flow
```
Campaign Dashboard
  ├─ GET /api/staff/campaigns
  └─ Display metrics

Coupon Creation
  ├─ User fills form
  ├─ POST /api/admin/coupons
  ├─ GET /api/admin/coupons
  └─ Display list

Coupon Management
  ├─ GET /api/admin/coupons
  ├─ Display coupons
  ├─ User clicks Edit
  ├─ GET /api/admin/coupons/{id}
  ├─ PUT /api/admin/coupons/{id}
  └─ Refresh list
```

---

## 🚨 ESCALATION MODULE

### Endpoints
```
POST /api/staff/escalation               → Trigger escalation
GET  /api/staff/escalations              → Get escalations
```

### Used By
- All staff members

### Data Flow
```
Escalation
  ├─ User clicks Escalate
  ├─ POST /api/staff/escalation
  ├─ Admin notified
  └─ Show success
```

---

## 📋 AUDIT MODULE

### Endpoints
```
GET /api/staff/audit/logs                → Get audit logs
GET /api/staff/activity                  → Get activity logs
GET /api/staff/performance               → Get performance metrics
```

### Used By
- Admin staff
- All staff (read-only)

### Data Flow
```
Activity Tracking
  ├─ GET /api/staff/audit/logs
  ├─ Display logs
  └─ Show history

Performance Metrics
  ├─ GET /api/staff/performance
  └─ Display metrics
```

---

## ⚙️ SYSTEM MODULE

### Endpoints
```
GET  /api/staff/system/status            → Get system status
GET  /api/staff/permissions/check        → Check permissions
POST /api/staff/conflict/lock            → Lock resource
```

### Used By
- System admin

---

## 📊 API Count by Module

| Module | GET | POST | PUT | DELETE | Total |
|--------|-----|------|-----|--------|-------|
| Auth | 3 | 4 | 0 | 1 | 8 |
| Dashboard | 1 | 0 | 0 | 0 | 1 |
| RBAC | 2 | 1 | 0 | 0 | 3 |
| Tasks | 2 | 2 | 0 | 0 | 4 |
| Orders | 3 | 2 | 0 | 0 | 5 |
| Support | 4 | 4 | 0 | 0 | 8 |
| Finance | 4 | 4 | 0 | 0 | 8 |
| Marketing | 4 | 1 | 1 | 1 | 7 |
| Escalation | 1 | 1 | 0 | 0 | 2 |
| Audit | 3 | 0 | 0 | 0 | 3 |
| System | 2 | 1 | 0 | 0 | 3 |
| **TOTAL** | **29** | **20** | **1** | **2** | **52** |

---

## 🔄 API Call Patterns

### Read Pattern
```
GET /api/staff/{resource}
  ↓
Display list
  ↓
User selects item
  ↓
GET /api/staff/{resource}/{id}
  ↓
Display detail
```

### Create Pattern
```
User fills form
  ↓
POST /api/staff/{resource}
  ↓
Backend saves
  ↓
GET /api/staff/{resource}
  ↓
Refresh list
```

### Update Pattern
```
GET /api/staff/{resource}/{id}
  ↓
User edits
  ↓
PUT /api/staff/{resource}/{id}
  ↓
Backend updates
  ↓
GET /api/staff/{resource}
  ↓
Refresh list
```

### Delete Pattern
```
DELETE /api/staff/{resource}/{id}
  ↓
Backend deletes
  ↓
GET /api/staff/{resource}
  ↓
Refresh list
```

### Action Pattern
```
POST /api/staff/{resource}/{id}/{action}
  ↓
Backend processes
  ↓
GET /api/staff/{resource}
  ↓
Refresh list
```

---

## 🎯 API Grouping

### By HTTP Method
```
GET (29)
  - Read operations
  - No side effects
  - Cacheable

POST (20)
  - Create operations
  - Action operations
  - Side effects

PUT (1)
  - Update operations
  - Full replacement

DELETE (2)
  - Delete operations
  - Permanent removal
```

### By Resource Type
```
Auth (8)
  - User authentication
  - Session management

Data (29)
  - Orders, Tickets, Finance, etc.
  - CRUD operations

Action (15)
  - Reassign, Reply, Approve, etc.
  - Business logic
```

---

## 📝 Summary

**Total APIs:** 52
**Modules:** 11
**HTTP Methods:** 4 (GET, POST, PUT, DELETE)
**Authentication:** Bearer token required
**Response Format:** JSON

**All APIs are:**
- ✅ Documented
- ✅ Organized by module
- ✅ Categorized by role
- ✅ Production-ready
