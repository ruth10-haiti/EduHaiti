import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Menu from '../../components/Menu';
import AjouterEcole from '../../components/AjouterEcole';
import ListeEleves from '../../components/ListeEleves';
import Examens from '../../components/Examens';
import api from '../../services/api';
import styles from '../styles/Dashboard.module.css';
import AjouterEleve from '../../components/AjouterEleve'; 



// ========== COMPOSANT CRÉER UN UTILISATEUR ==========
const CreerUtilisateur: React.FC<{ onUserCreated: () => void }> = ({ onUserCreated }) => {
  const [form, setForm] = useState({ email: '', nom: '', prenom: '', role: 'secretariat', id_ecole: '' });
  const [ecoles, setEcoles] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEcoles = async () => {
      try {
        const response = await api.get('/admin/ecoles');
        setEcoles(response.data);
      } catch (err) {
        console.error('Erreur chargement écoles:', err);
      }
    };
    fetchEcoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await api.post('/admin/utilisateurs/creer', form);
      setMessage(`✅ Compte ${form.role} créé avec succès ! Un email a été envoyé.`);
      setForm({ email: '', nom: '', prenom: '', role: 'secretariat', id_ecole: '' });
      onUserCreated();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Erreur lors de la création'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 10, marginBottom: 30 }}>
      <h3>➕ Créer un nouvel utilisateur</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input 
          type="email" 
          placeholder="Email" 
          required 
          value={form.email} 
          onChange={e => setForm({...form, email: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="Nom" 
          required 
          value={form.nom} 
          onChange={e => setForm({...form, nom: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="Prénom" 
          required 
          value={form.prenom} 
          onChange={e => setForm({...form, prenom: e.target.value})} 
        />
        <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
          <option value="secretariat">Secrétariat</option>
          <option value="bunexe">Bunexe</option>
          <option value="admin">Administrateur</option>
        </select>
        <select value={form.id_ecole} onChange={e => setForm({...form, id_ecole: e.target.value})}>
          <option value="">Sans école</option>
          {ecoles.map(ecole => (
            <option key={ecole.id} value={ecole.id}>{ecole.nom}</option>
          ))}
        </select>
        <button type="submit" disabled={loading} style={{ background: '#28a745', color: 'white', padding: 10, border: 'none', borderRadius: 5 }}>
          {loading ? 'Création...' : 'Créer le compte'}
        </button>
      </form>
      {message && <p style={{ marginTop: 10, color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

// ========== COMPOSANT LISTE DES UTILISATEURS ==========
const ListeUtilisateurs: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/utilisateurs');
      setUsers(response.data);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refreshKey]);

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`Supprimer ${nom} ?`)) {
      try {
        await api.delete(`/admin/utilisateurs/${id}`);
        setMessage('✅ Utilisateur supprimé');
        loadUsers();
        setTimeout(() => setMessage(''), 3000);
      } catch (err: any) {
        setMessage(`❌ ${err.response?.data?.error}`);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: any = {
      admin: '#dc3545',
      secretariat: '#17a2b8',
      bunexe: '#ffc107',
      parent: '#28a745',
      eleve: '#6c757d'
    };
    const names: any = {
      admin: '👑 Admin',
      secretariat: '📋 Secrétariat',
      bunexe: '🔬 Bunexe',
      parent: '👨‍👩‍👧 Parent',
      eleve: '🎓 Élève'
    };
    return <span style={{ background: colors[role] || '#6c757d', color: 'white', padding: '3px 8px', borderRadius: 12, fontSize: 12 }}>{names[role] || role}</span>;
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h3>📋 Liste des utilisateurs</h3>
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 15 }}>
        <thead style={{ background: '#343a40', color: 'white' }}>
          <tr>
            <th style={{ padding: 10, textAlign: 'left' }}>Nom</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Rôle</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Statut</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 10 }}>{user.prenom} {user.nom}</td>
              <td style={{ padding: 10 }}>{user.email}</td>
              <td style={{ padding: 10 }}>{getRoleBadge(user.role)}</td>
              <td style={{ padding: 10 }}>
                {user.doit_changer_mdp ? 
                  <span style={{ color: '#ffc107' }}>⚠️ Doit changer MDP</span> : 
                  <span style={{ color: '#28a745' }}>✅ Actif</span>
                }
              </td>
              <td style={{ padding: 10 }}>
                <button 
                  onClick={() => handleDelete(user.id, `${user.prenom} ${user.nom}`)}
                  style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer' }}
                >
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ========== PAGE ACCUEIL ADMIN ==========
const AdminHome: React.FC = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalEcoles: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersRes, ecolesRes] = await Promise.all([
          api.get('/admin/utilisateurs'),
          api.get('/admin/ecoles')
        ]);
        setStats({ totalUsers: usersRes.data.length, totalEcoles: ecolesRes.data.length });
      } catch (err) {
        console.error('Erreur stats:', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className={styles.welcome}>
      <h1>📊 Tableau de bord Administrateur</h1>
      <div style={{ display: 'flex', gap: 20, margin: '20px 0' }}>
        <div style={{ background: '#007bff', color: 'white', padding: 20, borderRadius: 10, flex: 1, textAlign: 'center' }}>
          <h2>{stats.totalUsers}</h2>
          <p>Utilisateurs</p>
        </div>
        <div style={{ background: '#28a745', color: 'white', padding: 20, borderRadius: 10, flex: 1, textAlign: 'center' }}>
          <h2>{stats.totalEcoles}</h2>
          <p>Écoles</p>
        </div>
      </div>
      <div className={styles.cardGrid}>
        <Link to="/admin/utilisateurs" className={styles.card}>👥 Gérer les utilisateurs</Link>
        <Link to="/admin/ecoles" className={styles.card}>🏫 Gérer les écoles</Link>
        <Link to="/admin/eleves" className={styles.card}>🎓 Liste des élèves</Link>
        <Link to="/admin/examens" className={styles.card}>📝 Examens</Link>
      </div>
    </div>
  );
};

// ========== COMPOSANT GESTION UTILISATEURS ==========
const GestionUtilisateurs: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <CreerUtilisateur onUserCreated={() => setRefreshKey(prev => prev + 1)} />
      <ListeUtilisateurs refreshKey={refreshKey} />
    </div>
  );
};

// ========== DASHBOARD PRINCIPAL ==========
const AdminDashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Menu />
      <div className={styles.content}>
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/utilisateurs" element={<GestionUtilisateurs />} />
          <Route path="/ecoles" element={<AjouterEcole />} />
          <Route path="/eleves" element={<ListeEleves />} />
          <Route path="/examens" element={<Examens />} />
          <Route path="/eleves/ajouter" element={<AjouterEleve />} />
          <Route path="/eleves/:id/modifier" element={<AjouterEleve />} />

        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;