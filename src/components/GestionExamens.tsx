import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Clock, Award, FileText, MapPin, Users, DollarSign } from 'lucide-react';
import api from '../services/api';
import styles from "../pages/styles/AdminDashboard.module.css";

const GestionExamens: React.FC = () => {
  const [examens, setExamens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExamen, setEditingExamen] = useState<any>(null);
  const [formData, setFormData] = useState({
    nom: '', description: '', annee_session: new Date().getFullYear(),
    debut_inscription: '', fin_inscription: '', date_examen: '', 
    heure_examen: '09:00', duree: 120, coefficient: 1,
    lieu: '', nombre_places: 0, frais_inscription: 0
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
        alert('✅ Examen modifié avec succès');
      } else {
        await api.post('/examens', formData);
        alert('✅ Examen créé avec succès');
      }
      resetForm();
      loadExamens();
    } catch (err: any) {
      alert(err.response?.data?.error || '❌ Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`⚠️ Supprimer l'examen "${nom}" ?\n\nCette action supprimera toutes les inscriptions associées.`)) {
      try {
        await api.delete(`/examens/${id}`);
        loadExamens();
        alert('✅ Examen supprimé');
      } catch (err) {
        alert('❌ Erreur');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '', description: '', annee_session: new Date().getFullYear(),
      debut_inscription: '', fin_inscription: '', date_examen: '',
      heure_examen: '09:00', duree: 120, coefficient: 1,
      lieu: '', nombre_places: 0, frais_inscription: 0
    });
    setEditingExamen(null);
    setShowForm(false);
  };

  const editExamen = (examen: any) => {
    setEditingExamen(examen);
    setFormData(examen);
    setShowForm(true);
  };

  const formatDate = (date: string) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatus = (examen: any) => {
    const now = new Date();
    const debut = new Date(examen.debut_inscription);
    const fin = new Date(examen.fin_inscription);
    const dateExamen = new Date(examen.date_examen);
    
    if (now > dateExamen) return { label: '📅 Terminé', className: styles.badgeWarning };
    if (now < debut) return { label: '⏳ À venir', className: styles.badgeInfo };
    if (now > fin) return { label: '🔒 Inscriptions fermées', className: styles.badgeDanger };
    return { label: '📝 Inscriptions ouvertes', className: styles.badgeSuccess };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className={styles.formTitle}>📝 Gestion des examens</h1>
          <p className={styles.formSubtitle}>Organisez, planifiez et gérez les sessions d'examen</p>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}><FileText size={16} /> Nom de l'examen *</label>
                <input type="text" className={styles.input} required
                  value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} 
                  placeholder="Ex: Baccalauréat, BEF, Concours national"/>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><Calendar size={16} /> Année scolaire *</label>
                <input type="number" className={styles.input} required
                  value={formData.annee_session} onChange={e => setFormData({...formData, annee_session: parseInt(e.target.value)})} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description complète</label>
              <textarea className={styles.input} rows={3}
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Décrivez les matières, conditions, informations importantes..."/>
            </div>

            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <h4 style={{ marginBottom: 16 }}>📅 Dates et lieu</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className={styles.label}>📅 Date de l'examen</label>
                  <input type="date" className={styles.input}
                    value={formData.date_examen} onChange={e => setFormData({...formData, date_examen: e.target.value})} />
                </div>
                <div>
                  <label className={styles.label}>⏰ Heure de l'examen</label>
                  <input type="time" className={styles.input}
                    value={formData.heure_examen} onChange={e => setFormData({...formData, heure_examen: e.target.value})} />
                </div>
                <div>
                  <label className={styles.label}>⏱️ Durée (minutes)</label>
                  <input type="number" className={styles.input}
                    value={formData.duree} onChange={e => setFormData({...formData, duree: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className={styles.label}><MapPin size={16} /> Lieu</label>
                  <input type="text" className={styles.input}
                    value={formData.lieu} onChange={e => setFormData({...formData, lieu: e.target.value})}
                    placeholder="Salle, centre d'examen..."/>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff3e0', padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <h4 style={{ marginBottom: 16 }}>📋 Période d'inscription</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className={styles.label}>🟢 Début des inscriptions</label>
                  <input type="date" className={styles.input}
                    value={formData.debut_inscription} onChange={e => setFormData({...formData, debut_inscription: e.target.value})} />
                </div>
                <div>
                  <label className={styles.label}>🔴 Fin des inscriptions</label>
                  <input type="date" className={styles.input}
                    value={formData.fin_inscription} onChange={e => setFormData({...formData, fin_inscription: e.target.value})} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}><Award size={16} /> Coefficient</label>
                <input type="number" step="0.5" className={styles.input}
                  value={formData.coefficient} onChange={e => setFormData({...formData, coefficient: parseFloat(e.target.value)})} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><Users size={16} /> Nombre de places</label>
                <input type="number" className={styles.input}
                  value={formData.nombre_places} onChange={e => setFormData({...formData, nombre_places: parseInt(e.target.value)})} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><DollarSign size={16} /> Frais d'inscription (Gdes)</label>
                <input type="number" className={styles.input}
                  value={formData.frais_inscription} onChange={e => setFormData({...formData, frais_inscription: parseInt(e.target.value)})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading ? 'Enregistrement...' : (editingExamen ? 'Modifier' : 'Créer')}
              </button>
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
              
              {examen.description && (
                <p style={{ color: '#6c757d', fontSize: 13, marginBottom: 12 }}>{examen.description.substring(0, 100)}...</p>
              )}
              
              <div style={{ borderTop: '1px solid #e9ecef', paddingTop: 12 }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6c757d', flexWrap: 'wrap', marginBottom: 8 }}>
                  <span><Calendar size={14} /> {examen.annee_session}</span>
                  <span><Award size={14} /> Coef. {examen.coefficient}</span>
                  {examen.nombre_places > 0 && <span><Users size={14} /> {examen.nombre_places} places</span>}
                  {examen.frais_inscription > 0 && <span><DollarSign size={14} /> {examen.frais_inscription} Gdes</span>}
                </div>
                
                {examen.date_examen && (
                  <div style={{ fontSize: 12, color: '#6c757d' }}>
                    <Clock size={14} /> Examen: {formatDate(examen.date_examen)} à {examen.heure_examen || '09:00'}
                  </div>
                )}
                
                {examen.lieu && (
                  <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                    <MapPin size={14} /> {examen.lieu}
                  </div>
                )}
                
                {(examen.debut_inscription || examen.fin_inscription) && (
                  <div style={{ marginTop: 8, fontSize: 12, background: '#fff3e0', padding: 8, borderRadius: 6 }}>
                    📋 Inscriptions: {formatDate(examen.debut_inscription)} → {formatDate(examen.fin_inscription)}
                  </div>
                )}
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