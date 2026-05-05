# Data Flow Diagrams

## 1. Order Queue Page Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpsOrderQueuePage                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ useEffect(() => {                                        │   │
│  │   fetchOrders()                                          │   │
│  │   fetchVendors()                                         │   │
│  │ }, [])                                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                        │
│         ┌────────────────┴────────────────┐                      │
│         ▼                                  ▼                      │
│  ┌─────────────────┐            ┌──────────────────┐             │
│  │ fetchOrders()   │            │ fetchVendors()   │             │
│  └────────┬────────┘            └────────┬─────────┘             │
│           │                              │                       │
│           ▼                              ▼                       │
│  ┌─────────────────────────┐   ┌──────────────────────┐          │
│  │ staffService.           │   │ staffService.        │          │
│  │ getOrderQueue()         │   │ getAssignableVendors │          │
│  └────────┬────────────────┘   └────────┬─────────────┘          │
│           │                              │                       │
│           ▼                              ▼                       │
│  ┌─────────────────────────┐   ┌──────────────────────┐          │
│  │ GET /api/staff/orders   │   │ GET /api/staff/      │          │
│  │                         │   │ vendors              │          │
│  └────────┬────────────────┘   └────────┬─────────────┘          │
│           │                              │                       │
│           ▼                              ▼                       │
│  ┌─────────────────────────┐   ┌──────────────────────┐          │
│  │ Response:               │   │ Response:            │          │
│  │ {                       │   │ {                    │          │
│  │   success: true,        │   │   success: true,     │          │
│  │   data: Order[]         │   │   data: {            │          │
│  │ }                       │   │     vendors: Vendor[]│          │
│  │                         │   │   }                  │          │
│  │ OR                      │   │ }                    │          │
│  │ {                       │   │                      │          │
│  │   success: true,        │   │ OR                   │          │
│  │   data: {               │   │ {                    │          │
│  │     orders: Order[]     │   │   success: true,     │          │
│  │   }                     │   │   data: Vendor[]     │          │
│  │ }                       │   │ }                    │          │
│  └────────┬────────────────┘   └────────┬─────────────┘          │
│           │                              │                       │
│           ▼                              ▼                       │
│  ┌─────────────────────────┐   ┌──────────────────────┐          │
│  │ Parse Response:         │   │ Parse Response:      │          │
│  │ • Check data.orders     │   │ • Check data.vendors │          │
│  │ • Check data (array)    │   │ • Check data (array) │          │
│  │ • Check data (object)   │   │ • Check data (object)│          │
│  └────────┬────────────────┘   └────────┬─────────────┘          │
│           │                              │                       │
│           ▼                              ▼                       │
│  ┌─────────────────────────┐   ┌──────────────────────┐          │
│  │ setOrders(orders)       │   │ setVendors(vendors)  │          │
│  └────────┬────────────────┘   └────────┬─────────────┘          │
│           │                              │                       │
│           └────────────────┬─────────────┘                       │
│                            ▼                                     │
│                   ┌──────────────────┐                           │
│                   │ Render UI:       │                           │
│                   │ • Stats row      │                           │
│                   │ • Order table    │                           │
│                   │ • Vendor dropdown│                           │
│                   └──────────────────┘                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Support Tickets Page Data Flow

```
┌──────────────────────────────────────────────────────────┐
│              TicketQueuePage                              │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ useEffect(() => {                                 │  │
│  │   fetchTickets()                                  │  │
│  │ }, [])                                            │  │
│  └────────────────────────────────────────────────────┘  │
│                      │                                    │
│                      ▼                                    │
│           ┌──────────────────────┐                       │
│           │ fetchTickets()       │                       │
│           └──────────┬───────────┘                       │
│                      │                                    │
│                      ▼                                    │
│           ┌──────────────────────┐                       │
│           │ staffService.        │                       │
│           │ getTickets()         │                       │
│           └──────────┬───────────┘                       │
│                      │                                    │
│                      ▼                                    │
│           ┌──────────────────────┐                       │
│           │ GET /api/staff/      │                       │
│           │ tickets              │                       │
│           └──────────┬───────────┘                       │
│                      │                                    │
│                      ▼                                    │
│           ┌──────────────────────┐                       │
│           │ Response:            │                       │
│           │ {                    │                       │
│           │   success: true,     │                       │
│           │   data: Ticket[]     │                       │
│           │ }                    │                       │
│           │                      │                       │
│           │ OR                   │                       │
│           │ {                    │                       │
│           │   success: true,     │                       │
│           │   data: {            │                       │
│           │     tickets: Ticket[]│                       │
│           │   }                  │                       │
│           │ }                    │                       │
│           └──────────┬───────────┘                       │
│                      │                                    │
│                      ▼                                    │
│           ┌──────────────────────┐                       │
│           │ Parse Response:      │                       │
│           │ • Check data.tickets │                       │
│           │ • Check data (array) │                       │
│           │ • Check data (object)│                       │
│           └──────────┬───────────┘                       │
│                      │                                    │
│                      ▼                                    │
│           ┌──────────────────────┐                       │
│           │ setItems(tickets)    │                       │
│           └──────────┬───────────┘                       │
│                      │                                    │
│                      ▼                                    │
│           ┌──────────────────────┐                       │
│           │ Render UI:           │                       │
│           │ • Ticket list        │                       │
│           │ • Status filters     │                       │
│           │ • Detail modal       │                       │
│           └──────────────────────┘                       │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Vendor Tickets Page Data Flow

```
┌──────────────────────────────────────────────────────┐
│           VendorTicketsPage                           │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ useEffect(() => {                             │  │
│  │   fetchTickets()                              │  │
│  │ }, [])                                        │  │
│  └────────────────────────────────────────────────┘  │
│                    │                                  │
│                    ▼                                  │
│         ┌──────────────────────┐                     │
│         │ fetchTickets()       │                     │
│         └──────────┬───────────┘                     │
│                    │                                  │
│                    ▼                                  │
│         ┌──────────────────────┐                     │
│         │ staffService.        │                     │
│         │ getVendorTickets()   │                     │
│         └──────────┬───────────┘                     │
│                    │                                  │
│                    ▼                                  │
│         ┌──────────────────────┐                     │
│         │ GET /api/staff/      │                     │
│         │ vendor-tickets       │                     │
│         └──────────┬───────────┘                     │
│                    │                                  │
│                    ▼                                  │
│         ┌──────────────────────┐                     │
│         │ Response:            │                     │
│         │ {                    │                     │
│         │   success: true,     │                     │
│         │   data: Ticket[]     │                     │
│         │ }                    │                     │
│         │                      │                     │
│         │ OR                   │                     │
│         │ {                    │                     │
│         │   success: true,     │                     │
│         │   data: {            │                     │
│         │     tickets: Ticket[]│                     │
│         │   }                  │                     │
│         │ }                    │                     │
│         └──────────┬───────────┘                     │
│                    │                                  │
│                    ▼                                  │
│         ┌──────────────────────┐                     │
│         │ Parse Response:      │                     │
│         │ • Check data.tickets │                     │
│         │ • Check data (array) │                     │
│         │ • Check data (object)│                     │
│         └──────────┬───────────┘                     │
│                    │                                  │
│                    ▼                                  │
│         ┌──────────────────────┐                     │
│         │ setItems(tickets)    │                     │
│         └──────────┬───────────┘                     │
│                    │                                  │
│                    ▼                                  │
│         ┌──────────────────────┐                     │
│         │ Render UI:           │                     │
│         │ • Vendor tickets     │                     │
│         │ • Detail modal       │                     │
│         │ • Reply form         │                     │
│         └──────────────────────┘                     │
│                                                        │
└──────────────────────────────────────────────────────┘
```

---

## 4. Response Format Handling Logic

```
┌─────────────────────────────────────────────────────────────┐
│                  API Response Received                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ if (r.success) {                                     │   │
│  │   let data = []                                      │   │
│  │                                                      │   │
│  │   // Try Format 1: Nested array                      │   │
│  │   if (r.data?.orders && Array.isArray(...)) {       │   │
│  │     data = r.data.orders                            │   │
│  │   }                                                  │   │
│  │   // Try Format 2: Direct array                     │   │
│  │   else if (Array.isArray(r.data)) {                 │   │
│  │     data = r.data                                   │   │
│  │   }                                                  │   │
│  │   // Try Format 3: Single object                    │   │
│  │   else if (r.data && typeof r.data === 'object') {  │   │
│  │     data = [r.data]                                 │   │
│  │   }                                                  │   │
│  │                                                      │   │
│  │   setState(data)                                    │   │
│  │ }                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Supported Response Formats:                          │   │
│  │                                                      │   │
│  │ Format 1: Nested Array                              │   │
│  │ {                                                    │   │
│  │   success: true,                                    │   │
│  │   data: {                                           │   │
│  │     orders: [...],                                  │   │
│  │     tickets: [...],                                 │   │
│  │     vendors: [...]                                  │   │
│  │   }                                                 │   │
│  │ }                                                    │   │
│  │                                                      │   │
│  │ Format 2: Direct Array                              │   │
│  │ {                                                    │   │
│  │   success: true,                                    │   │
│  │   data: [...]                                       │   │
│  │ }                                                    │   │
│  │                                                      │   │
│  │ Format 3: Single Object                             │   │
│  │ {                                                    │   │
│  │   success: true,                                    │   │
│  │   data: {...}                                       │   │
│  │ }                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Console Logging Flow

```
┌──────────────────────────────────────────────────────────┐
│              Console Logging Sequence                     │
│                                                            │
│  1. API Call Initiated                                   │
│     📦 Order queue API response: {...}                   │
│     📋 Tickets API response: {...}                       │
│     🏢 Vendors API response: {...}                       │
│                                                            │
│  2. Response Received                                    │
│     Check: success: true?                                │
│     Check: data exists?                                  │
│                                                            │
│  3. Data Parsing                                         │
│     Try: data.orders / data.tickets / data.vendors       │
│     Try: data (direct array)                             │
│     Try: data (single object)                            │
│                                                            │
│  4. Success                                              │
│     ✅ Total orders received: 5                          │
│     ✅ Parsed tickets: 8                                 │
│     ✅ Vendors loaded: 3                                 │
│                                                            │
│  5. Data Inspection (if needed)                          │
│     🔍 First order structure: {...}                      │
│     🔍 Order keys: [id, type, vendor, ...]              │
│                                                            │
│  6. Error (if any)                                       │
│     ❌ Order queue fetch failed: Network error           │
│     ❌ Fetch tickets error: 404 Not Found                │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Error Handling Flow

```
┌──────────────────────────────────────────────────────────┐
│                 Error Handling Flow                       │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ try {                                              │  │
│  │   const r = await staffService.getOrderQueue()    │  │
│  │   // Process response                             │  │
│  │ } catch (e: any) {                                │  │
│  │   console.error('❌ Error:', e?.message)          │  │
│  │   setState([])  // Set empty state                │  │
│  │ } finally {                                        │  │
│  │   setLoading(false)  // Stop loading              │  │
│  │ }                                                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  Error Scenarios:                                        │
│  ├─ Network Error                                       │
│  │  └─ ❌ Order queue fetch failed: Network error      │
│  │                                                      │
│  ├─ 404 Not Found                                      │
│  │  └─ ❌ Fetch tickets error: 404 Not Found           │
│  │                                                      │
│  ├─ 401 Unauthorized                                  │
│  │  └─ ❌ Fetch vendor tickets error: Unauthorized     │
│  │                                                      │
│  ├─ 500 Server Error                                  │
│  │  └─ ❌ Fetch error: Internal server error           │
│  │                                                      │
│  └─ Timeout                                            │
│     └─ ❌ Fetch error: Request timeout                 │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 7. State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│              State Management Flow                        │
│                                                            │
│  Initial State:                                          │
│  ├─ items: []                                            │
│  ├─ loading: true                                        │
│  ├─ search: ""                                           │
│  ├─ filter: "all"                                        │
│  └─ detail: null                                         │
│                                                            │
│  On Component Mount:                                     │
│  ├─ setLoading(true)                                     │
│  ├─ Call fetchTickets()                                  │
│  └─ Call fetchVendors()                                  │
│                                                            │
│  On API Response:                                        │
│  ├─ Parse response                                       │
│  ├─ setItems(parsedData)                                 │
│  └─ setLoading(false)                                    │
│                                                            │
│  On User Interaction:                                    │
│  ├─ Search: setSearch(value)                             │
│  ├─ Filter: setFilter(value)                             │
│  ├─ Detail: setDetail(item)                              │
│  └─ Modal: setModal(type, order)                         │
│                                                            │
│  On Action (Reply/Reassign):                             │
│  ├─ setModalLoading(true)                                │
│  ├─ Call API                                             │
│  ├─ On Success: setDetail(null), fetchItems()            │
│  ├─ On Error: setModalErr(message)                       │
│  └─ setModalLoading(false)                               │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Component Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│            Component Lifecycle                            │
│                                                            │
│  Mount                                                   │
│    ↓                                                      │
│  useEffect(() => {                                       │
│    fetchOrders()                                         │
│    fetchVendors()                                        │
│  }, [])                                                  │
│    ↓                                                      │
│  Loading State                                           │
│    ↓                                                      │
│  API Calls Complete                                      │
│    ↓                                                      │
│  Render Data                                             │
│    ↓                                                      │
│  User Interaction                                        │
│    ├─ Search/Filter → Re-render                          │
│    ├─ Click Item → Show Detail                           │
│    ├─ Submit Action → Call API                           │
│    └─ Refresh → Call fetchItems()                        │
│    ↓                                                      │
│  Unmount                                                 │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 9. API Request/Response Cycle

```
┌──────────────────────────────────────────────────────────┐
│           API Request/Response Cycle                      │
│                                                            │
│  Frontend                          Backend                │
│  ─────────────────────────────────────────────────────   │
│                                                            │
│  1. User Action                                          │
│     (Click Refresh)                                      │
│         │                                                 │
│         ▼                                                 │
│  2. Call fetchOrders()                                   │
│         │                                                 │
│         ▼                                                 │
│  3. staffService.getOrderQueue()                         │
│         │                                                 │
│         ▼                                                 │
│  4. fetch(GET /api/staff/orders)                         │
│         │                                                 │
│         ├─────────────────────────────────────────────→  │
│         │                                                 │
│         │                                    5. Receive   │
│         │                                       Request   │
│         │                                          │      │
│         │                                          ▼      │
│         │                                    6. Query DB  │
│         │                                          │      │
│         │                                          ▼      │
│         │                                    7. Format    │
│         │                                       Response  │
│         │                                          │      │
│         │                                          ▼      │
│         │                                    8. Send      │
│         │                                       Response  │
│         │                                          │      │
│         ←─────────────────────────────────────────┤      │
│         │                                                 │
│         ▼                                                 │
│  9. Receive Response                                     │
│         │                                                 │
│         ▼                                                 │
│  10. Parse Response                                      │
│         │                                                 │
│         ▼                                                 │
│  11. setItems(data)                                      │
│         │                                                 │
│         ▼                                                 │
│  12. Re-render UI                                        │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 10. Data Type Relationships

```
┌──────────────────────────────────────────────────────────┐
│            Data Type Relationships                        │
│                                                            │
│  Order                                                   │
│  ├─ id: string (primary key)                             │
│  ├─ type: string                                         │
│  ├─ vendor: string (FK to Vendor)                        │
│  ├─ status: string                                       │
│  ├─ sla: string                                          │
│  ├─ risk: string (critical|warning|normal)              │
│  ├─ customer: string                                     │
│  ├─ customerId: string (FK to Customer)                  │
│  └─ amount: number                                       │
│                                                            │
│  Ticket                                                  │
│  ├─ _id: string (primary key)                            │
│  ├─ subject: string                                      │
│  ├─ status: string (open|in_progress|resolved|closed)   │
│  ├─ priority: string (urgent|high|medium|low)           │
│  ├─ category: string                                     │
│  ├─ orderId?: string (FK to Order)                       │
│  ├─ replies?: Reply[]                                    │
│  └─ createdAt: string                                    │
│                                                            │
│  Vendor                                                  │
│  ├─ id: string (primary key)                             │
│  ├─ name: string                                         │
│  ├─ location: string                                     │
│  ├─ score: number                                        │
│  ├─ priority: number                                     │
│  └─ isApproved?: boolean                                 │
│                                                            │
│  Reply                                                   │
│  ├─ authorRole: string                                   │
│  ├─ message: string                                      │
│  └─ createdAt: string                                    │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

**These diagrams help visualize the data flow and architecture of the staff portal.**
