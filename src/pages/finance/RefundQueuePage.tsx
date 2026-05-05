import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, X, RefreshCw, Clock, TrendingUp, RotateCcw, Circle, Search } from "lucide-react";
import staffService from "../../services/staff.service";

const STAFF_LIMIT = 500;

// Backend mapRefund() returns: { id, order, customer, amount, reason, status }
// status: "pending" | "approved" | "escalated" | "completed"
type Refund = {
  id: string;
  order: string;       // orderNumber ?? orderId
  customer: string;    // customerName ?? customerId
  amount: number;
  reason: string;
  status: "pending" | "approved" | "escalated" | "completed" | string;
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  approved:  { bg: "#f0fdf4", color: "#16a34a" },
  completed: { bg: "#f0fdf4", color: "#16a34a" },
  escalated: { bg: "#fff7ed", color: "#ea580c" },
  pending:   { bg: "#fffbeb", color: "#d97706" },
};

const STATUS_FILTER = ["all", "pending", "approved", "escalated", "completed"] as const;

export default function RefundQueuePage() {
  const [items,      setItems]      = useState<Refund[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<string>("all");
  const [search,     setSearch]     = useState("");
  const [escalateId, setEscalateId] = useState<string | null>(null);
  const [err,        setErr]        = useState("");
  const [busy,       setBusy]       = useState<string | null>(null);

  useEffect(() => { fetchRefunds(); }, [filter]);

  const fetchRefunds = async () => {
    try {
      setLoading(true); setErr("");
      // Pass status filter to backend: GET /api/staff/refunds?status=pending
      const r = await staffService.getRefunds(filter !== "all" ? filter : undefined);
      
      // Handle both response structures:
      // 1. { success: true, data: [...] }
      // 2. { data: [...] }
      // 3. Direct array [...]
      let refunds: Refund[] = [];
      
      if (r.success && Array.isArray(r.data)) {
        refunds = r.data;
      } else if (Array.isArray(r.data)) {
        refunds = r.data;
      } else if (Array.isArray(r)) {
        refunds = r;
      }
      
      setItems(refunds);
    } catch (e: any) {
      setErr(e?.message || "Failed to load refunds");
      setItems([]);
    } finally { setLoading(false); }
  };

  // POST /api/staff/refunds/:id/approve
  // Backend: credits wallet, updates order status → "refunded", notifies customer
  const approve = async (id: string) => {
    try {
      setBusy(id); setErr("");
      const r = await staffService.approveRefund(id);
      if (r.success) {
        // Update local state with response data
        setItems(p => p.map(x => x.id === id
          ? { ...x, status: r.data?.status || "approved" }
          : x
        ));
      } else {
        setErr(r.message || "Failed to approve refund");
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to approve refund");
    } finally { setBusy(null); }
  };

  // POST /api/staff/refunds/:id/escalate
  // Backend: updates status → "escalated", notifies OPS team
  const doEscalate = async (id: string) => {
    try {
      setBusy(id); setErr("");
      const r = await staffService.escalateRefund(id);
      if (r.success) {
        setItems(p => p.map(x => x.id === id
          ? { ...x, status: r.data?.status || "escalated" }
          : x
        ));
        setEscalateId(null);
      } else {
        setErr(r.message || "Failed to escalate refund");
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to escalate refund");
    } finally { setBusy(null); }
  };

  const filtered = items.filter(r =>
    !search ||
    r.order?.toLowerCase().includes(search.toLowerCase()) ||
    r.customer?.toLowerCase().includes(search.toLowerCase()) ||
    r.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const pending   = items.filter(r => r.status === "pending");
  const approved  = items.filter(r => r.status === "approved" || r.status === "completed");
  const escalated = items.filter(r => r.status === "escalated");

  const escalateTarget = items.find(r => r.id === escalateId);

  return (
    <div className="space-y-5">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <RotateCcw size={17} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Refund Queue</p>
            <p className="text-xs text-gray-400">{pending.length} pending · staff limit ₹{STAFF_LIMIT}</p>
          </div>
        </div>
        <button onClick={fetchRefunds} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ══ KPI CARDS ══ */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Clock,       color: "#d97706", bg: "#fffbeb", value: pending.length,   label: "Pending",   sub: "Awaiting review" },
            { icon: CheckCircle, color: "#16a34a", bg: "#f0fdf4", value: approved.length,  label: "Approved",  sub: "Wallet credited" },
            { icon: TrendingUp,  color: "#ea580c", bg: "#fff7ed", value: escalated.length, label: "Escalated", sub: "Sent to admin" },
          ].map(({ icon: Icon, color, bg, value, label, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ backgroundColor: bg, color }}>Live</span>
              </div>
              <p className="text-4xl font-black text-gray-900 leading-none tabular-nums">{value}</p>
              <p className="text-sm font-semibold text-gray-600 mt-2">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ══ ERROR ══ */}
      {err && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700">{err}</p>
        </div>
      )}

      {/* ══ FILTERS + SEARCH ══ */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search order, customer, reason…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 transition bg-white" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {STATUS_FILTER.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition"
              style={filter === s ? { backgroundColor: "#111827", color: "#fff" } : { color: "#6b7280" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ══ LOADING / EMPTY ══ */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-green-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading refunds…</p>
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <CheckCircle size={32} className="text-green-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">
            {search ? "No refunds match your search" : "No refunds in queue"}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Cancelled paid orders will appear here automatically
          </p>
        </div>
      )}

      {/* ══ TABLE ══ */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <RotateCcw size={14} className="text-green-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Refund Requests</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
              {pending.length} pending
            </span>
          </div>

          {/* Desktop header */}
          <div className="hidden md:grid px-6 py-3 border-b border-gray-100 bg-gray-50/60"
            style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {["Order", "Customer · Reason", "Amount", "Status", "Actions"].map((h, i) => (
              <span key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>

          <div className="divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: "480px" }}>
            {filtered.map(r => {
              const overLimit = r.amount > STAFF_LIMIT;
              const s = STATUS_STYLE[r.status] || { bg: "#f3f4f6", color: "#6b7280" };
              const isPending = r.status === "pending";

              return (
                <div key={r.id} className="hover:bg-gray-50/40 transition">
                  {/* Desktop row */}
                  <div className="hidden md:grid items-center px-6 py-3.5"
                    style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>

                    {/* Order */}
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-bold text-gray-900 truncate">{r.order || "—"}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5 truncate" title={r.id}>{r.id?.slice(-10)}</p>
                    </div>

                    {/* Customer + Reason */}
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-semibold text-gray-800 truncate">{r.customer || "—"}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{r.reason || "—"}</p>
                    </div>

                    {/* Amount */}
                    <div className="pr-4">
                      <p className="text-sm font-black text-gray-900 whitespace-nowrap">₹{r.amount}</p>
                      {overLimit && isPending && (
                        <span className="text-[10px] font-bold text-orange-500">Over ₹{STAFF_LIMIT} limit</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                        {r.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      {isPending ? (
                        <>
                          {!overLimit && (
                            <button onClick={() => approve(r.id)} disabled={busy === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-60 whitespace-nowrap">
                              <CheckCircle size={12} />
                              {busy === r.id ? "…" : "Approve"}
                            </button>
                          )}
                          <button onClick={() => setEscalateId(r.id)} disabled={busy === r.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-50 transition disabled:opacity-60 whitespace-nowrap">
                            <AlertTriangle size={12} />
                            {overLimit ? "Escalate" : "Escalate"}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium capitalize">{r.status}</span>
                      )}
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{r.order || "—"}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{r.customer} · {r.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-black text-gray-900">₹{r.amount}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-1 capitalize"
                          style={{ backgroundColor: s.bg, color: s.color }}>{r.status}</span>
                      </div>
                    </div>
                    {isPending && (
                      <div className="flex gap-2">
                        {!overLimit && (
                          <button onClick={() => approve(r.id)} disabled={busy === r.id}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-60">
                            <CheckCircle size={12} /> Approve
                          </button>
                        )}
                        <button onClick={() => setEscalateId(r.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-orange-200 text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-50 transition">
                          <AlertTriangle size={12} /> Escalate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ NOTICE ══ */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <Circle size={8} className="mt-1 flex-shrink-0 fill-blue-400 text-blue-400" />
        <p className="text-xs font-semibold text-blue-700">
          Approving a refund credits the customer's wallet and marks the order as refunded.
          Refunds above ₹{STAFF_LIMIT} must be escalated to admin. All actions are permanently logged.
        </p>
      </div>

      {/* ══ ESCALATE MODAL ══ */}
      {escalateId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Escalate Refund</h2>
              <button onClick={() => setEscalateId(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {escalateTarget && (
              <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-mono text-gray-500">{escalateTarget.order}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{escalateTarget.customer}</p>
                <p className="text-xs text-gray-400 mt-0.5">{escalateTarget.reason}</p>
                <p className="text-sm font-black text-gray-900 mt-1">₹{escalateTarget.amount}</p>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-5">
              {escalateTarget && escalateTarget.amount > STAFF_LIMIT
                ? `This refund exceeds the staff limit of ₹${STAFF_LIMIT}. It will be escalated to admin for approval.`
                : "This refund will be escalated to the admin/OPS team for review."}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setEscalateId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={() => doEscalate(escalateId)} disabled={busy === escalateId}
                className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition disabled:opacity-60">
                {busy === escalateId ? "Escalating…" : "Escalate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
