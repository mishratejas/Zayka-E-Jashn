import { useNavigate } from "react-router-dom";

const ROLES = [
  {
    id: "customer",
    emoji: "🧑‍💼",
    title: "Customer",
    desc: "Browse menu & place orders",
    loginPath: "/login",
    registerPath: "/register",
    gradient: "from-orange-400 to-brand-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    hover: "hover:border-brand-400",
  },
  {
    id: "chef",
    emoji: "👨‍🍳",
    title: "Chef",
    desc: "Manage orders in your kitchen",
    loginPath: "/chef/login",
    registerPath: "/chef/register",
    gradient: "from-emerald-400 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    hover: "hover:border-emerald-400",
  },
  {
    id: "manager",
    emoji: "📊",
    title: "Manager",
    desc: "Oversee operations & analytics",
    loginPath: "/manager/login",
    registerPath: null,
    gradient: "from-blue-400 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    hover: "hover:border-blue-400",
  },
  {
    id: "admin",
    emoji: "🛡️",
    title: "Admin",
    desc: "Full platform control",
    loginPath: "/admin/login",
    registerPath: null,
    gradient: "from-purple-400 to-violet-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    hover: "hover:border-purple-400",
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-charcoal via-brand-950 to-brand-800 text-white py-20 px-6 text-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #ff8c30 0%, transparent 50%), radial-gradient(circle at 75% 50%, #e06b1a 0%, transparent 50%)" }} />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Now serving • Allahabad, India
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Zayka-E-Jashn
          </h1>
          <p className="text-brand-200 text-lg font-body">
            A celebration of flavors — authentic Indian cuisine, crafted with passion.
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-charcoal">Who are you?</h2>
          <p className="text-gray-400 mt-2 text-sm">Choose your role to continue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-4xl">
          {ROLES.map((r) => (
            <div key={r.id}
              className={`group card p-6 flex flex-col items-center text-center cursor-pointer border-2 ${r.border} ${r.hover} transition-all duration-300 hover:scale-105 hover:shadow-lg`}
              onClick={() => navigate(r.loginPath)}>
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {r.emoji}
              </div>
              <h3 className="font-display text-lg font-bold text-charcoal">{r.title}</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{r.desc}</p>

              <div className="mt-5 w-full space-y-2">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(r.loginPath); }}
                  className={`w-full py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${r.gradient} hover:opacity-90 transition-opacity shadow-sm`}>
                  Login
                </button>
                {r.registerPath && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(r.registerPath); }}
                    className={`w-full py-2 rounded-xl text-sm font-medium ${r.bg} border ${r.border} text-gray-600 hover:text-gray-800 transition-colors`}>
                    Register
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Decorative footer note */}
        <p className="mt-12 text-xs text-gray-300 text-center">
          🔒 Secure role-based access • 🍽️ Zayka-E-Jashn © 2025
        </p>
      </div>
    </div>
  );
}
