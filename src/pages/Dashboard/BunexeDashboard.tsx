import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Link, useNavigate} from 'react-router-dom';
import { Home, FileText, ClipboardList, Award, Users, School, Plus, Edit2, Trash2, Calendar, Clock, MapPin, Search } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../styles/AdminDashboard.module.css';

// Contexte pour partager les stats entre composants
const StatsContext = React.createContext<any>(null);

const BunexeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [globalStats, setGlobalStats] = useState({ examens: 0, inscriptions: 0, resultats: 0, eleves: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshStats = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        const [examens, inscriptions, resultats, eleves] = await Promise.all([
          api.get('/examens'),
          api.get('/inscriptions-examens'),
          api.get('/resultats-examens'),
          api.get('/eleves')
        ]);
        setGlobalStats({
          examens: examens.data.length,
          inscriptions: inscriptions.data.length,
          resultats: resultats.data.length,
          eleves: eleves.data.length
        });
      } catch (error) {
        console.error('Erreur chargement stats globales:', error);
      }
    };
    loadGlobalStats();
  }, [refreshTrigger]);

  if (user && user.role !== 'bunexe') {
    navigate('/dashboard');
  }

  return (
    <StatsContext.Provider value={{ refreshStats, globalStats }}>
      <div className={styles.dashboardContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.logo}>
            <h2>EduHaiti</h2>
            <p>BUNEXE</p>
          </div>
          <nav className={styles.nav}>
            <NavLinkBunexe to="/bunexe" icon={<Home size={20} />} label="Accueil" />
            <NavLinkBunexe to="/bunexe/examens" icon={<FileText size={20} />} label="Examens" />
            <NavLinkBunexe to="/bunexe/inscriptions" icon={<ClipboardList size={20} />} label="Inscriptions" />
            <NavLinkBunexe to="/bunexe/resultats" icon={<Award size={20} />} label="Résultats" />
            <NavLinkBunexe to="/bunexe/eleves" icon={<Users size={20} />} label="Élèves" />
            <NavLinkBunexe to="/bunexe/ecoles" icon={<School size={20} />} label="Écoles" />
          </nav>
          <div className={styles.logoutSection}>
            <button onClick={() => { localStorage.clear(); navigate('/connexion'); }} className={styles.logoutButton}>
              <span>🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>
        <main className={styles.content}>
          <Routes>
            <Route path="/" element={<BunexeAccueil />} />
            <Route path="/examens/*" element={<BunexeExamens refreshStats={refreshStats} />} />
            <Route path="/inscriptions/*" element={<BunexeInscriptions refreshStats={refreshStats} />} />
            <Route path="/resultats/*" element={<BunexeResultats refreshStats={refreshStats} />} />
            <Route path="/eleves/*" element={<BunexeEleves />} />
            <Route path="/ecoles/*" element={<BunexeEcoles />} />
          </Routes>
        </main>
      </div>
    </StatsContext.Provider>
  );
};

const NavLinkBunexe: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isActive = location === to;
  
  return (
    <button
      onClick={() => navigate(to)}
      className={`${styles.navLink} ${isActive ? styles.active : ''}`}
      style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer' }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

// ========== PAGE ACCUEIL BUNEXE ==========
const BunexeAccueil: React.FC = () => {
  const { globalStats } = React.useContext(StatsContext);
  const [stats, setStats] = useState(globalStats);

  useEffect(() => {
    setStats(globalStats);
  }, [globalStats]);

  const cartes = [
    { title: 'Examens', value: stats.examens, icon: <FileText size={24} />, color: '#4361ee', path: '/bunexe/examens' },
    { title: 'Inscriptions', value: stats.inscriptions, icon: <ClipboardList size={24} />, color: '#fca311', path: '/bunexe/inscriptions' },
    { title: 'Résultats', value: stats.resultats, icon: <Award size={24} />, color: '#06d6a0', path: '/bunexe/resultats' },
    { title: 'Élèves', value: stats.eleves, icon: <Users size={24} />, color: '#7209b7', path: '/bunexe/eleves' }
  ];

  return (
    <div>
      <h1 className={styles.formTitle}>📊 Bureau National des Examens (BUNEXE)</h1>
      <p className={styles.formSubtitle}>Gérez les examens nationaux, les inscriptions et les résultats</p>
      
      <div className={styles.statsGrid}>
        {cartes.map((carte, idx) => (
          <div key={idx} className={styles.statCard} onClick={() => window.location.href = carte.path} style={{ cursor: 'pointer' }}>
            <div className={styles.statInfo}>
              <h3>{carte.title}</h3>
              <div className={styles.statNumber}>{carte.value}</div>
            </div>
            <div className={styles.statIcon} style={{ background: `${carte.color}20`, color: carte.color }}>{carte.icon}</div>
          </div>
        ))}
      </div>

      <div className={styles.formCard}>
        <h3 style={{ marginBottom: 16 }}>📋 Actions rapides</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <Link to="/bunexe/examens" className={styles.primaryButton} style={{ textDecoration: 'none', textAlign: 'center' }}>📝 Gérer les examens</Link>
          <Link to="/bunexe/inscriptions" className={styles.primaryButton} style={{ textDecoration: 'none', textAlign: 'center', background: '#fca311' }}>📋 Gérer les inscriptions</Link>
          <Link to="/bunexe/resultats" className={styles.primaryButton} style={{ textDecoration: 'none', textAlign: 'center', background: '#06d6a0' }}>📊 Publier les résultats</Link>
        </div>
      </div>
    </div>
  );
};

// ========== GESTION DES EXAMENS BUNEXE ==========
const BunexeExamens: React.FC<{ refreshStats: () => void }> = ({ refreshStats }) => {
  const [examens, setExamens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExamen, setEditingExamen] = useState<any>(null);
  const [formData, setFormData] = useState({
    nom: '', description: '', annee_session: new Date().getFullYear(),
    debut_inscription: '', fin_inscription: '', date_examen: '',
    heure_examen: '09:00', duree: 120, coefficient: 1,
    lieu: '', nombre_places: 0, frais_inscription: 0,
    type_examen: 'bac'
  });

  useEffect(() => { loadExamens(); }, []);

  const loadExamens = async () => {
    setLoading(true);
    try {
      const res = await api.get('/examens');
      setExamens(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingExamen) {
        await api.put(`/examens/${editingExamen.id}`, formData);
        alert('✅ Examen modifié');
      } else {
        await api.post('/examens', formData);
        alert('✅ Examen créé');
        refreshStats();
      }
      resetForm();
      loadExamens();
    } catch (err: any) { alert(err.response?.data?.error || '❌ Erreur'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`⚠️ Supprimer "${nom}" ?`)) {
      try { 
        await api.delete(`/examens/${id}`); 
        loadExamens(); 
        refreshStats();
        alert('✅ Supprimé'); 
      }
      catch (err) { alert('❌ Erreur'); }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '', description: '', annee_session: new Date().getFullYear(),
      debut_inscription: '', fin_inscription: '', date_examen: '',
      heure_examen: '09:00', duree: 120, coefficient: 1,
      lieu: '', nombre_places: 0, frais_inscription: 0,
      type_examen: 'bac'
    });
    setEditingExamen(null);
    setShowForm(false);
  };

  const editExamen = (examen: any) => { setEditingExamen(examen); setFormData(examen); setShowForm(true); };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : 'Non définie';

  const getStatus = (examen: any) => {
    const now = new Date();
    const debut = new Date(examen.debut_inscription);
    const fin = new Date(examen.fin_inscription);
    const dateExamen = new Date(examen.date_examen);
    if (now > dateExamen) return { label: 'Terminé', className: styles.badgeWarning };
    if (now < debut) return { label: 'À venir', className: styles.badgeInfo };
    if (now > fin) return { label: 'Inscriptions fermées', className: styles.badgeDanger };
    return { label: 'Inscriptions ouvertes', className: styles.badgeSuccess };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 className={styles.formTitle}>📝 Gestion des examens</h1><p className={styles.formSubtitle}>Organisez les examens nationaux</p></div>
        {!showForm && <button onClick={() => setShowForm(true)} className={styles.primaryButton}><Plus size={18} /> Nouvel examen</button>}
      </div>

      {showForm && (
        <div className={styles.formCard} style={{ marginBottom: 32 }}>
          <h3>{editingExamen ? '✏️ Modifier' : '➕ Créer'} un examen</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className={styles.formGroup}><label className={styles.label}>Nom *</label><input type="text" className={styles.input} required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} /></div>
              <div className={styles.formGroup}><label className={styles.label}>Année *</label><input type="number" className={styles.input} required value={formData.annee_session} onChange={e => setFormData({...formData, annee_session: parseInt(e.target.value)})} /></div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Type d'examen *</label>
              <select className={styles.input} value={formData.type_examen} onChange={e => setFormData({...formData, type_examen: e.target.value})}>
                <option value="9e AF">📘 9e AF (9e Année Fondamentale)</option>
                <option value="NS4">📗 NS4 (Nouveau Secondaire 4)</option>
                <option value="bac">🎓 Baccalauréat</option>
              </select>
              <small style={{ color: '#6c757d', fontSize: 12, marginTop: 4, display: 'block' }}>
                Sélectionnez le type d'examen selon le système officiel haïtien
              </small>
            </div>

            <div className={styles.formGroup}><label className={styles.label}>Description</label><textarea className={styles.input} rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <h4>📅 Dates</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label className={styles.label}>Date examen</label><input type="date" className={styles.input} value={formData.date_examen} onChange={e => setFormData({...formData, date_examen: e.target.value})} /></div>
                <div><label className={styles.label}>Heure</label><input type="time" className={styles.input} value={formData.heure_examen} onChange={e => setFormData({...formData, heure_examen: e.target.value})} /></div>
                <div><label className={styles.label}>Durée (min)</label><input type="number" className={styles.input} value={formData.duree} onChange={e => setFormData({...formData, duree: parseInt(e.target.value)})} /></div>
                <div><label className={styles.label}>Lieu</label><input type="text" className={styles.input} value={formData.lieu} onChange={e => setFormData({...formData, lieu: e.target.value})} /></div>
              </div>
            </div>
            <div style={{ background: '#fff3e0', padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <h4>📋 Inscriptions</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div><label className={styles.label}>Début</label><input type="date" className={styles.input} value={formData.debut_inscription} onChange={e => setFormData({...formData, debut_inscription: e.target.value})} /></div>
                <div><label className={styles.label}>Fin</label><input type="date" className={styles.input} value={formData.fin_inscription} onChange={e => setFormData({...formData, fin_inscription: e.target.value})} /></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              <div><label className={styles.label}>Coefficient</label><input type="number" step="0.5" className={styles.input} value={formData.coefficient} onChange={e => setFormData({...formData, coefficient: parseFloat(e.target.value)})} /></div>
              <div><label className={styles.label}>Places</label><input type="number" className={styles.input} value={formData.nombre_places} onChange={e => setFormData({...formData, nombre_places: parseInt(e.target.value)})} /></div>
              <div><label className={styles.label}>Frais (Gdes)</label><input type="number" className={styles.input} value={formData.frais_inscription} onChange={e => setFormData({...formData, frais_inscription: parseInt(e.target.value)})} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="submit" className={styles.primaryButton}>{loading ? 'Enregistrement...' : (editingExamen ? 'Modifier' : 'Créer')}</button>
              <button type="button" onClick={resetForm} className={styles.secondaryButton}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
        {examens.map(examen => {
          const status = getStatus(examen);
          return (
            <div key={examen.id} className={styles.formCard} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3>{examen.nom}</h3>
                  <span className={`${styles.badge} ${status.className}`}>{status.label}</span>
                  {examen.type_examen && <span className={styles.badgeInfo} style={{ marginLeft: 8 }}>{examen.type_examen}</span>}
                </div>
                <div><button onClick={() => editExamen(examen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca311' }}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(examen.id, examen.nom)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef233c' }}><Trash2 size={16} /></button></div>
              </div>
              <div style={{ borderTop: '1px solid #e9ecef', marginTop: 12, paddingTop: 12 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}><span><Calendar size={14} /> {examen.annee_session}</span><span><Award size={14} /> Coef {examen.coefficient}</span></div>
                {examen.date_examen && <div><Clock size={14} /> {formatDate(examen.date_examen)} à {examen.heure_examen}</div>}
                {examen.lieu && <div><MapPin size={14} /> {examen.lieu}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========== GESTION DES INSCRIPTIONS BUNEXE ==========
const BunexeInscriptions: React.FC<{ refreshStats: () => void }> = ({ refreshStats }) => {
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [examens, setExamens] = useState<any[]>([]);
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState<number | null>(null);
  const [examenInfo, setExamenInfo] = useState<any>(null);
  const [selectedEleve, setSelectedEleve] = useState('');
  const [stats, setStats] = useState({ total: 0, enCours: 0, confirme: 0, echoue: 0, reussi: 0 });

  useEffect(() => {
    loadExamens();
    loadAllInscriptions();
  }, []);

  const loadExamens = async () => {
    try {
      const res = await api.get('/examens');
      setExamens(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllInscriptions = async () => {
    try {
      const res = await api.get('/inscriptions-examens');
      setInscriptions(res.data);
      
      const total = res.data.length;
      const enCours = res.data.filter((i: any) => i.statut === 'en cours').length;
      const confirme = res.data.filter((i: any) => i.statut === 'confirme').length;
      const echoue = res.data.filter((i: any) => i.statut === 'echoue').length;
      const reussi = res.data.filter((i: any) => i.statut === 'reussi').length;
      setStats({ total, enCours, confirme, echoue, reussi });
    } catch (err) {
      console.error(err);
    }
  };

  const chargerElevesPourExamen = async (examenId: number) => {
    setSelectedExamen(examenId);
    const examen = examens.find(e => e.id === examenId);
    setExamenInfo(examen);
    setLoading(true);
    try {
      const [tousEleves, inscriptionsExamen] = await Promise.all([
        api.get('/eleves'),
        api.get(`/inscriptions-examens/examen/${examenId}`)
      ]);
      
      const idsInscrits = inscriptionsExamen.data.map((ins: any) => ins.id_eleve);
      const elevesNonInscrits = tousEleves.data.filter((e: any) => !idsInscrits.includes(e.id));
      
      setEleves(elevesNonInscrits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEleve || !selectedExamen) {
      alert('Veuillez sélectionner un examen d\'abord, puis un élève');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/inscriptions-examens', { 
        id_eleve: selectedEleve, 
        id_examen: selectedExamen,
        statut: 'en cours'
      });
      alert('✅ Inscription enregistrée avec succès');
      setShowForm(false);
      setSelectedEleve('');
      setSelectedExamen(null);
      setExamenInfo(null);
      setEleves([]);
      await loadAllInscriptions();
      refreshStats();
    } catch (err: any) { 
      alert(err.response?.data?.message || '❌ Erreur lors de l\'inscription'); 
    }
    finally { setLoading(false); }
  };

  const updateStatut = async (id: number, nouveauStatut: string) => {
    try {
      await api.put(`/inscriptions-examens/${id}`, { statut: nouveauStatut });
      alert(`✅ Inscription ${nouveauStatut === 'confirme' ? 'confirmée' : nouveauStatut === 'reussi' ? 'réussie' : 'échouée'}`);
      await loadAllInscriptions();
      refreshStats();
    } catch (err) { 
      alert('❌ Erreur lors de la mise à jour'); 
    }
  };

  const annulerInscription = async (id: number) => {
    if (window.confirm('Annuler cette inscription ?')) {
      try { 
        await api.delete(`/inscriptions-examens/${id}`); 
        await loadAllInscriptions(); 
        refreshStats();
        alert('✅ Inscription annulée'); 
      }
      catch (err) { 
        alert('❌ Erreur'); 
      }
    }
  };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-';

  const getStatutBadge = (statut: string) => {
    switch(statut) {
      case 'confirme': return { text: '✅ Confirmée', class: styles.badgeSuccess };
      case 'reussi': return { text: '🎉 Réussi', class: styles.badgeSuccess };
      case 'echoue': return { text: '❌ Échoué', class: styles.badgeDanger };
      default: return { text: '⏳ En cours', class: styles.badgeWarning };
    }
  };

  return (
    <div>
      <h1 className={styles.formTitle}>📋 Gestion des inscriptions aux examens</h1>
      <p className={styles.formSubtitle}>Inscrivez des élèves, gérez les statuts des inscriptions</p>

      <div className={styles.formCard} style={{ marginBottom: 24 }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Sélectionner un examen</label>
          <select 
            className={styles.input} 
            onChange={(e) => chargerElevesPourExamen(Number(e.target.value))}
            value={selectedExamen || ""}
          >
            <option value="">-- Choisir un examen --</option>
            {examens.map((ex: any) => (
              <option key={ex.id} value={ex.id}>
                {ex.nom} - {ex.annee_session} ({ex.type_examen || 'Standard'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedExamen && !showForm && (
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => setShowForm(true)} className={styles.primaryButton}>
            <Plus size={18} /> Nouvelle inscription pour {examenInfo?.nom}
          </button>
        </div>
      )}

      {showForm && selectedExamen && (
        <div className={styles.formCard} style={{ marginBottom: 32 }}>
          <h3>➕ Inscrire un élève à {examenInfo?.nom}</h3>
          <form onSubmit={handleInscription}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Élève</label>
              <select 
                className={styles.input} 
                required 
                value={selectedEleve} 
                onChange={e => setSelectedEleve(e.target.value)}
              >
                <option value="">-- Choisir un élève --</option>
                {eleves.map((e: any) => (
                  <option key={e.id} value={e.id}>
                    {e.prenom} {e.nom} - {e.matricule_national || 'pas de matricule'} - {e.classe || 'classe non définie'}
                  </option>
                ))}
              </select>
              {eleves.length === 0 && (
                <small style={{ color: '#ef233c', display: 'block', marginTop: 4 }}>
                  Aucun élève disponible pour cet examen (tous sont déjà inscrits)
                </small>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className={styles.primaryButton} disabled={loading || eleves.length === 0}>
                {loading ? 'Inscription...' : 'Inscrire'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setSelectedEleve('');
                }} 
                className={styles.secondaryButton}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedExamen && examenInfo && (
        <div className={styles.formCard} style={{ marginBottom: 24, background: '#f0f4ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h3>📌 {examenInfo.nom} - Session {examenInfo.annee_session}</h3>
              <p style={{ marginTop: 8, fontSize: 14 }}>
                📊 Type: {examenInfo.type_examen === 'bac' ? 'Baccalauréat' : 
                  examenInfo.type_examen === '9e AF' ? '9e Année Fondamentale' : 
                  examenInfo.type_examen === 'NS4' ? 'Nouveau Secondaire 4' : 'Standard'}
              </p>
              {examenInfo.date_examen && (
                <p style={{ fontSize: 13, color: '#6c757d' }}>
                  📅 Date examen: {formatDate(examenInfo.date_examen)}
                </p>
              )}
            </div>
            <div>
              <span className={styles.badgeInfo}>📝 Inscriptions: {inscriptions.filter(i => i.id_examen === selectedExamen).length}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}><div><h3>Total</h3><div className={styles.statNumber}>{stats.total}</div></div><div className={styles.statIcon}>📋</div></div>
        <div className={styles.statCard}><div><h3>En cours</h3><div className={styles.statNumber} style={{ color: '#fca311' }}>{stats.enCours}</div></div><div className={styles.statIcon}>⏳</div></div>
        <div className={styles.statCard}><div><h3>Confirmées</h3><div className={styles.statNumber} style={{ color: '#06d6a0' }}>{stats.confirme}</div></div><div className={styles.statIcon}>✅</div></div>
        <div className={styles.statCard}><div><h3>Réussis</h3><div className={styles.statNumber} style={{ color: '#28a745' }}>{stats.reussi}</div></div><div className={styles.statIcon}>🎉</div></div>
        <div className={styles.statCard}><div><h3>Échoués</h3><div className={styles.statNumber} style={{ color: '#ef233c' }}>{stats.echoue}</div></div><div className={styles.statIcon}>❌</div></div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Élève</th>
              <th>Matricule</th>
              <th>Examen</th>
              <th>Date inscription</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inscriptions.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Aucune inscription</td></tr>
            ) : (
              inscriptions.map((ins: any) => {
                const statutBadge = getStatutBadge(ins.statut);
                return (
                  <tr key={ins.id}>
                    <td><strong>{ins.eleve_prenom} {ins.eleve_nom}</strong></td>
                    <td><code>{ins.matricule_national || '-'}</code></td>
                    <td>{ins.examen_nom}</td>
                    <td>{formatDate(ins.date_inscription)}</td>
                    <td><span className={statutBadge.class}>{statutBadge.text}</span></td>
                    <td>
                      {ins.statut === 'en cours' && (
                        <>
                          <button onClick={() => updateStatut(ins.id, 'confirme')} className={styles.primaryButton} style={{ marginRight: 8, padding: '4px 10px' }}>✅ Confirmer</button>
                          <button onClick={() => updateStatut(ins.id, 'echoue')} className={styles.secondaryButton} style={{ marginRight: 8, padding: '4px 10px', background: '#ef233c', color: 'white', border: 'none' }}>❌ Échoué</button>
                          <button onClick={() => updateStatut(ins.id, 'reussi')} className={styles.primaryButton} style={{ padding: '4px 10px', background: '#28a745' }}>🎉 Réussi</button>
                        </>
                      )}
                      {ins.statut !== 'en cours' && (
                        <button onClick={() => annulerInscription(ins.id)} className={styles.secondaryButton} style={{ padding: '4px 10px' }}>🗑️ Annuler</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== GESTION DES RÉSULTATS BUNEXE AVEC SAISIE DES NOTES ==========
const BunexeResultats: React.FC<{ refreshStats: () => void }> = ({ refreshStats }) => {
  const [examens, setExamens] = useState<any[]>([]);
  const [selectedExamen, setSelectedExamen] = useState<number | null>(null);
  const [examenInfo, setExamenInfo] = useState<any>(null);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingNote, setSavingNote] = useState<number | null>(null);
  const [statsDecision, setStatsDecision] = useState({ admis: 0, echoue: 0, ajourne: 0, recale: 0 });

  useEffect(() => {
    const fetchExamens = async () => {
      try { 
        const res = await api.get('/examens'); 
        setExamens(res.data); 
      } catch (err) { 
        console.error(err); 
      }
    };
    fetchExamens();
  }, []);

  const chargerInscriptionsAvecResultats = async (examenId: number) => {
    setSelectedExamen(examenId);
    const examen = examens.find(e => e.id === examenId);
    setExamenInfo(examen);
    setLoading(true);
    try {
      // Récupérer les inscriptions pour cet examen (tous statuts confirme/reussi/echoue)
      const inscriptionsRes = await api.get(`/inscriptions-examens/examen/${examenId}`);
      const inscriptionsValidees = inscriptionsRes.data.filter((i: any) => 
        i.statut === 'confirme' || i.statut === 'reussi' || i.statut === 'echoue'
      );
      
      // Pour chaque inscription, récupérer ou créer un résultat
      const resultatsAvecInscriptions = await Promise.all(
        inscriptionsValidees.map(async (ins: any) => {
          try {
            // Récupérer les résultats pour cet examen
            const resultatsRes = await api.get(`/resultats-examens/examen/${examenId}`);
            const resultatExistant = resultatsRes.data.find((r: any) => r.id_eleve === ins.id_eleve);
            
            if (resultatExistant) {
              return {
                ...ins,
                resultat_id: resultatExistant.id,
                note: resultatExistant.note,
                publie: resultatExistant.publie
              };
            } else {
              // Créer un résultat vide
              const createRes = await api.post('/resultats-examens', {
                id_eleve: ins.id_eleve,
                id_examen: examenId,
                note: 0
              });
              return {
                ...ins,
                resultat_id: createRes.data.id,
                note: 0,
                publie: false
              };
            }
          } catch (err) {
            console.error('Erreur récupération résultat:', err);
            return { ...ins, note: 0, publie: false };
          }
        })
      );
      
      setInscriptions(resultatsAvecInscriptions);
      
      // Calculer les statistiques
      const admis = resultatsAvecInscriptions.filter((r: any) => getDecisionHaitienne(r.note, examen?.type_examen || examen?.nom) === 'Admis(e)').length;
      const echoue = resultatsAvecInscriptions.filter((r: any) => getDecisionHaitienne(r.note, examen?.type_examen || examen?.nom) === 'Échoué(e)').length;
      const ajourne = resultatsAvecInscriptions.filter((r: any) => getDecisionHaitienne(r.note, examen?.type_examen || examen?.nom) === 'Ajourné(e)').length;
      const recale = resultatsAvecInscriptions.filter((r: any) => getDecisionHaitienne(r.note, examen?.type_examen || examen?.nom) === 'Recalé(e)').length;
      setStatsDecision({ admis, echoue, ajourne, recale });
      
    } catch (err) { 
      console.error('Erreur chargement:', err); 
      alert('Erreur lors du chargement des inscriptions');
    }
    finally { setLoading(false); }
  };

  const sauvegarderNote = async (resultatId: number, note: number, eleveNom: string) => {
    if (note < 0 || note > 20) {
      alert('❌ La note doit être comprise entre 0 et 20');
      return;
    }
    
    setSavingNote(resultatId);
    try {
      await api.put(`/resultats-examens/${resultatId}`, { note });
      // Mettre à jour la note dans l'état local
      setInscriptions(prev => prev.map(ins => 
        ins.resultat_id === resultatId ? { ...ins, note: note } : ins
      ));
      alert(`✅ Note ${note}/20 enregistrée pour ${eleveNom}`);
      
      // Recalculer les statistiques
      if (selectedExamen) {
        chargerInscriptionsAvecResultats(selectedExamen);
      }
    } catch (err) { 
      console.error('Erreur sauvegarde:', err);
      alert('❌ Erreur lors de la sauvegarde de la note'); 
    } finally { 
      setSavingNote(null); 
    }
  };

  const publierResultats = async () => {
    if (!selectedExamen) return;
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir publier tous les résultats ? Ils seront visibles par les secrétariats et les parents.')) {
      setLoading(true);
      try {
        await api.post(`/resultats-examens/${selectedExamen}/publier`);
        alert('✅ Résultats publiés avec succès');
        refreshStats();
        if (selectedExamen) chargerInscriptionsAvecResultats(selectedExamen);
      } catch (err) { 
        console.error('Erreur publication:', err);
        alert('❌ Erreur lors de la publication'); 
      } finally { 
        setLoading(false); 
      }
    }
  };

  const getDecisionHaitienne = (note: number, typeExamen: string): string => {
    const noteValue = Number(note);
    
    if (typeExamen === 'bac' || typeExamen === 'Baccalauréat') {
      if (noteValue >= 10) return 'Admis(e)';
      if (noteValue >= 8 && noteValue < 10) return 'Ajourné(e) - Peut repasser';
      return 'Recalé(e)';
    }
    if (typeExamen === '9e AF') {
      if (noteValue >= 10) return 'Admis(e)';
      if (noteValue >= 8 && noteValue < 10) return 'Ajourné(e)';
      return 'Échoué(e)';
    }
    if (typeExamen === 'NS4') {
      if (noteValue >= 10) return 'Admis(e)';
      if (noteValue >= 7 && noteValue < 10) return 'Ajourné(e)';
      return 'Échoué(e)';
    }
    if (noteValue >= 10) return 'Admis(e)';
    if (noteValue >= 7 && noteValue < 10) return 'Ajourné(e)';
    return 'Échoué(e)';
  };

  const getMentionHaitienne = (note: number, typeExamen: string) => {
    const noteValue = Number(note);
    
    if (typeExamen === 'bac' || typeExamen === 'Baccalauréat') {
      if (noteValue >= 16) return { text: '🏅 Très Bien', class: styles.badgeSuccess };
      if (noteValue >= 13) return { text: '🎖️ Bien', class: styles.badgeSuccess };
      if (noteValue >= 10) return { text: '✅ Passable', class: styles.badgeWarning };
      if (noteValue >= 8) return { text: '⏳ Ajourné', class: styles.badgeWarning };
      return { text: '❌ Recalé', class: styles.badgeDanger };
    }
    if (typeExamen === '9e AF') {
      if (noteValue >= 16) return { text: '🏅 Très Bien', class: styles.badgeSuccess };
      if (noteValue >= 13) return { text: '🎖️ Bien', class: styles.badgeSuccess };
      if (noteValue >= 10) return { text: '📘 Assez Bien', class: styles.badgeInfo };
      if (noteValue >= 8) return { text: '⚠️ Ajourné', class: styles.badgeWarning };
      return { text: '❌ Échoué', class: styles.badgeDanger };
    }
    if (typeExamen === 'NS4') {
      if (noteValue >= 16) return { text: '🏅 Très Bien', class: styles.badgeSuccess };
      if (noteValue >= 13) return { text: '🎖️ Bien', class: styles.badgeSuccess };
      if (noteValue >= 10) return { text: '📘 Assez Bien', class: styles.badgeInfo };
      if (noteValue >= 7) return { text: '⚠️ Ajourné', class: styles.badgeWarning };
      return { text: '❌ Échoué', class: styles.badgeDanger };
    }
    if (noteValue >= 16) return { text: '🏅 Excellent', class: styles.badgeSuccess };
    if (noteValue >= 14) return { text: '🎖️ Très Bien', class: styles.badgeSuccess };
    if (noteValue >= 12) return { text: '📘 Bien', class: styles.badgeInfo };
    if (noteValue >= 10) return { text: '✅ Passable', class: styles.badgeWarning };
    if (noteValue >= 7) return { text: '⚠️ Ajourné', class: styles.badgeWarning };
    return { text: '❌ Échoué', class: styles.badgeDanger };
  };

  const getBadgeColor = (decision: string) => {
    if (decision.includes('Admis')) return styles.badgeSuccess;
    if (decision.includes('Ajourné')) return styles.badgeWarning;
    if (decision.includes('Recalé')) return styles.badgeDanger;
    return styles.badgeDanger;
  };

  // Suppression de la ligne `const formatDate = ...` qui n'était pas utilisée

  return (
    <div>
      <h1 className={styles.formTitle}>📊 Gestion des résultats - BUNEXE</h1>
      <p className={styles.formSubtitle}>Saisie des notes selon le système officiel haïtien (9e AF, NS4, Baccalauréat)</p>

      <div className={styles.formCard} style={{ marginBottom: 24 }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Sélectionner un examen</label>
          <select 
            className={styles.input} 
            onChange={(e) => chargerInscriptionsAvecResultats(Number(e.target.value))}
            value={selectedExamen || ""}
          >
            <option value="">-- Choisir un examen --</option>
            {examens.map((ex: any) => (
              <option key={ex.id} value={ex.id}>
                {ex.nom} - {ex.annee_session} ({ex.type_examen || 'Standard'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedExamen && examenInfo && (
        <>
          <div className={styles.formCard} style={{ marginBottom: 24, background: '#f0f4ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <h3>📌 {examenInfo.nom} - Session {examenInfo.annee_session}</h3>
                <p style={{ marginTop: 8, fontSize: 14 }}>
                  📊 Type: {examenInfo.type_examen === 'bac' ? 'Baccalauréat' : 
                    examenInfo.type_examen === '9e AF' ? '9e Année Fondamentale' : 
                    examenInfo.type_examen === 'NS4' ? 'Nouveau Secondaire 4' : 'Standard'}
                </p>
                <p style={{ fontSize: 13, color: '#6c757d' }}>
                  📌 Barème: Seuil d'admission à 10/20 | Mention Très Bien à partir de 16/20
                </p>
              </div>
              <div>
                <span className={styles.badgeInfo}>📝 Total candidats: {inscriptions.length}</span>
              </div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}><div><h3>🎓 Admis(es)</h3><div className={styles.statNumber} style={{ color: '#06d6a0' }}>{statsDecision.admis}</div></div></div>
            <div className={styles.statCard}><div><h3>⚠️ Ajourné(es)</h3><div className={styles.statNumber} style={{ color: '#fca311' }}>{statsDecision.ajourne}</div></div></div>
            <div className={styles.statCard}><div><h3>❌ Échoué(es)</h3><div className={styles.statNumber} style={{ color: '#ef233c' }}>{statsDecision.echoue}</div></div></div>
            <div className={styles.statCard}><div><h3>📋 Recalé(es)</h3><div className={styles.statNumber} style={{ color: '#dc3545' }}>{statsDecision.recale}</div></div></div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Élève</th>
                  <th>École</th>
                  <th>Classe</th>
                  <th>Note /20</th>
                  <th>Mention</th>
                  <th>Décision</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center' }}>Chargement...</td></tr>
                ) : inscriptions.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center' }}>Aucun candidat inscrit pour cet examen</td></tr>
                ) : (
                  inscriptions.map((ins: any) => {
                    const mention = getMentionHaitienne(ins.note, examenInfo?.type_examen || examenInfo?.nom);
                    const decision = getDecisionHaitienne(ins.note, examenInfo?.type_examen || examenInfo?.nom);
                    return (
                      <tr key={ins.id}>
                        <td><code>{ins.matricule_national || '-'}</code></td>
                        <td><strong>{ins.eleve_prenom} {ins.eleve_nom}</strong></td>
                        <td>{ins.nom_ecole || '-'}</td>
                        <td>{ins.classe || '-'}</td>
                        <td>
                          {ins.publie ? (
                            <span style={{ fontWeight: 'bold', fontSize: 18 }}>{ins.note}/20</span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <input 
                                type="number" 
                                step="0.5" 
                                min="0" 
                                max="20" 
                                value={ins.note || 0}
                                onChange={(e) => {
                                  const newNote = parseFloat(e.target.value);
                                  if (!isNaN(newNote) && newNote >= 0 && newNote <= 20) {
                                    setInscriptions(prev => prev.map(i => 
                                      i.id === ins.id ? { ...i, note: newNote } : i
                                    ));
                                  }
                                }}
                                className={styles.input} 
                                style={{ width: 80 }}
                                disabled={savingNote === ins.resultat_id}
                              />
                              <button 
                                onClick={() => sauvegarderNote(ins.resultat_id, ins.note, `${ins.eleve_prenom} ${ins.eleve_nom}`)}
                                className={styles.primaryButton}
                                style={{ padding: '4px 12px' }}
                                disabled={savingNote === ins.resultat_id}
                              >
                                {savingNote === ins.resultat_id ? '💾...' : '💾 Sauvegarder'}
                              </button>
                            </div>
                          )}
                        </td>
                        <td><span className={mention.class}>{mention.text}</span></td>
                        <td><span className={getBadgeColor(decision)}>{decision}</span></td>
                        <td>
                          {ins.publie ? 
                            <span className={styles.badgeSuccess}>✅ Publié</span> : 
                            <span className={styles.badgeWarning}>📝 En cours</span>
                          }
                        </td>
                        <td>
                          {!ins.publie && (
                            <button 
                              onClick={() => sauvegarderNote(ins.resultat_id, ins.note, `${ins.eleve_prenom} ${ins.eleve_nom}`)}
                              className={styles.primaryButton}
                              style={{ padding: '4px 12px' }}
                              disabled={savingNote === ins.resultat_id}
                            >
                              💾 Enregistrer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={publierResultats} 
              className={styles.primaryButton} 
              style={{ background: '#06d6a0' }}
              disabled={loading || inscriptions.length === 0}
            >
              <Award size={18} /> Publier tous les résultats
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ========== LISTE DES ÉLÈVES ==========
const BunexeEleves: React.FC = () => {
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadEleves = async () => {
      try { 
        const res = await api.get('/eleves'); 
        setEleves(res.data); 
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    loadEleves();
  }, []);

  const filteredEleves = eleves.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.matricule_national && e.matricule_national.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <h1 className={styles.formTitle}>🎓 Liste des élèves</h1>
      <p className={styles.formSubtitle}>Consultez tous les élèves inscrits avec leurs matricules et écoles</p>

      <div style={{ marginBottom: 24 }}>
        <div className={styles.inputWrapper}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
          <input type="text" placeholder="Rechercher par nom, prénom ou matricule..." className={styles.input} style={{ paddingLeft: 40 }}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom complet</th>
              <th>École</th>
              <th>Classe</th>
              <th>Date naissance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <td><td colSpan={5} style={{ textAlign: 'center' }}>Chargement...</td></td>
            ) : filteredEleves.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Aucun élève</td></tr>
            ) : (
              filteredEleves.map((eleve: any) => (
                <tr key={eleve.id}>
                  <td><code>{eleve.matricule_national || 'En attente'}</code></td>
                  <td><strong>{eleve.prenom} {eleve.nom}</strong></td>
                  <td>{eleve.nom_ecole || '-'}</td>
                  <td><span className={styles.badgeInfo} style={{ padding: '2px 8px', borderRadius: 12 }}>{eleve.classe || 'Non assignée'}</span></td>
                  <td>{eleve.date_naissance ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR') : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== LISTE DES ÉCOLES ==========
const BunexeEcoles: React.FC = () => {
  const [ecoles, setEcoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEcoles = async () => {
      try {
        const res = await api.get('/admin/ecoles');
        setEcoles(res.data);
      } catch (err) { 
        console.error('Erreur chargement écoles:', err); 
      } finally { 
        setLoading(false); 
      }
    };
    loadEcoles();
  }, []);

  return (
    <div>
      <h1 className={styles.formTitle}>🏫 Gestion des écoles</h1>
      <p className={styles.formSubtitle}>Consultez les écoles et leurs responsables (Secrétariat)</p>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom de l'école</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Responsable(s)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Chargement...</td></tr>
            ) : ecoles.length === 0 ? (
              <td><td colSpan={4} style={{ textAlign: 'center' }}>Aucune école</td></td>
            ) : (
              ecoles.map((ecole: any) => (
                <tr key={ecole.id}>
                  <td><strong>{ecole.nom}</strong></td>
                  <td>{ecole.adresse || '-'}</td>
                  <td>{ecole.telephone || '-'}</td>
                  <td><span style={{ color: '#6c757d' }}>Non assigné</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BunexeDashboard;