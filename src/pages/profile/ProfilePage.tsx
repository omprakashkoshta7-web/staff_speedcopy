import { useState, useEffect } from "react";
import {
  User, Mail, Shield, Calendar, LogOut,
  RefreshCw, CheckCircle, Lock, Building2,
  UserCheck, Key, ChevronRight, Circle,
} from "lucide-react";
import { useStaffRole } from "../../context/StaffContext";
import { useNavigate } from "react-router-dom";
import staffService from "../../services/staff.service";

const ROLE_LABELS: Record<string, string> = {
  ops: "Operations Staff", support: "Support Staff",
  finance: "Finance Staff", marketing: "Marketing Staff", admin: "Admin",
};
const ROLE_STYLE: Record<string, { bg: string; color: string; accent: string }> = {
  ops:       { bg: "#eff6ff", color: "#3b82f6", accent: "#1d4ed8" },
  support:   { bg: "#f5f3ff", color: "#8b5cf6", accent: "#6d28d9" },
  finance:   { bg: "#f0fdf4", color: "#10b981", accent: "#047857" },
  marketing: { bg: "#fffbeb", color: "#f59e0b", accent: "#b45309" },
  admin:     { bg: "#fef2f2", color: "#ef4444", accent: "#b91c1c" },
};

type ProfileData = {
  id: string;
  fullName: string;
  emailAddress: string;
  role: string;
  roleLabel: string;
  team: string;
  accessLevel: string;
  permissions: string[];
  memberSince: string;
  lastLogin: string | null;
  status: string;
  mfaEnabled: boolean;
  department: string;
  manager: string;
};

export default function ProfilePage() {
  const { user, role, logout } = useStaffRole();
  const navigate = useNavigate();

  const [profile,    setProfile]    = useState<ProfileData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  const rs = ROLE_STYLE[role] || ROLE_STYLE.ops;

  /* ── Load profile ── */
  const loadProfile = async () => {
    try {
      setLoading(true);
      // GET /api/staff/profile → { success, data: { id, fullName, emailAddress, role, roleLabel,
      //   team, accessLevel, permissions, memberSince, lastLogin, status, mfaEnabled, department, manager } }
      const r = await staffService.getMyProfile();
      if (r.success && r.data) {
        setProfile(r.data);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadProfile(); }, []);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const displayName  = profile?.fullName     || user?.name  || "Staff Member";
  const displayEmail = profile?.emailAddress || user?.email || "—";
  const displayRole  = profile?.roleLabel    || ROLE_LABELS[role] || role;
  const initials     = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: rs.bg }}>
            <User size={17} style={{ color: rs.color }} />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">My Profile</p>
            <p className="text-xs text-gray-400">{displayEmail}</p>
          </div>
        </div>
        <button onClick={() => void loadProfile()} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ══ PROFILE HEADER ══ */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2" style={{ color: rs.color }} />
          <p className="text-sm text-gray-400">Loading profile…</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${rs.accent} 0%, ${rs.color} 100%)` }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-gray-900">{displayName}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{displayEmail}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                  profile?.status === "active"   ? "bg-green-50 text-green-700" :
                  profile?.status === "inactive" ? "bg-gray-100 text-gray-600"  :
                                                   "bg-red-50 text-red-600"
                }`}>
                  {profile?.status || "active"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: rs.bg, color: rs.color }}>
                  <Shield size={11} />{displayRole}
                </span>
                {profile?.mfaEnabled && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700">
                    <Lock size={11} /> MFA Enabled
                  </span>
                )}
                {profile?.accessLevel && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                    {profile.accessLevel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ ACCOUNT DETAILS ══ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center px-6 py-4 border-b border-gray-100 gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: rs.bg }}>
            <User size={14} style={{ color: rs.color }} />
          </div>
          <span className="text-sm font-bold text-gray-900">Account Details</span>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { icon: User,      bg: "#eff6ff", ic: "#3b82f6", label: "Full Name",    value: displayName },
            { icon: Mail,      bg: "#f5f3ff", ic: "#8b5cf6", label: "Email Address",value: displayEmail },
            { icon: Shield,    bg: rs.bg,     ic: rs.color,  label: "Role",         value: displayRole },
            { icon: Building2, bg: "#f0fdf4", ic: "#10b981", label: "Department",   value: profile?.department   || "" },
            { icon: UserCheck, bg: "#fffbeb", ic: "#f59e0b", label: "Manager",      value: profile?.manager      || "" },
            { icon: Calendar,  bg: "#f0fdf4", ic: "#10b981", label: "Member Since", value: fmt(profile?.memberSince) },
            { icon: Calendar,  bg: "#eff6ff", ic: "#3b82f6", label: "Last Login",   value: fmt(profile?.lastLogin) },
          ].filter(({ value }) => value && value !== "—")
           .map(({ icon: Icon, bg, ic, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={15} style={{ color: ic }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PERMISSIONS ══ */}
      {profile?.permissions && profile.permissions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                <Key size={14} className="text-purple-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Permissions</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
              {profile.permissions.length}
            </span>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {profile.permissions.map(p => (
                <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs font-mono font-semibold text-gray-600">
                  <CheckCircle size={10} className="text-green-500" />{p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ QUICK ACTIONS ══ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Quick Actions</p>
        </div>
        <div className="p-4 space-y-2">
          <button onClick={() => navigate("/sessions")}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition text-left group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Shield size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Manage Sessions</p>
                <p className="text-xs text-gray-500 mt-0.5">View and control active sessions</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition" />
          </button>

          <button onClick={() => setShowLogout(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-100 hover:border-red-300 hover:bg-red-50 transition text-left group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <LogOut size={15} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">Logout</p>
                <p className="text-xs text-red-400 mt-0.5">Sign out from your account</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-red-200 group-hover:text-red-400 transition" />
          </button>
        </div>
      </div>

      {/* ══ NOTICE ══ */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <Circle size={8} className="mt-1 flex-shrink-0 fill-blue-400 text-blue-400" />
        <p className="text-xs font-semibold text-blue-700">
          Profile changes require admin approval. Contact your admin to update name, email, role, or department.
        </p>
      </div>

      {/* ══ LOGOUT MODAL ══ */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
              <LogOut size={22} className="text-red-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg text-center mb-2">Confirm Logout</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
