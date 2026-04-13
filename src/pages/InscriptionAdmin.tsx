import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const InscriptionAdmin = () => {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', confirmation: '' });
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Vérifier si un admin existe déjà
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get('/setup/check-admin');
        setAdminExists(res.data.exists);
      } catch (err) {
        setAdminExists(false);
      }
    };
    checkAdmin();
  }, []);

  // Si un admin existe déjà, rediriger
  if (adminExists === true) {
    return (
      <div style={{ maxWidth: 450, margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2>✅ Administrateur déjà existant</h2>
        <p>Un administrateur a déjà été créé.</p>
        <button onClick={() => navigate('/connexion')}>Aller à la connexion</button>
      </div>
    );
  }

  if (adminExists === null) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}>Vérification...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.mot_de_passe !== form.confirmation) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.mot_de_passe.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/setup/create-admin', {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        mot_de_passe: form.mot_de_passe
      });
      setMessage('Administrateur créé avec succès ! Un email de vérification a été envoyé. Redirection...');
      setTimeout(() => navigate('/connexion'), 3000);
    } catch (err: any) {
      setErreur(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 450, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 28, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h2>🎓 Création du premier administrateur</h2>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>Un email de vérification vous sera envoyé.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="text" placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }} />
          <input type="text" placeholder="Prénom" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }} />
        </div>
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }} />
        <input type="password" placeholder="Mot de passe (min 6 caractères)" value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})} required style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }} />
        <input type="password" placeholder="Confirmer le mot de passe" value={form.confirmation} onChange={e => setForm({...form, confirmation: e.target.value})} required style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }} />
        <button type="submit" disabled={loading} style={{ padding: '0.75rem', background: '#3d6b3d', color: 'white', border: 'none', borderRadius: 48, cursor: 'pointer' }}>
          {loading ? 'Création...' : 'Créer l\'administrateur'}
        </button>
      </form>
      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
      {erreur && <p style={{ color: 'red', marginTop: '1rem' }}>{erreur}</p>}
    </div>
  );
};

export default InscriptionAdmin;