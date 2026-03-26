import { Navigate, Outlet } from 'react-router';
import { useStore } from '../store/useStore';

interface ProtectedRouteProps {
  role?: 'ADMIN' | 'STAFF';
  allowedEmail?: string;
}

export function ProtectedRoute({ role, allowedEmail }: ProtectedRouteProps) {
  const { user, authLoading } = useStore();

  // Prevent role checks from being bypassed using localStorage tampering.
  if (authLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/user'} replace />;
  }

  if (allowedEmail && user.email !== allowedEmail) {
    // Explicitly block non-default admin accounts from admin dashboard.
    return <Navigate to="/user" replace />;
  }

  return <Outlet />;
}
