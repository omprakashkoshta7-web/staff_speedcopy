import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  HeadphonesIcon,
  DollarSign,
  TrendingUp,
  LogOut,
  Bell,
  BellOff,
  CheckCheck,
  ChevronDown,
  BookOpen,
  RotateCcw,
  Search,
  X,
  Lock,
  Circle,
} from "lucide-react";
import { useStaffRole } from "../../context/StaffContext";
import { notificationService, type PortalNotification } from "../../services/notification.service";

type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  roles: string[];
};

type NavGroup = {
  label: string;
  roles: string[];
  items: NavItem[];
};

const allNavGroups: NavGroup[] = [
  {
    label: "Overview",
    roles: ["ops", "support", "finance", "marketing"],
    items: [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["ops", "support", "finance", "marketing"] }],
  },
  {
    label: "Operations",
    roles: ["ops"],
    items: [{ to: "/ops/orders", icon: ClipboardList, label: "Order Queue", roles: ["ops"] }],
  },
  {
    label: "Support",
    roles: ["support"],
    items: [
      { to: "/support/tickets", icon: HeadphonesIcon, label: "Ticket Queue", roles: ["support"] },
      { to: "/support/vendor-tickets", icon: HeadphonesIcon, label: "Vendor Tickets", roles: ["support"] },
    ],
  },
  {
    label: "Finance",
    roles: ["finance"],
    items: [
      { to: "/finance/refunds", icon: RotateCcw, label: "Refund Queue", roles: ["finance"] },
      { to: "/finance/ledger", icon: BookOpen, label: "Ledger View", roles: ["finance"] },
      { to: "/finance/payouts", icon: DollarSign, label: "Payout Assist", roles: ["finance"] },
    ],
  },
  {
    label: "Marketing",
    roles: ["marketing"],
    items: [{ to: "/marketing/campaigns", icon: TrendingUp, label: "Campaigns", roles: ["marketing"] }],
  },
  {
    label: "Account",
    roles: ["ops", "support", "finance", "marketing"],
    items: [{ to: "/sessions", icon: Lock, label: "Sessions", roles: ["ops", "support", "finance", "marketing"] }],
  },
];

const pageMeta: Record<string, { title: string; caption: string }> = {
  "/dashboard": { title: "Dashboard", caption: "Track your queue, tickets, finance tasks, and campaign flow in one place." },
  "/profile": { title: "Profile", caption: "View and manage your staff account details and settings." },
  "/ops/orders": { title: "Order Queue", caption: "Watch assignments, escalations, and turnaround pressure." },
  "/support/tickets": { title: "Ticket Queue", caption: "Handle customer issues while keeping SLA targets visible." },
  "/support/vendor-tickets": { title: "Vendor Tickets", caption: "Manage vendor-facing issues and response history." },
  "/finance/refunds": { title: "Refund Queue", caption: "Review refund requests and escalation thresholds." },
  "/finance/ledger": { title: "Ledger View", caption: "Inspect entries, filters, and staff-safe ledger detail." },
  "/finance/payouts": { title: "Payout Assist", caption: "Coordinate payout support tasks without direct finance edits." },
  "/marketing/campaigns": { title: "Campaigns", caption: "Keep offers, approvals, and status updates organized." },
  "/sessions": { title: "Session Monitoring", caption: "View and manage your active sessions. Kill suspicious sessions immediately." },
};

const roleLabels: Record<string, string> = {
  ops: "Ops Staff",
  support: "Support Staff",
  finance: "Finance Staff",
  marketing: "Marketing Staff",
};

export default function StaffLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { role, user, logout } = useStaffRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const page = pageMeta[pathname] || { title: "Staff Portal", caption: "Manage daily staff workflows in a unified workspace." };

  const visibleGroups = allNavGroups
    .filter((group) => group.roles.includes(role))
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);

  const navItems = visibleGroups.flatMap((group) => group.items);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate based on role
      if (role === "ops") {
        navigate(`/ops/orders?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (role === "support") {
        navigate(`/support/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const [summary, recent] = await Promise.all([
          notificationService.getSummary(),
          notificationService.getRecent(),
        ]);
        if (!active) return;
        setUnreadCount(summary.data.unread_count || 0);
        setNotifications(recent.data.notifications || []);
      } catch {
        if (!active) return;
        setUnreadCount(0);
        setNotifications([]);
      }
    };
    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  const handleMarkAsRead = async (id: string) => {
    if (markingId) return;
    try {
      setMarkingId(id);
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silently ignore */ } finally { setMarkingId(null); }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll) return;
    try {
      setMarkingAll(true);
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silently ignore */ } finally { setMarkingAll(false); }
  };

  const formatTimestamp = (value?: string) =>
    value
      ? new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
      : "";

  return (
    <div className="staff-app-shell h-screen overflow-hidden p-3 sm:p-4">
      <div className="staff-frame flex h-[calc(100vh-1.5rem)] overflow-hidden rounded-[34px]">
        <aside className="staff-sidebar hidden w-[236px] flex-shrink-0 lg:flex lg:flex-col h-full overflow-y-auto">
          <div className="px-5 pb-6 pt-8">
            <div className="flex items-center gap-2">
              <h1 className="text-[2.2rem] font-black lowercase leading-none tracking-tight text-white">
                SpeedCopy
              </h1>
            </div>
            <p className="mt-2 pl-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/50">
              Staff portal
            </p>
          </div>

          <div className="mx-5 h-px bg-violet-200/30" />

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-5">
              {visibleGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">{group.label}</p>
                  <div className="space-y-1">
                    {group.items.map(({ to, icon: IconComponent, label }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                            isActive ? "staff-nav-active" : "staff-nav-idle hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        <IconComponent size={15} />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="px-4 pb-6">
            <div className="mb-3 rounded-2xl bg-white/5 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-white truncate">{user?.name || roleLabels[role] || role}</p>
              <p className="text-[11px] text-white/40 truncate mt-0.5">{user?.email || ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.35)',
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <div className="staff-content-shell flex min-w-0 flex-1 flex-col overflow-hidden h-full">
          <header className="staff-topbar flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-500/80">Staff Workspace</p>
              <h1 className="text-[2.15rem] font-black tracking-tight text-slate-900">{page.title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">{page.caption}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form onSubmit={handleSearch} className="relative min-w-[220px] flex-1 sm:w-[320px]">
                <Search size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-violet-500" />
                <input 
                  className="staff-search-input w-full rounded-full border-0 px-5 py-3 pr-11 text-sm" 
                  placeholder="Search orders, tickets, payouts" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="relative" ref={notifRef}>
                  <button
                    className="relative hidden md:flex h-9 w-9 items-center justify-center rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                    style={{
                      background: 'radial-gradient(circle at top, rgba(255, 255, 255, 0.04), transparent 24%), linear-gradient(180deg, #1a2332 0%, #141c28 100%)'
                    }}
                    onClick={() => setShowNotifications(v => !v)}
                    title="Notifications"
                  >
                    <Bell size={16} className="text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 min-w-[16px] h-4 rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white border border-white text-center">
                        {Math.min(unreadCount, 99)}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-[360px] rounded-2xl bg-white shadow-2xl border border-slate-100 z-50 overflow-hidden">

                      {/* ── Header ── */}
                      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Bell size={15} className="text-slate-700" />
                          <span className="text-sm font-bold text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              disabled={markingAll}
                              title="Mark all as read"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-violet-600 hover:bg-violet-50 transition disabled:opacity-50"
                            >
                              <CheckCheck size={13} />
                              {markingAll ? "Marking…" : "Mark all read"}
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                          >
                            <X size={14} className="text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {/* ── List ── */}
                      {notifications.length > 0 ? (
                        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                          {notifications.map(n => (
                            <div
                              key={n._id}
                              className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
                                n.isRead ? "bg-white hover:bg-slate-50" : "bg-violet-50/40 hover:bg-violet-50/70"
                              }`}
                            >
                              {/* Unread dot */}
                              <div className="mt-1.5 flex-shrink-0">
                                {n.isRead
                                  ? <Circle size={8} className="text-slate-200 fill-slate-200" />
                                  : <Circle size={8} className="text-violet-500 fill-violet-500" />
                                }
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${n.isRead ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}>
                                  {n.title}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                                  {n.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    {n.category}
                                  </span>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-[10px] text-slate-400">
                                    {formatTimestamp(n.createdAt)}
                                  </span>
                                </div>
                              </div>

                              {/* Mark as read btn — only for unread */}
                              {!n.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(n._id)}
                                  disabled={markingId === n._id}
                                  title="Mark as read"
                                  className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg hover:bg-violet-100 transition disabled:opacity-40"
                                >
                                  <CheckCheck size={13} className="text-violet-500" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                            <BellOff size={20} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700">All caught up</p>
                          <p className="text-xs text-slate-400 mt-1">No notifications right now.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    className="staff-profile-chip"
                    onClick={() => navigate('/profile')}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white overflow-hidden" style={{ background: 'radial-gradient(circle at top, rgba(255, 255, 255, 0.04), transparent 24%), linear-gradient(180deg, #1a2332 0%, #141c28 100%)' }}>
                      S
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-semibold text-slate-700">{user?.name || "Staff Member"}</p>
                      <p className="text-xs text-slate-400">{user?.email || roleLabels[role] || role}</p>
                    </div>
                    <ChevronDown size={13} className="text-violet-500" />
                  </button>


                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.14)]"
                        : "bg-white/85 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </header>

          <main className="staff-main flex-1 overflow-y-auto px-6 pb-5 pt-7 sm:px-10 sm:pb-7 sm:pt-8 lg:px-14 lg:pt-9">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
