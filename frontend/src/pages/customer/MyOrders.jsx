import { useState, useEffect } from "react";
import { orderAPI } from "../../services/api";
import { Skeleton, EmptyState, StatusBadge, Button } from "../../components/ui";
import Navbar from "../../components/layout/Navbar";
import { Link } from "react-router-dom";
import { RefreshCw, ChevronDown, ChevronUp, Clock } from "lucide-react";

const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready", "dispatched", "completed"];

function OrderTimeline({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  const cancelled = status === "cancelled";
  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1 shrink-0">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            cancelled ? "bg-red-300" : i <= idx ? "bg-brand-500" : "bg-gray-200"
          }`} />
          <span className={`text-[9px] capitalize ${i <= idx && !cancelled ? "text-brand-500 font-medium" : "text-gray-300"}`}>{s}</span>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`w-4 h-px ${i < idx && !cancelled ? "bg-brand-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const canCancel = ["pending", "confirmed"].includes(order.status);

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
            <span className={`badge-${order.status}`}>{order.status}</span>
          </div>
          <p className="font-semibold text-charcoal capitalize">{order.type} Order</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Clock size={10} /> {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-brand-600 text-lg">₹{order.total.toFixed(0)}</p>
          <p className="text-xs text-gray-400">{order.paymentMethod}</p>
        </div>
      </div>

      {order.status !== "cancelled" && <OrderTimeline status={order.status} />}

      {order.estimatedTime && order.status === "preparing" && (
        <div className="bg-brand-50 rounded-xl px-3 py-2 text-xs text-brand-600 font-medium flex items-center gap-1.5">
          ⏱️ Estimated ready in ~{order.estimatedTime} minutes
        </div>
      )}

      {/* Items summary */}
      <button className="w-full flex items-center justify-between text-sm font-medium text-gray-500 hover:text-gray-700"
        onClick={() => setExpanded(!expanded)}>
        <span>{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {expanded && (
        <div className="space-y-2 pt-1 border-t border-gray-50">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
              <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="border-t border-gray-50 pt-2 flex justify-between text-xs text-gray-400">
            <span>Tax (5%)</span><span>₹{order.tax?.toFixed(2)}</span>
          </div>
          {order.specialInstructions && (
            <p className="text-xs text-gray-400 italic">📝 "{order.specialInstructions}"</p>
          )}
        </div>
      )}

      {canCancel && (
        <button onClick={() => onCancel(order._id)}
          className="text-xs text-red-400 hover:text-red-500 transition-colors font-medium">
          Cancel order
        </button>
      )}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getMyOrders({ page: p, limit: 10 });
      const fetched = data.data.orders || [];
      setOrders(p === 1 ? fetched : (prev) => [...prev, ...fetched]);
      setHasMore(data.data.pagination?.pages > p);
      setPage(p);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(1); }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await orderAPI.cancel(id);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: "cancelled" } : o));
    } catch { }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="page-container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-charcoal">My Orders</h1>
            <p className="text-gray-400 text-sm mt-1">Track and manage your orders</p>
          </div>
          <button onClick={() => fetchOrders(1)} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading && page === 1 ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}</div>
        ) : orders.length === 0 ? (
          <EmptyState icon="🧾" title="No orders yet"
            description="When you place an order, it will appear here."
            action={<Link to="/menu" className="btn-primary">Browse Menu</Link>} />
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} onCancel={handleCancel} />
            ))}
            {hasMore && (
              <div className="text-center">
                <Button variant="secondary" onClick={() => fetchOrders(page + 1)} loading={loading}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
