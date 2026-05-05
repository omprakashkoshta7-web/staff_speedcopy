import { useNavigate } from "react-router-dom";
import {
  ClipboardList, TrendingUp, AlertTriangle, Clock,
  CheckCircle, Package, Users, RefreshCw,
  ArrowRight, Zap, ShoppingCart, Activity,
  ChevronRight, Circle,
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
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.ops;
  const RoleIcon = ROLE_ICON[role] || Activity;

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setError("");
    try {
      const promises: Promise<any>[] = [staffService.getDashboard(role)];
      if (role === "ops") promises.push(staffService.getOrderQueue().catch(() => ({ success: false, data: [] })));
      const [dashResult, ordersResult] = await Promise.all(promises);

      if (dashResult?.success && dashResult?.data) {
        setDashData({
          kpis:   Array.isArray(dashResult.data.kpis)   ? dashResult.data.kpis   : [],
          tasks:  Array.isArray(dashResult.data.tasks)  ? dashResult.data.tasks  : [],
          alerts: Array.isArray(dashResult.data.alerts) ? dashResult.data.alerts : [],
        });
      } else {
        setError(dashResult?.message || "Dashboard data unavailable");
      }

      if (role === "ops" && ordersResult?.success) {
        const orders: any[] = Array.isArray(ordersResult.data) ? ordersResult.data : [];
        setOrderStats({
          total:    orders.length,
          critical: orders.filter((o: any) => o.risk === "critical").length,
          pending:  orders.filter((o: any) => o.rawStatus === "pending" || o.rawStatus === "assigned_vendor").length,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
    } finally { setLoading(false); setRefreshing(false); }
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
