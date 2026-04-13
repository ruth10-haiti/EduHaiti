import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import styles from './styles/Inscription.module.css';

const ChangerMotDePasse: React.FC = () => {
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [ancienMdp, setAncienMdp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && !user.doit_changer_mdp) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nouveauMdp !== confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (nouveauMdp.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    try {
      // ✅ CORRECTION : Utilise /auth/changer-mot-de-passe (accessible à tous)
      await api.post('/auth/changer-mot-de-passe', {
        ancien_mot_de_passe: ancienMdp,
        nouveau_mot_de_passe: nouveauMdp
      });
      
      setSuccess('Mot de passe changé avec succès ! Redirection...');
      
      if (user) {
        const updatedUser = { ...user, doit_changer_mdp: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du changement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>🔐 Changer votre mot de passe</h2>
        <p>Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire.</p>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            placeholder="Mot de passe actuel (temporaire)" 
            value={ancienMdp} 
            onChange={e => setAncienMdp(e.target.value)} 
            required 
            autoComplete="current-password"
          />
          <input 
            type="password" 
            placeholder="Nouveau mot de passe" 
            value={nouveauMdp} 
            onChange={e => setNouveauMdp(e.target.value)} 
            required 
            autoComplete="new-password"
          />
          <input 
            type="password" 
            placeholder="Confirmer le nouveau mot de passe" 
            value={confirmation} 
            onChange={e => setConfirmation(e.target.value)} 
            required 
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Changement...' : 'Changer mon mot de passe'}
          </button>
        </form>
        
        <button 
          onClick={() => logout()} 
          style={{ marginTop: 20, background: '#dc3545', color: 'white', padding: 10, border: 'none', borderRadius: 5, cursor: 'pointer' }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default ChangerMotDePasse;