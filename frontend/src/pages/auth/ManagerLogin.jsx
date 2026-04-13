// ManagerLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

export function ManagerLogin() {
  const { managerLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    setLoading(true);
    try {
      await managerLogin(form.email, form.password);
      navigate("/manager/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6 animate-fade-in">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500">
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-3">📊</div>
          <h2 className="font-display text-2xl font-bold text-charcoal">Manager Login</h2>
          <p className="text-sm text-gray-400">Secure manager portal access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
          <Input label="Manager Email" type="email" icon={Mail} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="manager@zayka.com" />
          <Input label="Password" type="password" icon={Lock} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Enter password" />
          <Button type="submit" loading={loading} className="w-full justify-center !bg-blue-500 hover:!bg-blue-600">Access Dashboard</Button>
        </form>
      </div>
    </div>
  );
}

export default ManagerLogin;
