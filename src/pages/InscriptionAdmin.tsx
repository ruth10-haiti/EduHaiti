import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const InscriptionAdmin = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await api.post('/auth/creer-admin', { nom_utilisateur: nomUtilisateur, mot_de_passe: motDePasse });
      setMessage('Administrateur créé avec succès. Redirection vers la connexion...');
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la création');
    }
  };

  return (
    <div style={{ maxWidth: 450, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 28, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h2>Inscription du premier administrateur</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" placeholder="Nom d'utilisateur" value={nomUtilisateur} onChange={e => setNomUtilisateur(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required />
        <input type="password" placeholder="Confirmer le mot de passe" value={confirmation} onChange={e => setConfirmation(e.target.value)} required />
        <button type="submit" style={{ padding: '0.75rem', background: '#3d6b3d', color: 'white', border: 'none', borderRadius: 48, cursor: 'pointer' }}>Créer l'administrateur</button>
      </form>
      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
      {erreur && <p style={{ color: 'red', marginTop: '1rem' }}>{erreur}</p>}
    </div>
  );
};
export default InscriptionAdmin;