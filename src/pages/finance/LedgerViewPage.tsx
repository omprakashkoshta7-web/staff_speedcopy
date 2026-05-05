import { useState, useEffect } from "react";
import { Lock, RefreshCw, TrendingUp, TrendingDown, BookOpen, Circle, Search, Filter } from "lucide-react";
import staffService from "../../services/staff.service";

// Backend mapLedger() returns:
// { id, type (category??type), ref (orderNumber??referenceId??LED-XXXX), amount ("+₹850"/"-₹200"), date ("02 May 2026"), note (description) }
type Entry = {
  id: string;
  type: string;   // category: order_payment | refund | referral_reward | payout | wallet_topup | admin_credit | admin_debit | delivery_earning
  ref: string;    // orderNumber ?? referenceId ?? "LED-XXXXXX"
  amount: string; // "+₹850" or "-₹200"
  date: string;   // "02 May 2026"
  note: string;   // description
};

const CATEGORIES = [
  "all", "order_payment", "refund", "wallet_topup",
  "admin_credit", "admin_debit", "payout", "referral_reward", "delivery_earning",
] as const;

export default function LedgerViewPage() {
  const [entries,  setEntries]  = useState<Entry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState("all");
  const [userId,   setUserId]   = useState("");
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(false);
  const LIMIT = 20;

  useEffect(() => { setPage(1); fetchLedger(1); }, [category, userId]);

  const fetchLedger = async (p = page) => {
    try {
      setLoading(true);
      // GET /api/staff/wallet/ledger?userId=xxx&category=refund&page=1&limit=20
      const r = await staffService.getWalletLedger({
        category: category !== "all" ? category : undefined,
        userId:   userId.trim() || undefined,
        page:     p,
        limit:    LIMIT,
      });
      if (r.success && Array.isArray(r.data)) {
        if (p === 1) setEntries(r.data);
        else setEntries(prev => [...prev, ...r.data]);
        setHasMore(r.data.length === LIMIT);
      } else {
        if (p === 1) setEntries([]);
        setHasMore(false);
      }
    } catch { if (p === 1) setEntries([]); }
    finally { setLoading(false); }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    void fetchLedger(next);
  };

  const filtered = entries.filter(e =>
    !search ||
    e.ref?.toLowerCase().includes(search.toLowerCase()) ||
    e.type?.toLowerCase().includes(search.toLowerCase()) ||
    e.note?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredit = entries.filter(e => e.amount?.startsWith("+"))
    .reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, "") || "0"), 0);
  const totalDebit = entries.filter(e => !e.amount?.startsWith("+"))
    .reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, "") || "0"), 0);

  return (
    <div className="space-y-5">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <BookOpen size={17} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Ledger View</p>
            <p className="text-xs text-gray-400">{entries.length} entries · read-only</p>
          </div>
        </div>
        <button onClick={() => { setPage(1); void fetchLedger(1); }} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ══ KPI CARDS ══ */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: TrendingUp,   color: "#16a34a", bg: "#f0fdf4", value: `+₹${totalCredit.toFixed(0)}`, label: "Total Credits", sub: "Inflow" },
            { icon: TrendingDown, color: "#ef4444", bg: "#fef2f2", value: `-₹${totalDebit.toFixed(0)}`,  label: "Total Debits",  sub: "Outflow" },
            { icon: BookOpen,     color: "#3b82f6", bg: "#eff6ff", value: entries.length,                label: "Entries Loaded", sub: `Page ${page}` },
          ].map(({ icon: Icon, color, bg, value, label, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ backgroundColor: bg, color }}>Live</span>
              </div>
              <p className="text-3xl font-black leading-none tabular-nums"
                style={{ color: label === "Total Credits" ? "#16a34a" : label === "Total Debits" ? "#ef4444" : "#111827" }}>
                {value}
              </p>
              <p className="text-sm font-semibold text-gray-600 mt-2">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ══ FILTERS ══ */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search ref, type, note…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 transition bg-white" />
        </div>

        {/* User ID filter */}
        <div className="relative min-w-[180px]">
          <Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={userId} onChange={e => setUserId(e.target.value)}
            placeholder="Filter by User ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 transition bg-white" />
        </div>

        {/* Category filter */}
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 transition bg-white font-semibold text-gray-700">
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c === "all" ? "All Categories" : c.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {/* ══ LOADING / EMPTY ══ */}
      {loading && entries.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-green-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading ledger…</p>
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Lock size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">No ledger entries found</p>
          <p className="text-xs text-gray-300 mt-1">Try changing the category filter or user ID</p>
        </div>
      )}

      {/* ══ TABLE ══ */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <BookOpen size={14} className="text-green-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Ledger Entries</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
              <Lock size={11} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-600">Read-Only</span>
            </div>
          </div>

          {/* Column headers — 6 columns now (added Note) */}
          <div className="hidden md:grid px-6 py-3 border-b border-gray-100 bg-gray-50/60"
            style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
            {["Entry ID", "Type", "Reference", "Note", "Amount", "Date"].map((h, i) => (
              <span key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${i === 5 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>

          <div className="divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: "480px" }}>
            {filtered.map(e => {
              const isCredit = e.amount?.startsWith("+");
              return (
                <div key={e.id} className="hover:bg-gray-50/40 transition">
                  {/* Desktop */}
                  <div className="hidden md:grid items-center px-6 py-3.5"
                    style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
                    <span className="text-xs font-mono font-semibold text-gray-500 truncate pr-4" title={e.id}>
                      {e.id?.slice(-12) || "—"}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 truncate pr-4 capitalize">
                      {e.type?.replace(/_/g, " ") || "—"}
                    </span>
                    <span className="text-xs text-gray-500 truncate pr-4">{e.ref || "—"}</span>
                    <span className="text-xs text-gray-400 truncate pr-4">{e.note || "—"}</span>
                    <span className={`text-sm font-black pr-4 whitespace-nowrap ${isCredit ? "text-green-600" : "text-red-500"}`}>
                      {e.amount}
                    </span>
                    <span className="text-xs text-gray-400 text-right whitespace-nowrap">{e.date}</span>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 capitalize">{e.type?.replace(/_/g, " ") || "—"}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{e.ref}</p>
                        {e.note && <p className="text-xs text-gray-400 mt-0.5 truncate">{e.note}</p>}
                        <p className="text-xs font-mono text-gray-300 mt-0.5">{e.id?.slice(-10)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-base font-black ${isCredit ? "text-green-600" : "text-red-500"}`}>{e.amount}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{e.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="px-6 py-4 border-t border-gray-100 text-center">
              <button onClick={loadMore} disabled={loading}
                className="flex items-center gap-2 mx-auto px-5 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Load More
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══ NOTICE ══ */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <Circle size={8} className="mt-1 flex-shrink-0 fill-blue-400 text-blue-400" />
        <p className="text-xs font-semibold text-blue-700">
          Read-Only Access: Finance staff can view all ledger entries for audit and verification.
          Contact admin for any corrections or adjustments.
        </p>
      </div>
    </div>
  );
}
