import { useState, useEffect } from "react";
import {
  Gift, Plus, X, RefreshCw, CheckCircle, AlertTriangle,
  Percent, DollarSign, Tag, TrendingUp, Search, Calendar,
} from "lucide-react";
import staffService from "../../services/staff.service";

type Coupon = {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  applicableFlows?: string[];
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
};

type CouponForm = {
  code: string;
  description: string;
  discountType: "percentage" | "flat";
  discountValue: string;
  maxDiscount: string;
  minOrderValue: string;
  applicableFlows: string[];
  usageLimit: string;
  perUserLimit: string;
  isActive: boolean;
  expiresAt: string;
};

const EMPTY_FORM: CouponForm = {
  code: "", description: "", discountType: "percentage",
  discountValue: "", maxDiscount: "", minOrderValue: "",
  applicableFlows: [], usageLimit: "", perUserLimit: "1",
  isActive: true, expiresAt: "",
};

const FLOWS = ["printing", "gifting", "shopping"];

export default function CampaignsPage() {
  const [coupons,      setCoupons]      = useState<Coupon[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [form,         setForm]         = useState<CouponForm>(EMPTY_FORM);

  // GET /api/staff/coupons?page=1&limit=50
  const fetchCoupons = async () => {
    try {
      setLoading(true); setError("");
      const r = await staffService.getCoupons({
        isActive: filterActive,
        search: searchTerm || undefined,
        page: 1,
        limit: 50,
      });
      // handle { success, data: { coupons: [] } } or { success, data: [] }
      const list = r?.data?.coupons ?? r?.data ?? r?.coupons ?? [];
      setCoupons(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load coupons");
      setCoupons([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { void fetchCoupons(); }, [filterActive, searchTerm]);

  // POST /api/staff/coupons
  const handleCreate = async () => {
    if (!form.code || !form.discountValue) return;
    setSaving(true); setError("");
    try {
      const payload: any = {
        code: form.code.toUpperCase().trim(),
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
        minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : undefined,
        applicableFlows: form.applicableFlows.length > 0 ? form.applicableFlows : undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : 0,
        perUserLimit: parseInt(form.perUserLimit) || 1,
        isActive: form.isActive,
        expiresAt: form.expiresAt || undefined,
      };
      const r = await staffService.createCoupon(payload);
      if (r.success === false) {
        setError(r.message || "Failed to create coupon");
        return;
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      void fetchCoupons();
    } catch (e: any) {
      setError(e?.message || "Failed to create coupon");
    } finally { setSaving(false); }
  };

  const toggleFlow = (flow: string) =>
    setForm(p => ({
      ...p,
      applicableFlows: p.applicableFlows.includes(flow)
        ? p.applicableFlows.filter(f => f !== flow)
        : [...p.applicableFlows, flow],
    }));

  const isExpired = (expiresAt?: string) =>
    !!expiresAt && new Date(expiresAt) < new Date();

  const formatDiscount = (c: Coupon) =>
    c.discountType === "percentage"
      ? `${c.discountValue}% off${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`
      : `₹${c.discountValue} off`;

  const activeCoupons = coupons.filter(c => c.isActive && !isExpired(c.expiresAt));
  const totalUsed     = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);

  return (
    <div className="space-y-5">

      {/* ══ TOOLBAR ══ */}
      <div className="flex items-center justify-between">
        <button onClick={() => void fetchCoupons()} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-900 transition text-sm font-semibold disabled:opacity-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
        <button onClick={() => { setForm(EMPTY_FORM); setError(""); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition">
          <Plus size={15} /> New Coupon
        </button>
      </div>

      {/* ══ KPI CARDS ══ */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Gift,        color: "#8b5cf6", bg: "#f5f3ff", value: coupons.length,       label: "Total Coupons" },
          { icon: CheckCircle, color: "#10b981", bg: "#f0fdf4", value: activeCoupons.length, label: "Active" },
          { icon: TrendingUp,  color: "#3b82f6", bg: "#eff6ff", value: totalUsed,            label: "Total Uses" },
        ].map(({ icon: Icon, color, bg, value, label }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ══ ERROR ══ */}
      {error && !showModal && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* ══ FILTERS ══ */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by code…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
        </div>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {([["all", undefined], ["active", true], ["inactive", false]] as const).map(([label, val]) => (
            <button key={label} onClick={() => setFilterActive(val)}
              className="rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition"
              style={filterActive === val ? { backgroundColor: "#111827", color: "#fff" } : { color: "#6b7280" }}>
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 font-semibold">{coupons.length} coupons</span>
      </div>

      {/* ══ LOADING / EMPTY ══ */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <RefreshCw size={28} className="animate-spin text-purple-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading coupons…</p>
        </div>
      )}
      {!loading && coupons.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Gift size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">No coupons found</p>
          <p className="text-xs text-gray-400 mt-1">Create your first coupon to get started</p>
        </div>
      )}

      {/* ══ COUPON LIST ══ */}
      {!loading && coupons.length > 0 && (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {coupons.map(coupon => {
            const expired   = isExpired(coupon.expiresAt);
            const usagePct  = coupon.usageLimit > 0
              ? Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100))
              : 0;

            return (
              <div key={coupon._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Gift size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-black text-gray-900 font-mono">{coupon.code}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        expired          ? "bg-red-50 text-red-700"   :
                        coupon.isActive  ? "bg-green-50 text-green-700" :
                                           "bg-gray-100 text-gray-600"
                      }`}>
                        {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {coupon.description && (
                      <p className="text-xs text-gray-500 mb-2">{coupon.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Percent size={12} className="text-gray-400" />
                        {formatDiscount(coupon)}
                      </span>
                      {coupon.minOrderValue && coupon.minOrderValue > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} className="text-gray-400" />
                          Min ₹{coupon.minOrderValue}
                        </span>
                      )}
                      {coupon.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Usage bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[120px]">
                        <div className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${usagePct}%`,
                            backgroundColor: usagePct >= 90 ? "#ef4444" : "#8b5cf6",
                          }} />
                      </div>
                      <span className="text-xs text-gray-500">
                        {coupon.usedCount}/{coupon.usageLimit || "∞"} uses
                      </span>
                    </div>

                    {coupon.applicableFlows && coupon.applicableFlows.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag size={11} className="text-gray-400" />
                        {coupon.applicableFlows.map(f => (
                          <span key={f} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium capitalize">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ CREATE MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">Create Coupon</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle size={13} /> {error}
              </div>
            )}

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Coupon Code *</label>
                <input value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER20"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition font-mono" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description" rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Discount Type *</label>
                  <select value={form.discountType}
                    onChange={e => setForm(p => ({ ...p, discountType: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Value *</label>
                  <input type="number" value={form.discountValue}
                    onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))}
                    placeholder={form.discountType === "percentage" ? "20" : "100"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscount}
                    onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))}
                    placeholder="0 = no cap"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Min Order (₹)</label>
                  <input type="number" value={form.minOrderValue}
                    onChange={e => setForm(p => ({ ...p, minOrderValue: e.target.value }))}
                    placeholder="0 = no minimum"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Applicable Flows</label>
                <div className="flex gap-2">
                  {FLOWS.map(flow => (
                    <button key={flow} type="button" onClick={() => toggleFlow(flow)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition"
                      style={form.applicableFlows.includes(flow)
                        ? { backgroundColor: "#1e293b", color: "#fff" }
                        : { backgroundColor: "#f1f5f9", color: "#6b7280" }}>
                      {flow}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave empty = all flows</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Total Usage Limit</label>
                  <input type="number" value={form.usageLimit}
                    onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))}
                    placeholder="0 = unlimited"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Per User Limit</label>
                  <input type="number" value={form.perUserLimit}
                    onChange={e => setForm(p => ({ ...p, perUserLimit: e.target.value }))}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Expiry Date</label>
                <input type="date" value={form.expiresAt}
                  onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm font-semibold text-gray-700">Active — users can apply this coupon</span>
              </label>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={() => void handleCreate()}
                disabled={!form.code || !form.discountValue || saving}
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                {saving ? "Creating…" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
