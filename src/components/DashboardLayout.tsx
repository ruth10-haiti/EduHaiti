import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  School, 
  Users, 
  GraduationCap, 
  FileText,
  LogOut
} from 'lucide-react';
import styles from "../pages/styles/AdminDashboard.module.css";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/admin/ecoles', icon: School, label: 'Écoles' },
    { path: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
    { path: '/admin/eleves', icon: GraduationCap, label: 'Élèves' },
    { path: '/admin/examens', icon: FileText, label: 'Examens' },
  ];

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // Supprimer le token et les infos utilisateur
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      // Rediriger vers la page de connexion
      navigate('/connexion');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>EduHaiti</h2>
          <p>Administration</p>
        </div>
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => 
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              <item.icon className={styles.navIcon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className={styles.logoutSection}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut className={styles.navIcon} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;