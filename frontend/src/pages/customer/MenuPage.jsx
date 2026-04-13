import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, ShoppingCart, Plus, Minus, Star, Clock, Flame, Leaf } from "lucide-react";
import { menuAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { CardSkeleton, EmptyState, StatusBadge } from "../../components/ui";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const CATEGORIES = [
  { id: "all",       label: "All",       emoji: "🍽️" },
  { id: "veg",       label: "Veg",       emoji: "🥗" },
  { id: "nonveg",    label: "Non-Veg",   emoji: "🍗" },
  { id: "italian",   label: "Italian",   emoji: "🍕" },
  { id: "chinese",   label: "Chinese",   emoji: "🥡" },
  { id: "beverages", label: "Beverages", emoji: "☕" },
  { id: "desserts",  label: "Desserts",  emoji: "🍮" },
];

const SORT_OPTIONS = [
  { value: "name",       label: "A–Z" },
  { value: "price_asc",  label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "rating",     label: "Rating" },
];

const SPICE_COLORS = { mild: "text-green-500", medium: "text-yellow-500", hot: "text-orange-500", "extra-hot": "text-red-500" };

function MenuItemCard({ item }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.itemId === item._id);

  return (
    <div className="card p-0 overflow-hidden group flex flex-col hover:scale-[1.02] transition-all duration-300">
      {/* Image / Emoji placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-brand-50 to-orange-100 flex items-center justify-center overflow-hidden">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <span className="text-6xl">🍽️</span>
        }
        {item.isFeatured && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full">⭐ Featured</div>
        )}
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.isVeg ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-display font-semibold text-charcoal leading-tight">{item.name}</h3>
          {item.spiceLevel && (
            <span className={`text-xs ${SPICE_COLORS[item.spiceLevel]} shrink-0`}>
              <Flame size={12} className="inline" /> {item.spiceLevel}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-gray-400 leading-relaxed mb-2 flex-1 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {item.rating > 0 && (
            <span className="flex items-center gap-0.5 text-yellow-500"><Star size={11} fill="currentColor" />{item.rating.toFixed(1)}</span>
          )}
          <span className="flex items-center gap-1"><Clock size={11} />{item.preparationTime} min</span>
          {item.calories && <span>🔥 {item.calories} cal</span>}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <p className="font-display font-bold text-brand-600 text-lg">₹{item.price}</p>

          {cartItem ? (
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(cartItem.itemId, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-brand-50 hover:bg-brand-100 flex items-center justify-center text-brand-600 transition-colors">
                <Minus size={13} />
              </button>
              <span className="font-bold text-charcoal text-sm w-4 text-center">{cartItem.quantity}</span>
              <button onClick={() => updateQuantity(cartItem.itemId, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-colors">
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button onClick={() => addItem(item)}
              disabled={!item.isAvailable}
              className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus size={13} /> Add
            </button>
          )}
        </div>
        {!item.isAvailable && (
          <p className="text-[10px] text-red-400 text-center mt-1">Currently unavailable</p>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState("name");
  const [vegOnly, setVegOnly]   = useState(false);
  const { count, total }        = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const params = { sort };
        if (category !== "all") params.category = category;
        const { data } = await menuAPI.getAll(params);
        setItems(data.data.items || []);
      } catch { setItems([]); } finally { setLoading(false); }
    };
    fetchMenu();
  }, [category, sort]);

  const filtered = useMemo(() => {
    let result = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    }
    if (vegOnly) result = result.filter((i) => i.isVeg);
    return result;
  }, [items, search, vegOnly]);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-charcoal to-brand-900 text-white py-10">
        <div className="page-container">
          <h1 className="font-display text-4xl font-bold mb-1">Our Menu</h1>
          <p className="text-brand-300 text-sm">Explore {items.length}+ dishes crafted with love</p>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-10" placeholder="Search dishes, ingredients..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field sm:w-40" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-green-400 transition-colors select-none">
            <div className={`w-9 h-5 rounded-full transition-colors ${vegOnly ? "bg-green-500" : "bg-gray-200"} relative`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${vegOnly ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm font-medium flex items-center gap-1"><Leaf size={13} className="text-green-500" /> Veg only</span>
          </label>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin mb-8">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                category === c.id
                  ? "bg-brand-500 text-white shadow-md shadow-brand-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-500"
              }`}>
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-400 mb-4">{filtered.length} item{filtered.length !== 1 ? "s" : ""} found</p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No dishes found" description="Try a different search or category" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((item) => <MenuItemCard key={item._id} item={item} />)}
          </div>
        )}
      </div>

      {/* Floating cart bar */}
      {count > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
          <a href="/order" className="flex items-center gap-4 bg-brand-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl hover:bg-brand-700 transition-colors">
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-charcoal text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>
            </div>
            <span className="font-semibold">{count} item{count !== 1 ? "s" : ""} in cart</span>
            <span className="font-bold">₹{total.toFixed(0)}</span>
          </a>
        </div>
      )}

      <Footer />
    </div>
  );
}
