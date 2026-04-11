import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Accueil from './pages/Accueil';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import VerifierEmail from './pages/VerifierEmail';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import SecretariatDashboard from './pages/Dashboard/SecretariatDashboard';
import BunexeDashboard from './pages/Dashboard/BunexeDashboard';
import ParentDashboard from './pages/Dashboard/ParentDashboard';

// ✅ COMPOSANT DE TEST TEMPORAIRE
const DashboardTest = () => {
  const { user } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard Test</h1>
      <p>Bienvenue {user?.nom || user?.email} !</p>
      <p>Rôle: {user?.role}</p>
      <button onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/connexion';
      }}>Déconnexion</button>
    </div>
  );
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  console.log('🔍 DashboardRedirect - user:', user);
  
  if (!user) {
    console.log('❌ Pas d\'utilisateur, redirection vers /connexion');
    return <Navigate to="/connexion" />;
  }
  
  console.log('✅ Utilisateur trouvé, rôle:', user.role);
  
  switch (user.role) {
    case 'admin': 
      console.log('➡️ Redirection vers /admin');
      return <Navigate to="/admin" />;
    case 'secretariat': 
      console.log('➡️ Redirection vers /secretariat');
      return <Navigate to="/secretariat" />;
    case 'bunexe': 
      console.log('➡️ Redirection vers /bunexe');
      return <Navigate to="/bunexe" />;
    case 'parent': 
      console.log('➡️ Redirection vers /parent');
      return <Navigate to="/parent" />;
    default: 
      console.log('➡️ Redirection par défaut vers /');
      return <Navigate to="/" />;
  }
};

function App() {
  console.log('🚀 App démarrée');
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Accueil />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/verifier-email/:token" element={<VerifierEmail />} />
          
          {/* ✅ Route de test temporaire */}
          <Route path="/dashboard-test" element={<DashboardTest />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Routes protégées */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute roles={['secretariat']} />}>
            <Route path="/secretariat/*" element={<SecretariatDashboard />} />
          </Route>
          <Route element={<ProtectedRoute roles={['bunexe']} />}>
            <Route path="/bunexe/*" element={<BunexeDashboard />} />
          </Route>
          <Route element={<ProtectedRoute roles={['parent']} />}>
            <Route path="/parent/*" element={<ParentDashboard />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;