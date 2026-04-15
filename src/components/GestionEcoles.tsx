import React, { useState, useEffect } from 'react';
import { School, MapPin, Phone, Trash2, Edit2, CheckCircle, AlertCircle, X, Search, User, Mail } from 'lucide-react';
import api from '../services/api';
import styles from "../pages/styles/AdminDashboard.module.css";

interface Ecole {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  responsable_id?: number;
  responsable_nom?: string;
  responsable_email?: string;
}

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  id_ecole: number | null;
}

const GestionEcoles: React.FC = () => {
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEcole, setEditingEcole] = useState<Ecole | null>(null);
  const [formData, setFormData] = useState({ 
    nom: '', 
    adresse: '', 
    telephone: '',
    responsable_id: ''
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEcoles();
    loadUtilisateurs();
  }, []);

  const loadEcoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/ecoles');
      // Récupérer les responsables pour chaque école
      const ecolesAvecResponsables = await Promise.all(
        res.data.map(async (ecole: any) => {
          try {
            const usersRes = await api.get('/admin/utilisateurs');
            const responsable = usersRes.data.find((u: any) => u.id_ecole === ecole.id && u.role === 'secretariat');
            return { 
              ...ecole, 
              responsable_id: responsable?.id,
              responsable_nom: responsable ? `${responsable.prenom} ${responsable.nom}` : null,
              responsable_email: responsable?.email
            };
          } catch {
            return { ...ecole, responsable_id: null, responsable_nom: null, responsable_email: null };
          }
        })
      );
      setEcoles(ecolesAvecResponsables);
    } catch (err) {
      showNotification('error', 'Erreur lors du chargement des écoles');
    } finally {
      setLoading(false);
    }
  };

  const loadUtilisateurs = async () => {
    try {
      const res = await api.get('/admin/utilisateurs');
      // Filtrer seulement les utilisateurs avec rôle secretariat et sans école assignée
      const secretariats = res.data.filter((u: any) => u.role === 'secretariat');
      setUtilisateurs(secretariats);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const verifierExistenceEcole = async (nom: string, idExclu?: number): Promise<boolean> => {
    try {
      const res = await api.get('/admin/ecoles');
      const existe = res.data.some((e: Ecole) => 
        e.nom.toLowerCase() === nom.toLowerCase() && e.id !== idExclu
      );
      return existe;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      showNotification('error', 'Le nom de l\'école est requis');
      return;
    }

    setLoading(true);
    
    try {
      const existe = await verifierExistenceEcole(formData.nom, editingEcole?.id);
      if (existe) {
        showNotification('error', '⚠️ Cette école existe déjà dans le système !');
        setLoading(false);
        return;
      }

      let ecoleId: number;
      
      if (editingEcole) {
        await api.put(`/admin/ecoles/${editingEcole.id}`, {
          nom: formData.nom,
          adresse: formData.adresse,
          telephone: formData.telephone
        });
        ecoleId = editingEcole.id;
        showNotification('success', 'École modifiée avec succès');
      } else {
        const response = await api.post('/admin/ecoles', {
          nom: formData.nom,
          adresse: formData.adresse,
          telephone: formData.telephone
        });
        ecoleId = response.data.id;
        showNotification('success', 'École ajoutée avec succès');
      }

      // Assigner le responsable à l'école
      if (formData.responsable_id) {
        await api.put(`/admin/utilisateurs/${formData.responsable_id}/assigner-ecole`, {
          id_ecole: ecoleId
        });
        showNotification('success', 'Responsable assigné à l\'école avec succès');
      }
      
      resetForm();
      loadEcoles();
      loadUtilisateurs();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`⚠️ Supprimer définitivement l'école "${nom}" ?\n\nCette action est irréversible.`)) {
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
    setFormData({ nom: '', adresse: '', telephone: '', responsable_id: '' });
    setEditingEcole(null);
    setShowForm(false);
  };

  const editEcole = (ecole: Ecole) => {
    setEditingEcole(ecole);
    setFormData({ 
      nom: ecole.nom, 
      adresse: ecole.adresse || '', 
      telephone: ecole.telephone || '',
      responsable_id: ecole.responsable_id ? String(ecole.responsable_id) : ''
    });
    setShowForm(true);
  };

  const filteredEcoles = ecoles.filter(e => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer les responsables disponibles (sans école ou l'école en cours d'édition)
  const responsablesDisponibles = utilisateurs.filter(u => 
    !u.id_ecole || (editingEcole && u.id_ecole === editingEcole.id)
  );

  return (
    <div>
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
          <p className={styles.formSubtitle}>Ajoutez, modifiez ou supprimez les établissements scolaires et assignez leurs responsables</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className={styles.primaryButton}>
            <School size={18} />
            Nouvelle école
          </button>
        )}
      </div>

      {showForm && (
        <div className={styles.formCard} style={{ marginBottom: 32 }}>
          <h3>{editingEcole ? '✏️ Modifier l\'école' : '➕ Ajouter une école'}</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}><School size={16} /> Nom de l'école *</label>
              <input
                type="text"
                className={styles.input}
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                placeholder="Ex: Lycée National de Port-au-Prince"
              />
              <small style={{ color: '#6c757d', fontSize: 12, marginTop: 4, display: 'block' }}>
                ⚠️ Le nom doit être unique. Une vérification sera effectuée.
              </small>
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

            <div className={styles.formGroup}>
              <label className={styles.label}><User size={16} /> Responsable (Secrétariat)</label>
              <select
                className={styles.input}
                value={formData.responsable_id}
                onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
              >
                <option value="">-- Sélectionner un responsable --</option>
                {responsablesDisponibles.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom} - {user.email}
                  </option>
                ))}
              </select>
              <small style={{ color: '#6c757d', fontSize: 12, marginTop: 4, display: 'block' }}>
                👤 Le responsable pourra gérer les élèves et inscriptions de cette école
              </small>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading ? 'Vérification...' : (editingEcole ? 'Modifier' : 'Ajouter')}
              </button>
              <button type="button" onClick={resetForm} className={styles.secondaryButton}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div className={styles.inputWrapper}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Rechercher une école..."
            className={styles.input}
            style={{ paddingLeft: 40 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Responsable</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Chargement...</td></tr>
            ) : filteredEcoles.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Aucune école trouvée</td></tr>
            ) : (
              filteredEcoles.map((ecole) => (
                <tr key={ecole.id}>
                  <td><strong>{ecole.nom}</strong></td>
                  <td>{ecole.adresse || '-'}</td>
                  <td>{ecole.telephone || '-'}</td>
                  <td>
                    {ecole.responsable_nom ? (
                      <div>
                        <span className={styles.badgeInfo}>
                          <User size={12} style={{ display: 'inline', marginRight: 4 }} />
                          {ecole.responsable_nom}
                        </span>
                        <br />
                        <small style={{ color: '#6c757d', fontSize: 11 }}>
                          <Mail size={10} style={{ display: 'inline', marginRight: 2 }} />
                          {ecole.responsable_email}
                        </small>
                      </div>
                    ) : (
                      <span style={{ color: '#fca311' }}>⚠️ Aucun responsable assigné</span>
                    )}
                   </td>
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