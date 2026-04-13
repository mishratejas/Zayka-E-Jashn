// ─── CustomerRegister ─────────────────────────────────────────────────────────
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

export function CustomerRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "", phone: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2)  e.name     = "Name must be at least 2 characters";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate("/home");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Registration failed" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6 animate-fade-in">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-2xl mb-3">🧑‍💼</div>
          <h2 className="font-display text-2xl font-bold text-charcoal">Create account</h2>
          <p className="text-sm text-gray-400">Join Zayka-E-Jashn today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{errors.general}</div>}
          <Input label="Full name" placeholder="Your name" icon={User} value={form.name} onChange={set("name")} error={errors.name} />
          <Input label="Email" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set("email")} error={errors.email} />
          <Input label="Phone (optional)" type="tel" placeholder="+91 98765 43210" icon={Phone} value={form.phone} onChange={set("phone")} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPass ? "text" : "password"} placeholder="Min 6 characters" className={`input-field pl-10 pr-10 ${errors.password ? "border-red-400" : ""}`}
                value={form.password} onChange={set("password")} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>
          <Button type="submit" loading={loading} className="w-full justify-center">Create Account</Button>
        </form>
        <p className="text-center text-sm text-gray-500">Already have an account?{" "}
          <Link to="/login" className="text-brand-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default CustomerRegister;
