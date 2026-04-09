import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Menu from '../../components/Menu';
import ListeEleves from '../../components/ListeEleves';
import FormulaireEleve from '../../components/FormulaireEleve';
import Documents from '../../components/Documents';
import TransfertInitier from '../../components/TransfertInitier';
import TransfertRecevoir from '../../components/TransfertRecevoir';
import styles from '../styles/Dashboard.module.css';

const SecretariatDashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Menu />
      <div className={styles.content}>
        <Routes>
          <Route path="/" element={<SecretariatHome />} />
          <Route path="/eleves" element={<ListeEleves />} />
          <Route path="/eleves/ajouter" element={<FormulaireEleve />} />
          <Route path="/eleves/:id/modifier" element={<FormulaireEleve />} />
          <Route path="/inscriptions" element={<div>Gestion des inscriptions</div>} />
          <Route path="/transferts/initier" element={<TransfertInitier />} />
          <Route path="/transferts/recevoir" element={<TransfertRecevoir />} />
          <Route path="/documents" element={<Documents />} />
        </Routes>
      </div>
    </div>
  );
};

const SecretariatHome: React.FC = () => (
  <div className={styles.welcome}>
    <h1>Secrétariat</h1>
    <div className={styles.cardGrid}>
      <Link to="/secretariat/eleves" className={styles.card}>🎓 Liste des élèves</Link>
      <Link to="/secretariat/eleves/ajouter" className={styles.card}>➕ Ajouter un élève</Link>
      <Link to="/secretariat/inscriptions" className={styles.card}>📋 Inscriptions</Link>
      <Link to="/secretariat/transferts/initier" className={styles.card}>🔄 Initier un transfert</Link>
      <Link to="/secretariat/transferts/recevoir" className={styles.card}>📥 Recevoir un transfert</Link>
      <Link to="/secretariat/documents" className={styles.card}>📄 Documents</Link>
    </div>
  </div>
);

export default SecretariatDashboard;