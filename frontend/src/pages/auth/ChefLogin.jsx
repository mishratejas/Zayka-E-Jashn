// ChefLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

export function ChefLogin() {
  const { chefLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.email || !form.password) { setErrors({ general: "All fields required" }); return; }
    setLoading(true);
    try {
      await chefLogin(form.email, form.password);
      navigate("/chef/dashboard");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Login failed" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6 animate-fade-in">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-500 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-2xl mb-3">👨‍🍳</div>
          <h2 className="font-display text-2xl font-bold text-charcoal">Chef Login</h2>
          <p className="text-sm text-gray-400">Access your kitchen dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{errors.general}</div>}
          <Input label="Email" type="email" placeholder="chef@zayka.com" icon={Mail} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPass ? "text" : "password"} className="input-field pl-10 pr-10"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Enter password" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full justify-center !bg-emerald-500 hover:!bg-emerald-600">Sign In as Chef</Button>
        </form>
        <p className="text-center text-sm text-gray-500">New chef?{" "}
          <Link to="/chef/register" className="text-emerald-600 font-semibold">Apply here</Link>
        </p>
      </div>
    </div>
  );
}

export default ChefLogin;
