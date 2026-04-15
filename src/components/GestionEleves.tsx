import React, { useState, useEffect } from 'react';
import {  Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from '../pages/styles/AdminDashboard.module.css';

const GestionEleves: React.FC = () => {
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEleves();
  }, []);

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

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`Supprimer ${nom} ?`)) {
      try {
        await api.delete(`/eleves/${id}`);
        loadEleves();
      } catch (err) {
        alert('Erreur');
      }
    }
  };

  const filteredEleves = eleves.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.matricule_national?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className={styles.formTitle}>🎓 Gestion des élèves</h1>
          <p className={styles.formSubtitle}>Liste complète des étudiants inscrits</p>
        </div>
        <button onClick={() => navigate('/admin/eleves/ajouter')} className={styles.primaryButton}>
          <Plus size={18} />
          Nouvel élève
        </button>
      </div>

      {/* Barre de recherche */}
      <div style={{ marginBottom: 24 }}>
        <div className={styles.inputWrapper}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Rechercher un élève..."
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
              <th>Matricule</th>
              <th>Nom complet</th>
              <th>Date naissance</th>
              <th>Classe</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Chargement...</td></tr>
            ) : filteredEleves.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Aucun élève trouvé</td></tr>
            ) : (
              filteredEleves.map(eleve => (
                <tr key={eleve.id}>
                  <td><code>{eleve.matricule_national || 'N/A'}</code></td>
                  <td><strong>{eleve.prenom} {eleve.nom}</strong></td>
                  <td>{eleve.date_naissance || '-'}</td>
                  <td><span className={`${styles.badge} ${styles.badgeInfo}`}>{eleve.classe || 'Non assignée'}</span></td>
                  <td>
                    <button onClick={() => navigate(`/admin/eleves/${eleve.id}/modifier`)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 12, color: '#fca311' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(eleve.id, `${eleve.prenom} ${eleve.nom}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef233c' }}>
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

export default GestionEleves;
