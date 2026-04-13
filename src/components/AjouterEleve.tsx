import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const AjouterEleve: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ecoles, setEcoles] = useState<any[]>([]);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    sexe: 'M',
    matricule_national: '',
    id_ecole: '',
    classe: ''
  });

  useEffect(() => {
    // Charger les écoles
    const fetchEcoles = async () => {
      try {
        const res = await api.get('/ecoles');
        setEcoles(res.data);
      } catch (err) {
        console.error('Erreur chargement écoles:', err);
      }
    };
    fetchEcoles();

    // Si on est en mode édition, charger l'élève
    if (id) {
      const fetchEleve = async () => {
        try {
          const res = await api.get(`/eleves/${id}`);
          setForm(res.data);
        } catch (err) {
          setError('Erreur lors du chargement de l\'élève');
        }
      };
      fetchEleve();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id) {
        await api.put(`/eleves/${id}`, form);
      } else {
        await api.post('/eleves', form);
      }
      navigate('/admin/eleves');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>{id ? '✏️ Modifier' : '➕ Ajouter'} un élève</h2>
      
      {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: 10, borderRadius: 5, marginBottom: 20 }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div style={{ display: 'flex', gap: 15 }}>
          <input type="text" placeholder="Nom" required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #ddd' }} />
          <input type="text" placeholder="Prénom" required value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #ddd' }} />
        </div>
        
        <div style={{ display: 'flex', gap: 15 }}>
          <input type="date" placeholder="Date de naissance" value={form.date_naissance} onChange={e => setForm({...form, date_naissance: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #ddd' }} />
          <input type="text" placeholder="Lieu de naissance" value={form.lieu_naissance} onChange={e => setForm({...form, lieu_naissance: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #ddd' }} />
        </div>
        
        <div style={{ display: 'flex', gap: 15 }}>
          <select value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #ddd' }}>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
          <input type="text" placeholder="Matricule national" value={form.matricule_national} onChange={e => setForm({...form, matricule_national: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #ddd' }} />
        </div>
        
        <select value={form.id_ecole} onChange={e => setForm({...form, id_ecole: e.target.value})} style={{ padding: 10, borderRadius: 5, border: '1px solid #ddd' }}>
          <option value="">Sélectionnez une école</option>
          {ecoles.map(ecole => (
            <option key={ecole.id} value={ecole.id}>{ecole.nom}</option>
          ))}
        </select>
        
        <input type="text" placeholder="Classe" value={form.classe} onChange={e => setForm({...form, classe: e.target.value})} style={{ padding: 10, borderRadius: 5, border: '1px solid #ddd' }} />
        
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button type="submit" disabled={loading} style={{ background: '#28a745', color: 'white', border: 'none', padding: 10, borderRadius: 5, cursor: 'pointer', flex: 1 }}>
            {loading ? 'Enregistrement...' : (id ? 'Modifier' : 'Ajouter')}
          </button>
          <button type="button" onClick={() => navigate('/admin/eleves')} style={{ background: '#6c757d', color: 'white', border: 'none', padding: 10, borderRadius: 5, cursor: 'pointer', flex: 1 }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default AjouterEleve;