import { useNavigate } from "react-router-dom";
import {
  ClipboardList, TrendingUp, AlertTriangle, Clock,
  CheckCircle, Package, Users, RefreshCw,
  ArrowRight, Zap, ShoppingCart, Activity,
  ChevronRight, Circle, Gift, Tag, Percent,
  BarChart3, Calendar, RotateCcw, BookOpen,
  DollarSign, HeadphonesIcon, MessageSquare,
} from "lucide-react";
import { useStaffRole } from "../../context/StaffContext";
import { useEffect, useState } from "react";
import staffService from "../../services/staff.service";

const ROLE_CONFIG: Record<string, {
  label: string; color: string; bg: string; accent: string;
  quickLinks: { label: string; route: string; icon: React.ElementType; desc: string }[];
}> = {
  ops: {
    label: "Operations", color: "#3b82f6", bg: "#eff6ff", accent: "#1d4ed8",
    quickLinks: [
      { label: "Order Queue",  route: "/ops/orders", icon: ShoppingCart, desc: "View & manage active orders" },
      { label: "Vendor List",  route: "/ops/orders", icon: Users,        desc: "Browse assignable vendors"  },
    ],
  },
  support: {
    label: "Support", color: "#8b5cf6", bg: "#f5f3ff", accent: "#6d28d9",
    quickLinks: [{ label: "Ticket Queue", route: "/support/tickets", icon: ClipboardList, desc: "Handle open tickets" }],
  },
  finance: {
    label: "Finance", color: "#10b981", bg: "#f0fdf4", accent: "#047857",
    quickLinks: [{ label: "Refund Queue", route: "/finance/refunds", icon: TrendingUp, desc: "Review pending refunds" }],
  },
  marketing: {
    label: "Marketing", color: "#f59e0b", bg: "#fffbeb", accent: "#b45309",
    quickLinks: [{ label: "Campaigns", route: "/marketing/campaigns", icon: Zap, desc: "Manage coupons & offers" }],
  },
};

const P_COLOR = { critical: "#ef4444", high: "#f59e0b", normal: "#3b82f6" };
const P_BG    = { critical: "#fef2f2", high: "#fffbeb", normal: "#eff6ff" };
const A_COLOR = { critical: "#ef4444", warning: "#f59e0b", info: "#3b82f6" };
const A_BG    = { critical: "#fef2f2", warning: "#fffbeb", info: "#eff6ff" };

const ROLE_ICON: Record<string, React.ElementType> = {
  ops: ShoppingCart, support: ClipboardList, finance: TrendingUp, marketing: Zap,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { role } = useStaffRole();
  const [dashData, setDashData] = useState<{ kpis: any[]; tasks: any[]; alerts: any[] }>({ kpis: [], tasks: [], alerts: [] });
  const [orderStats, setOrderStats] = useState({ total: 0, critical: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Marketing analytics state
  type Coupon = { _id: string; code: string; discountType: string; discountValue: number; isActive: boolean; usedCount: number; usageLimit: number; expiresAt?: string; applicableFlows?: string[]; createdAt: string; };
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);

  // Finance analytics state
  type Refund = { id: string; amount: number; status: string; };
  type LedgerEntry = { id: string; amount: string; type: string; };
  type Payout = { id: string; status: string; amount: string; };
  const [refunds,  setRefunds]  = useState<Refund[]>([]);
  const [ledger,   setLedger]   = useState<LedgerEntry[]>([]);
  const [payouts,  setPayouts]  = useState<Payout[]>([]);

  // Support analytics state
  type STicket = { _id?: string; id?: string; status: string; priority: string; category?: string; createdAt: string; };
  type VTicket = { id?: string; status: string; priority: string; vendor?: string; };
  const [custTickets,   setCustTickets]   = useState<STicket[]>([]);
  const [vendorTickets, setVendorTickets] = useState<VTicket[]>([]);
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.ops;
  const RoleIcon = ROLE_ICON[role] || Activity;

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setError("");
    try {
      const promises: Promise<any>[] = [staffService.getDashboard(role)];
      if (role === "ops")       promises.push(staffService.getOrderQueue().catch(() => ({ success: false, data: [] })));
      if (role === "marketing") promises.push(staffService.getCoupons({ page: 1, limit: 100 }).catch(() => ({ data: [] })));
      if (role === "finance") {
        promises.push(
          staffService.getRefunds().catch(() => ({ data: [] })),
          staffService.getWalletLedger({ page: 1, limit: 50 }).catch(() => ({ data: [] })),
          staffService.getPayouts().catch(() => ({ data: [] })),
        );
      }
      if (role === "support") {
        promises.push(
          staffService.getTickets().catch(() => ({ success: false, data: [] })),
          staffService.getVendorTickets().catch(() => ({ success: false, data: [] })),
        );
      }
      const [dashResult, extra1, extra2, extra3] = await Promise.all(promises);
      if (dashResult?.success && dashResult?.data) {
        setDashData({
          kpis:   Array.isArray(dashResult.data.kpis)   ? dashResult.data.kpis   : [],
          tasks:  Array.isArray(dashResult.data.tasks)  ? dashResult.data.tasks  : [],
          alerts: Array.isArray(dashResult.data.alerts) ? dashResult.data.alerts : [],
        });
      } else {
        setError(dashResult?.message || "Dashboard data unavailable");
      }

      if (role === "ops" && extra1?.success) {
        const orders: any[] = Array.isArray(extra1.data) ? extra1.data : [];
        setOrderStats({
          total:    orders.length,
          critical: orders.filter((o: any) => o.risk === "critical").length,
          pending:  orders.filter((o: any) => o.rawStatus === "pending" || o.rawStatus === "assigned_vendor").length,
        });
      }

      if (role === "marketing" && extra1) {
        const list = extra1?.data?.coupons ?? extra1?.data ?? extra1?.coupons ?? [];
        setCoupons(Array.isArray(list) ? list : []);
      }

      if (role === "finance") {
        const rList = extra1?.data ?? extra1 ?? [];
        setRefunds(Array.isArray(rList) ? rList : []);
        const lList = extra2?.data ?? extra2 ?? [];
        setLedger(Array.isArray(lList) ? lList : []);
        const pList = extra3?.data ?? extra3 ?? [];
        setPayouts(Array.isArray(pList) ? pList : []);
      }

      if (role === "support") {
        const ct = extra1?.data?.tickets ?? extra1?.data ?? extra1 ?? [];
        setCustTickets(Array.isArray(ct) ? ct : []);
        const vt = extra2?.data?.tickets ?? extra2?.data ?? extra2 ?? [];
        setVendorTickets(Array.isArray(vt) ? vt : []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
    } finally { setLoading(false); setRefreshing(false); setCouponLoading(false); }
  };

  useEffect(() => { void loadData(); }, [role]);

  /* ── KPI data to render ── */
  const kpiCards = role === "ops"
    ? [
        { icon: Package,       color: "#3b82f6", bg: "#eff6ff", value: orderStats.total,    label: "Active Orders",      sub: "In queue" },
        { icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2", value: orderStats.critical, label: "Critical SLA Risk",  sub: "Need action" },
        { icon: Clock,         color: "#f59e0b", bg: "#fffbeb", value: orderStats.pending,  label: "Pending Assignment", sub: "Unassigned" },
      ]
    : dashData.kpis.map((k: any) => ({
        icon: TrendingUp, color: k.color || rc.color,
        bg: (k.color || rc.color) + "18",
        value: k.value, label: k.label, sub: "",
      }));

  const alertCount = dashData.alerts.length
    + (role === "ops" && orderStats.critical > 0 ? 1 : 0)
    + (role === "ops" && orderStats.pending  > 0 ? 1 : 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <RefreshCw size={24} className="animate-spin mx-auto mb-3" style={{ color: rc.color }} />
        <p className="text-sm text-gray-400 font-medium">Loading dashboard…</p>
      </div>
    </div>
  );

  // ── Marketing: show only coupon analytics ──
  if (role === "marketing") {
    return (
      <div className="space-y-6">
        {/* TOOLBAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: rc.bg }}>
              <RoleIcon size={17} style={{ color: rc.color }} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Marketing Dashboard</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
            </div>
          </div>
          <button onClick={() => void loadData(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
        {/* COUPON ANALYTICS */}
        <MarketingAnalytics coupons={coupons} loading={couponLoading} navigate={navigate} />
      </div>
    );
  }

  // ── Finance: show only finance analytics ──
  if (role === "finance") {
    return (
      <div className="space-y-6">
        {/* TOOLBAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: rc.bg }}>
              <RoleIcon size={17} style={{ color: rc.color }} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Finance Dashboard</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
            </div>
          </div>
          <button onClick={() => void loadData(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
        {/* FINANCE ANALYTICS */}
        <FinanceAnalytics refunds={refunds} ledger={ledger} payouts={payouts} navigate={navigate} />
      </div>
    );
  }

  // ── Support: show only support analytics ──
  if (role === "support") {
    return (
      <div className="space-y-6">
        {/* TOOLBAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: rc.bg }}>
              <RoleIcon size={17} style={{ color: rc.color }} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Support Dashboard</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
            </div>
          </div>
          <button onClick={() => void loadData(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
        {/* SUPPORT ANALYTICS */}
        <SupportAnalytics custTickets={custTickets} vendorTickets={vendorTickets} navigate={navigate} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: rc.bg }}>
            <RoleIcon size={17} style={{ color: rc.color }} />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{rc.label} Dashboard</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
          </div>
        </div>
        <button onClick={() => void loadData(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ══ ERROR ══ */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Dashboard data unavailable</p>
            <p className="text-xs text-amber-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          KPI CARDS
      ══════════════════════════════════════ */}
      {kpiCards.length > 0 && (
        <div className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(kpiCards.length, 4)}, minmax(0, 1fr))` }}>
          {kpiCards.map(({ icon: Icon, color, bg, value, label, sub }) => (
            <div key={label}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              {/* icon + trend row */}
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                  style={{ backgroundColor: bg, color }}>
                  Live
                </span>
              </div>
              {/* value */}
              <p className="text-4xl font-black text-gray-900 leading-none tabular-nums">{value}</p>
              {/* label */}
              <p className="text-sm font-semibold text-gray-600 mt-2">{label}</p>
              {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* empty state for non-ops with no KPIs */}
      {kpiCards.length === 0 && role !== "ops" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: rc.bg }}>
            <TrendingUp size={24} style={{ color: rc.color }} />
          </div>
          <p className="text-sm font-bold text-gray-500">No KPI data yet</p>
          <p className="text-xs text-gray-400 mt-1">Metrics for the {rc.label} role will appear here once available.</p>
        </div>
      )}

      {/* ══════════════════════════════════════
          TASKS  +  ALERTS  (side by side)
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Assigned Tasks ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClipboardList size={14} className="text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Assigned Tasks</span>
            </div>
            {dashData.tasks.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                {dashData.tasks.length}
              </span>
            )}
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 340 }}>
            {dashData.tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <CheckCircle size={32} className="text-green-300" />
                <p className="text-sm font-semibold text-gray-400">All clear — no tasks assigned</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {dashData.tasks.map((t: any) => (
                  <div key={t.id} onClick={() => navigate(t.route || "/")}
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50/60 transition group">
                    {/* priority dot */}
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: P_COLOR[t.priority as keyof typeof P_COLOR] || "#3b82f6" }} />
                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-gray-400">{t.id}</span>
                        {t.time && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="flex items-center gap-1 text-[11px] font-semibold"
                              style={{ color: P_COLOR[t.priority as keyof typeof P_COLOR] || "#3b82f6" }}>
                              <Clock size={9} />{t.time}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* priority badge */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                      style={{ backgroundColor: P_BG[t.priority as keyof typeof P_BG] || "#eff6ff", color: P_COLOR[t.priority as keyof typeof P_COLOR] || "#3b82f6" }}>
                      {t.priority || "normal"}
                    </span>
                    <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 transition flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Alerts ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle size={14} className="text-red-500" />
              </div>
              <span className="text-sm font-bold text-gray-900">Alerts</span>
            </div>
            {alertCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                {alertCount}
              </span>
            )}
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 300 }}>
            {alertCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <CheckCircle size={32} className="text-green-300" />
                <p className="text-sm font-semibold text-gray-400">No active alerts</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {role === "ops" && orderStats.critical > 0 && (
                  <div className="flex items-start gap-3 px-5 py-3.5">
                    <Circle size={8} className="mt-1.5 flex-shrink-0 fill-red-500 text-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {orderStats.critical} order{orderStats.critical > 1 ? "s" : ""} at critical SLA risk
                      </p>
                      <p className="text-xs text-red-500 font-medium mt-0.5">Immediate action required</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex-shrink-0">Critical</span>
                  </div>
                )}
                {role === "ops" && orderStats.pending > 0 && (
                  <div className="flex items-start gap-3 px-5 py-3.5">
                    <Circle size={8} className="mt-1.5 flex-shrink-0 fill-amber-400 text-amber-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {orderStats.pending} order{orderStats.pending > 1 ? "s" : ""} pending vendor assignment
                      </p>
                      <p className="text-xs text-amber-500 font-medium mt-0.5">Assign vendor to proceed</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 flex-shrink-0">Warning</span>
                  </div>
                )}
                {dashData.alerts.map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <Circle size={8} className="mt-1.5 flex-shrink-0"
                      style={{ fill: A_COLOR[a.type as keyof typeof A_COLOR] || "#3b82f6", color: A_COLOR[a.type as keyof typeof A_COLOR] || "#3b82f6" }} />
                    <p className="text-sm font-semibold text-gray-800 flex-1 min-w-0">{a.msg}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                      style={{ backgroundColor: A_BG[a.type as keyof typeof A_BG] || "#eff6ff", color: A_COLOR[a.type as keyof typeof A_COLOR] || "#3b82f6" }}>
                      {a.type || "info"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
            <p className="text-[11px] text-gray-400 font-medium">
              Staff cannot override system rules — escalate to admin when needed.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          QUICK ACTIONS
      ══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Quick Actions</p>
          <p className="text-xs text-gray-400 mt-0.5">Jump to your most-used workflows</p>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rc.quickLinks.map(link => (
            <button key={link.route + link.label} onClick={() => navigate(link.route)}
              className="flex items-center gap-4 p-4 rounded-xl border text-left transition hover:shadow-sm group"
              style={{ backgroundColor: rc.bg + "80", borderColor: rc.color + "25" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: rc.color + "18" }}>
                <link.icon size={18} style={{ color: rc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: rc.accent }}>{link.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
              </div>
              <ArrowRight size={15} className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: rc.color }} />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

// ══════════════════════════════════════
// SUPPORT ANALYTICS COMPONENT
// ══════════════════════════════════════
type CSTicket = { _id?: string; id?: string; status: string; priority: string; category?: string; createdAt: string; };
type CVTicket = { id?: string; status: string; priority: string; vendor?: string; };

function SupportAnalytics({ custTickets, vendorTickets, navigate }: {
  custTickets: CSTicket[]; vendorTickets: CVTicket[]; navigate: (r: string) => void;
}) {
  // Customer ticket stats
  const cOpen       = custTickets.filter(t => t.status === "open").length;
  const cInProgress = custTickets.filter(t => t.status === "in_progress").length;
  const cResolved   = custTickets.filter(t => t.status === "resolved" || t.status === "closed").length;
  const cUrgent     = custTickets.filter(t => t.priority === "urgent" || t.priority === "high").length;

  // Vendor ticket stats
  const vOpen       = vendorTickets.filter(t => t.status === "open").length;
  const vInProgress = vendorTickets.filter(t => t.status === "in_progress").length;
  const vResolved   = vendorTickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  // Category breakdown
  const catMap: Record<string, number> = {};
  custTickets.forEach(t => { if (t.category) catMap[t.category] = (catMap[t.category] || 0) + 1; });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Priority breakdown
  const priMap: Record<string, number> = {};
  custTickets.forEach(t => { if (t.priority) priMap[t.priority] = (priMap[t.priority] || 0) + 1; });
  const PRI_COLOR: Record<string, string> = { urgent: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#16a34a" };

  return (
    <div className="space-y-4">

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: MessageSquare, color: "#8b5cf6", bg: "#f5f3ff", value: custTickets.length,   label: "Customer Tickets", link: "/support/tickets" },
          { icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2", value: cUrgent,              label: "High Priority",    link: "/support/tickets" },
          { icon: HeadphonesIcon,color: "#3b82f6", bg: "#eff6ff", value: vendorTickets.length, label: "Vendor Tickets",   link: "/support/vendor-tickets" },
          { icon: Clock,         color: "#f59e0b", bg: "#fffbeb", value: cOpen + vOpen,        label: "Total Open",       link: "/support/tickets" },
        ].map(({ icon: Icon, color, bg, value, label, link }) => (
          <div key={label} onClick={() => navigate(link)}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon size={16} style={{ color }} />
              </div>
              <ArrowRight size={12} className="text-gray-300 group-hover:text-gray-500 transition mt-1" />
            </div>
            <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Customer tickets + Vendor tickets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Customer ticket status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                <MessageSquare size={13} className="text-purple-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Customer Tickets</span>
            </div>
            <button onClick={() => navigate("/support/tickets")}
              className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700">
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Open",        value: cOpen,       color: "#3b82f6", bg: "#eff6ff" },
              { label: "In Progress", value: cInProgress, color: "#f59e0b", bg: "#fffbeb" },
              { label: "Resolved",    value: cResolved,   color: "#16a34a", bg: "#f0fdf4" },
            ].map(({ label, value, color }) => {
              const pct = custTickets.length ? Math.round(value / custTickets.length * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{value}</span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
            {custTickets.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No customer tickets</p>}
          </div>
        </div>

        {/* Vendor ticket status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <HeadphonesIcon size={13} className="text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Vendor Tickets</span>
            </div>
            <button onClick={() => navigate("/support/vendor-tickets")}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div className="p-5">
            {vendorTickets.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No vendor tickets</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Open",        value: vOpen,       color: "#3b82f6", bg: "#eff6ff" },
                  { label: "In Progress", value: vInProgress, color: "#f59e0b", bg: "#fffbeb" },
                  { label: "Resolved",    value: vResolved,   color: "#16a34a", bg: "#f0fdf4" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: bg }}>
                    <p className="text-xl font-black" style={{ color }}>{value}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Priority breakdown + Category breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Priority breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle size={13} className="text-red-500" />
            </div>
            <span className="text-sm font-bold text-gray-900">Priority Breakdown</span>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(priMap).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No priority data</p>
            ) : (
              ["urgent", "high", "medium", "low"].filter(p => priMap[p]).map(pri => {
                const count = priMap[pri] || 0;
                const pct = custTickets.length ? Math.round(count / custTickets.length * 100) : 0;
                return (
                  <div key={pri}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRI_COLOR[pri] }} />
                        <span className="text-xs font-semibold text-gray-700 capitalize">{pri}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: PRI_COLOR[pri] }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <Tag size={13} className="text-purple-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">Top Categories</span>
          </div>
          <div className="p-5">
            {topCats.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No category data</p>
            ) : (
              <div className="space-y-3">
                {topCats.map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 capitalize">{cat.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-purple-400"
                          style={{ width: `${Math.round(count / custTickets.length * 100)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// FINANCE ANALYTICS COMPONENT
// ══════════════════════════════════════
type FRefund  = { id: string; amount: number; status: string; };
type FLedger  = { id: string; amount: string; type: string; };
type FPayout  = { id: string; status: string; amount: string; };

function FinanceAnalytics({ refunds, ledger, payouts, navigate }: {
  refunds: FRefund[]; ledger: FLedger[]; payouts: FPayout[]; navigate: (r: string) => void;
}) {
  const STAFF_LIMIT = 500;

  // Refund stats
  const rPending   = refunds.filter(r => r.status === "pending");
  const rApproved  = refunds.filter(r => r.status === "approved" || r.status === "completed");
  const rEscalated = refunds.filter(r => r.status === "escalated");
  const rOverLimit = rPending.filter(r => r.amount > STAFF_LIMIT);
  const totalRefundAmt = refunds.reduce((s, r) => s + (r.amount || 0), 0);

  // Ledger stats
  const credits = ledger.filter(e => e.amount?.startsWith("+"));
  const debits  = ledger.filter(e => !e.amount?.startsWith("+"));
  const totalCredit = credits.reduce((s, e) => s + parseFloat(e.amount?.replace(/[^0-9.]/g, "") || "0"), 0);
  const totalDebit  = debits.reduce((s, e)  => s + parseFloat(e.amount?.replace(/[^0-9.]/g, "") || "0"), 0);

  // Ledger by type
  const typeMap: Record<string, number> = {};
  ledger.forEach(e => { if (e.type) typeMap[e.type] = (typeMap[e.type] || 0) + 1; });
  const topTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Payout stats
  const pScheduled  = payouts.filter(p => p.status === "scheduled").length;
  const pPaid       = payouts.filter(p => p.status === "paid").length;
  const pIssue      = payouts.filter(p => p.status === "issue").length;
  const pProcessing = payouts.filter(p => p.status === "processing").length;

  return (
    <div className="space-y-4">

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: RotateCcw,     color: "#d97706", bg: "#fffbeb", value: rPending.length,   label: "Pending Refunds",  link: "/finance/refunds" },
          { icon: AlertTriangle, color: "#ea580c", bg: "#fff7ed", value: rOverLimit.length, label: "Over ₹500 Limit",  link: "/finance/refunds" },
          { icon: BookOpen,      color: "#3b82f6", bg: "#eff6ff", value: ledger.length,     label: "Ledger Entries",   link: "/finance/ledger" },
          { icon: DollarSign,    color: "#ef4444", bg: "#fef2f2", value: pIssue,            label: "Payout Issues",    link: "/finance/payouts" },
        ].map(({ icon: Icon, color, bg, value, label, link }) => (
          <div key={label} onClick={() => navigate(link)}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon size={16} style={{ color }} />
              </div>
              <ArrowRight size={12} className="text-gray-300 group-hover:text-gray-500 transition mt-1" />
            </div>
            <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Refunds + Payouts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Refund breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <RotateCcw size={13} className="text-green-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Refund Queue</span>
            </div>
            <button onClick={() => navigate("/finance/refunds")}
              className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700">
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Pending",   value: rPending.length,   color: "#d97706", bg: "#fffbeb" },
              { label: "Approved",  value: rApproved.length,  color: "#16a34a", bg: "#f0fdf4" },
              { label: "Escalated", value: rEscalated.length, color: "#ea580c", bg: "#fff7ed" },
            ].map(({ label, value, color }) => {
              const pct = refunds.length ? Math.round(value / refunds.length * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{value}</span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
            {refunds.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No refund data</p>}
            <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">Total refund value</span>
              <span className="text-sm font-black text-gray-900">₹{totalRefundAmt.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payout breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign size={13} className="text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Payout Status</span>
            </div>
            <button onClick={() => navigate("/finance/payouts")}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div className="p-5">
            {payouts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No payout data</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Scheduled",  value: pScheduled,  color: "#3b82f6", bg: "#eff6ff" },
                  { label: "Processing", value: pProcessing, color: "#f59e0b", bg: "#fffbeb" },
                  { label: "Paid",       value: pPaid,       color: "#16a34a", bg: "#f0fdf4" },
                  { label: "Issues",     value: pIssue,      color: "#ef4444", bg: "#fef2f2" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: bg }}>
                    <p className="text-xl font-black" style={{ color }}>{value}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Ledger summary ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <BookOpen size={13} className="text-blue-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">Ledger Summary</span>
          </div>
          <button onClick={() => navigate("/finance/ledger")}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
            View Ledger <ArrowRight size={11} />
          </button>
        </div>
        <div className="p-5">
          {/* Credit / Debit totals */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl p-3 text-center bg-green-50">
              <p className="text-xs font-bold text-green-600 mb-1">Credits</p>
              <p className="text-lg font-black text-green-700">+₹{totalCredit.toFixed(0)}</p>
              <p className="text-xs text-green-500">{credits.length} entries</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-red-50">
              <p className="text-xs font-bold text-red-600 mb-1">Debits</p>
              <p className="text-lg font-black text-red-700">-₹{totalDebit.toFixed(0)}</p>
              <p className="text-xs text-red-500">{debits.length} entries</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-gray-50">
              <p className="text-xs font-bold text-gray-600 mb-1">Net</p>
              <p className={`text-lg font-black ${totalCredit - totalDebit >= 0 ? "text-green-700" : "text-red-700"}`}>
                {totalCredit - totalDebit >= 0 ? "+" : ""}₹{(totalCredit - totalDebit).toFixed(0)}
              </p>
              <p className="text-xs text-gray-400">{ledger.length} total</p>
            </div>
          </div>

          {/* Top transaction types */}
          {topTypes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Top Transaction Types</p>
              {topTypes.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 capitalize">{type.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-blue-400"
                        style={{ width: `${Math.round(count / ledger.length * 100)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {ledger.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No ledger data</p>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// MARKETING ANALYTICS COMPONENT
// ══════════════════════════════════════
type MCoupon = { _id: string; code: string; discountType: string; discountValue: number; isActive: boolean; usedCount: number; usageLimit: number; expiresAt?: string; applicableFlows?: string[]; createdAt: string; };

function MarketingAnalytics({ coupons, loading, navigate }: { coupons: MCoupon[]; loading: boolean; navigate: (r: string) => void }) {
  const isExpired = (d?: string) => !!d && new Date(d) < new Date();

  const active   = coupons.filter(c => c.isActive && !isExpired(c.expiresAt));
  const expired  = coupons.filter(c => isExpired(c.expiresAt));
  const inactive = coupons.filter(c => !c.isActive && !isExpired(c.expiresAt));
  const totalUses = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);
  const nearLimit = coupons.filter(c => c.usageLimit > 0 && c.usedCount / c.usageLimit >= 0.8 && c.isActive);

  // flow breakdown
  const flowMap: Record<string, number> = {};
  coupons.forEach(c => (c.applicableFlows || []).forEach(f => { flowMap[f] = (flowMap[f] || 0) + 1; }));
  const flows = Object.entries(flowMap).sort((a, b) => b[1] - a[1]);

  // top used coupons
  const topCoupons = [...coupons].sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0)).slice(0, 5);

  // expiring soon (within 7 days)
  const soon = coupons.filter(c => {
    if (!c.expiresAt || isExpired(c.expiresAt)) return false;
    return (new Date(c.expiresAt).getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000;
  });

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
      <RefreshCw size={22} className="animate-spin text-amber-400 mx-auto mb-2" />
      <p className="text-sm text-gray-400">Loading analytics…</p>
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <BarChart3 size={14} className="text-amber-600" />
          </div>
          <span className="text-sm font-bold text-gray-900">Coupon Analytics</span>
        </div>
        <button onClick={() => navigate("/marketing/campaigns")}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition">
          Manage Coupons <ArrowRight size={12} />
        </button>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Gift,        color: "#8b5cf6", bg: "#f5f3ff", value: coupons.length, label: "Total Coupons" },
          { icon: CheckCircle, color: "#10b981", bg: "#f0fdf4", value: active.length,  label: "Active" },
          { icon: TrendingUp,  color: "#3b82f6", bg: "#eff6ff", value: totalUses,      label: "Total Uses" },
          { icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2", value: nearLimit.length, label: "Near Limit" },
        ].map(({ icon: Icon, color, bg, value, label }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Status breakdown + Flow breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <Percent size={13} className="text-purple-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">Status Breakdown</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Active",   value: active.length,   color: "#10b981", bg: "#f0fdf4", pct: coupons.length ? Math.round(active.length / coupons.length * 100) : 0 },
              { label: "Inactive", value: inactive.length, color: "#6b7280", bg: "#f3f4f6", pct: coupons.length ? Math.round(inactive.length / coupons.length * 100) : 0 },
              { label: "Expired",  value: expired.length,  color: "#ef4444", bg: "#fef2f2", pct: coupons.length ? Math.round(expired.length / coupons.length * 100) : 0 },
            ].map(({ label, value, color, pct }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs font-semibold text-gray-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{value}</span>
                    <span className="text-xs text-gray-400">{pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
            {coupons.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No coupons yet</p>
            )}
          </div>
        </div>

        {/* Flow breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Tag size={13} className="text-blue-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">By Flow</span>
          </div>
          <div className="p-5">
            {flows.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No flow data</p>
            ) : (
              <div className="space-y-3">
                {flows.map(([flow, count]) => (
                  <div key={flow} className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold capitalize">{flow}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-400"
                          style={{ width: `${Math.round(count / coupons.length * 100)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Top used + Expiring soon ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top used coupons */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={13} className="text-green-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">Top Used Coupons</span>
          </div>
          <div className="divide-y divide-gray-50">
            {topCoupons.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No usage data</p>
            ) : topCoupons.map((c, i) => {
              const pct = c.usageLimit > 0 ? Math.min(100, Math.round(c.usedCount / c.usageLimit * 100)) : 0;
              return (
                <div key={c._id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-black text-gray-300 w-4">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 font-mono truncate">{c.code}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-1">
                        <div className="h-1 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: pct >= 90 ? "#ef4444" : "#8b5cf6" }} />
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{c.usedCount} uses</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.isActive ? "Active" : "Off"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiring soon */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <Calendar size={13} className="text-orange-500" />
              </div>
              <span className="text-sm font-bold text-gray-900">Expiring Soon</span>
            </div>
            {soon.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">{soon.length}</span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {soon.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-1">
                <CheckCircle size={24} className="text-green-300" />
                <p className="text-xs text-gray-400">No coupons expiring in 7 days</p>
              </div>
            ) : soon.map(c => {
              const daysLeft = Math.ceil((new Date(c.expiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={c._id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 font-mono truncate">{c.code}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(c.expiresAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${daysLeft <= 2 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
                    {daysLeft}d left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
