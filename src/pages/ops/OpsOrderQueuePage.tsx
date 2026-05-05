import { useState, useEffect } from "react";
import {
  AlertTriangle, RefreshCw, MessageSquare, X, CheckCircle,
  Search, Package, Clock, ShoppingCart, Circle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import staffService from "../../services/staff.service";

const RISK_COLOR: Record<string, string> = { critical: "#ef4444", warning: "#f59e0b", normal: "#16a34a" };
const RISK_BG:    Record<string, string> = { critical: "#fef2f2", warning: "#fffbeb", normal: "#f0fdf4" };

const getOrderMongoId = (order: any): string => {
  const fields = [order._id, order.orderId, order.id];
  for (const f of fields) {
    if (typeof f === "string" && /^[0-9a-fA-F]{24}$/.test(f)) return f;
    if (f && typeof f === "object" && f.$oid) return f.$oid;
  }
  return order._id || order.orderId || order.id || "";
};

type Order = {
  id: string; _id?: string; orderId?: string; orderNumber?: string;
  type: string; vendor: string; status: string;
  sla: string; risk: string; customer: string;
  rawStatus: string; customerId: string; amount: number;
};
type Vendor = { id: string; orgId: string; name: string; location: string; score: number; priority: number; isApproved?: boolean };
type Modal  = { type: "reassign" | "clarify"; order: Order } | null;

const REASONS = ["Vendor SLA breach", "Vendor capacity full", "Vendor suspended", "Quality concern"];

export default function OpsOrderQueuePage() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<Modal>(null);
  const [reason,  setReason]  = useState("");
  const [vendor,  setVendor]  = useState("");
  const [msg,     setMsg]     = useState("");
  const [done,    setDone]    = useState<string[]>([]);
  const [modalErr,     setModalErr]     = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => { fetchOrders(); fetchVendors(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const r = await staffService.getOrderQueue();
      let rawOrders: any[] = [];
      if (r.success) {
        if (r.data?.orders && Array.isArray(r.data.orders)) rawOrders = r.data.orders;
        else if (Array.isArray(r.data)) rawOrders = r.data;
        else if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) rawOrders = [r.data];
      }
      const orders: Order[] = rawOrders.map((o: any) => {
        const mongoId = getOrderMongoId(o);
        return { ...o, _id: mongoId, id: o.id || mongoId };
      });
      setOrders(orders);
    } catch { setOrders([]); } finally { setLoading(false); }
  };

  const fetchVendors = async () => {
    try {
      const r = await staffService.getAssignableVendors();
      let vendors: Vendor[] = [];
      if (r.success) {
        if (r.data?.vendors && Array.isArray(r.data.vendors)) vendors = r.data.vendors;
        else if (Array.isArray(r.data)) vendors = r.data;
      }
      setVendors(vendors);
    } catch { setVendors([]); }
  };

  const submitReassign = async () => {
    if (!reason || !vendor || !modal) return;
    try {
      setModalLoading(true); setModalErr("");
      const orderId = getOrderMongoId(modal.order);
      if (!orderId) { setModalErr("Order ID is missing. Please refresh and try again."); return; }
      try {
        const detail = await staffService.getOrderDetail(orderId);
        if (!detail.success) {
          const r2 = await staffService.reassignVendor(modal.order.id, vendor, reason);
          if (r2.success) { setDone(p => [...p, modal.order.id]); setModal(null); setReason(""); setVendor(""); fetchOrders(); return; }
          setModalErr("Order not found. Please refresh the page and try again."); return;
        }
      } catch { /* proceed */ }
      const r = await staffService.reassignVendor(orderId, vendor, reason);
      if (r.success) { setDone(p => [...p, modal.order.id]); setModal(null); setReason(""); setVendor(""); fetchOrders(); }
      else setModalErr(r.message || r.error || "Reassignment failed.");
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404) setModalErr("Order not found on server. Please refresh the page and try again.");
      else if (status === 403) setModalErr("You don't have permission to reassign this order.");
      else setModalErr(e?.response?.data?.message || e?.message || "Reassignment failed.");
    } finally { setModalLoading(false); }
  };

  const submitClarify = async () => {
    if (!msg || !modal) return;
    try {
      setModalLoading(true); setModalErr("");
      const orderId = getOrderMongoId(modal.order);
      const r = await staffService.raiseClarification(orderId, msg);
      if (r.success) { setDone(p => [...p, modal.order.id]); setModal(null); setMsg(""); fetchOrders(); }
      else setModalErr(r.message || "Failed to raise clarification.");
    } catch (e: any) { setModalErr(e?.message || "Failed to raise clarification."); }
    finally { setModalLoading(false); }
  };

  const filtered = orders.filter(o =>
    !search ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.toLowerCase().includes(search.toLowerCase()) ||
    o.type?.toLowerCase().includes(search.toLowerCase()) ||
    o.status?.toLowerCase().includes(search.toLowerCase())
  );

  const critical = orders.filter(o => o.risk === "critical").length;
  const warning  = orders.filter(o => o.risk === "warning").length;

  return (
    <div className="space-y-5">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <ShoppingCart size={17} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Order Queue</p>
            <p className="text-xs text-gray-400">{orders.length} active orders</p>
          </div>
        </div>
        <button onClick={fetchOrders} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ══ KPI CARDS ══ */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Package,       color: "#3b82f6", bg: "#eff6ff", value: orders.length, label: "Active Orders",    sub: "In queue" },
            { icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2", value: critical,       label: "Critical SLA",    sub: "Need action" },
            { icon: Clock,         color: "#f59e0b", bg: "#fffbeb", value: warning,        label: "SLA Warning",     sub: "Monitor closely" },
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

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search orders, customers, status…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition bg-white" />
        </div>
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{filtered.length} orders</span>
      </div>

      {/* ══ LOADING ══ */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-blue-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading orders…</p>
        </div>
      )}

      {/* ══ EMPTY ══ */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Package size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">{search ? "No orders match your search" : "No active orders in queue"}</p>
          {!search && <p className="text-xs text-gray-300 mt-1">Orders with active statuses will appear here</p>}
        </div>
      )}

      {/* ══ DESKTOP TABLE ══ */}
      {!loading && filtered.length > 0 && (
        <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingCart size={14} className="text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">All Orders</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{filtered.length}</span>
          </div>
          <div className="grid items-center px-6 py-3 border-b border-gray-100 bg-gray-50/60"
            style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {["Order ID", "Details", "Vendor", "SLA", "Risk", "Amount", "Actions"].map((h, i) => (
              <span key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${i === 6 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: "480px" }}>
            {filtered.map(o => (
              <div key={o.id}
                className={`grid items-center px-6 py-3.5 hover:bg-gray-50/50 transition ${done.includes(o.id) ? "opacity-40" : ""}`}
                style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                <button onClick={() => navigate(`/ops/orders/${o._id || o.id}`)}
                  className="text-xs font-mono font-bold text-blue-600 hover:underline truncate pr-3 text-left" title={o.id}>{o.id.slice(-10)}</button>
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-semibold text-gray-900 truncate">{o.type}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{o.customer}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block"
                    style={{ backgroundColor: RISK_BG[o.risk] || "#f3f4f6", color: RISK_COLOR[o.risk] || "#6b7280" }}>{o.status}</span>
                </div>
                <span className="text-sm text-gray-600 truncate pr-3">{o.vendor}</span>
                <span className="text-sm font-bold pr-3 whitespace-nowrap" style={{ color: RISK_COLOR[o.risk] || "#6b7280" }}>{o.sla}</span>
                <div className="pr-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold capitalize"
                    style={{ backgroundColor: RISK_BG[o.risk] || "#f3f4f6", color: RISK_COLOR[o.risk] || "#6b7280" }}>
                    {o.risk === "critical" && <AlertTriangle size={9} />}{o.risk}
                  </span>
                </div>
                <span className="text-sm font-black text-gray-900 pr-3 whitespace-nowrap">₹{o.amount}</span>
                <div className="flex items-center justify-end gap-1.5">
                  {done.includes(o.id) ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={12} /> Done</span>
                  ) : (
                    <>
                      <button onClick={() => { setModal({ type: "reassign", order: o }); setReason(""); setVendor(""); setModalErr(""); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition whitespace-nowrap">
                        <RefreshCw size={10} /> Reassign
                      </button>
                      <button onClick={() => { setModal({ type: "clarify", order: o }); setMsg(""); setModalErr(""); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition whitespace-nowrap">
                        <MessageSquare size={10} /> Clarify
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ MOBILE CARDS ══ */}
      {!loading && filtered.length > 0 && (
        <div className="lg:hidden space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map(o => (
            <div key={o.id} className={`bg-white rounded-2xl border border-gray-100 p-4 shadow-sm ${done.includes(o.id) ? "opacity-40" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <button onClick={() => navigate(`/ops/orders/${o._id || o.id}`)}
                    className="text-xs font-mono font-bold text-blue-600 hover:underline">{o.id.slice(-10)}</button>
                  <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{o.type}</p>
                  <p className="text-xs text-gray-400 truncate">{o.customer}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                    style={{ backgroundColor: RISK_BG[o.risk] || "#f3f4f6", color: RISK_COLOR[o.risk] || "#6b7280" }}>
                    {o.risk === "critical" && <AlertTriangle size={10} />}{o.risk}
                  </span>
                  <p className="text-sm font-black text-gray-900 mt-1">₹{o.amount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 py-3 border-t border-gray-50 text-xs mb-3">
                <div><p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Vendor</p><p className="text-gray-700 font-medium truncate">{o.vendor}</p></div>
                <div><p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">SLA</p><p className="font-bold" style={{ color: RISK_COLOR[o.risk] }}>{o.sla}</p></div>
              </div>
              <div className="flex gap-2">
                {done.includes(o.id) ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={12} /> Done</span>
                ) : (
                  <>
                    <button onClick={() => { setModal({ type: "reassign", order: o }); setReason(""); setVendor(""); setModalErr(""); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition">
                      <RefreshCw size={11} /> Reassign
                    </button>
                    <button onClick={() => { setModal({ type: "clarify", order: o }); setMsg(""); setModalErr(""); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition">
                      <MessageSquare size={11} /> Clarify
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ NOTICE ══ */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <Circle size={8} className="mt-1 flex-shrink-0 fill-blue-400 text-blue-400" />
        <p className="text-xs font-semibold text-blue-700">
          Operations staff can reassign vendors or request clarifications, but cannot cancel orders.
          Order cancellations require admin approval for security and audit purposes.
        </p>
      </div>

      {/* ══ REASSIGN MODAL ══ */}
      {modal?.type === "reassign" && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto pt-8 pb-8"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Vendor Reassignment</h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-mono text-gray-500">{modal.order.id.slice(-10)}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{modal.order.type} · {modal.order.customer}</p>
              <p className="text-xs text-gray-400 mt-0.5">Current vendor: {modal.order.vendor}</p>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Select Reason *</label>
                <div className="space-y-2">
                  {REASONS.map(r => (
                    <button key={r} onClick={() => setReason(r)} type="button"
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${reason === r ? "bg-gray-900 text-white font-bold" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  Select New Vendor * {vendors.length > 0 ? `(${vendors.length} available)` : ""}
                </label>
                {vendors.length > 0 ? (
                  <select value={vendor} onChange={e => setVendor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 bg-white">
                    <option value="">Choose vendor…</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.isApproved ? "✓" : "⚠"} {v.name}{v.location && v.location !== "Unknown" ? ` — ${v.location}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <div className="px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-100">
                      <p className="text-xs font-semibold text-yellow-700">No approved vendors found. Enter vendor ID manually.</p>
                    </div>
                    <input value={vendor} onChange={e => setVendor(e.target.value)}
                      placeholder="Enter vendor user ID manually…"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 bg-white" />
                  </div>
                )}
              </div>
            </div>
            {modalErr && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100"><p className="text-xs font-semibold text-red-600">⚠ {modalErr}</p></div>}
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={submitReassign} disabled={!reason || !vendor || modalLoading}
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                {modalLoading ? "Processing…" : "Reassign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CLARIFY MODAL ══ */}
      {modal?.type === "clarify" && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto pt-8 pb-8"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Trigger Clarification</h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-mono text-gray-500">{modal.order.id.slice(-10)}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{modal.order.type} · {modal.order.customer}</p>
              <p className="text-xs text-orange-600 font-semibold mt-1">⚠ SLA timer remains active during clarification</p>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Message to Customer *</label>
              <textarea value={msg} onChange={e => setMsg(e.target.value)}
                placeholder="Describe what clarification is needed from the customer…"
                rows={4} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition resize-none" />
            </div>
            {modalErr && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100"><p className="text-xs font-semibold text-red-600">⚠ {modalErr}</p></div>}
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={submitClarify} disabled={!msg || modalLoading}
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                {modalLoading ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}