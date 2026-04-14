import React, { useState, useEffect } from 'react';
import {  UserPlus, Trash2 } from 'lucide-react';
import api from '../services/api';
import styles from '../../styles/AdminDashboard.module.css';

const GestionUtilisateurs: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '', nom: '', prenom: '', role: 'secretariat', id_ecole: ''
  });
  const [ecoles, setEcoles] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
    loadEcoles();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/utilisateurs');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEcoles = async () => {
    try {
      const res = await api.get('/admin/ecoles');
      setEcoles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/utilisateurs/creer', formData);
      setFormData({ email: '', nom: '', prenom: '', role: 'secretariat', id_ecole: '' });
      setShowForm(false);
      loadUsers();
      alert('✅ Utilisateur créé avec succès');
    } catch (err: any) {
      alert(`❌ ${err.response?.data?.error || 'Erreur'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`Supprimer ${nom} ?`)) {
      try {
        await api.delete(`/admin/utilisateurs/${id}`);
        loadUsers();
      } catch (err) {
        alert('Erreur');
      }
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: any = {
      admin: '👑 Admin', secretariat: '📋 Secrétariat', bunexe: '🔬 Bunexe'
    };
    return roles[role] || role;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className={styles.formTitle}>👥 Gestion des utilisateurs</h1>
          <p className={styles.formSubtitle}>Gérez les comptes et les accès</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className={styles.primaryButton}>
            <UserPlus size={18} />
            Nouvel utilisateur
          </button>
        )}
      </div>

      {showForm && (
        <div className={styles.formCard} style={{ marginBottom: 32 }}>
          <h3>➕ Créer un utilisateur</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <input type="email" placeholder="Email *" className={styles.input} required
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input type="text" placeholder="Nom *" className={styles.input} required
                value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
              <input type="text" placeholder="Prénom *" className={styles.input} required
                value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
            </div>
            <select className={styles.input} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="secretariat">Secrétariat</option>
              <option value="bunexe">Bunexe</option>
              <option value="admin">Administrateur</option>
            </select>
            <select className={styles.input} value={formData.id_ecole} onChange={e => setFormData({...formData, id_ecole: e.target.value})}>
              <option value="">Sans école</option>
              {ecoles.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading ? 'Création...' : 'Créer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className={styles.secondaryButton}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td><strong>{user.prenom} {user.nom}</strong></td>
                <td>{user.email}</td>
                <td><span className={`${styles.badge} ${styles.badgeInfo}`}>{getRoleLabel(user.role)}</span></td>
                <td>
                  <button onClick={() => handleDelete(user.id, `${user.prenom} ${user.nom}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef233c' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionUtilisateurs;