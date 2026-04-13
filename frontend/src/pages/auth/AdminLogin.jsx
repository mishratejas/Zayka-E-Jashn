import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== "admin") { setError("Access denied: admin only"); return; }
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 space-y-6 animate-fade-in">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-300">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🛡️</div>
          <h2 className="font-display text-2xl font-bold text-white">Admin Portal</h2>
          <p className="text-sm text-gray-400 mt-1">Restricted access only</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-300">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" className="w-full px-4 py-3 pl-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@zayka.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="password" className="w-full px-4 py-3 pl-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Admin password" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Shield size={16} />}
            Enter Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
}
