import { useState, useEffect } from "react";
import { AlertTriangle, X, CheckCircle, RefreshCw, DollarSign, TrendingUp, Circle, Clock } from "lucide-react";
import staffService from "../../services/staff.service";

// Backend mapPayout() returns:
// { id, vendor (vendorOrg.name??businessName), amount (netAmount??amount as string),
//   period (periodEnd??createdAt as "Apr 2026"), status (mapped), date (transferredAt??periodEnd??createdAt) }
// DB status → Response status:
//   "pending"    → "scheduled"
//   "processing" → "processing"
//   "paid"       → "paid"
//   "failed"     → "issue"
type Payout = {
  id: string;
  vendor: string;
  amount: string;
  period: string;
  status: "scheduled" | "processing" | "paid" | "issue" | string;
  date: string;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  scheduled:  { bg: "#eff6ff", color: "#3b82f6", label: "Scheduled" },
  processing: { bg: "#fffbeb", color: "#f59e0b", label: "Processing" },
  paid:       { bg: "#f0fdf4", color: "#16a34a", label: "Paid" },
  issue:      { bg: "#fef2f2", color: "#ef4444", label: "Issue" },
};

export default function PayoutAssistPage() {
  const [payouts,     setPayouts]     = useState<Payout[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [ticketModal, setTicketModal] = useState<{ id: string; vendor: string; period: string } | null>(null);
  const [ticketMsg,   setTicketMsg]   = useState("");
  const [raised,      setRaised]      = useState<string[]>([]);
  const [err,         setErr]         = useState("");
  const [busy,        setBusy]        = useState(false);

  useEffect(() => { fetchPayouts(); }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true); setErr("");
      const r = await staffService.getPayouts();
      if (r.success && Array.isArray(r.data)) {
        setPayouts(r.data);
      } else if (!r.success && r.message) {
        setErr(r.message);
        setPayouts([]);
      } else {
        setPayouts([]);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load payouts");
      setPayouts([]);
    } finally { setLoading(false); }
  };

  // POST /api/staff/payouts/issue-ticket
  // Backend creates a ticket in tickets collection with category: "payment_issue"
  const raiseTicket = async () => {
    if (!ticketMsg || !ticketModal) return;
    try {
      setBusy(true); setErr("");
      const r = await staffService.issuePayoutTicket(ticketModal.id, ticketMsg);
      if (r.success) {
        setRaised(p => [...p, ticketModal.id]);
        setTicketModal(null);
        setTicketMsg("");
      } else {
        setErr(r.message || "Failed to raise ticket");
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to raise ticket");
    } finally { setBusy(false); }
  };

  const issueCount      = payouts.filter(p => p.status === "issue").length;
  const paidCount       = payouts.filter(p => p.status === "paid").length;
  const scheduledCount  = payouts.filter(p => p.status === "scheduled").length;

  return (
    <div className="space-y-5">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <DollarSign size={17} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Payout Assist</p>
            <p className="text-xs text-gray-400">{payouts.length} payouts · {issueCount} issues</p>
          </div>
        </div>
        <button onClick={fetchPayouts} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ══ KPI CARDS ══ */}
      {!loading && !err && payouts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Clock,         color: "#3b82f6", bg: "#eff6ff", value: scheduledCount, label: "Scheduled",  sub: "Upcoming payouts" },
            { icon: TrendingUp,    color: "#16a34a", bg: "#f0fdf4", value: paidCount,       label: "Paid",       sub: "Completed" },
            { icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2", value: issueCount,      label: "Issues",     sub: "Need attention" },
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
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-700">{err}</p>
            {err.includes("permission") && (
              <p className="text-xs text-red-600 mt-1">Contact your admin to enable payout access for your role.</p>
            )}
          </div>
        </div>
      )}

      {/* ══ LOADING / EMPTY ══ */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-green-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading payouts…</p>
        </div>
      )}
      {!loading && err && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <AlertTriangle size={32} className="text-red-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Unable to load payouts</p>
          <p className="text-xs text-gray-400 mt-1">{err}</p>
        </div>
      )}
      {!loading && !err && payouts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <DollarSign size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">No payouts found</p>
          <p className="text-xs text-gray-300 mt-1">Vendor payout records will appear here</p>
        </div>
      )}

      {/* ══ TABLE ══ */}
      {!loading && !err && payouts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign size={14} className="text-green-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Payout Schedule</span>
            </div>
            {issueCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                {issueCount} issue{issueCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Column headers */}
          <div className="hidden md:grid px-6 py-3 border-b border-gray-100 bg-gray-50/60"
            style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {["Vendor", "Period", "Net Amount", "Status", "Action"].map((h, i) => (
              <span key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>

          <div className="divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: "480px" }}>
            {payouts.map(p => {
              const s = STATUS_STYLE[p.status] || { bg: "#f3f4f6", color: "#6b7280", label: p.status };
              const ticketRaised = raised.includes(p.id);

              return (
                <div key={p.id} className="hover:bg-gray-50/40 transition">
                  {/* Desktop row */}
                  <div className="hidden md:grid items-center px-6 py-3.5"
                    style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>

                    {/* Vendor */}
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.vendor || "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">Due {p.date}</p>
                    </div>

                    {/* Period */}
                    <span className="text-sm text-gray-600 pr-4 whitespace-nowrap">{p.period || "—"}</span>

                    {/* Amount */}
                    <span className="text-sm font-black text-gray-900 pr-4 whitespace-nowrap">
                      ₹{p.amount}
                    </span>

                    {/* Status */}
                    <div className="pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end">
                      {p.status === "issue" && !ticketRaised ? (
                        <button onClick={() => setTicketModal({ id: p.id, vendor: p.vendor, period: p.period })}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-50 transition whitespace-nowrap">
                          <AlertTriangle size={12} /> Raise Ticket
                        </button>
                      ) : ticketRaised ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 whitespace-nowrap">
                          <CheckCircle size={12} /> Ticket Raised
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 font-medium">—</span>
                      )}
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{p.vendor || "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.period} · Due {p.date}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-black text-gray-900">₹{p.amount}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-1"
                          style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                    </div>
                    {p.status === "issue" && !ticketRaised && (
                      <button onClick={() => setTicketModal({ id: p.id, vendor: p.vendor, period: p.period })}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border border-orange-200 text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-50 transition">
                        <AlertTriangle size={12} /> Raise Ticket
                      </button>
                    )}
                    {ticketRaised && (
                      <span className="flex items-center justify-center gap-1 text-xs font-bold text-green-600 mt-2">
                        <CheckCircle size={12} /> Ticket Raised
                      </span>
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
          Finance staff can view payout schedules and raise tickets for issues.
          Payout releases require admin authorization. All actions are permanently logged.
        </p>
      </div>

      {/* ══ TICKET MODAL ══ */}
      {ticketModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Raise Payout Ticket</h2>
              <button onClick={() => { setTicketModal(null); setErr(""); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400">Vendor</p>
              <p className="text-sm font-semibold text-gray-800">{ticketModal.vendor}</p>
              <p className="text-xs text-gray-400 mt-1">Period: {ticketModal.period}</p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                Issue Description *
              </label>
              <textarea value={ticketMsg} onChange={e => setTicketMsg(e.target.value)}
                placeholder="Describe the payout issue in detail…" rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition resize-none" />
            </div>

            {err && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-xs font-semibold text-red-600">⚠ {err}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setTicketModal(null); setErr(""); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={raiseTicket} disabled={!ticketMsg || busy}
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                {busy ? "Raising…" : "Raise Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
