import { useState, useEffect } from 'react';
import api from '../api/axios';

export interface Product {
  _id: string; // MongoDB uses _id
  name: string;
  category: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
  warehouse?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF'; // Matches backend
  plan: 'FREE' | 'PRO';
  organizationId: string;
}

interface StoreState {
  user: User | null;
  products: Product[];
  alerts: any[];
  activity: ActivityLog[];
  loading: boolean;
  authLoading: boolean;
}

export type ActivityLog = {
  id: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string | Date;
};

let globalState: StoreState = {
  // Security: do not trust localStorage for role/authorization.
  user: null,
  products: [],
  alerts: [],
  activity: [],
  loading: false,
  authLoading: true,
};

const listeners = new Set<() => void>();
let authHydrationStarted = false;

const updateListeners = () => {
  listeners.forEach(l => l());
};

export function useStore() {
  const [, setState] = useState({});

  useEffect(() => {
    const listener = () => setState({});
    listeners.add(listener);

    // Hydrate auth state once (based on JWT), so guards can't be bypassed by localStorage tampering.
    if (!authHydrationStarted) {
      authHydrationStarted = true;
      hydrateAuth();
    }

    // Initial fetch if logged in
    if (globalState.user && globalState.products.length === 0 && !globalState.loading) {
      fetchProducts();
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const hydrateAuth = async () => {
    try {
      globalState.authLoading = true;
      updateListeners();

      const token = localStorage.getItem('token');
      if (!token) {
        globalState.user = null;
        return;
      }

      const res = await api.get('/auth/me');
      globalState.user = res.data.user;

      // After we know the user, fetch initial data.
      if (globalState.products.length === 0) {
        await fetchProducts();
        await fetchActivity();
        await fetchAlerts();
      }
    } catch (err) {
      console.error('Auth hydrate error:', err);
      globalState.user = null;
    } finally {
      globalState.authLoading = false;
      updateListeners();
    }
  };

  const fetchProducts = async () => {
    try {
      globalState.loading = true;
      updateListeners();
      const res = await api.get('/products');
      globalState.products = res.data;
      globalState.loading = false;
      updateListeners();
    } catch (err) {
      console.error('Fetch products error:', err);
      globalState.loading = false;
      updateListeners();
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await api.get('/activity');
      globalState.activity = res.data?.logs ?? [];
      updateListeners();
    } catch (err) {
      // Activity isn't critical for the app to render.
      console.error('Fetch activity error:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      globalState.alerts = res.data ?? [];
      updateListeners();
    } catch (err) {
      console.error('Fetch alerts error:', err);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);

      // Security/consistency: always hydrate the authoritative user (role) from backend (/auth/me).
      globalState.user = null;
      globalState.products = [];
      globalState.authLoading = true;
      updateListeners();

      await hydrateAuth();
      if (!globalState.user) return false;

      await fetchProducts();
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const signup = async (formData: any): Promise<boolean> => {
    try {
      await api.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organization,
        planName: formData.plan || 'FREE',
      });
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const upgradePlan = async (plan: 'free' | 'pro'): Promise<boolean> => {
    try {
      if (plan === 'pro') {
        await api.post('/upgrade');
      } else {
        await api.post('/downgrade');
      }
      return true;
    } catch (err) {
      console.error('Upgrade plan error:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    globalState.user = null;
    globalState.products = [];
    globalState.authLoading = false;
    updateListeners();
    window.location.href = '/login';
  };

  const addProduct = async (product: Omit<Product, '_id'>) => {
    try {
      const res = await api.post('/products', product);
      globalState.products.push(res.data);
      updateListeners();
      await fetchActivity();
    } catch (err) {
      console.error('Add product error:', err);
      throw err;
    }
  };

  const updateProductStock = async (productId: string, stock: number) => {
    try {
      const res = await api.patch(`/products/${productId}/stock`, { stock });
      const idx = globalState.products.findIndex(p => p._id === productId);
      if (idx !== -1) {
        globalState.products[idx] = res.data;
        updateListeners();
      }
      await fetchActivity();
    } catch (err) {
      console.error('Update stock error:', err);
      throw err;
    }
  };

  return {
    ...globalState,
    login,
    signup,
    upgradePlan,
    logout,
    addProduct,
    updateProductStock,
    fetchProducts,
    fetchActivity,
    fetchAlerts,
  };
}
