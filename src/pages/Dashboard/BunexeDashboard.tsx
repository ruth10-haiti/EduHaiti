import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, FileText, ClipboardList, Award, Users, School, Plus, Edit2, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../styles/AdminDashboard.module.css';

const BunexeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'bunexe') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (  
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
          <Route path="/examens/*" element={<BunexeExamens />} />
          <Route path="/inscriptions/*" element={<BunexeInscriptions />} />
          <Route path="/resultats/*" element={<BunexeResultats />} />
          <Route path="/eleves/*" element={<BunexeEleves />} />
          <Route path="/ecoles/*" element={<BunexeEcoles />} />
        </Routes>
      </main>
    </div>
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
  const [stats, setStats] = useState({ examens: 0, inscriptions: 0, resultats: 0, eleves: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [examens, inscriptions, resultats, eleves] = await Promise.all([
          api.get('/examens'),
          api.get('/inscriptions-examens'),
          api.get('/resultats-examens'),
          api.get('/eleves')
        ]);
        setStats({
          examens: examens.data.length,
          inscriptions: inscriptions.data.length,
          resultats: resultats.data.length,
          eleves: eleves.data.length
        });
      } catch (error) {
        console.error(error);
      }
    };
    loadStats();
  }, []);

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
const BunexeExamens: React.FC = () => {
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
      }
      resetForm();
      loadExamens();
    } catch (err: any) { alert(err.response?.data?.error || '❌ Erreur'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`⚠️ Supprimer "${nom}" ?`)) {
      try { await api.delete(`/examens/${id}`); loadExamens(); alert('✅ Supprimé'); }
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
const BunexeInscriptions: React.FC = () => {
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [examens, setExamens] = useState<any[]>([]);
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState('');
  const [selectedEleve, setSelectedEleve] = useState('');
  const [stats, setStats] = useState({ total: 0, validees: 0, enAttente: 0, rejetees: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inscriptionsRes, examensRes, elevesRes] = await Promise.all([
        api.get('/inscriptions-examens'),
        api.get('/examens'),
        api.get('/eleves')
      ]);
      setInscriptions(inscriptionsRes.data);
      setExamens(examensRes.data.filter((e: any) => new Date(e.date_examen) > new Date()));
      setEleves(elevesRes.data);
      
      const total = inscriptionsRes.data.length;
      const enAttente = inscriptionsRes.data.filter((i: any) => i.statut === 'en_attente').length;
      const validees = inscriptionsRes.data.filter((i: any) => i.statut === 'validee').length;
      const rejetees = inscriptionsRes.data.filter((i: any) => i.statut === 'rejetee').length;
      setStats({ total, validees, enAttente, rejetees });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inscriptions-examens', { id_eleve: selectedEleve, id_examen: selectedExamen });
      alert('✅ Inscription enregistrée avec succès');
      setShowForm(false);
      setSelectedEleve('');
      setSelectedExamen('');
      loadData();
    } catch (err: any) { alert(err.response?.data?.message || '❌ Erreur'); }
    finally { setLoading(false); }
  };

  const validerInscription = async (id: number) => {
    try {
      await api.patch(`/inscriptions-examens/${id}/valider`);
      alert('✅ Inscription validée');
      loadData();
    } catch (err) { alert('❌ Erreur'); }
  };

  const rejeterInscription = async (id: number) => {
    try {
      await api.patch(`/inscriptions-examens/${id}/rejeter`);
      alert('❌ Inscription rejetée');
      loadData();
    } catch (err) { alert('❌ Erreur'); }
  };

  const annulerInscription = async (id: number) => {
    if (window.confirm('Annuler cette inscription ?')) {
      try { await api.delete(`/inscriptions-examens/${id}`); loadData(); alert('✅ Inscription annulée'); }
      catch (err) { alert('❌ Erreur'); }
    }
  };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-';

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Chargement...</div>;

  return (
    <div>
      <h1 className={styles.formTitle}>📋 Gestion des inscriptions aux examens</h1>
      <p className={styles.formSubtitle}>Inscrivez des élèves, validez ou rejetez les demandes d'inscription</p>

      <div style={{ marginBottom: 24 }}>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className={styles.primaryButton}>
            <Plus size={18} /> Nouvelle inscription
          </button>
        ) : (
          <div className={styles.formCard}>
            <h3>➕ Inscrire un élève à un examen</h3>
            <form onSubmit={handleInscription}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Élève</label>
                <select className={styles.input} required value={selectedEleve} onChange={e => setSelectedEleve(e.target.value)}>
                  <option value="">-- Choisir un élève --</option>
                  {eleves.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} - {e.matricule_national || 'pas de matricule'}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Examen</label>
                <select className={styles.input} required value={selectedExamen} onChange={e => setSelectedExamen(e.target.value)}>
                  <option value="">-- Choisir un examen --</option>
                  {examens.map(e => <option key={e.id} value={e.id}>{e.nom} ({e.type_examen}) - {formatDate(e.date_examen)}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className={styles.primaryButton} disabled={loading}>{loading ? 'Inscription...' : 'Inscrire'}</button>
                <button type="button" onClick={() => setShowForm(false)} className={styles.secondaryButton}>Annuler</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}><div><h3>Total</h3><div className={styles.statNumber}>{stats.total}</div></div><div className={styles.statIcon}>📋</div></div>
        <div className={styles.statCard}><div><h3>En attente</h3><div className={styles.statNumber} style={{ color: '#fca311' }}>{stats.enAttente}</div></div><div className={styles.statIcon}>⏳</div></div>
        <div className={styles.statCard}><div><h3>Validées</h3><div className={styles.statNumber} style={{ color: '#06d6a0' }}>{stats.validees}</div></div><div className={styles.statIcon}>✅</div></div>
        <div className={styles.statCard}><div><h3>Rejetées</h3><div className={styles.statNumber} style={{ color: '#ef233c' }}>{stats.rejetees}</div></div><div className={styles.statIcon}>❌</div></div>
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
              inscriptions.map((ins: any) => (
                <tr key={ins.id}>
                  <td><strong>{ins.eleve_prenom} {ins.eleve_nom}</strong></td>
                  <td><code>{ins.matricule_national || '-'}</code></td>
                  <td>{ins.examen_nom}</td>
                  <td>{formatDate(ins.date_inscription)}</td>
                  <td>
                    <span className={`${styles.badge} ${ins.statut === 'validee' ? styles.badgeSuccess : ins.statut === 'rejetee' ? styles.badgeDanger : styles.badgeWarning}`}>
                      {ins.statut === 'validee' ? '✅ Validée' : ins.statut === 'rejetee' ? '❌ Rejetée' : '⏳ En attente'}
                    </span>
                  </td>
                  <td>
                    {ins.statut === 'en_attente' && (
                      <>
                        <button onClick={() => validerInscription(ins.id)} className={styles.primaryButton} style={{ marginRight: 8, padding: '4px 10px' }}>✅ Valider</button>
                        <button onClick={() => rejeterInscription(ins.id)} className={styles.secondaryButton} style={{ padding: '4px 10px', background: '#ef233c', color: 'white', border: 'none' }}>❌ Rejeter</button>
                      </>
                    )}
                    {ins.statut !== 'en_attente' && (
                      <button onClick={() => annulerInscription(ins.id)} className={styles.secondaryButton} style={{ padding: '4px 10px' }}>🗑️ Annuler</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== GESTION DES RÉSULTATS BUNEXE - SYSTÈME OFFICIEL HAÏTIEN ==========
const BunexeResultats: React.FC = () => {
  const [examens, setExamens] = useState<any[]>([]);
  const [selectedExamen, setSelectedExamen] = useState<number | null>(null);
  const [examenInfo, setExamenInfo] = useState<any>(null);
  const [resultats, setResultats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsDecision, setStatsDecision] = useState({ admis: 0, echoue: 0, ajourne: 0, recale: 0 });

  useEffect(() => {
    const fetchExamens = async () => {
      try { const res = await api.get('/examens'); setExamens(res.data); }
      catch (err) { console.error(err); }
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
      
      // Calcul des statistiques
      const admis = res.data.filter((r: any) => getDecisionHaitienne(r.note, examen?.type_examen || examen?.nom) === 'Admis(e)').length;
      const echoue = res.data.filter((r: any) => getDecisionHaitienne(r.note, examen?.type_examen || examen?.nom) === 'Échoué(e)').length;
      const ajourne = res.data.filter((r: any) => getDecisionHaitienne(r.note, examen?.type_examen || examen?.nom) === 'Ajourné(e)').length;
      const recale = res.data.filter((r: any) => getDecisionHaitienne(r.note, examen?.type_examen || examen?.nom) === 'Recalé(e)').length;
      setStatsDecision({ admis, echoue, ajourne, recale });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const saisirNote = async (id: number, note: number) => {
    if (note < 0 || note > 20) {
      alert('❌ La note doit être comprise entre 0 et 20');
      return;
    }
    try {
      await api.put(`/resultats-examens/${id}`, { note });
      alert('✅ Note enregistrée');
      if (selectedExamen) chargerResultats(selectedExamen);
    } catch (err) { alert('❌ Erreur'); }
  };

  const publierResultats = async () => {
    if (!selectedExamen) return;
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir publier tous les résultats ? Ils seront visibles par les secrétariats et les parents.')) {
      try {
        await api.post(`/resultats-examens/${selectedExamen}/publier`);
        alert('✅ Résultats publiés avec succès');
        if (selectedExamen) chargerResultats(selectedExamen);
      } catch (err) { alert('❌ Erreur'); }
    }
  };

  // Système officiel haïtien des examens
  const getDecisionHaitienne = (note: number, typeExamen: string): string => {
    const noteValue = Number(note);
    
    // Baccalauréat
    if (typeExamen === 'bac' || typeExamen === 'Baccalauréat') {
      if (noteValue >= 10 && noteValue < 13) return 'Admis(e)';
      if (noteValue >= 13 && noteValue < 16) return 'Admis(e)';
      if (noteValue >= 16) return 'Admis(e)';
      if (noteValue >= 8 && noteValue < 10) return 'Ajourné(e) - Peut repasser';
      return 'Recalé(e)';
    }
    
    // 9e AF (9e Année Fondamentale)
    if (typeExamen === '9e AF') {
      if (noteValue >= 10 && noteValue < 13) return 'Admis(e)';
      if (noteValue >= 13 && noteValue < 16) return 'Admis(e) - Mention Bien';
      if (noteValue >= 16) return 'Admis(e) - Mention Très Bien';
      if (noteValue >= 8 && noteValue < 10) return 'Ajourné(e)';
      return 'Échoué(e)';
    }
    
    // NS4 (Nouveau Secondaire 4)
    if (typeExamen === 'NS4') {
      if (noteValue >= 10 && noteValue < 13) return 'Admis(e)';
      if (noteValue >= 13 && noteValue < 16) return 'Admis(e) - Bien';
      if (noteValue >= 16) return 'Admis(e) - Très Bien';
      if (noteValue >= 7 && noteValue < 10) return 'Ajourné(e)';
      return 'Échoué(e)';
    }
    
    // Par défaut
    if (noteValue >= 10) return 'Admis(e)';
    if (noteValue >= 7 && noteValue < 10) return 'Ajourné(e)';
    return 'Échoué(e)';
  };

  const getMentionHaitienne = (note: number, typeExamen: string) => {
    const noteValue = Number(note);
    
    // Baccalauréat
    if (typeExamen === 'bac' || typeExamen === 'Baccalauréat') {
      if (noteValue >= 16) return { text: '🏅 Très Bien', class: styles.badgeSuccess };
      if (noteValue >= 13) return { text: '🎖️ Bien', class: styles.badgeSuccess };
      if (noteValue >= 10) return { text: '✅ Passable', class: styles.badgeWarning };
      if (noteValue >= 8) return { text: '⏳ Ajourné', class: styles.badgeWarning };
      return { text: '❌ Recalé', class: styles.badgeDanger };
    }
    
    // 9e AF
    if (typeExamen === '9e AF') {
      if (noteValue >= 16) return { text: '🏅 Très Bien', class: styles.badgeSuccess };
      if (noteValue >= 13) return { text: '🎖️ Bien', class: styles.badgeSuccess };
      if (noteValue >= 10) return { text: '📘 Assez Bien', class: styles.badgeInfo };
      if (noteValue >= 8) return { text: '⚠️ Ajourné', class: styles.badgeWarning };
      return { text: '❌ Échoué', class: styles.badgeDanger };
    }
    
    // NS4
    if (typeExamen === 'NS4') {
      if (noteValue >= 16) return { text: '🏅 Très Bien', class: styles.badgeSuccess };
      if (noteValue >= 13) return { text: '🎖️ Bien', class: styles.badgeSuccess };
      if (noteValue >= 10) return { text: '📘 Assez Bien', class: styles.badgeInfo };
      if (noteValue >= 7) return { text: '⚠️ Ajourné', class: styles.badgeWarning };
      return { text: '❌ Échoué', class: styles.badgeDanger };
    }
    
    // Par défaut
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
    if (decision.includes('Échoué')) return styles.badgeDanger;
    if (decision.includes('Recalé')) return styles.badgeDanger;
    return styles.badgeInfo;
  };

  return (
    <div>
      <h1 className={styles.formTitle}>📊 Gestion des résultats - BUNEXE</h1>
      <p className={styles.formSubtitle}>Saisie des notes selon le système officiel haïtien (9e AF, NS4, Baccalauréat)</p>

      <div className={styles.formCard} style={{ marginBottom: 24 }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Sélectionner un examen</label>
          <select className={styles.input} onChange={(e) => chargerResultats(Number(e.target.value))}>
            <option value="">-- Choisir un examen --</option>
            {examens.map((ex: any) => (
              <option key={ex.id} value={ex.id}>
                {ex.nom} - {ex.annee_session} ({ex.type_examen || 'Standard'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedExamen && (
        <>
          {/* Statistiques des décisions */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}><div><h3>🎓 Admis(es)</h3><div className={styles.statNumber} style={{ color: '#06d6a0' }}>{statsDecision.admis}</div></div></div>
            <div className={styles.statCard}><div><h3>⚠️ Ajourné(es)</h3><div className={styles.statNumber} style={{ color: '#fca311' }}>{statsDecision.ajourne}</div></div></div>
            <div className={styles.statCard}><div><h3>❌ Échoué(es)</h3><div className={styles.statNumber} style={{ color: '#ef233c' }}>{statsDecision.echoue}</div></div></div>
            <div className={styles.statCard}><div><h3>📋 Recalé(es)</h3><div className={styles.statNumber} style={{ color: '#dc3545' }}>{statsDecision.recale}</div></div></div>
          </div>

          <div className={styles.formCard} style={{ marginBottom: 24, background: '#f0f4ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <h3>📌 {examenInfo?.nom} - Session {examenInfo?.annee_session}</h3>
                <p style={{ marginTop: 8, fontSize: 14 }}>
                  📊 Type: {examenInfo?.type_examen === 'bac' ? 'Baccalauréat' : 
                    examenInfo?.type_examen === '9e AF' ? '9e Année Fondamentale' : 
                    examenInfo?.type_examen === 'NS4' ? 'Nouveau Secondaire 4' : 'Standard'}
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

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Élève</th>
                  <th>École</th>
                  <th>Note /20</th>
                  <th>Mention</th>
                  <th>Décision</th>
                  <th>Statut publication</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>Chargement...</td></tr>
                ) : resultats.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>Aucun résultat trouvé pour cet examen</td></tr>
                ) : (
                  resultats.map((res: any) => {
                    const mention = getMentionHaitienne(res.note, examenInfo?.type_examen || examenInfo?.nom);
                    const decision = getDecisionHaitienne(res.note, examenInfo?.type_examen || examenInfo?.nom);
                    return (
                      <tr key={res.id}>
                        <td><code>{res.matricule_national || '-'}</code></td>
                        <td><strong>{res.eleve_prenom} {res.eleve_nom}</strong></td>
                        <td>{res.ecole_nom || '-'}</td>
                        <td>
                          {res.publie ? (
                            <span style={{ fontWeight: 'bold', fontSize: 18 }}>{res.note}/20</span>
                          ) : (
                            <input 
                              type="number" 
                              step="0.5" 
                              min="0" 
                              max="20" 
                              defaultValue={res.note || 0} 
                              className={styles.input} 
                              style={{ width: 80 }}
                              onBlur={(e) => saisirNote(res.id, parseFloat(e.target.value))} 
                            />
                          )}
                        </td>
                        <td><span className={mention.class}>{mention.text}</span></td>
                        <td><span className={getBadgeColor(decision)}>{decision}</span></td>
                        <td>{res.publie ? <span className={styles.badgeSuccess}>✅ Publié</span> : <span className={styles.badgeWarning}>📝 En cours</span>}</td>
                        <td>
                          {!res.publie && (
                            <button onClick={() => saisirNote(res.id, res.note)} className={styles.primaryButton} style={{ padding: '4px 12px' }}>
                              💾 Sauvegarder
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

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <button onClick={publierResultats} className={styles.primaryButton} style={{ background: '#06d6a0' }}>
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
      try { const res = await api.get('/eleves'); setEleves(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadEleves();
  }, []);

  const filteredEleves = eleves.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.matricule_national?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className={styles.formTitle}>🎓 Liste des élèves</h1>
      <p className={styles.formSubtitle}>Consultez tous les élèves inscrits avec leurs matricules et écoles</p>

      <div style={{ marginBottom: 24 }}>
        <div className={styles.inputWrapper}>
          <input type="text" placeholder="Rechercher par nom, prénom ou matricule..." className={styles.input}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead><tr><th>Matricule</th><th>Nom complet</th><th>École</th><th>Classe</th><th>Date naissance</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center' }}>Chargement...</td></tr> :
              filteredEleves.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center' }}>Aucun élève</td></tr> :
              filteredEleves.map(eleve => (
                <tr key={eleve.id}>
                  <td><code>{eleve.matricule_national || 'En attente'}</code></td>
                  <td><strong>{eleve.prenom} {eleve.nom}</strong></td>
                  <td>{eleve.nom_ecole || '-'}</td>
                  <td><span className={styles.badgeInfo} style={{ padding: '2px 8px', borderRadius: 12 }}>{eleve.classe || 'Non assignée'}</span></td>
                  <td>{eleve.date_naissance ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR') : '-'}</td>
                </tr>
              ))}
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
        const ecolesAvecResponsables = await Promise.all(
          res.data.map(async (ecole: any) => {
            try {
              const usersRes = await api.get('/admin/utilisateurs');
              const responsables = usersRes.data.filter((u: any) => u.id_ecole === ecole.id && u.role === 'secretariat');
              return { ...ecole, responsables };
            } catch { return { ...ecole, responsables: [] }; }
          })
        );
        setEcoles(ecolesAvecResponsables);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadEcoles();
  }, []);

  return (
    <div>
      <h1 className={styles.formTitle}>🏫 Gestion des écoles</h1>
      <p className={styles.formSubtitle}>Consultez les écoles et leurs responsables (Secrétariat)</p>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead><tr><th>Nom de l'école</th><th>Adresse</th><th>Téléphone</th><th>Responsable(s)</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ textAlign: 'center' }}>Chargement...</td></tr> :
              ecoles.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center' }}>Aucune école</td></tr> :
              ecoles.map(ecole => (
                <tr key={ecole.id}>
                  <td><strong>{ecole.nom}</strong></td>
                  <td>{ecole.adresse || '-'}</td>
                  <td>{ecole.telephone || '-'}</td>
                  <td>
                    {ecole.responsables && ecole.responsables.length > 0 ? (
                      ecole.responsables.map((resp: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: 4 }}>
                          <span className={styles.badgeInfo}>📋 {resp.prenom} {resp.nom}</span>
                          <span style={{ fontSize: 12, color: '#6c757d', marginLeft: 8 }}>{resp.email}</span>
                        </div>
                      ))
                    ) : <span style={{ color: '#6c757d' }}>Aucun responsable assigné</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BunexeDashboard;