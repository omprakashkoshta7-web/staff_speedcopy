import { useState, useEffect } from "react";
import { Clock, ChevronRight, X, CheckCircle, AlertTriangle, RefreshCw, MessageSquare, HeadphonesIcon, Circle } from "lucide-react";
import staffService from "../../services/staff.service";

type Ticket = {
  id?: string; _id?: string; ticketId?: string;
  issue: string; vendor: string; status: string; sla: string; priority: string;
};

const STATUS_COLOR: Record<string, string> = { open: "#3b82f6", in_progress: "#f59e0b", resolved: "#16a34a", closed: "#6b7280" };
const STATUS_BG:    Record<string, string> = { open: "#eff6ff", in_progress: "#fffbeb", resolved: "#f0fdf4", closed: "#f3f4f6" };
const PRI_COLOR:    Record<string, string> = { urgent: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#16a34a" };

export default function VendorTicketsPage() {
  const [items,  setItems]  = useState<Ticket[]>([]);
  const [loading,setLoading]= useState(true);
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [reply,  setReply]  = useState("");
  const [err,    setErr]    = useState("");
  const [busy,   setBusy]   = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const r = await staffService.getVendorTickets();
      let tickets: Ticket[] = [];
      if (r.success) {
        if (r.data?.tickets && Array.isArray(r.data.tickets)) tickets = r.data.tickets;
        else if (Array.isArray(r.data)) tickets = r.data;
        else if (r.data && typeof r.data === "object") tickets = [r.data];
      }
      tickets = tickets.map((t, idx) => ({
        ...t,
        id:  t.id  || t._id || t.ticketId || `ticket-${idx}`,
        _id: t._id || t.id  || t.ticketId || `ticket-${idx}`,
      }));
      setItems(tickets);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  const doResolve = async (id: string | undefined) => {
    if (!reply) return;
    if (!id || id.startsWith("ticket-")) { setErr("Cannot send reply: Ticket ID is missing."); return; }
    try { setBusy(true); setErr("");
      const r = await staffService.replyVendorTicket(id, reply);
      if (r.success) { setItems(p => p.map(t => t.id === id ? { ...t, status: "resolved" } : t)); setDetail(null); setReply(""); }
      else setErr(r.message || "Failed to send reply");
    } catch (e: any) { setErr(e?.message || "Failed to send reply"); } finally { setBusy(false); }
  };

  const doEscalate = async (id: string | undefined) => {
    if (!id || id.startsWith("ticket-")) { setErr("Cannot escalate: Ticket ID is missing."); return; }
    try { setBusy(true); setErr("");
      const r = await staffService.escalateTicket(id, "Escalated by staff");
      if (r.success) { setItems(p => p.map(t => t.id === id ? { ...t, status: "in_progress" } : t)); setDetail(null); }
      else setErr(r.message || "Failed to escalate");
    } catch (e: any) { setErr(e?.message || "Failed to escalate"); } finally { setBusy(false); }
  };

  const openCount       = items.filter(t => t.status === "open").length;
  const inProgressCount = items.filter(t => t.status === "in_progress").length;

  return (
    <div className="space-y-5">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <HeadphonesIcon size={17} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Vendor Tickets</p>
            <p className="text-xs text-gray-400">{items.length} ticket{items.length !== 1 ? "s" : ""} · {openCount} open</p>
          </div>
        </div>
        <button onClick={fetchTickets} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ══ KPI CARDS ══ */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, color: "#8b5cf6", bg: "#f5f3ff", value: items.length,    label: "Vendor Tickets", sub: "All statuses" },
            { icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2", value: openCount,       label: "Open",           sub: "Awaiting reply" },
            { icon: Clock,         color: "#f59e0b", bg: "#fffbeb", value: inProgressCount, label: "In Progress",    sub: "Being handled" },
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

      {/* ══ LOADING / EMPTY ══ */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-purple-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading vendor tickets…</p>
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <CheckCircle size={32} className="text-green-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">No vendor tickets in queue</p>
        </div>
      )}

      {/* ══ TABLE ══ */}
      {!loading && items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                <MessageSquare size={14} className="text-purple-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Vendor Issues</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">{items.length}</span>
          </div>
          <div className="hidden md:grid px-6 py-3 border-b border-gray-100 bg-gray-50/60"
            style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {["Issue", "Vendor", "Status", "SLA", "Action"].map((h, i) => (
              <span key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: "480px" }}>
            {items.map(t => {
              const status = t.status || "open";
              const done = status === "resolved" || status === "closed";
              return (
                <div key={t.id} className="hover:bg-gray-50/40 transition">
                  <div className="hidden md:grid items-center px-6 py-3.5"
                    style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                    <div className="min-w-0 pr-4 flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: PRI_COLOR[t.priority] || "#6b7280" }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{t.issue || "No issue"}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{t.id}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 font-medium truncate pr-4">{t.vendor || "Unknown"}</span>
                    <div className="pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: STATUS_BG[status] || "#f3f4f6", color: STATUS_COLOR[status] || "#6b7280" }}>
                        {status.replace("_", " ")}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-gray-400 pr-4 whitespace-nowrap"><Clock size={11} />{t.sla || "—"}</span>
                    <div className="flex justify-end">
                      {done ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={12} /> Resolved</span>
                      ) : (
                        <button onClick={() => { setDetail(t); setReply(""); setErr(""); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition">
                          Handle <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="md:hidden p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: PRI_COLOR[t.priority] || "#6b7280" }} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{t.issue || "No issue"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{t.vendor || "Unknown"} · {t.sla || "—"}</p>
                        </div>
                      </div>
                      <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: STATUS_BG[status] || "#f3f4f6", color: STATUS_COLOR[status] || "#6b7280" }}>
                        {status.replace("_", " ")}
                      </span>
                    </div>
                    {!done && (
                      <button onClick={() => { setDetail(t); setReply(""); setErr(""); }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition mt-2">
                        Handle <ChevronRight size={12} />
                      </button>
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
          All vendor communication is internal only. Customer personal information is never shared with vendors.
        </p>
      </div>

      {/* ══ DETAIL MODAL ══ */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-base">{detail.id}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Vendor: <span className="font-semibold text-gray-600">{detail.vendor}</span></p>
              </div>
              <button onClick={() => { setDetail(null); setErr(""); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">{detail.issue || "No issue"}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: STATUS_BG[detail.status || "open"] || "#f3f4f6", color: STATUS_COLOR[detail.status || "open"] || "#6b7280" }}>
                  {(detail.status || "open").replace("_", " ")}
                </span>
                {detail.sla && <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} />{detail.sla}</span>}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Reply to Vendor</label>
              <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your response to vendor…" rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition resize-none" />
            </div>
            {err && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100"><p className="text-xs font-semibold text-red-600">⚠ {err}</p></div>}
            <div className="flex gap-3">
              <button onClick={() => doEscalate(detail.id)} disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition disabled:opacity-60">
                <AlertTriangle size={13} /> {busy ? "…" : "Escalate"}
              </button>
              <button onClick={() => doResolve(detail.id)} disabled={!reply || busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                <CheckCircle size={13} /> {busy ? "Sending…" : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
