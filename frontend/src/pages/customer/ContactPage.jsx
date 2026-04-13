import { useState } from "react";
import { contactAPI } from "../../services/api";
import { Button, Input } from "../../components/ui";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm]   = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await contactAPI.send(form);
      toast.success("Message sent! We'll reply soon 📧");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="bg-gradient-to-r from-charcoal to-brand-900 text-white py-14">
        <div className="page-container text-center">
          <h1 className="font-display text-4xl font-bold mb-2">Get in Touch</h1>
          <p className="text-brand-300">We'd love to hear from you</p>
        </div>
      </div>
      <div className="page-container py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="card p-8 space-y-5">
            <h2 className="font-display text-2xl font-bold text-charcoal">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Your Name" value={form.name} onChange={set("name")} placeholder="John Doe" required />
                <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" required />
              </div>
              <Input label="Subject" value={form.subject} onChange={set("subject")} placeholder="How can we help?" required />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea className="input-field resize-none h-32" value={form.message} onChange={set("message")} placeholder="Your message..." required />
              </div>
              <Button type="submit" loading={loading} className="w-full justify-center">Send Message</Button>
            </form>
          </div>
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display font-bold text-charcoal mb-5">Contact Information</h3>
              <div className="space-y-4">
                {[
                  [MapPin, "Allahabad, Uttar Pradesh, India", "brand"],
                  [Phone, "+91 98765 43210", "green"],
                  [Mail, "info@zaykaejashn.com", "blue"],
                  [Clock, "Mon–Sun: 11:00 AM – 11:00 PM", "purple"],
                ].map(([Icon, text, color]) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className={`w-9 h-9 bg-${color}-50 rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon size={16} className={`text-${color}-500`} />
                    </div>
                    <p className="text-sm text-gray-600 pt-1.5">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6 bg-brand-50 border border-brand-100">
              <p className="text-sm text-brand-700 font-medium mb-1">📍 Find us on Maps</p>
              <p className="text-xs text-brand-500">Civil Lines area, Allahabad — look for the golden flame sign!</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
