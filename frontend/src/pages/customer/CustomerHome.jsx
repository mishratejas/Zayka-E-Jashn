import { Link } from "react-router-dom";
import { ArrowRight, Star, Clock, Truck, Award, ChefHat } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const SIGNATURE_DISHES = [
  { name: "Raj Kachori",         emoji: "🥘", tag: "Chef's Special", time: "20 min" },
  { name: "Hyderabadi Biryani",  emoji: "🍛", tag: "Best Seller",    time: "30 min" },
  { name: "Gulab Jamun",         emoji: "🍮", tag: "Dessert",         time: "10 min" },
  { name: "Kadhai Paneer",       emoji: "🧀", tag: "Vegetarian",      time: "25 min" },
  { name: "Cold Coffee",         emoji: "☕", tag: "Beverage",        time: "5 min"  },
  { name: "Chicken Kebab",       emoji: "🍢", tag: "Non-Veg",         time: "30 min" },
];

const FEATURES = [
  { icon: ChefHat, title: "Expert Chefs",       desc: "Masters of authentic Indian cuisine with years of passion.",    color: "bg-orange-50 text-brand-600" },
  { icon: Star,    title: "Award-Winning Taste", desc: "Recognized flavors that leave a lasting impression every time.", color: "bg-yellow-50 text-yellow-600" },
  { icon: Clock,   title: "Swift Preparation",  desc: "Hot, freshly prepared meals ready within minutes.",             color: "bg-green-50 text-green-600" },
  { icon: Truck,   title: "Fast Delivery",       desc: "From our kitchen to your doorstep — hot and on time.",         color: "bg-blue-50 text-blue-600" },
];

const INTERIORS = [
  { label: "Floor Sittings",        emoji: "🪴", desc: "Traditional-style floor seating experience" },
  { label: "Artificial Waterfalls", emoji: "💧", desc: "Serene waterfall ambiance for a peaceful meal" },
  { label: "Natural Trails",        emoji: "🌿", desc: "Greenery-surrounded dining for nature lovers" },
];

export default function CustomerHome() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal via-brand-950 to-brand-800 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #ff8c30 0%, transparent 50%), radial-gradient(circle at 80% 20%, #e06b1a 0%, transparent 50%)" }} />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[200px] opacity-5 select-none">🍽️</div>

        <div className="relative page-container py-24 md:py-32">
          <div className="max-w-2xl">
            {user && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
                👋 Welcome back, <span className="text-brand-300 font-semibold">{user.name}</span>!
              </div>
            )}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
              Taste the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-yellow-300">
                Celebration
              </span>
            </h1>
            <p className="text-brand-200 text-lg md:text-xl leading-relaxed mb-10 font-body">
              Authentic flavors, crafted with passion. Every dish tells a story of tradition,
              spice, and love — straight from our kitchen to your heart.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                Explore Menu <ArrowRight size={18} />
              </Link>
              <Link to="/order" className="btn-secondary !bg-white/10 !border-white/30 !text-white hover:!bg-white/20 flex items-center gap-2 text-base px-8 py-4">
                View Cart
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/10">
              {[["500+", "Dishes Served Daily"], ["4.9★", "Average Rating"], ["15 min", "Avg Prep Time"]].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-bold text-white">{n}</p>
                  <p className="text-sm text-brand-300">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Signature Dishes ──────────────────────────────────────────────────── */}
      <section className="py-20 page-container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-1">Our Menu</p>
            <h2 className="section-title">Signature Dishes</h2>
          </div>
          <Link to="/menu" className="btn-ghost flex items-center gap-1.5 text-sm">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SIGNATURE_DISHES.map((dish, i) => (
            <Link key={dish.name} to="/menu"
              className="group card p-4 flex flex-col items-center text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{dish.emoji}</div>
              <p className="font-semibold text-sm text-charcoal leading-tight">{dish.name}</p>
              <span className="mt-1.5 text-[10px] px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-medium">{dish.tag}</span>
              <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={9} /> {dish.time}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">Why Us</p>
            <h2 className="section-title">Why Choose Zayka-E-Jashn</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              We don't just serve food. We craft experiences that celebrate tradition and flavor.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-6 text-center group hover:scale-[1.02] transition-transform">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-display font-bold text-charcoal mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interiors ─────────────────────────────────────────────────────────── */}
      <section className="py-20 page-container">
        <div className="text-center mb-12">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">Ambiance</p>
          <h2 className="section-title">Exclusive Interiors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INTERIORS.map(({ label, emoji, desc }) => (
            <div key={label} className="group relative overflow-hidden card p-0 aspect-[4/3] flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 hover:scale-[1.02] transition-all duration-300">
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">{emoji}</div>
              <h3 className="font-display text-xl font-bold text-charcoal">{label}</h3>
              <p className="text-sm text-gray-400 mt-1 px-6 text-center">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-brand-500 to-brand-700">
        <div className="page-container text-center text-white">
          <h2 className="font-display text-4xl font-bold mb-4">Hungry? Let's eat.</h2>
          <p className="text-brand-100 mb-8 max-w-md mx-auto">
            Explore our full menu and place your order in seconds.
          </p>
          <Link to="/menu" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
            Order Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
