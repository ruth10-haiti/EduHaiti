import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Accueil from './pages/Accueil';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import VerifierEmail from './pages/VerifierEmail';
import ChangerMotDePasse from './pages/ChangerMotDePasse';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import SecretariatDashboard from './pages/Dashboard/SecretariatDashboard';
import BunexeDashboard from './pages/Dashboard/BunexeDashboard';
import ParentDashboard from './pages/Dashboard/ParentDashboard';
import InscriptionAdmin from './pages/InscriptionAdmin';

const DashboardRedirect = () => {
  const { user } = useAuth();
  console.log('🔍 DashboardRedirect - user:', user);
  
  if (!user) {
    console.log('❌ Pas d\'utilisateur, redirection vers /connexion');
    return <Navigate to="/connexion" replace />;
  }
  
  if (user.doit_changer_mdp) {
    console.log('⚠️ Utilisateur doit changer son mot de passe');
    return <Navigate to="/changer-mot-de-passe" replace />;
  }
  
  console.log('✅ Utilisateur trouvé, rôle:', user.role);
  
  switch (user.role) {
    case 'admin': 
      return <Navigate to="/admin" replace />;
    case 'secretariat': 
      return <Navigate to="/secretariat" replace />;
    case 'bunexe': 
      return <Navigate to="/bunexe" replace />;
    case 'parent': 
      return <Navigate to="/parent" replace />;
    default: 
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
          <Route path="/inscription-admin" element={<InscriptionAdmin />} /> 
          <Route path="/verifier-email/:token" element={<VerifierEmail />} />
          <Route path="/changer-mot-de-passe" element={<ChangerMotDePasse />} /> 
          
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Routes protégées - AVEC /* POUR LES SOUS-ROUTES */}
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;