import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Menu from '../../components/Menu';
import AjouterEcole from '../../components/AjouterEcole';
import ListeEleves from '../../components/ListeEleves';
import Examens from '../../components/Examens';
import styles from '../styles/Dashboard.module.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Menu />
      <div className={styles.content}>
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/ecoles" element={<AjouterEcole />} />
          <Route path="/eleves" element={<ListeEleves />} />
          <Route path="/examens" element={<Examens />} />
        </Routes>
      </div>
    </div>
  );
};

const AdminHome: React.FC = () => (
  <div className={styles.welcome}>
    <h1>Tableau de bord Administrateur</h1>
    <p>Gérez les écoles, les utilisateurs et la configuration du système.</p>
    <div className={styles.cardGrid}>
      <Link to="/admin/ecoles" className={styles.card}>🏫 Gérer les écoles</Link>
      <Link to="/admin/utilisateurs" className={styles.card}>👥 Gérer les utilisateurs</Link>
      <Link to="/admin/eleves" className={styles.card}>🎓 Liste des élèves</Link>
      <Link to="/admin/examens" className={styles.card}>📝 Examens</Link>
    </div>
  </div>
);

export default AdminDashboard;