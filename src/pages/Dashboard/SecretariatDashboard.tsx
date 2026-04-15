import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Home, Users, UserPlus, ClipboardList, Award, FileText, LogOut,  Search, Plus, Phone, Mail, MapPin, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../styles/AdminDashboard.module.css';

const SecretariatDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'secretariat') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  
  // Supprimer les items spécifiques
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  
  // Rediriger vers la page de connexion
  window.location.href = '/connexion';
};

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>EduHaiti</h2>
          <p>Secrétariat</p>
        </div>
        <nav className={styles.nav}>
          <NavLinkSecretariat to="/secretariat" icon={<Home size={20} />} label="Accueil" />
          <NavLinkSecretariat to="/secretariat/eleves" icon={<Users size={20} />} label="Mes élèves" />
          <NavLinkSecretariat to="/secretariat/eleves/ajouter" icon={<UserPlus size={20} />} label="Ajouter élève" />
          <NavLinkSecretariat to="/secretariat/inscriptions" icon={<ClipboardList size={20} />} label="Inscriptions" />
          <NavLinkSecretariat to="/secretariat/resultats" icon={<Award size={20} />} label="Résultats" />
          <NavLinkSecretariat to="/secretariat/transferts" icon={<RefreshCw size={20} />} label="Transferts" />
          <NavLinkSecretariat to="/secretariat/documents" icon={<FileText size={20} />} label="Documents" />
        </nav>
        <div className={styles.logoutSection}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      <main className={styles.content}>
        <Routes>
          <Route path="/" element={<SecretariatHome />} />
          <Route path="/eleves" element={<SecretariatEleves />} />
          <Route path="/eleves/ajouter" element={<SecretariatFormulaireEleve />} />
          <Route path="/eleves/:id/modifier" element={<SecretariatFormulaireEleve />} />
          <Route path="/inscriptions" element={<SecretariatInscriptions />} />
          <Route path="/resultats" element={<SecretariatResultats />} />
          <Route path="/transferts" element={<SecretariatTransferts />} />
          <Route path="/documents" element={<SecretariatDocuments />} />
        </Routes>
      </main>
    </div>
  );
};

const NavLinkSecretariat: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isActive = location === to || location.startsWith(to + '/');
  
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

// ========== PAGE ACCUEIL SECRÉTARIAT ==========
const SecretariatHome: React.FC = () => {
  const [stats, setStats] = useState({ eleves: 0, inscriptions: 0, resultats: 0, transferts: 0 });
  const { user } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [eleves, inscriptions, resultats, transferts] = await Promise.all([
          api.get('/eleves'),
          api.get('/inscriptions-examens'),
          api.get('/resultats-examens'),
          api.get('/transferts')
        ]);
        setStats({
          eleves: eleves.data.filter((e: any) => e.id_ecole === user?.id_ecole).length,
          inscriptions: inscriptions.data.filter((i: any) => i.id_ecole === user?.id_ecole).length,
          resultats: resultats.data.filter((r: any) => r.id_ecole === user?.id_ecole).length,
          transferts: transferts.data.filter((t: any) => t.id_ecole_source === user?.id_ecole || t.id_ecole_destination === user?.id_ecole).length
        });
      } catch (error) { console.error(error); }
    };
    loadStats();
  }, [user]);

  const cartes = [
    { title: 'Mes élèves', value: stats.eleves, icon: <Users size={24} />, color: '#4361ee', path: '/secretariat/eleves' },
    { title: 'Inscriptions', value: stats.inscriptions, icon: <ClipboardList size={24} />, color: '#fca311', path: '/secretariat/inscriptions' },
    { title: 'Résultats', value: stats.resultats, icon: <Award size={24} />, color: '#06d6a0', path: '/secretariat/resultats' },
    { title: 'Transferts', value: stats.transferts, icon: <RefreshCw size={24} />, color: '#7209b7', path: '/secretariat/transferts' }
  ];

  return (
    <div>
      <h1 className={styles.formTitle}>📋 Tableau de bord - Secrétariat</h1>
      <p className={styles.formSubtitle}>Gérez les élèves, les inscriptions, les résultats et les transferts de votre école</p>
      
      <div className={styles.statsGrid}>
        {cartes.map((carte, idx) => (
          <div key={idx} className={styles.statCard} onClick={() => window.location.href = carte.path} style={{ cursor: 'pointer' }}>
            <div><h3>{carte.title}</h3><div className={styles.statNumber}>{carte.value}</div></div>
            <div className={styles.statIcon} style={{ background: `${carte.color}20`, color: carte.color }}>{carte.icon}</div>
          </div>
        ))}
      </div>

      <div className={styles.formCard}>
        <h3 style={{ marginBottom: 16 }}>⚡ Actions rapides</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <Link to="/secretariat/eleves/ajouter" className={styles.primaryButton} style={{ textDecoration: 'none', textAlign: 'center' }}>➕ Nouvel élève</Link>
          <Link to="/secretariat/inscriptions" className={styles.primaryButton} style={{ textDecoration: 'none', textAlign: 'center', background: '#fca311' }}>📋 Gérer inscriptions</Link>
          <Link to="/secretariat/resultats" className={styles.primaryButton} style={{ textDecoration: 'none', textAlign: 'center', background: '#06d6a0' }}>📊 Voir résultats</Link>
          <Link to="/secretariat/transferts" className={styles.primaryButton} style={{ textDecoration: 'none', textAlign: 'center', background: '#7209b7' }}>🔄 Gérer transferts</Link>
        </div>
      </div>
    </div>
  );
};

// ========== LISTE DES ÉLÈVES AVEC MATRICULES ==========
const SecretariatEleves: React.FC = () => {
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadEleves = async () => {
      try {
        const res = await api.get('/eleves');
        const elevesFiltres = res.data.filter((e: any) => e.id_ecole === user?.id_ecole);
        setEleves(elevesFiltres);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadEleves();
  }, [user]);

  const filteredEleves = eleves.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.matricule_national && e.matricule_national.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <h1 className={styles.formTitle}>🎓 Mes élèves</h1>
      <p className={styles.formSubtitle}>Liste des élèves inscrits dans votre école avec leurs matricules</p>

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
              <th>Date naissance</th>
              <th>Classe</th>
              <th>Téléphone parent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Chargement...</td></tr>
            ) : filteredEleves.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Aucun élève trouvé</td></tr>
            ) : (
              filteredEleves.map((eleve: any) => (
                <tr key={eleve.id}>
                  <td><code>{eleve.matricule_national || 'En attente'}</code></td>
                  <td><strong>{eleve.prenom} {eleve.nom}</strong></td>
                  <td>{eleve.date_naissance ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR') : '-'}</td>
                  <td><span className={styles.badgeInfo} style={{ padding: '4px 12px', borderRadius: 20 }}>{eleve.classe || 'Non assignée'}</span></td>
                  <td>{eleve.tel_parent || '-'}</td>
                  <td>
                    <Link to={`/secretariat/eleves/${eleve.id}/modifier`} className={styles.primaryButton} style={{ padding: '4px 12px', textDecoration: 'none' }}>✏️ Modifier</Link>
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

// ========== FORMULAIRE ÉLÈVE AVEC MATRICULE AUTO ==========
const SecretariatFormulaireEleve: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', date_naissance: '', lieu_naissance: '',
    sexe: 'M', id_ecole: '', classe: '',
    tel_parent: '', email_parent: '', adresse: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (id) loadEleve();
    if (user?.id_ecole) {
      setForm(prev => ({ ...prev, id_ecole: String(user.id_ecole) }));
    }
  }, [id, user]);

  const loadEleve = async () => {
    try { 
      const res = await api.get(`/eleves/${id}`); 
      setForm(res.data); 
    } catch (err) { 
      alert('Erreur chargement'); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.put(`/eleves/${id}`, form);
        alert('✅ Élève modifié avec succès');
      } else {
        const response = await api.post('/eleves', form);
        alert(`✅ Élève créé avec succès !\n📌 Matricule généré: ${response.data.matricule_national}`);
      }
      navigate('/secretariat/eleves');
    } catch (err: any) {
      alert(err.response?.data?.message || '❌ Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.formCard}>
      <h1 className={styles.formTitle}>{id ? '✏️ Modifier' : '➕ Ajouter'} un élève</h1>
      <p className={styles.formSubtitle}>Le matricule national sera généré automatiquement</p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div><label className={styles.label}>Nom *</label><input type="text" className={styles.input} required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} /></div>
          <div><label className={styles.label}>Prénom *</label><input type="text" className={styles.input} required value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div><label className={styles.label}>Date naissance</label><input type="date" className={styles.input} value={form.date_naissance} onChange={e => setForm({...form, date_naissance: e.target.value})} /></div>
          <div><label className={styles.label}>Lieu naissance</label><input type="text" className={styles.input} value={form.lieu_naissance} onChange={e => setForm({...form, lieu_naissance: e.target.value})} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div><label className={styles.label}>Sexe</label>
            <select className={styles.input} value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})}>
              <option value="M">Masculin</option><option value="F">Féminin</option>
            </select>
          </div>
          <div><label className={styles.label}>Classe</label><input type="text" className={styles.input} placeholder="Ex: 6ème A" value={form.classe} onChange={e => setForm({...form, classe: e.target.value})} /></div>
        </div>
        <div><label className={styles.label}><Phone size={16} /> Téléphone parent</label><input type="tel" className={styles.input} value={form.tel_parent} onChange={e => setForm({...form, tel_parent: e.target.value})} /></div>
        <div><label className={styles.label}><Mail size={16} /> Email parent</label><input type="email" className={styles.input} value={form.email_parent} onChange={e => setForm({...form, email_parent: e.target.value})} /></div>
        <div><label className={styles.label}><MapPin size={16} /> Adresse</label><input type="text" className={styles.input} value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} /></div>

        <div style={{ padding: 12, background: '#e3f2fd', borderRadius: 8, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#1976d2' }}>ℹ️ Le matricule national sera généré automatiquement par le système après l'enregistrement.</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className={styles.primaryButton} disabled={loading}>{loading ? 'Enregistrement...' : (id ? 'Modifier' : 'Ajouter')}</button>
          <button type="button" onClick={() => navigate('/secretariat/eleves')} className={styles.secondaryButton}>Annuler</button>
        </div>
      </form>
    </div>
  );
};

// ========== INSCRIPTIONS SECRÉTARIAT ==========
const SecretariatInscriptions: React.FC = () => {
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [examens, setExamens] = useState<any[]>([]);
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState('');
  const [selectedEleve, setSelectedEleve] = useState('');
  const { user } = useAuth();

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
      setInscriptions(inscriptionsRes.data.filter((i: any) => i.id_ecole === user?.id_ecole));
      setExamens(examensRes.data.filter((e: any) => new Date(e.date_examen) > new Date()));
      setEleves(elevesRes.data.filter((e: any) => e.id_ecole === user?.id_ecole));
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
      <p className={styles.formSubtitle}>Inscrivez vos élèves aux examens nationaux</p>

      <div style={{ marginBottom: 24 }}>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className={styles.primaryButton}><Plus size={18} /> Nouvelle inscription</button>
        ) : (
          <div className={styles.formCard}>
            <h3>➕ Inscrire un élève à un examen</h3>
            <form onSubmit={handleInscription}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Élève</label>
                <select className={styles.input} required value={selectedEleve} onChange={e => setSelectedEleve(e.target.value)}>
                  <option value="">-- Choisir un élève --</option>
                  {eleves.map((e: any) => <option key={e.id} value={e.id}>{e.prenom} {e.nom} - {e.matricule_national || 'pas de matricule'}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Examen</label>
                <select className={styles.input} required value={selectedExamen} onChange={e => setSelectedExamen(e.target.value)}>
                  <option value="">-- Choisir un examen --</option>
                  {examens.map((e: any) => <option key={e.id} value={e.id}>{e.nom} - {formatDate(e.date_examen)}</option>)}
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

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>Élève</th><th>Matricule</th><th>Examen</th><th>Date inscription</th><th>Statut</th><th>Actions</th></tr>
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
                      <button onClick={() => annulerInscription(ins.id)} className={styles.secondaryButton} style={{ padding: '4px 12px', background: '#ef233c', color: 'white', border: 'none' }}>Annuler</button>
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

// ========== RÉSULTATS SECRÉTARIAT ==========
const SecretariatResultats: React.FC = () => {
  const [resultats, setResultats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadResultats = async () => {
      try {
        const res = await api.get('/resultats-examens');
        const resultatsFiltres = res.data.filter((r: any) => r.id_ecole === user?.id_ecole);
        setResultats(resultatsFiltres);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadResultats();
  }, [user]);

  const filteredResultats = resultats.filter(r => 
    `${r.eleve_nom} ${r.eleve_prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.matricule_national && r.matricule_national.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getMention = (note: number) => {
    if (note >= 16) return { text: '🏅 Très Bien', class: styles.badgeSuccess };
    if (note >= 14) return { text: '🎖️ Bien', class: styles.badgeSuccess };
    if (note >= 12) return { text: '📘 Assez Bien', class: styles.badgeInfo };
    if (note >= 10) return { text: '✅ Passable', class: styles.badgeWarning };
    return { text: '❌ Non admis', class: styles.badgeDanger };
  };

  return (
    <div>
      <h1 className={styles.formTitle}>📊 Résultats des examens</h1>
      <p className={styles.formSubtitle}>Consultez les résultats des élèves de votre école</p>

      <div style={{ marginBottom: 24 }}>
        <div className={styles.inputWrapper}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
          <input type="text" placeholder="Rechercher par élève ou matricule..." className={styles.input} style={{ paddingLeft: 40 }}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>Matricule</th><th>Élève</th><th>Examen</th><th>Note /20</th><th>Mention</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Chargement...</td></tr>
            ) : filteredResultats.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Aucun résultat trouvé</td></tr>
            ) : (
              filteredResultats.map((res: any) => {
                const mention = getMention(res.note);
                return (
                  <tr key={res.id}>
                    <td><code>{res.matricule_national || '-'}</code></td>
                    <td><strong>{res.eleve_prenom} {res.eleve_nom}</strong></td>
                    <td>{res.examen_nom}</td>
                    <td><span style={{ fontWeight: 'bold', fontSize: 18 }}>{res.note}/20</span></td>
                    <td><span className={mention.class}>{mention.text}</span></td>
                    <td>{res.publie ? <span className={styles.badgeSuccess}>✅ Publié</span> : <span className={styles.badgeWarning}>📝 En attente</span>}</td>
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

// ========== GESTION DES TRANSFERTS ==========
const SecretariatTransferts: React.FC = () => {
  const [transferts, setTransferts] = useState<any[]>([]);
  const [eleves, setEleves] = useState<any[]>([]);
  const [ecoles, setEcoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState('');
  const [selectedEcole, setSelectedEcole] = useState('');
  const [motif, setMotif] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transfertsRes, elevesRes, ecolesRes] = await Promise.all([
        api.get('/transferts'),
        api.get('/eleves'),
        api.get('/admin/ecoles')
      ]);
      setTransferts(transfertsRes.data.filter((t: any) => t.id_ecole_source === user?.id_ecole || t.id_ecole_destination === user?.id_ecole));
      setEleves(elevesRes.data.filter((e: any) => e.id_ecole === user?.id_ecole));
      setEcoles(ecolesRes.data.filter((e: any) => e.id !== user?.id_ecole));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const initierTransfert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transferts', {
        id_eleve: selectedEleve,
        id_ecole_source: user?.id_ecole,
        id_ecole_destination: selectedEcole,
        motif: motif,
        date_transfert: new Date().toISOString().split('T')[0],
        statut: 'en_attente'
      });
      alert('✅ Transfert initié avec succès');
      setShowForm(false);
      setSelectedEleve('');
      setSelectedEcole('');
      setMotif('');
      loadData();
    } catch (err: any) { alert(err.response?.data?.message || '❌ Erreur'); }
    finally { setLoading(false); }
  };

  const validerTransfert = async (id: number) => {
    try {
      await api.patch(`/transferts/${id}/valider`);
      alert('✅ Transfert validé');
      loadData();
    } catch (err) { alert('❌ Erreur'); }
  };

  const refuserTransfert = async (id: number) => {
    try {
      await api.patch(`/transferts/${id}/refuser`);
      alert('❌ Transfert refusé');
      loadData();
    } catch (err) { alert('❌ Erreur'); }
  };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-';

  const getStatutBadge = (statut: string) => {
    switch(statut) {
      case 'valide': return { text: '✅ Validé', class: styles.badgeSuccess };
      case 'refuse': return { text: '❌ Refusé', class: styles.badgeDanger };
      default: return { text: '⏳ En attente', class: styles.badgeWarning };
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Chargement...</div>;

  return (
    <div>
      <h1 className={styles.formTitle}>🔄 Gestion des transferts d'élèves</h1>
      <p className={styles.formSubtitle}>Initiez et gérez les transferts d'élèves vers d'autres écoles</p>

      <div style={{ marginBottom: 24 }}>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className={styles.primaryButton}><Plus size={18} /> Initier un transfert</button>
        ) : (
          <div className={styles.formCard}>
            <h3>➕ Initier un transfert d'élève</h3>
            <form onSubmit={initierTransfert}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Élève à transférer</label>
                <select className={styles.input} required value={selectedEleve} onChange={e => setSelectedEleve(e.target.value)}>
                  <option value="">-- Choisir un élève --</option>
                  {eleves.map((e: any) => <option key={e.id} value={e.id}>{e.prenom} {e.nom} - {e.matricule_national || 'pas de matricule'}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>École de destination</label>
                <select className={styles.input} required value={selectedEcole} onChange={e => setSelectedEcole(e.target.value)}>
                  <option value="">-- Choisir une école --</option>
                  {ecoles.map((e: any) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Motif du transfert</label>
                <textarea className={styles.input} rows={3} placeholder="Raison du transfert..." value={motif} onChange={e => setMotif(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className={styles.primaryButton} disabled={loading}>{loading ? 'Envoi...' : 'Initier le transfert'}</button>
                <button type="button" onClick={() => setShowForm(false)} className={styles.secondaryButton}>Annuler</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>Élève</th><th>Matricule</th><th>École source</th><th>École destination</th><th>Date</th><th>Motif</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {transferts.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>Aucun transfert trouvé</td></tr>
            ) : (
              transferts.map((transfert: any) => {
                const statut = getStatutBadge(transfert.statut);
                const isSource = transfert.id_ecole_source === user?.id_ecole;
                return (
                  <tr key={transfert.id}>
                    <td><strong>{transfert.eleve_prenom} {transfert.eleve_nom}</strong></td>
                    <td><code>{transfert.matricule_national || '-'}</code></td>
                    <td>{transfert.ecole_source_nom}</td>
                    <td>{transfert.ecole_destination_nom}</td>
                    <td>{formatDate(transfert.date_transfert)}</td>
                    <td>{transfert.motif || '-'}</td>
                    <td><span className={statut.class}>{statut.text}</span></td>
                    <td>
                      {transfert.statut === 'en_attente' && isSource && (
                        <button onClick={() => refuserTransfert(transfert.id)} className={styles.secondaryButton} style={{ padding: '4px 12px', background: '#ef233c', color: 'white', border: 'none' }}>Annuler</button>
                      )}
                      {transfert.statut === 'en_attente' && !isSource && (
                        <>
                          <button onClick={() => validerTransfert(transfert.id)} className={styles.primaryButton} style={{ marginRight: 8, padding: '4px 12px' }}>✅ Accepter</button>
                          <button onClick={() => refuserTransfert(transfert.id)} className={styles.secondaryButton} style={{ padding: '4px 12px', background: '#ef233c', color: 'white', border: 'none' }}>❌ Refuser</button>
                        </>
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

// ========== DOCUMENTS ==========
const SecretariatDocuments: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h1 className={styles.formTitle}>📄 Documents administratifs</h1>
      <p className={styles.formSubtitle}>Gérez les documents des élèves</p>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <FileText size={48} style={{ color: '#6c757d', marginBottom: 16 }} />
        <p>📁 Module de gestion documentaire en cours de développement</p>
        <p style={{ color: '#6c757d', marginTop: 8 }}>Cette fonctionnalité sera bientôt disponible</p>
      </div>
    </div>
  );
};

export default SecretariatDashboard;