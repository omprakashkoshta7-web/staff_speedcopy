import { useState, useEffect } from "react";
import { Monitor, Trash2, RefreshCw, Shield, Clock, MapPin, Wifi, CheckCircle, Circle, Smartphone, Globe, Calendar } from "lucide-react";
import staffService from "../../services/staff.service";
import { useStaffRole } from "../../context/StaffContext";

type Session = {
  id: string;
  device?: string;
  ip?: string;
  location?: string;
  lastActive?: string;
  createdAt?: string;
  current?: boolean;
};

const getDeviceIcon = (device?: string) => {
  if (!device) return Monitor;
  const d = device.toLowerCase();
  if (d.includes("mobile") || d.includes("ios") || d.includes("android") || d.includes("iphone")) return Smartphone;
  if (d.includes("safari") || d.includes("chrome") || d.includes("firefox") || d.includes("edge")) return Globe;
  return Monitor;
};

export default function SessionPage() {
  const { user } = useStaffRole();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [killing,  setKilling]  = useState<string | null>(null);
  const [killErr,  setKillErr]  = useState("");

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const result = await staffService.getSessions();
      if (result.success && result.data) {
        setSessions(Array.isArray(result.data) ? result.data : result.data.sessions || []);
      } else {
        setSessions([]);
      }
    } catch { setSessions([]); }
    finally { setLoading(false); }
  };

  const killSession = async (sessionId: string) => {
    try {
      setKilling(sessionId); setKillErr("");
      await staffService.killSession(sessionId);
      setSessions(p => p.filter(s => s.id !== sessionId));
    } catch (err: any) {
      setKillErr(err?.message || "Failed to terminate session");
    } finally { setKilling(null); }
  };

  const fmt = (val?: string) =>
    val ? new Date(val).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

  const fmtDate = (val?: string) =>
    val ? new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const activeCount  = sessions.filter(s => !s.current).length;

  return (
    <div className="space-y-5">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield size={17} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Session Monitoring</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button onClick={fetchSessions} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition text-sm font-semibold text-gray-600 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ══ KPI CARDS ══ */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Monitor,     color: "#3b82f6", bg: "#eff6ff", value: sessions.length,  label: "Total Sessions",  sub: "All devices" },
            { icon: CheckCircle, color: "#10b981", bg: "#f0fdf4", value: 1,                label: "Current Session", sub: "This device" },
            { icon: Wifi,        color: "#f59e0b", bg: "#fffbeb", value: activeCount,      label: "Other Sessions",  sub: "Can be terminated" },
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
      {killErr && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
          <Circle size={8} className="mt-1 flex-shrink-0 fill-red-400 text-red-400" />
          <p className="text-xs font-semibold text-red-700">{killErr}</p>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-blue-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading sessions…</p>
        </div>
      )}

      {/* ══ EMPTY ══ */}
      {!loading && sessions.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Monitor size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">No active sessions found</p>
          <p className="text-xs text-gray-300 mt-1">Sessions will appear here once you log in from a device</p>
        </div>
      )}

      {/* ══ SESSIONS TABLE ══ */}
      {!loading && sessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Monitor size={14} className="text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-900">Active Sessions</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {sessions.length}
            </span>
          </div>

          {/* Column headers */}
          <div className="hidden md:grid px-6 py-3 border-b border-gray-100 bg-gray-50/60"
            style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {["Device", "IP Address", "Location", "Last Active", "Action"].map((h, i) => (
              <span key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {sessions.map(session => {
              const DevIcon = getDeviceIcon(session.device);
              return (
                <div key={session.id}
                  className={`hover:bg-gray-50/40 transition ${session.current ? "bg-blue-50/20" : ""}`}>

                  {/* Desktop row */}
                  <div className="hidden md:grid items-center px-6 py-4"
                    style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>

                    {/* Device */}
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${session.current ? "bg-blue-100" : "bg-gray-100"}`}>
                        <DevIcon size={14} className={session.current ? "text-blue-600" : "text-gray-500"} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.device || "Unknown Device"}</p>
                        {session.current && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Current</span>
                        )}
                      </div>
                    </div>

                    {/* IP */}
                    <div className="flex items-center gap-1.5 pr-4">
                      <Wifi size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 font-mono truncate">{session.ip || "—"}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 pr-4">
                      <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 truncate">{session.location || "—"}</span>
                    </div>

                    {/* Last Active */}
                    <div className="flex items-center gap-1.5 pr-4">
                      <Clock size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{fmt(session.lastActive)}</span>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end">
                      {session.current ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                          <CheckCircle size={13} /> Active
                        </span>
                      ) : (
                        <button onClick={() => killSession(session.id)} disabled={killing === session.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition disabled:opacity-60 whitespace-nowrap">
                          <Trash2 size={12} />
                          {killing === session.id ? "Terminating…" : "Terminate"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${session.current ? "bg-blue-100" : "bg-gray-100"}`}>
                          <DevIcon size={16} className={session.current ? "text-blue-600" : "text-gray-500"} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-900 truncate">{session.device || "Unknown Device"}</p>
                            {session.current && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Current</span>
                            )}
                          </div>
                          {session.ip && (
                            <p className="text-xs text-gray-500 mt-0.5 font-mono">{session.ip}</p>
                          )}
                        </div>
                      </div>
                      {!session.current && (
                        <button onClick={() => killSession(session.id)} disabled={killing === session.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition disabled:opacity-60 flex-shrink-0">
                          <Trash2 size={12} />
                          {killing === session.id ? "…" : "Terminate"}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {session.location && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin size={11} className="text-gray-400" />
                          {session.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={11} className="text-gray-400" />
                        {fmt(session.lastActive)}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Calendar size={11} />
                        Since {fmtDate(session.createdAt)}
                      </div>
                    </div>
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
          All session activity is permanently logged for security audit. Terminate any session you don't recognise immediately.
        </p>
      </div>
    </div>
  );
}
