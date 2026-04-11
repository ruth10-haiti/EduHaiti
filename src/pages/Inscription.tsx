import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './styles/Inscription.module.css';

const Inscription: React.FC = () => {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', confirmation: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (form.mot_de_passe !== form.confirmation) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    
    try {
      // ✅ CORRECTION : Utiliser la bonne route du backend
      const response = await api.post('/auth/register', {
        nom: `${form.prenom} ${form.nom}`,  // Combiner prénom et nom
        email: form.email,
        password: form.mot_de_passe,        // Renommer 'mot_de_passe' en 'password'
        role: 'parent'                      // Ajouter le rôle
      });
      
      console.log('Inscription réussie:', response.data);
      setSuccess('Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.');
      setTimeout(() => navigate('/connexion'), 3000);
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>← Retour à l'accueil</Link>
      <div className={styles.card}>
        <h2>Créer un compte parent</h2>
        <p>Rejoignez EduHaiti pour suivre la scolarité de vos enfants.</p>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
            <input name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required />
          </div>
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="mot_de_passe" type="password" placeholder="Mot de passe" value={form.mot_de_passe} onChange={handleChange} required />
          <input name="confirmation" type="password" placeholder="Confirmer" value={form.confirmation} onChange={handleChange} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Inscription en cours...' : "S'inscrire"}
          </button>
        </form>
        <p className={styles.loginLink}>
          Déjà un compte ? <Link to="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Inscription;