// AdminDashboard.jsx
import Navbar from "../../components/layout/Navbar";
import { StatCard } from "../../components/ui";
import { useEffect, useState } from "react";
import { managerAPI } from "../../services/api";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { managerAPI.getDashboard().then(r => setStats(r.data.data.stats)).catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="page-container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-700 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Full platform control</p>
          </div>
        </div>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Orders"    value={stats.totalOrders}    icon="📋" color="brand" />
            <StatCard label="Total Customers" value={stats.totalCustomers} icon="👥" color="blue" />
            <StatCard label="Total Revenue"   value={`₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`} icon="💰" color="green" />
            <StatCard label="Total Chefs"     value={stats.totalChefs}     icon="👨‍🍳" color="purple" />
          </div>
        )}
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">🛡️</p>
          <p className="font-display text-xl font-bold text-charcoal">Admin Panel</p>
          <p className="text-sm text-gray-400 mt-1">Full user/menu/system management coming soon.</p>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;
