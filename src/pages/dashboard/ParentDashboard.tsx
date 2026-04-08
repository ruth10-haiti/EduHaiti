import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Menu from '../../components/Menu';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../styles/Dashboard.module.css';

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enfants, setEnfants] = useState<any[]>([]);

  useEffect(() => {
    api.get('/eleves/parent/enfants').then(res => setEnfants(res.data));
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <Menu />
      <div className={styles.content}>
        <div className={styles.welcome}>
          <h1>Bienvenue, {user?.prenom} !</h1>
          <h2>Vos enfants</h2>
          {enfants.length === 0 ? (
            <p>Aucun enfant associé à votre compte. Contactez le secrétariat.</p>
          ) : (
            <div className={styles.enfantsList}>
              {enfants.map(enfant => (
                <div key={enfant.id} className={styles.enfantCard}>
                  <h3>{enfant.prenom} {enfant.nom}</h3>
                  <p>Matricule : {enfant.matricule_national}</p>
                  <Link to={`/parent/enfant/${enfant.id}`} className={styles.btn}>Voir détails</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;