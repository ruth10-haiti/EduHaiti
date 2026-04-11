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

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" />;
  switch (user.role) {
    case 'admin': return <Navigate to="/admin" />;
    case 'secretariat': return <Navigate to="/secretariat" />;
    case 'bunexe': return <Navigate to="/bunexe" />;
    case 'parent': return <Navigate to="/parent" />;
    default: return <Navigate to="/" />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/verifier-email/:token" element={<VerifierEmail />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;