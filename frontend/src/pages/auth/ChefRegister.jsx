import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, Phone, FileText, BookOpen } from "lucide-react";
import { authAPI } from "../../services/api";
import { Button, Input, Select } from "../../components/ui";
import toast from "react-hot-toast";

const SPECIALIZATIONS = ["Indian", "Continental", "Chinese", "Bakery", "Multi-cuisine", "Italian", "Mexican"];

export default function ChefRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    specialization: "Indian", experience: "", bio: "",
  });
  const [resume, setResume]   = useState(null);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2)     e.name        = "Name required (min 2 chars)";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 6)       e.password = "Min 6 characters";
    if (!form.specialization)                   e.specialization = "Select a specialization";
    if (!form.experience || isNaN(form.experience) || Number(form.experience) < 0) e.experience = "Valid experience required";
    if (!resume)                                e.resume      = "PDF resume is required";
    else if (resume.type !== "application/pdf") e.resume      = "Only PDF files allowed";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("resume", resume);
      await authAPI.registerChef(fd);
      toast.success("Application submitted! Await manager verification. 👨‍🍳");
      navigate("/chef/login");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Registration failed" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-500 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to home
        </button>

        <div className="card p-8 space-y-7 animate-fade-in">
          {/* Header */}
          <div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-3xl mb-4">👨‍🍳</div>
            <h1 className="font-display text-3xl font-bold text-charcoal">Chef Application</h1>
            <p className="text-gray-400 text-sm mt-1">
              Join our culinary team. Your application will be reviewed by the manager.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {errors.general}
              </div>
            )}

            {/* Personal info */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name *" placeholder="Gordon Ramsay" icon={User}
                  value={form.name} onChange={set("name")} error={errors.name} />
                <Input label="Email *" type="email" placeholder="chef@kitchen.com" icon={Mail}
                  value={form.email} onChange={set("email")} error={errors.email} />
                <Input label="Phone" type="tel" placeholder="+91 98765 43210" icon={Phone}
                  value={form.phone} onChange={set("phone")} />
                <Input label="Password *" type="password" placeholder="Min 6 characters" icon={Lock}
                  value={form.password} onChange={set("password")} error={errors.password} />
              </div>
            </div>

            {/* Professional info */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Professional Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Specialization *" value={form.specialization} onChange={set("specialization")} error={errors.specialization}>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label="Years of Experience *" type="number" placeholder="e.g. 5" icon={BookOpen}
                  value={form.experience} onChange={set("experience")} error={errors.experience} min="0" max="50" />
              </div>

              <div className="mt-4 space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Bio (optional)</label>
                <textarea className="input-field resize-none h-24"
                  placeholder="Tell us about your culinary journey, signature dishes, and cooking philosophy..."
                  value={form.bio} onChange={set("bio")} maxLength={500} />
                <p className="text-xs text-gray-300 text-right">{form.bio.length}/500</p>
              </div>
            </div>

            {/* Resume upload */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Resume</h3>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                errors.resume ? "border-red-300 bg-red-50" :
                resume ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"
              }`}>
                <input type="file" accept=".pdf" className="hidden" id="resume-upload"
                  onChange={(e) => { setResume(e.target.files[0]); setErrors(p => ({ ...p, resume: "" })); }} />
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileText size={28} className={resume ? "text-emerald-500" : "text-gray-300"} />
                  {resume ? (
                    <>
                      <p className="text-sm font-semibold text-emerald-600">✅ {resume.name}</p>
                      <p className="text-xs text-gray-400">{(resume.size / 1024).toFixed(1)} KB • Click to change</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-500">Upload your resume (PDF)</p>
                      <p className="text-xs text-gray-300">Click to browse files</p>
                    </>
                  )}
                </label>
              </div>
              {errors.resume && <p className="text-xs text-red-500 mt-1">{errors.resume}</p>}
            </div>

            {/* Notice */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700 space-y-1">
              <p className="font-semibold">📋 What happens next?</p>
              <p>1. Your application is reviewed by the restaurant manager.</p>
              <p>2. Once verified, you'll be able to log in and manage orders.</p>
              <p>3. The process typically takes 1–2 business days.</p>
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center !text-base !py-3.5 !bg-gradient-to-r !from-emerald-500 !to-teal-600 hover:!opacity-90">
              Submit Application 🚀
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Already registered?{" "}
            <Link to="/chef/login" className="text-emerald-600 font-semibold hover:text-emerald-700">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
