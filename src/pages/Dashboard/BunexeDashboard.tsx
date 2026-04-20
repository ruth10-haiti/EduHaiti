import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, FileText, ClipboardList, Award, Users, School, Plus, Edit2, Trash2, Calendar, Clock, MapPin, Search, Edit3 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../styles/AdminDashboard.module.css';

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
            <NavLinkBunexe to="/bunexe/notes" icon={<Edit3 size={20} />} label="Notes" />
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
            <Route path="/notes/*" element={<BunexeSaisieNotes refreshStats={refreshStats} />} />
            <Route path="/resultats/*" element={<BunexeResultatsLecture refreshStats={refreshStats} />} />
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

// ========== PAGE ACCUEIL ==========
const BunexeAccueil: React.FC = () => {
  const { globalStats } = React.useContext(StatsContext);
  const [stats, setStats] = useState(globalStats);
  useEffect(() => {
    setStats(globalStats);
  }, [globalStats]);

  const cartes = [
    { title: 'Examens', value: stats.examens, icon: <FileText size={24} />, color: '#4361ee', path: '/bunexe/examens' },
    { title: 'Inscriptions', value: stats.inscriptions, icon: <ClipboardList size={24} />, color: '#fca311', path: '/bunexe/inscriptions' },
    { title: 'Notes', value: stats.resultats, icon: <Edit3 size={24} />, color: '#f97316', path: '/bunexe/notes' },
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
          <Link to="/bunexe/notes" className={styles.primaryButton} style={{ textDecoration: 'none', textAlign: 'center', background: '#f97316' }}>✏️ Saisir les notes</Link>
          <Link to="/bunexe/resultats" className={styles.primaryButton} style={{ textDecoration: 'none', textAlign: 'center', background: '#06d6a0' }}>📊 Voir les résultats</Link>
        </div>
      </div>
    </div>
  );
};

// ========== GESTION DES EXAMENS ==========
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

// ========== GESTION DES INSCRIPTIONS ==========
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

// ========== SAISIE DES NOTES ==========
const BunexeSaisieNotes: React.FC<{ refreshStats: () => void }> = ({ refreshStats }) => {
  const [examens, setExamens] = useState<any[]>([]);
  const [selectedExamen, setSelectedExamen] = useState<number | null>(null);
  const [examenInfo, setExamenInfo] = useState<any>(null);
  const [eleve, setEleve] = useState<any>(null);
  const [elevesDisponibles, setElevesDisponibles] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultatCalcul, setResultatCalcul] = useState<{ moyenne: number; mention: string; decision: string } | null>(null);
  const [serie, setSerie] = useState('');

  const matieres9eAF = [
    { nom: "Français", coefficient: 1 },
    { nom: "Mathématiques", coefficient: 1 },
    { nom: "Sciences", coefficient: 1 },
    { nom: "Histoire", coefficient: 1 }
  ];
  const matieresBAC = [
    { nom: "Philosophie", coefficient: 4 },
    { nom: "Mathématiques", coefficient: 5 },
    { nom: "SVT", coefficient: 3 }
  ];

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

  const chargerElevesPourExamen = async (examenId: number) => {
    setSelectedExamen(examenId);
    const examen = examens.find(e => e.id === examenId);
    setExamenInfo(examen);
    setEleve(null);
    setNotes([]);
    setResultatCalcul(null);
    setSerie('');
    setLoading(true);
    try {
      const inscriptionsRes = await api.get(`/inscriptions-examens/examen/${examenId}`);
      const inscriptionsValidees = inscriptionsRes.data.filter((i: any) => 
        i.statut === 'confirme' || i.statut === 'reussi' || i.statut === 'echoue'
      );
      const elevesIds = inscriptionsValidees.map((i: any) => i.id_eleve);
      if (elevesIds.length === 0) {
        setElevesDisponibles([]);
        return;
      }
      const elevesRes = await api.get('/eleves');
      const elevesFiltres = elevesRes.data.filter((e: any) => elevesIds.includes(e.id));
      setElevesDisponibles(elevesFiltres);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des élèves");
    } finally {
      setLoading(false);
    }
  };

  const handleEleveChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eleveId = e.target.value;
    if (!eleveId || !selectedExamen) return;
    setLoading(true);
    try {
      const eleveRes = await api.get(`/eleves/${eleveId}`);
      setEleve(eleveRes.data);
      const resultatsRes = await api.get(`/resultats-examens/examen/${selectedExamen}`);
      const resultatExistant = resultatsRes.data.find((r: any) => r.id_eleve === parseInt(eleveId));
      const matieres = examenInfo?.type_examen === 'bac' ? matieresBAC : matieres9eAF;
      if (resultatExistant && resultatExistant.details) {
        const notesSauvegardees = matieres.map(m => ({
          matiere: m.nom,
          coefficient: m.coefficient,
          note: resultatExistant.details[m.nom] || 0
        }));
        setNotes(notesSauvegardees);
        setSerie(resultatExistant.serie || '');
      } else {
        setNotes(matieres.map(m => ({ matiere: m.nom, coefficient: m.coefficient, note: 0 })));
        setSerie('');
      }
      setResultatCalcul(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des notes");
    } finally {
      setLoading(false);
    }
  };

  const handleNoteChange = (index: number, value: number) => {
    const newNotes = [...notes];
    newNotes[index].note = value;
    setNotes(newNotes);
    setResultatCalcul(null);
  };

  const calculerMoyenne = () => {
    let sommePonderee = 0;
    let sommeCoeff = 0;
    notes.forEach(n => {
      sommePonderee += n.note * n.coefficient;
      sommeCoeff += n.coefficient;
    });
    return sommeCoeff > 0 ? sommePonderee / sommeCoeff : 0;
  };

  const getMention = (moyenne: number, typeExamen: string) => {
    if (typeExamen === 'bac') {
      if (moyenne >= 16) return "🏅 Très Bien";
      if (moyenne >= 13) return "🎖️ Bien";
      if (moyenne >= 10) return "✅ Passable";
      return "❌ Recalé";
    } else {
      if (moyenne >= 16) return "🏅 Très Bien";
      if (moyenne >= 13) return "🎖️ Bien";
      if (moyenne >= 10) return "📘 Assez Bien";
      return "❌ Échoué";
    }
  };

  const getDecision = (moyenne: number, typeExamen: string) => {
    if (typeExamen === 'bac') return moyenne >= 10 ? "Admis(e)" : "Recalé(e)";
    return moyenne >= 10 ? "Admis(e)" : "Échoué(e)";
  };

  const handleCalculer = () => {
    const moyenne = calculerMoyenne();
    const mention = getMention(moyenne, examenInfo?.type_examen);
    const decision = getDecision(moyenne, examenInfo?.type_examen);
    setResultatCalcul({ moyenne, mention, decision });
  };

  const handleReinitialiser = () => {
    setNotes(notes.map(n => ({ ...n, note: 0 })));
    setResultatCalcul(null);
  };

  const handleSauvegarder = async () => {
    if (!eleve || !selectedExamen) return;
    setLoading(true);
    try {
      const moyenne = calculerMoyenne();
      const mention = getMention(moyenne, examenInfo?.type_examen);
      const decision = getDecision(moyenne, examenInfo?.type_examen);
      const details = notes.reduce((acc, n) => ({ ...acc, [n.matiere]: n.note }), {});
      const payload = {
        id_eleve: eleve.id,
        id_examen: selectedExamen,
        moyenne,
        mention,
        decision,
        details,
        serie: examenInfo?.type_examen === 'bac' ? serie : null
      };
      const resultatsRes = await api.get(`/resultats-examens/examen/${selectedExamen}`);
      const existant = resultatsRes.data.find((r: any) => r.id_eleve === eleve.id);
      if (existant) {
        await api.put(`/resultats-examens/${existant.id}`, payload);
      } else {
        await api.post('/resultats-examens', payload);
      }
      alert("✅ Notes sauvegardées avec succès");
      refreshStats();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className={styles.formTitle}>✏️ Saisie des notes</h1>
      <p className={styles.formSubtitle}>Saisissez les notes des élèves selon le type d'examen</p>

      <div className={styles.formCard} style={{ marginBottom: 24 }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Sélectionner un examen</label>
          <select className={styles.input} onChange={(e) => chargerElevesPourExamen(Number(e.target.value))} value={selectedExamen || ""}>
            <option value="">-- Choisir un examen --</option>
            {examens.map((ex: any) => (
              <option key={ex.id} value={ex.id}>{ex.nom} - {ex.annee_session} ({ex.type_examen || 'Standard'})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedExamen && examenInfo && (
        <>
          <div className={styles.formCard} style={{ marginBottom: 24 }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Sélectionner un élève</label>
              <select className={styles.input} onChange={handleEleveChange} value={eleve?.id || ""} disabled={elevesDisponibles.length === 0}>
                <option value="">-- Choisir un élève --</option>
                {elevesDisponibles.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.prenom} {e.nom} - {e.matricule_national || 'pas de matricule'}</option>
                ))}
              </select>
              {elevesDisponibles.length === 0 && <small style={{ color: '#ef233c' }}>Aucun élève inscrit pour cet examen</small>}
            </div>
          </div>

          {eleve && (
            <div className={styles.formCard}>
              <h3>📌 Informations élève</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div><label className={styles.label}>Nom</label><input type="text" className={styles.input} value={eleve.nom} disabled /></div>
                <div><label className={styles.label}>Prénom</label><input type="text" className={styles.input} value={eleve.prenom} disabled /></div>
                <div><label className={styles.label}>Numéro matricule</label><input type="text" className={styles.input} value={eleve.matricule_national || '-'} disabled /></div>
                {examenInfo.type_examen === 'bac' && (
                  <div><label className={styles.label}>Série (BAC)</label><input type="text" className={styles.input} value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="Série (ex: C, D, A, etc.)" /></div>
                )}
              </div>

              <h3>📝 Notes par matière</h3>
              <div style={{ marginBottom: 20 }}>
                {notes.map((n, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                    <div style={{ flex: 2 }}><label className={styles.label}>{n.matiere} (coef. {n.coefficient})</label></div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="20"
                        className={styles.input}
                        value={n.note}
                        onChange={(e) => handleNoteChange(idx, parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <button onClick={handleCalculer} className={styles.primaryButton}>🧮 Calculer</button>
                <button onClick={handleReinitialiser} className={styles.secondaryButton}>🔄 Réinitialiser</button>
                <button onClick={handleSauvegarder} className={styles.primaryButton} style={{ background: '#28a745' }} disabled={loading}>
                  💾 Sauvegarder les notes
                </button>
              </div>

              {resultatCalcul && (
                <div style={{ marginTop: 20, padding: 16, background: '#f0f4ff', borderRadius: 12 }}>
                  <h4>📊 Résultat du calcul</h4>
                  <p><strong>Moyenne générale :</strong> {resultatCalcul.moyenne.toFixed(2)}/20</p>
                  <p><strong>Mention :</strong> {resultatCalcul.mention}</p>
                  <p><strong>Décision :</strong> {resultatCalcul.decision}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ========== CONSULTATION DES RÉSULTATS ==========
const BunexeResultatsLecture: React.FC<{ refreshStats: () => void }> = ({ refreshStats }) => {
  const [examens, setExamens] = useState<any[]>([]);
  const [selectedExamen, setSelectedExamen] = useState<number | null>(null);
  const [examenInfo, setExamenInfo] = useState<any>(null);
  const [resultats, setResultats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  const chargerResultats = async (examenId: number) => {
    setSelectedExamen(examenId);
    const examen = examens.find(e => e.id === examenId);
    setExamenInfo(examen);
    setLoading(true);
    try {
      const res = await api.get(`/resultats-examens/examen/${examenId}`);
      setResultats(res.data);
      const admis = res.data.filter((r: any) => r.decision?.includes('Admis') || (r.moyenne >= 10)).length;
      const echoue = res.data.filter((r: any) => r.decision?.includes('Échoué') || (r.moyenne < 10 && !r.decision?.includes('Ajourné'))).length;
      const ajourne = res.data.filter((r: any) => r.decision?.includes('Ajourné')).length;
      const recale = res.data.filter((r: any) => r.decision?.includes('Recalé')).length;
      setStatsDecision({ admis, echoue, ajourne, recale });
    } catch (err) {
      console.error(err);
      alert('Erreur lors du chargement des résultats');
    } finally {
      setLoading(false);
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
        if (selectedExamen) chargerResultats(selectedExamen);
      } catch (err) {
        console.error(err);
        alert('❌ Erreur lors de la publication');
      } finally {
        setLoading(false);
      }
    }
  };

  const getMention = (note: number, typeExamen: string) => {
    if (typeExamen === 'bac') {
      if (note >= 16) return '🏅 Très Bien';
      if (note >= 13) return '🎖️ Bien';
      if (note >= 10) return '✅ Passable';
      return '❌ Recalé';
    } else {
      if (note >= 16) return '🏅 Très Bien';
      if (note >= 13) return '🎖️ Bien';
      if (note >= 10) return '📘 Assez Bien';
      return '❌ Échoué';
    }
  };

  const getDecision = (note: number, typeExamen: string) => {
    if (typeExamen === 'bac') return note >= 10 ? 'Admis(e)' : 'Recalé(e)';
    return note >= 10 ? 'Admis(e)' : 'Échoué(e)';
  };

  return (
    <div>
      <h1 className={styles.formTitle}>📊 Consultation des résultats</h1>
      <p className={styles.formSubtitle}>Consultez les résultats finaux des examens (notes, mentions, décisions)</p>

      <div className={styles.formCard} style={{ marginBottom: 24 }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Sélectionner un examen</label>
          <select className={styles.input} onChange={(e) => chargerResultats(Number(e.target.value))} value={selectedExamen || ""}>
            <option value="">-- Choisir un examen --</option>
            {examens.map((ex: any) => (
              <option key={ex.id} value={ex.id}>{ex.nom} - {ex.annee_session} ({ex.type_examen || 'Standard'})</option>
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
                <span className={styles.badgeInfo}>📝 Total candidats: {resultats.length}</span>
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}>Chargement...</td></tr>
                ) : resultats.length === 0 ? (
                  <td><td colSpan={7} style={{ textAlign: 'center' }}>Aucun résultat trouvé pour cet examen</td></td>
                ) : (
                  resultats.map((res: any) => {
                    const note = res.moyenne !== undefined ? res.moyenne : res.note;
                    const mention = getMention(note, examenInfo?.type_examen);
                    const decision = getDecision(note, examenInfo?.type_examen);
                    return (
                      <tr key={res.id}>
                        <td><code>{res.matricule_national || '-'}</code></td>
                        <td><strong>{res.eleve_prenom} {res.eleve_nom}</strong></td>
                        <td>{res.ecole_nom || '-'}</td>
                        <td>{res.classe || '-'}</td>
                        <td><span style={{ fontWeight: 'bold', fontSize: 18 }}>{note}/20</span></td>
                        <td><span className={styles.badgeSuccess}>{mention}</span></td>
                        <td><span className={note >= 10 ? styles.badgeSuccess : styles.badgeDanger}>{decision}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={publierResultats} className={styles.primaryButton} style={{ background: '#06d6a0' }} disabled={loading || resultats.length === 0}>
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
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Chargement...</td></tr>
            ) : filteredEleves.length === 0 ? (
              <td><td colSpan={5} style={{ textAlign: 'center' }}>Aucun élève</td></td>
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
        console.error(err);
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
            <tr><th>Nom de l'école</th><th>Adresse</th><th>Téléphone</th><th>Responsable(s)</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Chargement...</td></tr>
            ) : ecoles.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Aucune école</td></tr>
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