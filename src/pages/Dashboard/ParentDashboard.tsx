import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Menu from '../../components/Menu';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../styles/Dashboard.module.css';

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enfants, setEnfants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🎯 ParentDashboard chargé, user:', user);
    
    const fetchEnfants = async () => {
      try {
        console.log('📡 Chargement des enfants...');
        const response = await api.get('/eleves/parent/enfants');
        console.log('✅ Enfants chargés:', response.data);
        setEnfants(response.data);
        setError('');
      } catch (err: any) {
        console.error('❌ Erreur chargement enfants:', err.response?.data);
        setError(err.response?.data?.message || 'Erreur lors du chargement des enfants');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnfants();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <Menu />
        <div className={styles.content}>
          <div className={styles.welcome}>
            <p>Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Menu />
      <div className={styles.content}>
        <div className={styles.welcome}>
          <h1>Bienvenue, {user?.prenom || user?.nom || 'Parent'} !</h1>
          <h2>Vos enfants</h2>
          {error && (
            <div style={{ color: 'red', padding: '10px', background: '#ffebee', borderRadius: '5px' }}>
              {error}
            </div>
          )}
          {enfants.length === 0 ? (
            <p>Aucun enfant associé à votre compte. Contactez le secrétariat.</p>
          ) : (
            <div className={styles.enfantsList}>
              {enfants.map((enfant: any) => (
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