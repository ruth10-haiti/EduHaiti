import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  roles?: Array<'admin' | 'secretariat' | 'bunexe' | 'parent'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div style={{ padding: '2rem' }}>Chargement...</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default ProtectedRoute;