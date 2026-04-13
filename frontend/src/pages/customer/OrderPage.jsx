import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, MapPin, CreditCard } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { orderAPI } from "../../services/api";
import { Button, Input, Select, EmptyState } from "../../components/ui";
import Navbar from "../../components/layout/Navbar";
import toast from "react-hot-toast";

const ORDER_TYPES   = ["dine-in", "takeaway", "delivery"];
const PAYMENT_TYPES = ["Cash", "Card", "UPI", "Wallet"];

export default function OrderPage() {
  const { items, count, subtotal, tax, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "dine-in",
    paymentMethod: "Cash",
    tableNumber: "",
    specialInstructions: "",
    deliveryStreet: "",
    deliveryCity: "",
    deliveryPincode: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handlePlaceOrder = async () => {
    if (!items.length) { toast.error("Your cart is empty"); return; }
    if (form.type === "delivery" && !form.deliveryStreet) { toast.error("Delivery address is required"); return; }
    if (form.type === "dine-in" && !form.tableNumber) { toast.error("Table number is required"); return; }

    setLoading(true);
    try {
      const payload = {
        customerName:  user?.name  || "Guest",
        customerEmail: user?.email || "",
        items,
        subtotal,
        tax,
        total,
        type: form.type,
        paymentMethod: form.paymentMethod,
        tableNumber: form.tableNumber || undefined,
        specialInstructions: form.specialInstructions || undefined,
        deliveryAddress: form.type === "delivery" ? {
          street: form.deliveryStreet, city: form.deliveryCity, pincode: form.deliveryPincode,
        } : undefined,
      };
      const { data } = await orderAPI.create(payload);
      clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally { setLoading(false); }
  };

  if (!count) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="page-container py-20">
          <EmptyState icon="🛒" title="Your cart is empty"
            description="Add some delicious dishes from our menu!"
            action={<Link to="/menu" className="btn-primary">Explore Menu</Link>} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="page-container py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/menu" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal">Your Order</h1>
            <p className="text-sm text-gray-400">{count} item{count !== 1 ? "s" : ""} in cart</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart items ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5 space-y-4">
              <h2 className="font-display font-semibold text-charcoal flex items-center gap-2">
                <ShoppingCart size={18} className="text-brand-500" /> Cart Items
              </h2>
              {items.map((item) => (
                <div key={item.itemId} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-2xl shrink-0">
                    {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" /> : "🍽️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="font-bold text-brand-600 text-sm w-16 text-right">₹{(item.price * item.quantity).toFixed(0)}</p>
                  <button onClick={() => removeItem(item.itemId)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* ── Order details form ── */}
            <div className="card p-5 space-y-4">
              <h2 className="font-display font-semibold text-charcoal flex items-center gap-2">
                <MapPin size={18} className="text-brand-500" /> Order Details
              </h2>
              <Select label="Order Type" value={form.type} onChange={set("type")}>
                {ORDER_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </Select>

              {form.type === "dine-in" && (
                <Input label="Table Number" placeholder="e.g. T4" value={form.tableNumber} onChange={set("tableNumber")} />
              )}

              {form.type === "delivery" && (
                <div className="space-y-3">
                  <Input label="Street / Locality" placeholder="123 MG Road" value={form.deliveryStreet} onChange={set("deliveryStreet")} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="City" placeholder="Allahabad" value={form.deliveryCity} onChange={set("deliveryCity")} />
                    <Input label="Pincode" placeholder="211001" value={form.deliveryPincode} onChange={set("deliveryPincode")} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Special Instructions</label>
                <textarea className="input-field resize-none h-20" placeholder="Allergies, spice level preferences..."
                  value={form.specialInstructions} onChange={set("specialInstructions")} />
              </div>
            </div>
          </div>

          {/* ── Summary ── */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h2 className="font-display font-semibold text-charcoal flex items-center gap-2">
                <CreditCard size={18} className="text-brand-500" /> Payment
              </h2>
              <Select label="Payment Method" value={form.paymentMethod} onChange={set("paymentMethod")}>
                {PAYMENT_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>

            <div className="card p-5 space-y-3">
              <h2 className="font-display font-semibold text-charcoal">Bill Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal ({count} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery fee</span>
                  <span className="text-green-500">{form.type === "delivery" ? "₹49" : "FREE"}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-charcoal">
                  <span>Total</span>
                  <span className="text-brand-600 text-lg">₹{(total + (form.type === "delivery" ? 49 : 0)).toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handlePlaceOrder} loading={loading} className="w-full justify-center mt-2">
                Place Order 🎉
              </Button>
              <button onClick={clearCart} className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center gap-1">
                <Trash2 size={11} /> Clear cart
              </button>
            </div>

            <div className="card p-4 bg-green-50 border border-green-100">
              <p className="text-xs text-green-700 text-center">🔒 Your order data is secure & encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
