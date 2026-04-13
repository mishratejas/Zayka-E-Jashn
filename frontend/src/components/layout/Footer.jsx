import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-gray-300">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">🍽️</span>
              </div>
              <div>
                <p className="font-display font-bold text-white">Zayka-E-Jashn</p>
                <p className="text-[10px] text-brand-400">Celebration of Flavors</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Blending tradition with taste to give you a culinary celebration worth remembering.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[["Home", "/home"], ["Menu", "/menu"], ["My Orders", "/orders"], ["Contact", "/contact"]].map(([l, h]) => (
                <li key={l}><Link to={h} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Mail size={14} className="mt-0.5 text-brand-400 shrink-0" /> info@zaykaejashn.com
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Phone size={14} className="mt-0.5 text-brand-400 shrink-0" /> +91 98765 43210
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin size={14} className="mt-0.5 text-brand-400 shrink-0" /> Allahabad, Uttar Pradesh, India
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {[["f", "Facebook"], ["in", "Instagram"], ["X", "Twitter"]].map(([s, l]) => (
                <a key={l} href="#" title={l}
                  className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-sm font-bold text-gray-300 hover:bg-brand-500 hover:text-white transition-all">
                  {s}
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-6">Open daily: 11:00 AM – 11:00 PM</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <p className="text-center text-xs text-gray-500">© {new Date().getFullYear()} Zayka-E-Jashn. All rights reserved.</p>
      </div>
    </footer>
  );
}
