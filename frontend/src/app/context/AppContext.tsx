import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../api/axios';
import { useStore } from '../store/useStore';

export type PlanType = 'free' | 'pro';
export type PlanStatus = 'active' | 'expired';
export type UserRole = 'admin' | 'staff';

interface AppContextType {
  plan: PlanType;
  planStatus: PlanStatus;
  userRole: UserRole;
  productsCount: number;
  productsLimit: number;
  setPlan: (plan: PlanType) => void;
  setPlanStatus: (status: PlanStatus) => void;
  setUserRole: (role: UserRole) => void;
  refreshSubscription: () => Promise<void>;
  addProduct: () => void;
  deleteProduct: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, authLoading } = useStore();

  const [plan, setPlan] = useState<PlanType>('free');
  const [planStatus, setPlanStatus] = useState<PlanStatus>('active');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [productsCount, setProductsCount] = useState(0);

  const productsLimit = plan === 'free' ? 10 : Infinity;

  const addProduct = () => {
    if (productsCount < productsLimit) {
      setProductsCount(prev => prev + 1);
    }
  };

  const deleteProduct = () => {
    if (productsCount > 0) {
      setProductsCount(prev => prev - 1);
    }
  };

  const refreshSubscription = async () => {
    const res = await api.get('/subscription');
    const data = res.data as {
      plan: string;
      planStatus: string;
      productsCount: number;
    };

    const nextPlan = (String(data.plan).toLowerCase() === 'pro' ? 'pro' : 'free') as PlanType;
    const nextStatus = (String(data.planStatus).toLowerCase() === 'expired' ? 'expired' : 'active') as PlanStatus;
    setPlan(nextPlan);
    setPlanStatus(nextStatus);
    setProductsCount(Number(data.productsCount ?? 0));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    // Map backend role -> app role
    setUserRole(user.role === 'ADMIN' ? 'admin' : 'staff');
    refreshSubscription().catch(() => {
      // Keep existing state if subscription fetch fails.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  return (
    <AppContext.Provider
      value={{
        plan,
        planStatus,
        userRole,
        productsCount,
        productsLimit,
        setPlan,
        setPlanStatus,
        setUserRole,
        refreshSubscription,
        addProduct,
        deleteProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
