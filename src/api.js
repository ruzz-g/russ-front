import axios from 'axios';

// All requests go to the LavaLust API. The app never talks to the database directly.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

const KEY = 'pms_auth';

export const session = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch {
      return null;
    }
  },
  set(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the access token to every request
api.interceptors.request.use((config) => {
  const s = session.get();
  if (s?.tokens?.access_token) {
    config.headers.Authorization = `Bearer ${s.tokens.access_token}`;
  }
  return config;
});

// If the access token expired (15 min), get a new one with the refresh token and retry once.
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes('/api/auth/login') || original?.url?.includes('/api/auth/register') || original?.url?.includes('/api/auth/refresh');

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      const s = session.get();
      if (s?.tokens?.refresh_token) {
        try {
          refreshing =
            refreshing ||
            axios
              .post(`${API_URL}/api/auth/refresh`, { refresh_token: s.tokens.refresh_token })
              .finally(() => {
                refreshing = null;
              });
          const { data } = await refreshing;
          session.set({ ...s, tokens: data.tokens });
          original.headers.Authorization = `Bearer ${data.tokens.access_token}`;
          return api(original);
        } catch {
          /* fall through to logout */
        }
      }
      session.clear();
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (err) => {
  const data = err?.response?.data;
  if (data?.errors) return Object.values(data.errors).join(' ');
  if (data?.error) return data.error;
  if (err?.code === 'ERR_NETWORK') return 'Cannot reach the API. Check VITE_API_URL, CORS and that the server is running.';
  return err?.message || 'Something went wrong.';
};

// ---- Auth ----
export const login = (email, password) => api.post('/api/auth/login', { email, password }).then((r) => r.data);
export const register = (payload) => api.post('/api/auth/register', payload).then((r) => r.data);
export const logout = () => {
  const s = session.get();
  return api.post('/api/auth/logout', { refresh_token: s?.tokens?.refresh_token || '' });
};

// ---- Products ----
export const getProducts = (search = '') => api.get('/api/products', { params: search ? { search } : {} }).then((r) => r.data);
export const createProduct = (p) => api.post('/api/products', p).then((r) => r.data);
export const updateProduct = (id, p) => api.put(`/api/products/${id}`, p).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`).then((r) => r.data);

export default api;
