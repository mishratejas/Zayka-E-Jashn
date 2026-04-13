import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User, LogOut, ChefHat, Home, UtensilsCrossed, ClipboardList, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const CUSTOMER_LINKS = [
  { to: "/home",    label: "Home",       icon: Home },
  { to: "/menu",    label: "Menu",       icon: UtensilsCrossed },
  { to: "/orders",  label: "My Orders",  icon: ClipboardList },
  { to: "/contact", label: "Contact",    icon: Phone },
];

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = role === "customer" ? CUSTOMER_LINKS : [];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-orange-100 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={role === "chef" ? "/chef/dashboard" : role === "manager" ? "/manager/dashboard" : "/home"}
            className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white text-lg">🍽️</span>
            </div>
            <div>
              <p className="font-display font-bold text-charcoal leading-none text-sm">Zayka-E-Jashn</p>
              <p className="text-[10px] text-brand-500 font-body leading-none">Celebration of Flavors</p>
            </div>
          </Link>

          {/* Desktop links */}
          {links.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === to
                      ? "bg-brand-50 text-brand-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-brand-500"
                  }`}>
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {role === "customer" && (
              <Link to="/order" className="relative p-2 rounded-xl hover:bg-brand-50 transition-colors">
                <ShoppingCart size={20} className="text-gray-600" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] px-1">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            )}

            {/* Profile dropdown */}
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  : <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-600 text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                    </div>
                }
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {user?.name}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-sm font-semibold text-charcoal">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-semibold rounded-full capitalize">
                      {role}
                    </span>
                  </div>
                  {role === "customer" && (
                    <Link to="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-500 transition-colors">
                      <User size={14} /> My Profile
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && links.length > 0 && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-slide-up">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === to ? "bg-brand-50 text-brand-600" : "text-gray-600 hover:bg-gray-50"
                }`}>
                <Icon size={16} /> {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
