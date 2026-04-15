import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  roles?: Array<'admin' | 'secretariat' | 'bunexe' | 'parent'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { user, isLoading } = useAuth();

  console.log('🔒 ProtectedRoute - isLoading:', isLoading, 'user:', user?.role);

  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        fontFamily: 'Arial',
        fontSize: '18px'
      }}>
        ⏳ Chargement de votre session...
      </div>
    );
  }
  
  if (!user) {
    console.log('❌ ProtectedRoute: Pas d\'utilisateur, redirection vers /connexion');
    return <Navigate to="/connexion" replace />;
  }
  
  if (roles && !roles.includes(user.role)) {
    console.log(`❌ ProtectedRoute: Rôle ${user.role} non autorisé, redirection vers /dashboard`);
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('✅ ProtectedRoute: Accès autorisé pour', user.role);
  return <Outlet />;
};

export default ProtectedRoute;
