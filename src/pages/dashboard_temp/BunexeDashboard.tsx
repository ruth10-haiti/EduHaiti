import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Menu from '../../components/Menu';
import Examens from '../../components/Examens';
import styles from '../styles/Dashboard.module.css';

const BunexeDashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Menu />
      <div className={styles.content}>
        <Routes>
          <Route path="/" element={<BunexeHome />} />
          <Route path="/examens" element={<Examens />} />
          <Route path="/inscriptions" element={<div>Inscriptions aux examens</div>} />
          <Route path="/resultats" element={<div>Saisie des résultats</div>} />
        </Routes>
      </div>
    </div>
  );
};

const BunexeHome: React.FC = () => (
  <div className={styles.welcome}>
    <h1>Bureau National des Examens (BUNEXE)</h1>
    <div className={styles.cardGrid}>
      <Link to="/bunexe/examens" className={styles.card}>📝 Gérer les examens</Link>
      <Link to="/bunexe/inscriptions" className={styles.card}>📋 Inscriptions</Link>
      <Link to="/bunexe/resultats" className={styles.card}>📊 Résultats</Link>
    </div>
  </div>
);

export default BunexeDashboard;