import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ListeEleves: React.FC = () => {
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEleves();
  }, []);

  const loadEleves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/eleves');
      setEleves(response.data);
      setError('');
    } catch (err) {
      console.error('Erreur chargement élèves:', err);
      setError('Erreur lors du chargement des élèves');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (window.confirm(`Supprimer l'élève ${nom} ?`)) {
      try {
        await api.delete(`/eleves/${id}`);
        loadEleves();
      } catch (err) {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Chargement des élèves...</div>;
  if (error) return <div style={{ padding: 20, color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>🎓 Liste des élèves</h2>
        <button 
          onClick={() => navigate('/admin/eleves/ajouter')}
          style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 5, cursor: 'pointer' }}
        >
          ➕ Ajouter un élève
        </button>
      </div>
      
      {eleves.length === 0 ? (
        <p>Aucun élève trouvé. Cliquez sur "Ajouter" pour en créer un.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#343a40', color: 'white' }}>
            <tr>
              <th style={{ padding: 10, textAlign: 'left' }}>ID</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Matricule</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Nom</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Prénom</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {eleves.map(eleve => (
              <tr key={eleve.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: 10 }}>{eleve.id}</td>
                <td style={{ padding: 10 }}>{eleve.matricule_national || '-'}</td>
                <td style={{ padding: 10 }}>{eleve.nom}</td>
                <td style={{ padding: 10 }}>{eleve.prenom}</td>
                <td style={{ padding: 10 }}>
                  <button 
                    onClick={() => navigate(`/admin/eleves/${eleve.id}/modifier`)}
                    style={{ background: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', marginRight: 10 }}
                  >
                    ✏️ Modifier
                  </button>
                  <button 
                    onClick={() => handleDelete(eleve.id, `${eleve.prenom} ${eleve.nom}`)}
                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer' }}
                  >
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListeEleves;
