import { useState, useEffect } from "react";
import { managerAPI, orderAPI, chefAPI } from "../../services/api";
import { StatCard, StatusBadge, EmptyState, Button } from "../../components/ui";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Users, ChefHat, ShoppingBag, TrendingUp, Check, X, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week",  label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year",  label: "This Year" },
];

function SimpleBarChart({ data }) {
  if (!data || !data.length) return <div className="h-40 flex items-center justify-center text-sm text-gray-400">No data yet</div>;
  const max = Math.max(...data.map((d) => d.revenue || 0));
  return (
    <div className="flex items-end gap-1 h-40 pt-4">
      {data.slice(-14).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-brand-100 rounded-t-sm hover:bg-brand-200 transition-colors relative group"
            style={{ height: `${max ? (d.revenue / max) * 100 : 0}%`, minHeight: "2px" }}>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap">
              ₹{d.revenue?.toFixed(0)}
            </div>
          </div>
          <span className="text-[8px] text-gray-400 rotate-45 origin-left translate-x-1">{d._id?.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats]         = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders]       = useState([]);
  const [chefs, setChefs]         = useState([]);
  const [period, setPeriod]       = useState("week");
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("overview");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, analyticsRes, ordersRes, chefsRes] = await Promise.all([
        managerAPI.getDashboard(),
        orderAPI.getAnalytics(period),
        orderAPI.getAllManager({ limit: 20 }),
        chefAPI.getAll({}),
      ]);
      setStats(dashRes.data.data.stats);
      setAnalytics(analyticsRes.data.data);
      setOrders(ordersRes.data.data.orders || []);
      setChefs(chefsRes.data.data.chefs || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [period]);

  const handleVerifyChef = async (id, verified) => {
    try {
      await chefAPI.verify(id, verified);
      setChefs((prev) => prev.map((c) => c._id === id ? { ...c, verified } : c));
      toast.success(verified ? "Chef verified ✅" : "Chef unverified");
    } catch { }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
      toast.success(`Order ${status}`);
    } catch { }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold mb-2">📊 Manager Portal</div>
            <h1 className="font-display text-3xl font-bold text-charcoal">Operations Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage orders, chefs & revenue</p>
          </div>
          <button onClick={fetchAll} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* KPI Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Orders"    value={stats.totalOrders}    icon="📋" color="brand" />
            <StatCard label="Today's Orders"  value={stats.todayOrders}    icon="🔥" color="red" />
            <StatCard label="Total Revenue"   value={`₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`} icon="💰" color="green" />
            <StatCard label="Active Chefs"    value={stats.totalChefs}     icon="👨‍🍳" color="blue" />
          </div>
        )}

        {stats?.unverifiedChefs > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-6 flex items-center justify-between">
            <p className="text-sm text-amber-700 font-medium">
              ⚠️ {stats.unverifiedChefs} chef{stats.unverifiedChefs !== 1 ? "s" : ""} pending verification
            </p>
            <button onClick={() => setTab("chefs")} className="text-xs text-amber-600 font-semibold underline">Review</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[["overview", "Overview", "📈"], ["orders", "Orders", "📋"], ["chefs", "Chefs", "👨‍🍳"]].map(([v, l, e]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                tab === v ? "border-brand-500 text-brand-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {e} {l}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue chart */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-charcoal">Revenue Trend</h3>
                <div className="flex gap-1">
                  {PERIOD_OPTIONS.map((p) => (
                    <button key={p.value} onClick={() => setPeriod(p.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        period === p.value ? "bg-brand-500 text-white" : "text-gray-400 hover:bg-gray-100"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <SimpleBarChart data={analytics?.dailyRevenue} />
            </div>

            {/* Order status breakdown */}
            <div className="card p-6">
              <h3 className="font-display font-semibold text-charcoal mb-4">Order Status Breakdown</h3>
              <div className="space-y-3">
                {analytics?.statusBreakdown?.map(({ _id, count }) => (
                  <div key={_id} className="flex items-center gap-3">
                    <span className={`badge-${_id} w-20 text-center capitalize`}>{_id}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-brand-400 h-2 rounded-full" style={{ width: `${(count / (stats?.totalOrders || 1)) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-charcoal w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top items */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-display font-semibold text-charcoal mb-4">🏆 Top Selling Items</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {analytics?.topItems?.slice(0, 5).map((item, i) => (
                  <div key={item._id} className="bg-brand-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-brand-400 font-bold mb-1">#{i + 1}</p>
                    <p className="text-sm font-semibold text-charcoal leading-tight">{item._id}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.count} sold</p>
                    <p className="text-xs font-medium text-brand-600">₹{item.revenue?.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? <EmptyState icon="📋" title="No orders" /> : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>{["Order ID", "Customer", "Items", "Total", "Type", "Payment", "Status", "Time", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">#{o._id.slice(-6).toUpperCase()}</td>
                        <td className="px-4 py-3 font-medium text-charcoal">{o.customerName}</td>
                        <td className="px-4 py-3 text-gray-500">{o.items?.length} items</td>
                        <td className="px-4 py-3 font-bold text-brand-600">₹{o.total?.toFixed(0)}</td>
                        <td className="px-4 py-3 capitalize text-gray-500">{o.type}</td>
                        <td className="px-4 py-3 text-gray-500">{o.paymentMethod}</td>
                        <td className="px-4 py-3"><span className={`badge-${o.status}`}>{o.status}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleTimeString("en-IN")}</td>
                        <td className="px-4 py-3">
                          {o.status === "pending" && (
                            <button onClick={() => handleOrderStatus(o._id, "confirmed")} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Confirm</button>
                          )}
                          {o.status === "ready" && (
                            <button onClick={() => handleOrderStatus(o._id, "completed")} className="text-xs text-green-500 hover:text-green-700 font-medium">Complete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Chefs Tab ── */}
        {tab === "chefs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chefs.length === 0 ? <EmptyState icon="👨‍🍳" title="No chefs registered" /> : chefs.map((chef) => (
              <div key={chef._id} className="card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-xl">
                    {chef.avatar ? <img src={chef.avatar} className="w-full h-full object-cover rounded-xl" alt="" /> : "👨‍🍳"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-charcoal truncate">{chef.name}</p>
                    <p className="text-xs text-gray-400 truncate">{chef.email}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-medium">{chef.specialization}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${chef.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {chef.verified ? "✓ Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-gray-400 mb-4">
                  <span>📅 {chef.experience} yrs exp</span>
                  {chef.resume && <a href={chef.resume} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">📄 Resume</a>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleVerifyChef(chef._id, !chef.verified)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                      chef.verified
                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}>
                    {chef.verified ? <><X size={12} /> Unverify</> : <><Check size={12} /> Verify</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
