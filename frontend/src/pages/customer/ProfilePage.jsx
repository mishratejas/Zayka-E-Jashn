// ── ProfilePage ────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { Button, Input } from "../../components/ui";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import toast from "react-hot-toast";

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.data.user);
      toast.success("Profile updated!");
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="page-container py-10 max-w-xl">
        <h1 className="font-display text-3xl font-bold text-charcoal mb-8">My Profile</h1>
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-3xl text-white font-bold">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold text-xl text-charcoal">{user?.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-medium capitalize">{user?.role}</span>
            </div>
          </div>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2 border-t border-gray-100">
            <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <Button type="submit" loading={loading}>Save Changes</Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default ProfilePage;
