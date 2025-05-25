import { useAuthStore } from '../store/auth';
import { Navigate, Outlet } from 'react-router';

export function ProtectedRoute() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
