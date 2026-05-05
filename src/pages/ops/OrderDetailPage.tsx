import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertTriangle, Clock, Package, User, MapPin, CreditCard } from "lucide-react";
import staffService from "../../services/staff.service";

const statusColor: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", assigned_vendor: "#8b5cf6",
  in_production: "#f97316", ready: "#06b6d4", out_for_delivery: "#6366f1",
  delivered: "#16a34a", cancelled: "#ef4444",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await staffService.getOrderDetail(id!);
      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.message || "Failed to load order");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <RefreshCw size={24} className="animate-spin text-gray-400" />
    </div>
  );

  if (error) return (
    <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center">
      <AlertTriangle size={24} className="text-red-500 mx-auto mb-2" />
      <p className="text-sm font-semibold text-red-700">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-3 text-xs text-red-600 underline">Go back</button>
    </div>
  );

  if (!order) return null;

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition">
        <ArrowLeft size={15} /> Back to Queue
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-gray-400 mb-1">{order._id || order.id}</p>
            <h2 className="text-xl font-black text-gray-900">{order.orderNumber || `Order #${(order._id || "").slice(-6)}`}</h2>
            <p className="text-sm text-gray-500 mt-1">{order.flowType} · {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: (statusColor[order.status] || "#6b7280") + "20", color: statusColor[order.status] || "#6b7280" }}>
            {order.status?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Customer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <User size={15} className="text-gray-400" />
            <h3 className="font-bold text-gray-900 text-sm">Customer</h3>
          </div>
          <p className="text-sm font-semibold text-gray-800">{order.customerName || order.userId || "—"}</p>
          {order.customerPhone && <p className="text-xs text-gray-500 mt-1">{order.customerPhone}</p>}
          {order.customerEmail && <p className="text-xs text-gray-500">{order.customerEmail}</p>}
        </div>

        {/* Vendor */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Package size={15} className="text-gray-400" />
            <h3 className="font-bold text-gray-900 text-sm">Vendor</h3>
          </div>
          <p className="text-sm font-semibold text-gray-800">{order.vendorName || order.vendorId || "Not assigned"}</p>
          {order.storeId && <p className="text-xs text-gray-500 mt-1">Store: {order.storeId}</p>}
        </div>

        {/* Delivery */}
        {order.deliveryAddress && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-gray-400" />
              <h3 className="font-bold text-gray-900 text-sm">Delivery Address</h3>
            </div>
            <p className="text-sm text-gray-700">{order.deliveryAddress.line1}</p>
            {order.deliveryAddress.line2 && <p className="text-xs text-gray-500">{order.deliveryAddress.line2}</p>}
            <p className="text-xs text-gray-500">{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
          </div>
        )}

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={15} className="text-gray-400" />
            <h3 className="font-bold text-gray-900 text-sm">Payment</h3>
          </div>
          <p className="text-2xl font-black text-gray-900">₹{order.totalAmount || order.amount || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{order.paymentStatus || "—"} · {order.paymentMethod || "—"}</p>
        </div>
      </div>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                {item.thumbnail && (
                  <img src={item.thumbnail} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.unitPrice} each</p>
                </div>
                <p className="text-sm font-black text-gray-900">₹{item.totalPrice}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-gray-400" />
            <h3 className="font-bold text-gray-900 text-sm">Timeline</h3>
          </div>
          <div className="space-y-3">
            {order.timeline.map((event: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{event.status?.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-400">{new Date(event.timestamp || event.at).toLocaleString()}</p>
                  {event.note && <p className="text-xs text-gray-500 mt-0.5">{event.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hard boundary notice */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
        <p className="text-xs font-bold text-blue-700">
          <strong>Important:</strong> Operations staff can view order details but cannot cancel orders directly. 
          Use the "Reassign" or "Clarify" actions from the Order Queue page to manage orders.
        </p>
      </div>
    </div>
  );
}
