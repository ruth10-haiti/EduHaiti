import React, { useState, useEffect } from 'react';
import { School, MapPin, Phone, Trash2, Edit2, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import styles from '../../styles/AdminDashboard.module.css';

interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
}

const GestionEcoles: React.FC = () => {
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEcole, setEditingEcole] = useState<Ecole | null>(null);
  const [formData, setFormData] = useState({ nom: '', adresse: '', telephone: '' });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadEcoles();
  }, []);

  const loadEcoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/ecoles');
      setEcoles(res.data);
    } catch (err) {
      showNotification('error', 'Erreur lors du chargement des écoles');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingEcole) {
        await api.put(`/admin/ecoles/${editingEcole.id}`, formData);
        showNotification('success', 'École modifiée avec succès');
      } else {
        await api.post('/admin/ecoles', formData);
        showNotification('success', 'École ajoutée avec succès');
      }
      
      resetForm();
      loadEcoles();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`Supprimer l'école "${nom}" ? Cette action est irréversible.`)) {
      try {
        await api.delete(`/admin/ecoles/${id}`);
        showNotification('success', 'École supprimée');
        loadEcoles();
      } catch (err) {
        showNotification('error', 'Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', adresse: '', telephone: '' });
    setEditingEcole(null);
    setShowForm(false);
  };

  const editEcole = (ecole: Ecole) => {
    setEditingEcole(ecole);
    setFormData({ nom: ecole.nom, adresse: ecole.adresse, telephone: ecole.telephone });
    setShowForm(true);
  };

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div className={styles.notification}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className={styles.formTitle}>🏫 Gestion des écoles</h1>
          <p className={styles.formSubtitle}>Ajoutez, modifiez ou supprimez les établissements scolaires</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className={styles.primaryButton}>
            <School size={18} />
            Nouvelle école
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className={styles.formCard} style={{ marginBottom: 32 }}>
          <h3>{editingEcole ? '✏️ Modifier l\'école' : '➕ Ajouter une école'}</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}><School size={16} /> Nom *</label>
              <input
                type="text"
                className={styles.input}
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                placeholder="Ex: Lycée National"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><MapPin size={16} /> Adresse</label>
              <input
                type="text"
                className={styles.input}
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Ex: Rue des Écoles, Port-au-Prince"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Phone size={16} /> Téléphone</label>
              <input
                type="tel"
                className={styles.input}
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="Ex: +509 1234 5678"
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading ? 'Enregistrement...' : (editingEcole ? 'Modifier' : 'Ajouter')}
              </button>
              <button type="button" onClick={resetForm} className={styles.secondaryButton}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des écoles */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !showForm ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Chargement...</td></tr>
            ) : ecoles.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Aucune école trouvée</td></tr>
            ) : (
              ecoles.map((ecole) => (
                <tr key={ecole.id}>
                  <td><strong>{ecole.nom}</strong></td>
                  <td>{ecole.adresse || '-'}</td>
                  <td>{ecole.telephone || '-'}</td>
                  <td>
                    <button onClick={() => editEcole(ecole)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 12, color: '#fca311' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(ecole.id, ecole.nom)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef233c' }}>
                      <Trash2 size={18} />
                    </button>
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

export default GestionEcoles;