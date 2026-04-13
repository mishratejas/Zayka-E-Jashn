import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─── Request interceptor: attach token ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: handle refresh + errors ────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/users/refresh-token`, { refreshToken });
        const newToken = data.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Show error toast (not for 401 to avoid spam)
    const message = error.response?.data?.message || "Something went wrong";
    if (error.response?.status !== 401) toast.error(message);

    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:      (data)       => api.post("/users/register", data),
  login:         (data)       => api.post("/users/login", data),
  googleLogin:   (credential) => api.post("/users/google-login", { credential }),
  logout:        ()           => api.post("/users/logout"),
  getProfile:    ()           => api.get("/users/profile"),
  updateProfile: (data)       => api.patch("/users/profile", data),
  changePassword:(data)       => api.patch("/users/change-password", data),
  uploadAvatar:  (formData)   => api.post("/users/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  chefLogin:     (data)       => api.post("/chefs/login", data),
  managerLogin:  (data)       => api.post("/manager/login", data),
  registerChef:  (formData)   => api.post("/chefs/register", formData, { headers: { "Content-Type": "multipart/form-data" } }),
};

// ─── Menu ─────────────────────────────────────────────────────────────────────
export const menuAPI = {
  getAll:    (params) => api.get("/menu", { params }),
  getById:   (id)     => api.get(`/menu/${id}`),
  create:    (data)   => api.post("/menu", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update:    (id, d)  => api.put(`/menu/${id}`, d, { headers: { "Content-Type": "multipart/form-data" } }),
  delete:    (id)     => api.delete(`/menu/${id}`),
  toggle:    (id)     => api.patch(`/menu/${id}/toggle`),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderAPI = {
  create:        (data)    => api.post("/orders", data),
  getAll:        (params)  => api.get("/orders", { params }),
  getAllManager:  (params)  => api.get("/orders/all", { params }),
  getMyOrders:   (params)  => api.get("/orders/my", { params }),
  getById:       (id)      => api.get(`/orders/${id}`),
  updateStatus:  (id, s)   => api.patch(`/orders/${id}/status`, { status: s }),
  assignChef:    (id, cId) => api.patch(`/orders/${id}/assign-chef`, { chefId: cId }),
  cancel:        (id)      => api.delete(`/orders/${id}/cancel`),
  getAnalytics:  (period)  => api.get("/orders/analytics", { params: { period } }),
};

// ─── Chef ─────────────────────────────────────────────────────────────────────
export const chefAPI = {
  getAll:        (params) => api.get("/chefs", { params }),
  getProfile:    ()       => api.get("/chefs/profile"),
  updateProfile: (data)   => api.patch("/chefs/profile", data),
  getDashboard:  ()       => api.get("/chefs/dashboard"),
  verify:        (id, v)  => api.patch(`/manager/chefs/${id}/verify`, { verified: v }),
};

// ─── Manager ──────────────────────────────────────────────────────────────────
export const managerAPI = {
  getDashboard: () => api.get("/manager/dashboard"),
  getUsers:    (p) => api.get("/manager/users", { params: p }),
};

// ─── Contact ──────────────────────────────────────────────────────────────────
export const contactAPI = {
  send: (data) => api.post("/contact", data),
};

export default api;
