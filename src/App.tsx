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

// Composant de test temporaire
const DashboardTest = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>✅ Dashboard Test - Connexion réussie !</h1>
      <div style={{ background: '#e8f5e9', padding: 15, borderRadius: 8, marginTop: 20 }}>
        <p><strong>Nom :</strong> {user?.nom} {user?.prenom}</p>
        <p><strong>Email :</strong> {user?.email}</p>
        <p><strong>Rôle :</strong> {user?.role}</p>
        <p><strong>ID :</strong> {user?.id}</p>
      </div>
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          logout();
          window.location.href = '/connexion';
        }}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer'
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  console.log('🔍 DashboardRedirect - user:', user);
  
  if (!user) {
    console.log('❌ Pas d\'utilisateur, redirection vers /connexion');
    return <Navigate to="/connexion" replace />;
  }
  
  console.log('✅ Utilisateur trouvé, rôle:', user.role);
  
  switch (user.role) {
    case 'admin': 
      console.log('➡️ Redirection vers /admin');
      return <Navigate to="/admin" replace />;
    case 'secretariat': 
      console.log('➡️ Redirection vers /secretariat');
      return <Navigate to="/secretariat" replace />;
    case 'bunexe': 
      console.log('➡️ Redirection vers /bunexe');
      return <Navigate to="/bunexe" replace />;
    case 'parent': 
      console.log('➡️ Redirection vers /parent');
      return <Navigate to="/parent" replace />;
    default: 
      console.log('➡️ Redirection par défaut vers /');
      return <Navigate to="/" replace />;
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
          
          {/* Route de test */}
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
          
          {/* Fallback - capture toutes les routes non définies */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;