import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null); // customer | chef | manager | admin
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // ─── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token    = localStorage.getItem("accessToken");
      const savedRole = localStorage.getItem("userRole");
      const savedUser = localStorage.getItem("userData");

      if (!token) { setLoading(false); setInitialized(true); return; }

      try {
        if (savedRole === "chef") {
          const parsed = JSON.parse(savedUser || "{}");
          setUser(parsed);
          setRole("chef");
        } else if (savedRole === "manager") {
          const parsed = JSON.parse(savedUser || "{}");
          setUser(parsed);
          setRole("manager");
        } else {
          const { data } = await authAPI.getProfile();
          const u = data.data.user;
          setUser(u);
          setRole(u.role);
          localStorage.setItem("userData", JSON.stringify(u));
          localStorage.setItem("userRole", u.role);
        }
      } catch {
        localStorage.clear();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    restore();
  }, []);

  // ─── Customer login ─────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const u = data.data.user;
    setUser(u);
    setRole(u.role);
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
    localStorage.setItem("userRole", u.role);
    localStorage.setItem("userData", JSON.stringify(u));
    toast.success(`Welcome back, ${u.name}! 🎉`);
    return u;
  }, []);

  // ─── Chef login ─────────────────────────────────────────────────────────────
  const chefLogin = useCallback(async (email, password) => {
    const { data } = await authAPI.chefLogin({ email, password });
    const c = data.data.chef;
    setUser(c);
    setRole("chef");
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("userRole", "chef");
    localStorage.setItem("userData", JSON.stringify(c));
    toast.success(`Welcome, Chef ${c.name}! 👨‍🍳`);
    return c;
  }, []);

  // ─── Manager login ──────────────────────────────────────────────────────────
  const managerLogin = useCallback(async (email, password) => {
    const { data } = await authAPI.managerLogin({ email, password });
    const m = data.data.user;
    setUser(m);
    setRole("manager");
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("userRole", "manager");
    localStorage.setItem("userData", JSON.stringify(m));
    toast.success("Manager dashboard unlocked 📊");
    return m;
  }, []);

  // ─── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, phone) => {
    const { data } = await authAPI.register({ name, email, password, phone });
    const u = data.data.user;
    setUser(u);
    setRole(u.role);
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
    localStorage.setItem("userRole", u.role);
    localStorage.setItem("userData", JSON.stringify(u));
    toast.success("Account created successfully! 🎉");
    return u;
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null);
    setRole(null);
    localStorage.clear();
    toast.success("Logged out. See you soon! 👋");
  }, []);

  // ─── Update local user ──────────────────────────────────────────────────────
  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
    localStorage.setItem("userData", JSON.stringify({ ...user, ...updated }));
  }, [user]);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{
      user, role, loading, initialized, isAuthenticated,
      login, chefLogin, managerLogin, register, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
