import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import LoadingScreen from "./components/shared/LoadingScreen";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const RoleSelect       = lazy(() => import("./pages/auth/RoleSelect"));
const CustomerLogin    = lazy(() => import("./pages/auth/CustomerLogin"));
const CustomerRegister = lazy(() => import("./pages/auth/CustomerRegister"));
const ChefLogin        = lazy(() => import("./pages/auth/ChefLogin"));
const ChefRegister     = lazy(() => import("./pages/auth/ChefRegister"));
const ManagerLogin     = lazy(() => import("./pages/auth/ManagerLogin"));
const AdminLogin       = lazy(() => import("./pages/auth/AdminLogin"));

const CustomerHome    = lazy(() => import("./pages/customer/CustomerHome"));
const MenuPage        = lazy(() => import("./pages/customer/MenuPage"));
const OrderPage       = lazy(() => import("./pages/customer/OrderPage"));
const MyOrders        = lazy(() => import("./pages/customer/MyOrders"));
const ProfilePage     = lazy(() => import("./pages/customer/ProfilePage"));
const ContactPage     = lazy(() => import("./pages/customer/ContactPage"));

const ChefDashboard   = lazy(() => import("./pages/chef/ChefDashboard"));
const ManagerDashboard= lazy(() => import("./pages/manager/ManagerDashboard"));
const AdminDashboard  = lazy(() => import("./pages/admin/AdminDashboard"));

// ─── Route Guards ─────────────────────────────────────────────────────────────
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) {
    const redirectMap = { customer: "/home", chef: "/chef/dashboard", manager: "/manager/dashboard", admin: "/admin/dashboard" };
    return <Navigate to={redirectMap[role] || "/home"} replace />;
  }
  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: "'DM Sans', sans-serif", borderRadius: "12px", fontSize: "14px" },
              success: { iconTheme: { primary: "#e06b1a", secondary: "#fff" } },
            }}
          />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* ── Public / Auth ──────────────────────────────────────────── */}
              <Route path="/"             element={<PublicRoute><RoleSelect /></PublicRoute>} />
              <Route path="/login"        element={<PublicRoute><CustomerLogin /></PublicRoute>} />
              <Route path="/register"     element={<PublicRoute><CustomerRegister /></PublicRoute>} />
              <Route path="/chef/login"   element={<PublicRoute><ChefLogin /></PublicRoute>} />
              <Route path="/chef/register" element={<ChefRegister />} />
              <Route path="/manager/login" element={<PublicRoute><ManagerLogin /></PublicRoute>} />
              <Route path="/admin/login"  element={<PublicRoute><AdminLogin /></PublicRoute>} />

              {/* ── Customer ───────────────────────────────────────────────── */}
              <Route path="/home"    element={<PrivateRoute allowedRoles={["customer"]}><CustomerHome /></PrivateRoute>} />
              <Route path="/menu"    element={<PrivateRoute allowedRoles={["customer"]}><MenuPage /></PrivateRoute>} />
              <Route path="/order"   element={<PrivateRoute allowedRoles={["customer"]}><OrderPage /></PrivateRoute>} />
              <Route path="/orders"  element={<PrivateRoute allowedRoles={["customer"]}><MyOrders /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute allowedRoles={["customer"]}><ProfilePage /></PrivateRoute>} />
              <Route path="/contact" element={<ContactPage />} />

              {/* ── Chef ───────────────────────────────────────────────────── */}
              <Route path="/chef/dashboard" element={<PrivateRoute allowedRoles={["chef"]}><ChefDashboard /></PrivateRoute>} />

              {/* ── Manager ────────────────────────────────────────────────── */}
              <Route path="/manager/dashboard" element={<PrivateRoute allowedRoles={["manager"]}><ManagerDashboard /></PrivateRoute>} />

              {/* ── Admin ──────────────────────────────────────────────────── */}
              <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={["admin"]}><AdminDashboard /></PrivateRoute>} />

              {/* ── Catch-all ──────────────────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
