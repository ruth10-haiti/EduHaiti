import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../pages/styles/Dashboard.module.css';

const Menu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'secretariat': return '/secretariat';
      case 'bunexe': return '/bunexe';
      case 'parent': return '/parent';
      default: return '/';
    }
  };

  return (
    <nav className={styles.dashboardNav}>
      <div className={styles.navBrand}>
        <Link to={getDashboardLink()}>📘 EduHaiti</Link>
        <span className={styles.roleBadge}>{user?.role}</span>
      </div>
      <ul className={styles.navMenu}>
        {user?.role === 'admin' && (
          <>
            <li><Link to="/admin/ecoles">Écoles</Link></li>
            <li><Link to="/admin/utilisateurs">Utilisateurs</Link></li>
            <li><Link to="/admin/eleves">Élèves</Link></li>
            <li><Link to="/admin/examens">Examens</Link></li>
          </>
        )}
        {user?.role === 'secretariat' && (
          <>
            <li><Link to="/secretariat/eleves">Élèves</Link></li>
            <li><Link to="/secretariat/inscriptions">Inscriptions</Link></li>
            <li><Link to="/secretariat/transferts">Transferts</Link></li>
            <li><Link to="/secretariat/documents">Documents</Link></li>
          </>
        )}
        {user?.role === 'bunexe' && (
          <>
            <li><Link to="/bunexe/examens">Examens</Link></li>
            <li><Link to="/bunexe/inscriptions">Inscriptions examens</Link></li>
            <li><Link to="/bunexe/resultats">Résultats</Link></li>
          </>
        )}
        {user?.role === 'parent' && (
          <>
            <li><Link to="/parent/enfants">Mes enfants</Link></li>
            <li><Link to="/parent/notes">Notes</Link></li>
            <li><Link to="/parent/documents">Documents</Link></li>
          </>
        )}
        <li><button onClick={handleLogout} className={styles.logoutBtn}>Déconnexion</button></li>
      </ul>
    </nav>
  );
};

export default Menu;
