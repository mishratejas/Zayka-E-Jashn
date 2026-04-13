import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

export default function CustomerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/home");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-charcoal to-brand-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 30% 70%, #ff8c30 0%, transparent 60%)" }} />
        <div className="relative text-white text-center space-y-6 max-w-sm">
          <div className="text-7xl mb-4">🍽️</div>
          <h1 className="font-display text-4xl font-bold">Welcome back to Zayka-E-Jashn</h1>
          <p className="text-brand-300 leading-relaxed">
            Your table is set. Your favourite dishes await. Log in and indulge in a celebration of flavours.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {["🥘", "🍛", "🍮", "☕", "🍕", "🥗"].map((e, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 text-2xl text-center hover:bg-white/20 transition-colors">
                {e}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div>
            <button onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-6">
              <ArrowLeft size={14} /> Back to roles
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🧑‍💼</span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-charcoal">Customer Login</h2>
                <p className="text-xs text-gray-400">Sign in to your account</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {errors.general}
              </div>
            )}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${errors.password ? "border-red-400" : ""}`}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center">
              Sign In
            </Button>
          </form>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                Create one
              </Link>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">Or login as</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="flex gap-3 justify-center">
              <Link to="/chef/login" className="px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:border-brand-300 hover:text-brand-500 transition-all">
                👨‍🍳 Chef
              </Link>
              <Link to="/manager/login" className="px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-all">
                📊 Manager
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
