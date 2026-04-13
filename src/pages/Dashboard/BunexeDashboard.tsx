import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Menu from '../../components/Menu';
import Examens from '../../components/Examens';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import styles from '../styles/Dashboard.module.css';

const BunexeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExamens: 0,
    totalInscriptions: 0,
    totalResultats: 0
  });

  useEffect(() => {
    // Vérifier que l'utilisateur a bien le rôle bunexe
    if (user && user.role !== 'bunexe') {
      navigate('/dashboard');
      return;
    }

    // Charger les statistiques
    const fetchStats = async () => {
      try {
        const [examensRes, inscriptionsRes, resultatsRes] = await Promise.all([
          api.get('/examens/stats'),
          api.get('/inscriptions-examens/stats'),
          api.get('/resultats-examens/stats')
        ]);
        setStats({
          totalExamens: examensRes.data.total || 0,
          totalInscriptions: inscriptionsRes.data.total || 0,
          totalResultats: resultatsRes.data.total || 0
        });
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, navigate]);

  return (
    <div className={styles.dashboardContainer}>
      <Menu />
      <div className={styles.content}>
        <Routes>
          <Route path="/" element={<BunexeHome stats={stats} />} />
          <Route path="/examens/*" element={<Examens />} />
          <Route path="/inscriptions/*" element={<InscriptionsBunexe />} />
          <Route path="/resultats/*" element={<ResultatsBunexe />} />
        </Routes>
      </div>
    </div>
  );
};

// Page d'accueil BUNEXE
const BunexeHome: React.FC<{ stats: any }> = ({ stats }) => (
  <div className={styles.welcome}>
    <h1>📚 Bureau National des Examens (BUNEXE)</h1>
    <p>Gérez les examens nationaux, les inscriptions et les résultats</p>
    
    {/* Cartes statistiques */}
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <h3>{stats.totalExamens}</h3>
        <p>Examens créés</p>
      </div>
      <div className={styles.statCard}>
        <h3>{stats.totalInscriptions}</h3>
        <p>Inscriptions</p>
      </div>
      <div className={styles.statCard}>
        <h3>{stats.totalResultats}</h3>
        <p>Résultats saisis</p>
      </div>
    </div>

    {/* Cartes de navigation */}
    <div className={styles.cardGrid}>
      <Link to="/bunexe/examens" className={styles.card}>
        <div className={styles.cardIcon}>📝</div>
        <h3>Gérer les examens</h3>
        <p>Créer, modifier et planifier les examens nationaux</p>
      </Link>
      
      <Link to="/bunexe/inscriptions" className={styles.card}>
        <div className={styles.cardIcon}>📋</div>
        <h3>Gérer les inscriptions</h3>
        <p>Valider les inscriptions aux examens</p>
      </Link>
      
      <Link to="/bunexe/resultats" className={styles.card}>
        <div className={styles.cardIcon}>📊</div>
        <h3>Publier les résultats</h3>
        <p>Saisir et publier les résultats des examens</p>
      </Link>
    </div>
  </div>
);

// Page de gestion des inscriptions BUNEXE
const InscriptionsBunexe: React.FC = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInscriptions = async () => {
      try {
        const response = await api.get('/inscriptions-examens');
        setInscriptions(response.data);
      } catch (error) {
        console.error('Erreur chargement inscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInscriptions();
  }, []);

  const validerInscription = async (id: number) => {
    try {
      await api.patch(`/inscriptions-examens/${id}/valider`);
      setInscriptions(inscriptions.filter((i: any) => i.id !== id));
      alert('✅ Inscription validée avec succès');
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('❌ Erreur lors de la validation');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>📋 Inscriptions aux examens</h2>
      <p>Validez les inscriptions des candidats</p>
      
      {inscriptions.length === 0 ? (
        <p>Aucune inscription en attente</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Élève</th>
              <th>Examen</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inscriptions.map((ins: any) => (
              <tr key={ins.id}>
                <td>{ins.eleve_nom}</td>
                <td>{ins.examen_nom}</td>
                <td>{new Date(ins.date_inscription).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => validerInscription(ins.id)} className={styles.btnValider}>
                    Valider
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Page de gestion des résultats BUNEXE
const ResultatsBunexe: React.FC = () => {
  const [examens, setExamens] = useState([]);
  const [selectedExamen, setSelectedExamen] = useState<number | null>(null);
  const [resultats, setResultats] = useState([]);

  useEffect(() => {
    const fetchExamens = async () => {
      try {
        const response = await api.get('/examens');
        setExamens(response.data);
      } catch (error) {
        console.error('Erreur chargement examens:', error);
      }
    };
    fetchExamens();
  }, []);

  const chargerResultats = async (examenId: number) => {
    setSelectedExamen(examenId);
    try {
      const response = await api.get(`/resultats-examens/examen/${examenId}`);
      setResultats(response.data);
    } catch (error) {
      console.error('Erreur chargement résultats:', error);
    }
  };

  const publierResultats = async () => {
    if (!selectedExamen) return;
    try {
      await api.post(`/resultats-examens/${selectedExamen}/publier`);
      alert('✅ Résultats publiés avec succès');
    } catch (error) {
      console.error('Erreur publication:', error);
      alert('❌ Erreur lors de la publication');
    }
  };

  return (
    <div>
      <h2>📊 Publication des résultats</h2>
      
      <div className={styles.formGroup}>
        <label>Sélectionner un examen</label>
        <select onChange={(e) => chargerResultats(Number(e.target.value))}>
          <option value="">Choisir un examen</option>
          {examens.map((ex: any) => (
            <option key={ex.id} value={ex.id}>{ex.nom}</option>
          ))}
        </select>
      </div>

      {selectedExamen && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Élève</th>
                <th>Note</th>
                <th>Mention</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((res: any) => (
                <tr key={res.id}>
                  <td>{res.eleve_nom}</td>
                  <td>{res.note}/20</td>
                  <td>{res.mention}</td>
                  <td>{res.publie ? 'Publié' : 'En attente'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button onClick={publierResultats} className={styles.btnPublier}>
            Publier tous les résultats
          </button>
        </>
      )}
    </div>
  );
};

export default BunexeDashboard;