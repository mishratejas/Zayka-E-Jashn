import { useState, useEffect, useCallback } from "react";
import { orderAPI, chefAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge, StatCard, EmptyState } from "../../components/ui";
import Navbar from "../../components/layout/Navbar";
import { RefreshCw, ChefHat, Clock, CheckCircle, Package } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_ACTIONS = {
  pending:   { next: "confirmed",  label: "Confirm",  color: "bg-blue-500 hover:bg-blue-600" },
  confirmed: { next: "preparing",  label: "Start Cooking", color: "bg-orange-500 hover:bg-orange-600" },
  preparing: { next: "ready",      label: "Mark Ready", color: "bg-green-500 hover:bg-green-600" },
  ready:     { next: "dispatched", label: "Dispatch",  color: "bg-purple-500 hover:bg-purple-600" },
  dispatched:{ next: "completed",  label: "Complete",  color: "bg-emerald-500 hover:bg-emerald-600" },
};

function OrderCard({ order, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);
  const action = STATUS_ACTIONS[order.status];

  const handleUpdate = async () => {
    if (!action) return;
    setUpdating(true);
    try {
      await orderAPI.updateStatus(order._id, action.next);
      onStatusUpdate(order._id, action.next);
      toast.success(`Order marked as ${action.next}`);
    } catch { } finally { setUpdating(false); }
  };

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  return (
    <div className={`card p-5 border-l-4 ${
      order.status === "pending"   ? "border-l-yellow-400" :
      order.status === "confirmed" ? "border-l-blue-400" :
      order.status === "preparing" ? "border-l-orange-400" :
      order.status === "ready"     ? "border-l-green-400" :
      "border-l-gray-300"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
            <span className={`badge-${order.status}`}>{order.status}</span>
          </div>
          <p className="font-semibold text-charcoal capitalize">{order.type}</p>
          {order.tableNumber && <p className="text-xs text-gray-400">Table: {order.tableNumber}</p>}
          <p className="text-xs text-gray-400 mt-0.5">{order.customerName} • {timeAgo(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-brand-600">₹{order.total.toFixed(0)}</p>
          <p className="text-xs text-gray-400">{order.paymentMethod}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-700">{item.name}</span>
            <span className="font-medium text-gray-500">×{item.quantity}</span>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mb-3">
          📝 {order.specialInstructions}
        </p>
      )}

      {action && (
        <button onClick={handleUpdate} disabled={updating}
          className={`w-full py-2 rounded-xl text-white text-sm font-semibold ${action.color} transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}>
          {updating && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {action.label}
        </button>
      )}
      {!action && order.status === "completed" && (
        <div className="flex items-center justify-center gap-2 text-emerald-500 text-sm font-medium">
          <CheckCircle size={15} /> Order Complete
        </div>
      )}
    </div>
  );
}

export default function ChefDashboard() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("active");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, dashRes] = await Promise.all([
        orderAPI.getAll({ status: filter === "active" ? undefined : filter }),
        chefAPI.getDashboard(),
      ]);
      setOrders(ordersRes.data.data.orders || []);
      setStats(dashRes.data.data.stats);
    } catch { } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStatusUpdate = (id, newStatus) => {
    setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: newStatus } : o));
  };

  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
  const displayOrders = filter === "active" ? activeOrders : orders;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
                <ChefHat size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-charcoal">Chef Dashboard</h1>
                <p className="text-xs text-gray-400">Welcome, Chef {user?.name}</p>
              </div>
            </div>
          </div>
          <button onClick={fetchData} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Today's Orders" value={stats.todayOrders} icon="📋" color="brand" />
            <StatCard label="Active"          value={stats.activeOrders} icon="🔥" color="red" />
            <StatCard label="Completed"       value={stats.completedOrders} icon="✅" color="green" />
          </div>
        )}

        {/* Active alert */}
        {activeOrders.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-6 flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <p className="text-sm text-amber-700 font-medium">
              {activeOrders.length} active order{activeOrders.length !== 1 ? "s" : ""} need your attention!
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[["active", "Active", "🔥"], ["all", "All Orders", "📋"], ["completed", "Completed", "✅"]].map(([v, l, e]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === v ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}>
              {e} {l}
            </button>
          ))}
        </div>

        {/* Orders grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-20 bg-gray-50 rounded-xl" />
                <div className="h-9 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : displayOrders.length === 0 ? (
          <EmptyState icon={filter === "active" ? "😌" : "📋"} title={filter === "active" ? "No active orders" : "No orders"}
            description={filter === "active" ? "All caught up! New orders will appear here." : "Orders will appear when placed by customers."} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayOrders.map((order) => (
              <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
