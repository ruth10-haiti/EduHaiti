// src/components/Layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = {
  admin: [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👥' },
    { path: '/admin/ecoles', label: 'Écoles', icon: '🏫' },
    { path: '/admin/statistiques', label: 'Statistiques', icon: '📈' },
  ],
  bunexe: [
    { path: '/bunexe', label: 'Dashboard', icon: '📊' },
    { path: '/bunexe/examens', label: 'Examens', icon: '📝' },
    { path: '/bunexe/inscriptions', label: 'Inscriptions examens', icon: '✅' },
    { path: '/bunexe/resultats', label: 'Résultats', icon: '🏆' },
  ],
  secretariat: [
    { path: '/secretariat', label: 'Dashboard', icon: '📊' },
    { path: '/secretariat/eleves', label: 'Élèves', icon: '👨‍🎓' },
    { path: '/secretariat/inscriptions', label: 'Inscriptions', icon: '📋' },
    { path: '/secretariat/documents', label: 'Documents', icon: '📄' },
  ],
  parent: [
    { path: '/parent', label: 'Dashboard', icon: '📊' },
    { path: '/parent/enfants', label: 'Mes enfants', icon: '👶' },
    { path: '/parent/resultats', label: 'Résultats', icon: '🏆' },
  ],
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const items = user ? menuItems[user.role as keyof typeof menuItems] || [] : [];

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen shadow-xl fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">EduHaiti</h1>
        <p className="text-sm text-blue-300">BUNEXE</p>
        <p className="text-xs text-blue-400 mt-2 capitalize">{user?.role}</p>
      </div>

      <nav className="mt-6">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 transition-colors ${
                isActive ? 'bg-blue-700 border-l-4 border-white' : 'hover:bg-blue-700'
              }`
            }
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-blue-700">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-left text-blue-200 hover:text-white hover:bg-blue-700 rounded transition-colors"
        >
          <span className="mr-3">🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
};