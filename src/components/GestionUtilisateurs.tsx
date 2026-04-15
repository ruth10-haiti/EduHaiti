import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Mail, Building } from 'lucide-react';
import api from '../services/api';
import styles from "../pages/styles/AdminDashboard.module.css";

const GestionUtilisateurs: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '', nom: '', prenom: '', role: 'secretariat', id_ecole: ''
  });
  const [ecoles, setEcoles] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
    
    if (formData.role === 'secretariat' && !formData.id_ecole) {
      newErrors.id_ecole = 'L\'école est obligatoire pour le rôle Secrétariat';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await api.post('/admin/utilisateurs/creer', formData);
      setFormData({ email: '', nom: '', prenom: '', role: 'secretariat', id_ecole: '' });
      setShowForm(false);
      setErrors({});
      loadUsers();
      alert('✅ Utilisateur créé avec succès ! Un email avec mot de passe temporaire a été envoyé.');
    } catch (err: any) {
      alert(`❌ ${err.response?.data?.error || 'Erreur lors de la création'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`Supprimer ${nom} ?`)) {
      try {
        await api.delete(`/admin/utilisateurs/${id}`);
        loadUsers();
        alert('✅ Utilisateur supprimé');
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: any = {
      admin: '👑 Administrateur', 
      secretariat: '📋 Secrétariat', 
      bunexe: '🔬 Bunexe'
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
          <p style={{ color: '#6c757d', marginBottom: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={16} /> Un email avec mot de passe temporaire sera envoyé automatiquement.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}><Mail size={16} /> Email *</label>
              <input 
                type="email" 
                placeholder="votre@email.com" 
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                required
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
              {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nom *</label>
                <input 
                  type="text" 
                  placeholder="Nom" 
                  className={`${styles.input} ${errors.nom ? styles.inputError : ''}`}
                  required
                  value={formData.nom} 
                  onChange={e => setFormData({...formData, nom: e.target.value})} 
                />
                {errors.nom && <p className={styles.errorMessage}>{errors.nom}</p>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Prénom *</label>
                <input 
                  type="text" 
                  placeholder="Prénom" 
                  className={`${styles.input} ${errors.prenom ? styles.inputError : ''}`}
                  required
                  value={formData.prenom} 
                  onChange={e => setFormData({...formData, prenom: e.target.value})} 
                />
                {errors.prenom && <p className={styles.errorMessage}>{errors.prenom}</p>}
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Rôle</label>
              <select 
                className={styles.input} 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value, id_ecole: ''})}
              >
                <option value="secretariat">📋 Secrétariat</option>
                <option value="bunexe">🔬 Bunexe</option>
                <option value="admin">👑 Administrateur</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Building size={16} /> École {formData.role === 'secretariat' && <span style={{ color: '#ef233c' }}>*</span>}
              </label>
              <select 
                className={`${styles.input} ${errors.id_ecole ? styles.inputError : ''}`}
                value={formData.id_ecole} 
                onChange={e => setFormData({...formData, id_ecole: e.target.value})}
              >
                <option value="">{formData.role === 'secretariat' ? '-- Sélectionnez une école --' : 'Sans école'}</option>
                {ecoles.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
              {errors.id_ecole && <p className={styles.errorMessage}>{errors.id_ecole}</p>}
              {formData.role === 'secretariat' && (
                <small style={{ color: '#6c757d', fontSize: 12, marginTop: 4, display: 'block' }}>
                  ⚠️ Le secrétariat doit être rattaché à une école spécifique.
                </small>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading ? 'Création...' : 'Créer et envoyer l\'email'}
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
                  <button onClick={() => handleDelete(user.id, `${user.prenom} ${user.nom}`)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef233c' }}>
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