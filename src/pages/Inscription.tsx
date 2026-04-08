import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './styles/Inscription.module.css';

const Inscription: React.FC = () => {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', confirmation: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.mot_de_passe !== form.confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await api.post('/auth/inscription', {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        mot_de_passe: form.mot_de_passe
      });
      setSuccess('Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.');
      setTimeout(() => navigate('/connexion'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
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
          <button type="submit">S'inscrire</button>
        </form>
        <p className={styles.loginLink}>
          Déjà un compte ? <Link to="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Inscription;