import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Clock,  Award } from 'lucide-react';
import api from '../services/api';
import styles from "../pages/styles/AdminDashboard.module.css";

const GestionExamens: React.FC = () => {
  const [examens, setExamens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExamen, setEditingExamen] = useState<any>(null);
  const [formData, setFormData] = useState({
    nom: '', description: '', annee_session: new Date().getFullYear(),
    debut_inscription: '', fin_inscription: '', date_examen: '', coefficient: 1
  });

  useEffect(() => {
    loadExamens();
  }, []);

  const loadExamens = async () => {
    setLoading(true);
    try {
      const res = await api.get('/examens');
      setExamens(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingExamen) {
        await api.put(`/examens/${editingExamen.id}`, formData);
      } else {
        await api.post('/examens', formData);
      }
      resetForm();
      loadExamens();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`Supprimer l'examen "${nom}" ?`)) {
      try {
        await api.delete(`/examens/${id}`);
        loadExamens();
      } catch (err) {
        alert('Erreur');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '', description: '', annee_session: new Date().getFullYear(),
      debut_inscription: '', fin_inscription: '', date_examen: '', coefficient: 1
    });
    setEditingExamen(null);
    setShowForm(false);
  };

  const editExamen = (examen: any) => {
    setEditingExamen(examen);
    setFormData(examen);
    setShowForm(true);
  };

  const getStatus = (examen: any) => {
    const now = new Date();
    const debut = new Date(examen.debut_inscription);
    const fin = new Date(examen.fin_inscription);
    if (now < debut) return { label: 'À venir', className: styles.badgeInfo };
    if (now > fin) return { label: 'Terminé', className: styles.badgeWarning };
    return { label: 'Inscriptions ouvertes', className: styles.badgeSuccess };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className={styles.formTitle}>📝 Gestion des examens</h1>
          <p className={styles.formSubtitle}>Organisez et planifiez les sessions d'examen</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className={styles.primaryButton}>
            <Plus size={18} />
            Nouvel examen
          </button>
        )}
      </div>

      {showForm && (
        <div className={styles.formCard} style={{ marginBottom: 32 }}>
          <h3>{editingExamen ? '✏️ Modifier' : '➕ Créer'} un examen</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <input type="text" placeholder="Nom de l'examen *" className={styles.input} required
                value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <textarea placeholder="Description" className={styles.input} rows={3}
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <input type="number" placeholder="Année" className={styles.input}
                value={formData.annee_session} onChange={e => setFormData({...formData, annee_session: parseInt(e.target.value)})} />
              <input type="number" placeholder="Coefficient" className={styles.input} step="0.5"
                value={formData.coefficient} onChange={e => setFormData({...formData, coefficient: parseFloat(e.target.value)})} />
              <input type="date" placeholder="Date examen" className={styles.input}
                value={formData.date_examen} onChange={e => setFormData({...formData, date_examen: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input type="date" placeholder="Début inscriptions" className={styles.input}
                value={formData.debut_inscription} onChange={e => setFormData({...formData, debut_inscription: e.target.value})} />
              <input type="date" placeholder="Fin inscriptions" className={styles.input}
                value={formData.fin_inscription} onChange={e => setFormData({...formData, fin_inscription: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading ? 'Enregistrement...' : (editingExamen ? 'Modifier' : 'Créer')}
              </button>
              <button type="button" onClick={resetForm} className={styles.secondaryButton}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Cartes des examens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {examens.map(examen => {
          const status = getStatus(examen);
          return (
            <div key={examen.id} className={styles.formCard} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, marginBottom: 4 }}>{examen.nom}</h3>
                  <span className={`${styles.badge} ${status.className}`}>{status.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => editExamen(examen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca311' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(examen.id, examen.nom)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef233c' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {examen.description && <p style={{ color: '#6c757d', fontSize: 13, marginBottom: 12 }}>{examen.description}</p>}
              <div style={{ borderTop: '1px solid #e9ecef', paddingTop: 12, marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6c757d' }}>
                  <span><Calendar size={14} /> {examen.annee_session}</span>
                  <span><Award size={14} /> Coef. {examen.coefficient}</span>
                </div>
                {examen.date_examen && <div><Clock size={14} /> Examen: {new Date(examen.date_examen).toLocaleDateString()}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {examens.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
          Aucun examen créé. Cliquez sur "Nouvel examen" pour commencer.
        </div>
      )}
    </div>
  );
};

export default GestionExamens;
