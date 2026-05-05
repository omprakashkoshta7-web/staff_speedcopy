import { useState, useEffect } from "react";
import { Clock, ChevronRight, X, CheckCircle, AlertTriangle, RefreshCw, Search, MessageSquare, HeadphonesIcon, Circle } from "lucide-react";
import staffService from "../../services/staff.service";

type Ticket = {
  _id?: string; id?: string; ticketId?: string;
  subject: string; description?: string;
  category: string; status: string; priority: string;
  orderId?: string;
  replies?: Array<{ authorRole: string; message: string; createdAt: string }>;
  createdAt: string;
};

const STATUS_COLOR: Record<string, string> = { open: "#3b82f6", in_progress: "#f59e0b", resolved: "#16a34a", closed: "#6b7280" };
const STATUS_BG:    Record<string, string> = { open: "#eff6ff", in_progress: "#fffbeb", resolved: "#f0fdf4", closed: "#f3f4f6" };
const PRI_COLOR:    Record<string, string> = { urgent: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#16a34a" };

const getSLA = (createdAt: string) => {
  const h = Math.floor((Date.now() - new Date(createdAt).getTime()) / 3600000);
  if (h < 1) return "< 1h"; if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`;
};

export default function TicketQueuePage() {
  const [items,  setItems]  = useState<Ticket[]>([]);
  const [loading,setLoading]= useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [reply,  setReply]  = useState("");
  const [err,    setErr]    = useState("");
  const [busy,   setBusy]   = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const r = await staffService.getTickets();
      let tickets: Ticket[] = [];
      if (r.success) {
        if (r.data?.tickets && Array.isArray(r.data.tickets)) tickets = r.data.tickets;
        else if (Array.isArray(r.data)) tickets = r.data;
        else if (r.data && typeof r.data === "object") tickets = [r.data];
      }
      tickets = tickets.map((t, idx) => ({
        ...t,
        _id: t._id || t.id || t.ticketId || `ticket-${idx}`,
        id:  t.id  || t._id || t.ticketId || `ticket-${idx}`,
      }));
      setItems(tickets);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  const doEscalate = async (id: string) => {
    if (!id || id.startsWith("ticket-")) { setErr("Cannot escalate: Ticket ID is missing."); return; }
    try { setBusy(true); setErr("");
      const r = await staffService.escalateTicket(id, "Escalated by support staff");
      if (r.success) { setItems(p => p.map(t => (t._id === id || t.id === id) ? { ...t, priority: "urgent", status: "in_progress" } : t)); setDetail(null); }
      else setErr(r.message || "Failed to escalate");
    } catch (e: any) { setErr(e?.message || "Failed to escalate"); } finally { setBusy(false); }
  };

  const doReply = async (id: string) => {
    if (!reply) return;
    if (!id || id.startsWith("ticket-")) { setErr("Cannot send reply: Ticket ID is missing."); return; }
    try { setBusy(true); setErr("");
      const r = await staffService.replyTicket(id, reply);
      if (r.success) { setDetail(null); setReply(""); fetchTickets(); }
      else setErr(r.message || "Failed to send reply");
    } catch (e: any) { setErr(e?.message || "Failed to send reply"); } finally { setBusy(false); }
  };

  const filtered = items.filter(t => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || (t._id || t.id || "").includes(search);
    const matchFilter = filter === "all" || t.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: items.length,
    open: items.filter(t => t.status === "open").length,
    in_progress: items.filter(t => t.status === "in_progress").length,
  };

  return (
    <div className="space-y-5">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <HeadphonesIcon size={17} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Ticket Queue</p>
            <p className="text-xs text-gray-400">{counts.open} open · {counts.in_progress} in progress</p>
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
            { icon: MessageSquare, color: "#8b5cf6", bg: "#f5f3ff", value: counts.all,         label: "Total Tickets",  sub: "All statuses" },
            { icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2", value: counts.open,        label: "Open",           sub: "Awaiting reply" },
            { icon: Clock,         color: "#f59e0b", bg: "#fffbeb", value: counts.in_progress, label: "In Progress",    sub: "Being handled" },
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 transition bg-white" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[["all", "All", counts.all], ["open", "Open", counts.open], ["in_progress", "In Progress", counts.in_progress]].map(([val, label, count]) => (
            <button key={String(val)} onClick={() => setFilter(String(val))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition"
              style={filter === val ? { backgroundColor: "#111827", color: "#fff" } : { color: "#6b7280" }}>
              {label} <span className="opacity-60">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══ LOADING / EMPTY ══ */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-purple-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading tickets…</p>
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <CheckCircle size={32} className="text-green-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">{search ? "No tickets match your search" : "No tickets in queue"}</p>
        </div>
      )}

      {/* ══ TABLE ══ */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                <MessageSquare size={14} className="text-purple-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Customer Tickets</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">{filtered.length}</span>
          </div>
          <div className="hidden md:grid px-6 py-3 border-b border-gray-100 bg-gray-50/60"
            style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {["Subject", "Status", "Priority", "Age", "Action"].map((h, i) => (
              <span key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: "480px" }}>
            {filtered.map(t => {
              const tid = t._id || t.id || "";
              const status = t.status || "open";
              const done = status === "resolved" || status === "closed";
              return (
                <div key={tid} className="hover:bg-gray-50/40 transition">
                  <div className="hidden md:grid items-center px-6 py-3.5"
                    style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRI_COLOR[t.priority] || "#6b7280" }} />
                        <p className="text-sm font-semibold text-gray-900 truncate">{t.subject || "No subject"}</p>
                      </div>
                      <p className="text-xs text-gray-400 pl-4">{tid.slice(-8)}{t.category ? ` · ${t.category}` : ""}</p>
                    </div>
                    <div className="pr-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: STATUS_BG[status] || "#f3f4f6", color: STATUS_COLOR[status] || "#6b7280" }}>
                        {status.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-xs font-bold capitalize pr-4 whitespace-nowrap" style={{ color: PRI_COLOR[t.priority] || "#6b7280" }}>{t.priority || "medium"}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 pr-4 whitespace-nowrap"><Clock size={11} />{getSLA(t.createdAt)}</span>
                    <div className="flex justify-end">
                      {done ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={12} />{status === "closed" ? "Closed" : "Resolved"}</span>
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
                          <p className="text-sm font-semibold text-gray-900 truncate">{t.subject || "No subject"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{tid.slice(-8)} · {getSLA(t.createdAt)}</p>
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
          Vendor information is never shared with customers for security reasons.
          If a ticket is beyond your scope, escalate it to admin for proper handling.
        </p>
      </div>

      {/* ══ DETAIL MODAL ══ */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">Ticket #{(detail._id || detail.id || "").slice(-8)}</h2>
              <button onClick={() => { setDetail(null); setErr(""); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">{detail.subject || "No subject"}</p>
              {detail.description && <p className="text-xs text-gray-600 mb-2">{detail.description}</p>}
              {detail.orderId && <p className="text-xs text-gray-400">Linked order: <span className="font-mono">{detail.orderId}</span></p>}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: STATUS_BG[detail.status || "open"] || "#f3f4f6", color: STATUS_COLOR[detail.status || "open"] || "#6b7280" }}>
                  {(detail.status || "open").replace("_", " ")}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: (PRI_COLOR[detail.priority] || "#6b7280") + "18", color: PRI_COLOR[detail.priority] || "#6b7280" }}>
                  {detail.priority || "medium"}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} />{getSLA(detail.createdAt)}</span>
              </div>
              {detail.replies && detail.replies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Previous Replies</p>
                  {detail.replies.slice(-3).map((r, i) => (
                    <div key={i} className="text-xs text-gray-600 bg-white rounded-lg p-2.5 border border-gray-100">
                      <span className="font-bold text-gray-700">{r.authorRole}:</span> {r.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Reply to Customer</label>
              <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your response…" rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition resize-none" />
            </div>
            {err && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100"><p className="text-xs font-semibold text-red-600">⚠ {err}</p></div>}
            <div className="flex gap-3">
              <button onClick={() => doEscalate(detail._id || detail.id || "")} disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition disabled:opacity-60">
                <AlertTriangle size={13} /> {busy ? "…" : "Escalate"}
              </button>
              <button onClick={() => doReply(detail._id || detail.id || "")} disabled={!reply || busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                <CheckCircle size={13} /> {busy ? "Saving…" : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
