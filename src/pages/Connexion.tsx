import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './styles/Connexion.module.css';

const Connexion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>← Retour à l'accueil</Link>
      <div className={styles.split}>
        <div className={styles.left}>
          <h2>Connexion</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className={styles.btnPrimary}>Se connecter</button>
          </form>
          <div className={styles.links}>
            <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
            <Link to="/inscription">Pas encore de compte ? S'inscrire</Link>
          </div>
        </div>
        <div className={styles.right}>
          <h2>EduHaiti</h2>
          <p>Connectez-vous pour accéder à votre espace personnalisé et suivre les parcours scolaires.</p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;