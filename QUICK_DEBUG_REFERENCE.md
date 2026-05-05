# Quick Debug Reference Card

## 🚀 Quick Start

### Data Not Showing?
1. Open DevTools: `F12`
2. Go to **Console** tab
3. Look for logs starting with `📦`, `📋`, or `🏢`
4. Check if data count is > 0

### Example Good Output
```
📦 Order queue API response: {success: true, data: Array(5)}
✅ Total orders received: 5
```

### Example Bad Output
```
📦 Order queue API response: {success: false, error: "Unauthorized"}
✅ Total orders received: 0
```

---

## 🔍 Console Log Meanings

| Log | Meaning | Action |
|-----|---------|--------|
| `📦 Order queue API response:` | API call completed | Check if `success: true` |
| `✅ Total orders received: 5` | Data parsed successfully | Data should display |
| `❌ Order queue fetch failed:` | API call failed | Check network tab |
| `🏢 Vendors API response:` | Vendors loaded | Check vendor count |
| `📋 Tickets API response:` | Tickets loaded | Check ticket count |

---

## 🛠️ Common Issues & Quick Fixes

### Issue: "No active orders in queue"
**Check:**
1. Console shows `Total orders received: 0`?
2. Network tab shows 200 response?
3. Backend service running on port 4000?

**Fix:**
```bash
# Check if backend is running
curl http://localhost:4000/api/staff/orders

# If 502 error, start backend
npm run dev:backend
```

---

### Issue: "No tickets in queue"
**Check:**
1. Console shows `Parsed tickets: 0`?
2. API endpoint correct?
3. Authentication token valid?

**Fix:**
```bash
# Check localStorage for token
localStorage.getItem('staffToken')

# If empty, login again
```

---

### Issue: "Vendor dropdown empty"
**Check:**
1. Console shows `Vendors loaded: 0`?
2. `/api/staff/vendors` returning data?

**Fix:**
```bash
# Test endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/staff/vendors
```

---

## 📊 Expected Data Structures

### Orders
```javascript
{
  id: "ORD-123",
  type: "standard",
  vendor: "Vendor A",
  status: "pending",
  sla: "2h",
  risk: "warning",
  customer: "John",
  amount: 5000
}
```

### Tickets
```javascript
{
  _id: "507f...",
  subject: "Order issue",
  status: "open",
  priority: "high",
  category: "delivery",
  createdAt: "2024-01-15T10:30:00Z"
}
```

### Vendors
```javascript
{
  id: "V-123",
  name: "Vendor A",
  location: "Mumbai",
  score: 4.5,
  priority: 1
}
```

---

## 🔗 API Endpoints

```
GET  /api/staff/orders              → Order queue
GET  /api/staff/vendors             → Vendors list
GET  /api/staff/tickets             → Support tickets
GET  /api/staff/vendor-tickets      → Vendor tickets
POST /api/staff/orders/:id/reassign-vendor
POST /api/staff/tickets/:id/reply
```

---

## 🧪 Quick Test Commands

### Test Order Queue
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/staff/orders | jq
```

### Test Tickets
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/staff/tickets | jq
```

### Test Vendor Tickets
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/staff/vendor-tickets | jq
```

---

## 📱 Browser DevTools Tips

### Check Network Requests
1. Open DevTools: `F12`
2. Go to **Network** tab
3. Refresh page
4. Look for `/api/staff/` requests
5. Click each request to see:
   - Status code (should be 200)
   - Response body (should have data)
   - Headers (should have Authorization)

### Check Console Errors
1. Open DevTools: `F12`
2. Go to **Console** tab
3. Look for red error messages
4. Click to expand and see full error

### Check Local Storage
1. Open DevTools: `F12`
2. Go to **Application** tab
3. Click **Local Storage**
4. Look for `staffToken` key
5. If empty, user not logged in

---

## ✅ Verification Checklist

### Before Reporting Issue
- [ ] Refreshed page (Ctrl+R or Cmd+R)
- [ ] Checked console for errors
- [ ] Checked Network tab for 200 responses
- [ ] Verified backend is running
- [ ] Verified authentication token exists
- [ ] Checked if data exists in backend

### When Reporting Issue
Include:
- [ ] Screenshot of console logs
- [ ] Screenshot of Network tab
- [ ] API response body
- [ ] Error message (if any)
- [ ] Steps to reproduce

---

## 🎯 Page-Specific Checks

### Order Queue Page (`/ops/orders`)
```javascript
// In console, check:
console.log(localStorage.getItem('staffToken')) // Should exist
// Look for: 📦 Order queue API response
// Look for: ✅ Total orders received: X
```

### Support Tickets Page (`/support/tickets`)
```javascript
// In console, check:
// Look for: 📋 Tickets API response
// Look for: ✅ Parsed tickets: X
```

### Vendor Tickets Page (`/support/vendor-tickets`)
```javascript
// In console, check:
// Look for: 📋 Vendor Tickets API response
// Look for: ✅ Parsed vendor tickets: X
```

---

## 🚨 Emergency Troubleshooting

### Nothing Works
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Logout and login again
3. Check if backend is running
4. Restart frontend: `npm run dev`
5. Check `.env` file for correct API URL

### Still Broken?
1. Check backend logs
2. Verify database connection
3. Check authentication service
4. Review recent code changes
5. Check git diff for issues

---

## 📞 Getting Help

1. **Check Logs First**: Look at console output
2. **Read Guide**: See `DATA_WIRING_GUIDE.md`
3. **Check Network**: Verify API responses
4. **Test Endpoint**: Use curl to test API
5. **Review Changes**: Check `FIXES_APPLIED.md`

---

## 🎓 Learning Resources

- `DATA_WIRING_GUIDE.md` - Complete data flow documentation
- `FIXES_APPLIED.md` - What was changed and why
- Browser DevTools - Built-in debugging tools
- Network tab - See actual API requests/responses
- Console tab - See application logs and errors

---

**Last Updated:** 2024
**Version:** 1.0
